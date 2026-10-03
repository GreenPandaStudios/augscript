#if defined(__APPLE__) && !defined(_DARWIN_C_SOURCE)
#define _DARWIN_C_SOURCE
#endif
#include "aug_runtime.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <pthread.h>
#include <stdatomic.h>
#include <unistd.h>
#include <errno.h>
#define MINICORO_IMPL
#include "minicoro.h"

typedef struct AugWorkerJob AugWorkerJob;
static _Thread_local AugWorkerJob *current_worker;
static void keep_worker_checkpoints(void) {}

/* C stack suspension preserves ordinary August calls and their precise GC frames. */
struct AugTask {
  mco_coro *coroutine; AugExecution execution; AugMethod function; AugPointerMethod pointer_function;
  AugValue value; AugRetained retained; bool retained_active, queued, complete, observed;
  size_t base_depth; struct AugTask *ready_next, *sibling; AugScope *owner;
  AugTaskCompletion completion; void *completion_data; unsigned ticks;
  unsigned char *owned_inputs; AugWorkerJob *worker; struct AugTask *worker_next;
};
static _Thread_local AugTask *ready_first, *ready_last, *pending_workers;
_Thread_local void (*aug_scheduler_io)(bool wait);
_Thread_local void (*aug_scheduler_notify)(void);

static void poll_workers(void);
static bool help_worker(void);
static void wait_worker_event(void);
static void cancel_worker(AugWorkerJob *job);

