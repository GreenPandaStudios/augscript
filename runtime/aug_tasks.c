#include "aug_runtime.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#define MINICORO_IMPL
#include "minicoro.h"

/* C stack suspension preserves ordinary August calls and their precise GC frames. */
struct AugTask {
  mco_coro *coroutine; AugExecution execution; AugMethod function;
  AugValue value; AugRetained retained; bool retained_active, queued, complete, observed;
  size_t base_depth; struct AugTask *ready_next, *sibling; AugScope *owner;
  AugTaskCompletion completion; void *completion_data; unsigned ticks;
};
static AugTask *ready_first, *ready_last;
void (*aug_scheduler_io)(bool wait);
void (*aug_scheduler_notify)(void);

static void fatal(const char *message) { fprintf(stderr, "August scheduler: %s\n", message); abort(); }
static AugTask *task_of(AugValue value) {
  return value.tag == AUG_OBJECT && value.as.object->kind == AUG_TASK_KIND ? value.as.object->native : NULL;
}
AugTask *aug_task_current(void) { return aug_execution_current()->fiber; }
bool aug_task_finished(AugValue value) { AugTask *task = task_of(value); return task && task->complete; }
void aug_task_wake(AugTask *task) {
  if (!task || task->complete || task->queued) return;
  task->queued = true; task->ready_next = NULL;
  if (ready_last) ready_last->ready_next = task; else ready_first = task;
  ready_last = task;
  if(aug_scheduler_notify)aug_scheduler_notify();
}
static void destroy_task(void *native) {
  AugTask *task = native;
  if (!task->complete) fatal("collected an unfinished task");
  mco_destroy(task->coroutine); free(task);
}
void aug_task_release(AugValue value) {
  AugTask *task = task_of(value);
  if (task && task->retained_active) { aug_release(&task->retained); task->retained_active = false; }
}
void aug_task_cancel(AugValue value) {
  AugTask *task = task_of(value);
  if (!task || task->complete) return;
  task->execution.cancelled = true; aug_task_wake(task);
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
    AugValue result = task->function(aug_field(task->value, 0), arguments.as.object->fields, (int)arguments.as.object->field_count);
    aug_set_field(task->value, 2, result);
  }
  aug_scope_restore(task->base_depth);
  if (aug_has_error) { aug_set_field(task->value, 3, aug_take_error()); cancel_group(task); }
  task->complete = true;
}
bool aug_scheduler_step(void) {
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
  if(aug_task_checkpoint_hook)aug_task_checkpoint_hook();
  AugTask *task = aug_task_current();
  if (task && !aug_lock_depth() && ++task->ticks % 128 == 0) { aug_task_wake(task); aug_task_suspend(); }
}
static void await_task(AugTask *task) {
  while (!task->complete) {
    if (aug_cancelled) aug_task_cancel(task->value);
    if (aug_task_current()) { aug_task_wake(aug_task_current()); aug_task_suspend(); }
    else if (!aug_scheduler_step()) {
      if (!aug_scheduler_io) fatal("task deadlock: every child is suspended");
      aug_scheduler_io(true);
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
AugValue aug_task_spawn(AugMethod function, AugValue receiver, AugValue *args, int count, AugTaskCompletion completion, void *data) {
  aug_scope_join_hook = join_scope;
  AugValue roots[3] = {receiver, aug_null(), aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 3);
  roots[1] = aug_list_new(args, (size_t)count);
  roots[2] = aug_new_object("Task", 4, NULL, NULL, 0); roots[2].as.object->kind = AUG_TASK_KIND;
  aug_set_field(roots[2], 0, receiver); aug_set_field(roots[2], 1, roots[1]);
  AugTask *task = calloc(1, sizeof(*task)); if (!task) fatal("out of memory");
  task->function = function; task->value = roots[2]; task->completion = completion; task->completion_data = data;
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
AugValue aug_task_start(AugMethod function, AugValue receiver, AugValue *args, int count) {
  AugScope *scope = aug_execution_current()->scope_stack;
  if (!scope) return aug_error_named("ConcurrencyError");
  AugValue value = aug_task_spawn(function, receiver, args, count, NULL, NULL); AugTask *task = task_of(value);
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