static void fatal(const char *message) { fprintf(stderr, "August scheduler: %s\n", message); abort(); }
static AugTask *task_of(AugValue value) {
  return value.tag == AUG_OBJECT && value.as.object->kind == AUG_TASK_KIND ? value.as.object->native : NULL;
}
AugTask *aug_task_current(void) { return aug_execution_current()->fiber; }
bool aug_task_finished(AugValue value) { AugTask *task = task_of(value); return task && task->complete; }
void aug_task_wake(AugTask *task) {
  if (!task || task->worker || task->complete || task->queued) return;
  task->queued = true; task->ready_next = NULL;
  if (ready_last) ready_last->ready_next = task; else ready_first = task;
  ready_last = task;
  if(aug_scheduler_notify)aug_scheduler_notify();
}
static void destroy_task(void *native) {
  AugTask *task = native;
  if (!task->complete) fatal("collected an unfinished task");
  if (task->coroutine) mco_destroy(task->coroutine); free(task->owned_inputs); free(task);
}
void aug_task_release(AugValue value) {
  AugTask *task = task_of(value);
  if (task && task->retained_active) { aug_release(&task->retained); task->retained_active = false; }
}
void aug_task_cancel(AugValue value) {
  AugTask *task = task_of(value);
  if (!task || task->complete) return;
  task->execution.cancelled = true;
  if (task->worker) cancel_worker(task->worker); else aug_task_wake(task);
}
static void cancel_group(AugTask *failed) {
  if (!failed->owner) return;
  for (AugTask *task = failed->owner->tasks; task; task = task->sibling)
    if (task != failed) aug_task_cancel(task->value);
}
static void run_task(mco_coro *coroutine) {
  AugTask *task = mco_get_user_data(coroutine);
  AugValue arguments = aug_field(task->value, 1);
  if (!aug_cancelled) {
    AugValue roots[2] = {aug_field(task->value, 0), aug_null()};
    AugFrame frame; aug_frame_enter(&frame, roots, 2);
    if (task->pointer_function) task->pointer_function(&roots[1], &roots[0], arguments.as.object->fields, (int)arguments.as.object->field_count);
    else roots[1] = task->function(roots[0], arguments.as.object->fields, (int)arguments.as.object->field_count);
    aug_set_field(task->value, 2, roots[1]);
    aug_frame_leave(&frame);
  } else if (task->owned_inputs) {
    /* Ownership crossed at start, even if a sibling cancels this child before
       entry. No callee ran to release these captures. Cleanup must run with
       cancellation suspended, just as an always block does. */
    AugValue pending = aug_error; AugFrame frame; aug_frame_enter(&frame, &pending, 1);
    bool failed = aug_has_error; aug_error = aug_null(); aug_has_error = false; aug_cancelled = false;
    for (size_t i = 0; i < arguments.as.object->field_count; i++) if (task->owned_inputs[i]) {
      aug_drop(aug_field(arguments, i)); aug_set_field(arguments, i, aug_null());
    }
    if (failed) aug_throw(pending); aug_cancelled = true; aug_frame_leave(&frame);
  }
  aug_scope_restore(task->base_depth);
  if (aug_has_error) { aug_set_field(task->value, 3, aug_take_error()); cancel_group(task); }
  task->complete = true;
}
bool aug_scheduler_step(void) {
#ifdef AUG_TEST_SCHEDULER_STEP
  extern void aug_test_before_scheduler_step(void);
  aug_test_before_scheduler_step();
#endif
  poll_workers();
  AugTask *task = ready_first;
  if (!task) return false;
  ready_first = task->ready_next; if (!ready_first) ready_last = NULL;
  task->queued = false; task->ready_next = NULL;
  if (task->complete) return true;
  AugExecution *previous = aug_execution_switch(&task->execution);
  if (mco_resume(task->coroutine) != MCO_SUCCESS) fatal("cannot resume task");
  aug_execution_switch(previous);
  if (task->complete) {
    aug_execution_dispose(&task->execution);
    if (task->completion) task->completion(task->value, task->completion_data);
  }
  return true;
}
void aug_task_suspend(void) {
  AugTask *task = aug_task_current();
  if (!task || mco_yield(task->coroutine) != MCO_SUCCESS) fatal("suspension outside a task");
}
void aug_task_checkpoint(void) {
  poll_workers();
  if(aug_task_checkpoint_hook)aug_task_checkpoint_hook();
  AugTask *task = aug_task_current();
  if (task && !aug_lock_depth() && ++task->ticks % 128 == 0) { aug_task_wake(task); aug_task_suspend(); }
}
static void await_task(AugTask *task) {
  while (!task->complete) {
    poll_workers(); if (task->complete) break;
    if (aug_cancelled) aug_task_cancel(task->value);
    if (aug_task_current()) { aug_task_wake(aug_task_current()); aug_task_suspend(); }
    else if (help_worker()) { /* Nested workers progress even with ready cooperative children. */ }
    else if (!aug_scheduler_step()) {
      /* The step polls worker completions too. No ready coroutine can mean
         this wait has completed, rather than a deadlock. */
      if (task->complete) break;
      if (pending_workers) { if (!help_worker()) wait_worker_event(); }
      else if (!aug_scheduler_io) fatal("task deadlock: every child is suspended");
      if (aug_scheduler_io) aug_scheduler_io(pending_workers ? false : true);
    }
    if (aug_scheduler_io && !aug_task_current()) aug_scheduler_io(false);
  }
}
static void join_scope(AugScope *scope) {
  bool cancelling = aug_has_error || aug_cancelled;
  AugValue first_error = aug_null(); AugFrame frame; aug_frame_enter(&frame, &first_error, 1);
  for (AugTask *task = scope->tasks; task; task = task->sibling) {
    if (cancelling) aug_task_cancel(task->value);
    await_task(task);
    AugValue error = aug_field(task->value, 3);
    if (!task->observed && error.tag != AUG_NULL && first_error.tag == AUG_NULL) first_error = error;
  }
  for (AugTask *task = scope->tasks; task;) {
    AugTask *next = task->sibling; task->owner = NULL; aug_task_release(task->value); task = next;
  }
  scope->tasks = NULL;
  if (!aug_has_error && first_error.tag != AUG_NULL) aug_throw(first_error);
  aug_frame_leave(&frame);
}
static AugValue spawn_task(AugMethod function, AugPointerMethod pointer_function, AugValue receiver, AugValue *args, int count, const unsigned char *owned, AugTaskCompletion completion, void *data) {
  aug_scope_join_hook = join_scope;
  AugValue roots[3] = {receiver, aug_null(), aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 3);
  roots[1] = aug_list_new(args, (size_t)count);
  roots[2] = aug_new_object("Task", 4, NULL, NULL, 0); roots[2].as.object->kind = AUG_TASK_KIND;
  aug_set_field(roots[2], 0, receiver); aug_set_field(roots[2], 1, roots[1]);
  AugTask *task = calloc(1, sizeof(*task)); if (!task) fatal("out of memory");
  task->function = function; task->pointer_function = pointer_function; task->value = roots[2]; task->completion = completion; task->completion_data = data;
  if (owned && count) { task->owned_inputs = malloc((size_t)count); if (!task->owned_inputs) fatal("out of memory"); memcpy(task->owned_inputs, owned, (size_t)count); }
  aug_execution_init(&task->execution); task->execution.fiber = task;
  AugExecution *parent = aug_execution_current();
  task->execution.scope_stack = parent->scope_stack; task->execution.scope_depth = parent->scope_depth; task->base_depth = parent->scope_depth;
  task->execution.http_job = parent->http_job; task->execution.cancelled = parent->cancelled;
  task->retained_active = true; aug_retain(&task->retained, &task->value, 1);
  roots[2].as.object->native = task; roots[2].as.object->finalize = destroy_task;
  mco_desc description = mco_desc_init(run_task, 1024 * 1024); description.user_data = task;
  if (mco_create(&task->coroutine, &description) != MCO_SUCCESS) fatal("cannot allocate coroutine stack");
  aug_task_wake(task); AugValue result = roots[2]; aug_frame_leave(&frame); return result;
}
AugValue aug_task_spawn(AugMethod function, AugValue receiver, AugValue *args, int count, AugTaskCompletion completion, void *data) {
  return spawn_task(function, NULL, receiver, args, count, NULL, completion, data);
}
void aug_task_spawn_pointer(AugValue *out, AugPointerMethod function, const AugValue *receiver, AugValue *args, int count, AugTaskCompletion completion, void *data) {
  *out = spawn_task(NULL, function, receiver ? *receiver : aug_null(), args, count, NULL, completion, data);
}
void aug_task_start_pointer(AugValue *out, AugPointerMethod function, const AugValue *receiver, AugValue *args, int count, const unsigned char *owned) {
  AugScope *scope = aug_execution_current()->scope_stack;
  if (!scope) { *out = aug_error_named("ConcurrencyError"); return; }
  *out = spawn_task(NULL, function, receiver ? *receiver : aug_null(), args, count, owned, NULL, NULL);
  AugTask *task = task_of(*out); task->owner = scope; task->sibling = scope->tasks; scope->tasks = task;
}
AugValue aug_task_start(AugMethod function, AugValue receiver, AugValue *args, int count) {
  return aug_task_start_owned(function, receiver, args, count, NULL);
}
AugValue aug_task_start_owned(AugMethod function, AugValue receiver, AugValue *args, int count, const unsigned char *owned) {
  AugScope *scope = aug_execution_current()->scope_stack;
  if (!scope) return aug_error_named("ConcurrencyError");
  AugValue value = spawn_task(function, NULL, receiver, args, count, owned, NULL, NULL); AugTask *task = task_of(value);
  task->owner = scope; task->sibling = scope->tasks; scope->tasks = task; return value;
}
static AugValue wait_one(AugValue value) {
  AugTask *task = task_of(value); if (!task) return aug_error_named("ConcurrencyError");
  await_task(task); AugValue error = aug_field(value, 3);
  if (error.tag != AUG_NULL) { task->observed = true; aug_throw(error); return aug_null(); }
  if (task->execution.cancelled) {
    if (!aug_cancelled && task->owner) for (AugTask *sibling = task->owner->tasks; sibling; sibling = sibling->sibling) {
      error = aug_field(sibling->value, 3);
      if (!sibling->observed && error.tag != AUG_NULL) {
        sibling->observed = true; aug_throw(error); return aug_null();
      }
    }
    aug_cancelled = true;
  }
  return aug_field(value, 2);
}
AugValue aug_task_wait(AugValue *tasks, int count) {
  if (count == 1 && task_of(tasks[0])) return wait_one(tasks[0]);
  AugValue *items = tasks; size_t size = (size_t)count; bool list = false;
  if (count == 1 && tasks[0].tag == AUG_OBJECT && tasks[0].as.object->kind == AUG_LIST_KIND) {
    items = tasks[0].as.object->fields; size = tasks[0].as.object->field_count; list = true;
  }
  AugValue roots[2] = {aug_list_new(NULL, 0), aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
  for (size_t i = 0; i < size; i++) {
    AugTask *task = task_of(items[i]);
    if (task && (roots[1].tag != AUG_NULL || aug_cancelled)) {
      aug_task_cancel(task->value); await_task(task); task->observed = true;
    } else {
      AugValue value = wait_one(items[i]);
      if (aug_has_error) {AugValue error = aug_take_error(); if (roots[1].tag == AUG_NULL) roots[1] = error;}
      else if (!aug_cancelled) aug_list_append(roots[0], value);
    }
  }
  if (!list) roots[0].as.object->kind = AUG_TUPLE_KIND;
  if (roots[1].tag != AUG_NULL) aug_throw(roots[1]);
  AugValue result = roots[0]; aug_frame_leave(&frame); return result;
}

/* All Task/scope state is owned by the submitting heap. Pool threads exchange
   copied messages and atomic completion/cancellation flags only. */
struct AugWorkerJob {
  AugMethod function; AugPointerMethod pointer_function; AugTransfer *input, *output;
  int count; bool failed, was_cancelled, test_failed; size_t assertions;
  atomic_bool cancel, complete; struct AugWorkerJob *next;
};
static pthread_mutex_t pool_mutex = PTHREAD_MUTEX_INITIALIZER;
static pthread_cond_t pool_condition = PTHREAD_COND_INITIALIZER;
static pthread_once_t pool_once = PTHREAD_ONCE_INIT;
static AugWorkerJob *pool_first, *pool_last;
static size_t pool_pending, pool_input_bytes, pending_limit = 1024, input_limit = 16777216, total_input_limit = 67108864;
static size_t worker_limit(const char *name, size_t fallback, size_t maximum) {
  const char *value = getenv(name); if (!value) return fallback;
  char *end; errno = 0; unsigned long long count = strtoull(value, &end, 10);
  if (errno || end == value || *end || value[0] == '-' || count < 1 || count > maximum) fatal("invalid worker admission limit");
  return (size_t)count;
}
static uint8_t native_worker_cancelled(void) {
  return (uint8_t)(current_worker && atomic_load_explicit(&current_worker->cancel, memory_order_relaxed));
}
static void worker_checkpoint(void) { if (current_worker && atomic_load_explicit(&current_worker->cancel, memory_order_relaxed)) aug_cancelled = true; }
static void execute_worker(AugWorkerJob *job) {
  AugRuntimeContext *context = aug_runtime_new(); if (!context) fatal("cannot allocate worker heap");
  AugRuntimeContext *previous = aug_runtime_switch(context);
  AugTask *saved_first = ready_first, *saved_last = ready_last, *saved_pending = pending_workers;
  AugWorkerJob *saved_worker = current_worker;
  AugScopeJoin saved_join = aug_scope_join_hook;
  void (*saved_checkpoint)(void) = aug_task_checkpoint_hook, (*saved_mutex)(void) = aug_mutex_wait_hook;
  void (*saved_io)(bool) = aug_scheduler_io; void (*saved_notify)(void) = aug_scheduler_notify;
  uint8_t (*saved_native_cancel)(void) = aug_native_cancel_probe;
  bool saved_failed = aug_test_failed; size_t saved_assertions = aug_test_assertions;
  ready_first = ready_last = pending_workers = NULL; current_worker = job; aug_native_cancel_probe = native_worker_cancelled;
  aug_scope_join_hook = NULL; aug_task_checkpoint_hook = worker_checkpoint; aug_mutex_wait_hook = NULL;
  aug_scheduler_io = NULL; aug_scheduler_notify = NULL; aug_test_failed = false; aug_test_assertions = 0;
  AugValue *values = calloc((size_t)job->count + 3, sizeof(AugValue)); if (!values) fatal("out of memory");
  AugFrame frame; aug_frame_enter(&frame, values, (size_t)job->count + 3);
  aug_transfer_restore(job->input, values, (size_t)job->count + 1);
  worker_checkpoint();
  if (!aug_cancelled) {
    if (job->pointer_function) job->pointer_function(&values[job->count + 1], &values[0], &values[1], job->count);
    else values[job->count + 1] = job->function(values[0], &values[1], job->count);
  }
  aug_scope_restore(0);
  job->failed = aug_has_error; job->was_cancelled = aug_cancelled;
  values[job->count + 2] = aug_has_error ? aug_take_error() : aug_null();
  if (job->was_cancelled) values[job->count + 1] = aug_null();
  job->output = aug_transfer_capture(&values[job->count + 1], 2);
  aug_frame_leave(&frame); free(values);
  job->test_failed = aug_test_failed; job->assertions = aug_test_assertions;
  aug_runtime_delete(context); aug_runtime_switch(previous);
  ready_first = saved_first; ready_last = saved_last; pending_workers = saved_pending; current_worker = saved_worker; aug_native_cancel_probe = saved_native_cancel;
  aug_scope_join_hook = saved_join; aug_task_checkpoint_hook = saved_checkpoint; aug_mutex_wait_hook = saved_mutex;
  aug_scheduler_io = saved_io; aug_scheduler_notify = saved_notify;
  aug_test_failed = saved_failed; aug_test_assertions = saved_assertions;
  /* Last access to job: its owner may immediately import and free it. */
  atomic_store_explicit(&job->complete, true, memory_order_release);
  pthread_mutex_lock(&pool_mutex); pthread_cond_broadcast(&pool_condition); pthread_mutex_unlock(&pool_mutex);
}
static AugWorkerJob *take_worker(void) {
  AugWorkerJob *job = pool_first;
  if (job) { pool_first = job->next; if (!pool_first) pool_last = NULL; job->next = NULL; }
  return job;
}
static void *pool_thread(void *unused) {
  (void)unused;
  for (;;) {
    pthread_mutex_lock(&pool_mutex);
    while (!pool_first) pthread_cond_wait(&pool_condition, &pool_mutex);
    AugWorkerJob *job = take_worker(); pthread_mutex_unlock(&pool_mutex);
    execute_worker(job);
  }
  return NULL;
}
static void init_pool(void) {
  pending_limit = worker_limit("AUG_WORKER_PENDING", 1024, 65536);
  input_limit = worker_limit("AUG_WORKER_INPUT_BYTES", 16777216, 67108864);
  total_input_limit = worker_limit("AUG_WORKER_TOTAL_INPUT_BYTES", 67108864, 1073741824);
  long count = sysconf(_SC_NPROCESSORS_ONLN); if (count < 1) count = 1; if (count > 64) count = 64;
  const char *setting = getenv("AUG_WORKERS");
  if (setting) { char *end; errno = 0; long specified = strtol(setting, &end, 10); if (errno || *end || specified < 1 || specified > 64) fatal("AUG_WORKERS must be an integer from 1 to 64"); count = specified; }
  for (long i = 0; i < count; i++) { pthread_t thread; if (pthread_create(&thread, NULL, pool_thread, NULL)) fatal("cannot create worker thread"); pthread_detach(thread); }
}
static bool help_worker(void) {
  if (!current_worker) return false;
  pthread_mutex_lock(&pool_mutex); AugWorkerJob *job = take_worker(); pthread_mutex_unlock(&pool_mutex);
  if (!job) return false;
  execute_worker(job); return true;
}
static void wait_worker_event(void) {
  struct timespec until; clock_gettime(CLOCK_REALTIME, &until); until.tv_nsec += 1000000;
  if (until.tv_nsec >= 1000000000) { until.tv_sec++; until.tv_nsec -= 1000000000; }
  pthread_mutex_lock(&pool_mutex); pthread_cond_timedwait(&pool_condition, &pool_mutex, &until); pthread_mutex_unlock(&pool_mutex);
}
static void cancel_worker(AugWorkerJob *job) { atomic_store_explicit(&job->cancel, true, memory_order_relaxed); }
static void poll_workers(void) {
  AugTask **cursor = &pending_workers;
  while (*cursor) {
    AugTask *task = *cursor; AugWorkerJob *job = task->worker;
    if (!atomic_load_explicit(&job->complete, memory_order_acquire)) { cursor = &task->worker_next; continue; }
    /* Import can collect and run cleanup checkpoints. Remove this job first
       so a nested poll cannot import or free the same completion twice. */
    *cursor = task->worker_next; task->worker_next = NULL;
    AugValue values[2] = {aug_null(), aug_null()}; AugFrame frame; aug_frame_enter(&frame, values, 2);
    aug_transfer_restore(job->output, values, 2);
    aug_set_field(task->value, 2, values[0]); aug_set_field(task->value, 3, values[1]);
    task->execution.cancelled = job->was_cancelled; task->complete = true;
    aug_test_failed |= job->test_failed; aug_test_assertions += job->assertions;
    if (job->failed) cancel_group(task);
    pthread_mutex_lock(&pool_mutex); pool_pending--; pool_input_bytes -= aug_transfer_bytes(job->input); pthread_mutex_unlock(&pool_mutex);
    aug_transfer_delete(job->input); aug_transfer_delete(job->output); free(job); task->worker = NULL;
    aug_execution_dispose(&task->execution);
    aug_frame_leave(&frame);
  }
  if (!pending_workers && aug_task_checkpoint_hook == keep_worker_checkpoints) aug_task_checkpoint_hook = NULL;
}
static AugValue start_worker(AugMethod function, AugPointerMethod pointer_function, AugValue receiver, AugValue *args, int count, const unsigned char *owned) {
  AugScope *scope = aug_execution_current()->scope_stack;
  if (!scope) return aug_error_named("ConcurrencyError");
  for (int i = 0; owned && i < count; i++) if (owned[i]) fatal("owned worker capture; compiler contract violated");
  pthread_once(&pool_once, init_pool); poll_workers();
  AugValue *inputs = malloc(((size_t)count + 1) * sizeof(AugValue)); if (!inputs) fatal("out of memory");
  inputs[0] = receiver; if (count) memcpy(inputs + 1, args, (size_t)count * sizeof(AugValue));
  pthread_mutex_lock(&pool_mutex);
  size_t available = total_input_limit - pool_input_bytes;
  AugTransfer *input = pool_pending < pending_limit ? aug_transfer_capture_bounded(inputs, (size_t)count + 1, available < input_limit ? available : input_limit) : NULL;
  if (input) { pool_pending++; pool_input_bytes += aug_transfer_bytes(input); }
  pthread_mutex_unlock(&pool_mutex); free(inputs);
  if (!input) return aug_error_named("ConcurrencyError");
  aug_scope_join_hook = join_scope;
  AugValue value = aug_new_object("Task", 4, NULL, NULL, 0); value.as.object->kind = AUG_TASK_KIND;
  AugTask *task = calloc(1, sizeof(*task)); AugWorkerJob *job = calloc(1, sizeof(*job));
  if (!task || !job) fatal("out of memory");
  task->value = value; task->worker = job; task->owner = scope; task->sibling = scope->tasks; scope->tasks = task;
  aug_execution_init(&task->execution); task->execution.cancelled = aug_cancelled;
  task->retained_active = true; aug_retain(&task->retained, &task->value, 1);
  value.as.object->native = task; value.as.object->finalize = destroy_task;
  job->input = input;
  job->function = function; job->pointer_function = pointer_function; job->count = count;
  atomic_init(&job->cancel, aug_cancelled); atomic_init(&job->complete, false);
  task->worker_next = pending_workers; pending_workers = task;
  if (!aug_task_checkpoint_hook) aug_task_checkpoint_hook = keep_worker_checkpoints;
  pthread_once(&pool_once, init_pool);
  pthread_mutex_lock(&pool_mutex); if (pool_last) pool_last->next = job; else pool_first = job; pool_last = job;
  pthread_cond_broadcast(&pool_condition); pthread_mutex_unlock(&pool_mutex);
  return value;
}
AugValue aug_task_start_worker(AugMethod function, AugValue receiver, AugValue *args, int count, const unsigned char *owned) {
  return start_worker(function, NULL, receiver, args, count, owned);
}
void aug_task_start_worker_pointer(AugValue *out, AugPointerMethod function, const AugValue *receiver, AugValue *args, int count, const unsigned char *owned) {
  *out = start_worker(NULL, function, receiver ? *receiver : aug_null(), args, count, owned);
}
