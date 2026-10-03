#include "aug_runtime.h"
#include "reliability_alloc.h"
#include <pthread.h>
#include <stdatomic.h>
#include <stdio.h>
#include <time.h>
#include <inttypes.h>
#include <string.h>
#include <errno.h>

static atomic_uint_fast64_t acquired, released, entered, forbidden_entries;
static uint64_t cases[5];
static atomic_uint_fast64_t cleanup_calls;
typedef struct { pthread_t owner; } Resource;
static void require(bool condition, const char *message) {
  if (!condition) { fprintf(stderr, "runtime probe: %s\n", message); exit(2); }
}
static double now(void) {
  struct timespec value; require(clock_gettime(CLOCK_MONOTONIC, &value) == 0, "clock unavailable");
  return (double)value.tv_sec + (double)value.tv_nsec / 1e9;
}
static void release_resource(void *value) {
  Resource *resource = value;
  require(pthread_equal(resource->owner, pthread_self()), "resource released on another thread");
  atomic_fetch_add(&released, 1); free(resource);
}
static AugValue resource(void) {
  AugValue value = aug_new_object("ProbeResource", 0, NULL, NULL, 0);
  value.as.object->kind = AUG_NATIVE_RESOURCE_KIND;
  Resource *native = malloc(sizeof(*native)); require(native != NULL, "resource allocation failed");
  native->owner = pthread_self(); value.as.object->native = native;
  value.as.object->finalize = release_resource; atomic_fetch_add(&acquired, 1);
  return value;
}
static void identity(AugValue *out, const AugValue *self, AugValue *args, int count) {
  (void)self; require(count == 1, "identity labels"); *out = args[0];
}
static void pressure(AugValue *out, const AugValue *self, AugValue *args, int count) {
  (void)self; require(count == 1, "pressure labels");
  AugValue roots[6] = {args[0], aug_null(), aug_null(), aug_null(), aug_null(), aug_null()};
  AugFrame frame; aug_frame_enter(&frame, roots, 6);
  roots[1] = resource(); roots[2] = aug_map_new(); roots[3] = aug_set_new(NULL, 0);
  AugValue first = aug_tuple_get(roots[0], 0), second = aug_tuple_get(roots[0], 1);
  require(first.as.object == second.as.object, "input aliases were lost");
  require(aug_list_get(first, 3).as.object == first.as.object, "input cycle was lost");
  aug_list_append(first, aug_int(7));
  for (int i = 0; i < 1600; i++) {
    roots[4] = aug_string("retained map value");
    aug_map_set(roots[2], aug_int(i % 97), roots[4]); aug_set_add(roots[3], aug_int(i % 97));
    if (i % 3 == 0) aug_map_take(roots[2], aug_int((i + 1) % 97));
    aug_string("private garbage collected during a job");
    aug_task_checkpoint(); if (aug_cancelled) break;
  }
  require(aug_set_length(roots[3]) == 97, "set lost an entry");
  require(aug_list_length(second) == 5, "copied aliases did not share their local mutation");
  aug_drop(roots[1]); *out = roots[0]; aug_frame_leave(&frame);
}
static void fail(AugValue *out, const AugValue *self, AugValue *args, int count) {
  (void)self; (void)args; require(count == 0, "failure labels");
  *out = aug_error_named("ProbeError");
}
static void forbidden(AugValue *out, const AugValue *self, AugValue *args, int count) {
  (void)self; require(count == 1, "owned labels");
  atomic_fetch_add(&forbidden_entries, 1); aug_drop(args[0]); *out = aug_null();
}
static void spin(AugValue *out, const AugValue *self, AugValue *args, int count) {
  (void)self; (void)args; require(count == 0, "spin labels");
  AugValue value = resource(); AugFrame frame; aug_frame_enter(&frame, &value, 1);
  atomic_fetch_add(&entered, 1);
  while (!aug_cancelled) aug_task_checkpoint();
  aug_drop(value); aug_frame_leave(&frame); *out = aug_null();
}
static void nested_child(AugValue *out, const AugValue *self, AugValue *args, int count) {
  (void)self; require(count == 1, "nested labels");
  AugValue roots[2] = {args[0], aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
  const unsigned char mask[1] = {0}; aug_scope_enter(mask);
  aug_task_start_worker_pointer(&roots[1], identity, NULL, roots, 1, mask);
  *out = aug_task_wait(&roots[1], 1); aug_scope_leave(); aug_frame_leave(&frame);
}
static void nested(AugValue *out, const AugValue *self, AugValue *args, int count) {
  (void)self; require(count == 1, "outer labels");
  AugValue roots[2] = {args[0], aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
  const unsigned char mask[1] = {0}; aug_scope_enter(mask);
  aug_task_start_pointer(&roots[1], nested_child, NULL, roots, 1, mask);
  *out = aug_task_wait(&roots[1], 1); aug_scope_leave(); aug_frame_leave(&frame);
}

static void failed_drop(AugValue *out, const AugValue *self, AugValue *args, int count) {
  (void)self; (void)args; require(count == 0, "drop labels");
  atomic_fetch_add(&cleanup_calls, 1);
  aug_new_object("DropGarbage", 0, NULL, NULL, 0);
  *out = aug_error_named("CleanupError");
}
static const unsigned char owned_child[] = {1};
static const AugMethodEntry dropping[] = {{"drop", NULL, failed_drop}};

static void cycle(unsigned scenario) {
  AugValue roots[7]; for (int i = 0; i < 7; i++) roots[i] = aug_null();
  AugFrame frame; aug_frame_enter(&frame, roots, 7);
  unsigned char mask[1] = {0};
  aug_scope_enter(mask);
  if (scenario == 0) {
    AugValue original[3] = {aug_int(1), aug_int(2), aug_int(3)};
    roots[0] = aug_list_new(original, 3); aug_list_append(roots[0], roots[0]);
    AugValue aliases[2] = {roots[0], roots[0]}; roots[1] = aug_tuple_new(aliases, 2);
    aug_task_start_worker_pointer(&roots[2], pressure, NULL, &roots[1], 1, mask);
    aug_task_start_worker_pointer(&roots[3], pressure, NULL, &roots[1], 1, mask);
    roots[4] = aug_task_wait(&roots[2], 2);
    require(!aug_has_error && !aug_cancelled, "normal work failed");
    require(aug_list_length(roots[0]) == 4, "parent input changed");
    for (int i = 0; i < 2; i++) {
      AugValue copy = aug_tuple_get(roots[4], i), list = aug_tuple_get(copy, 0);
      require(list.as.object == aug_tuple_get(copy, 1).as.object, "result aliases were lost");
      require(aug_list_get(list, 3).as.object == list.as.object, "result cycle was lost");
      require(aug_list_length(list) == 5 && aug_list_get(list, 4).as.integer == 7, "copied result changed");
      require(list.as.object != roots[0].as.object, "result shared a parent object");
    }
    aug_scope_leave();
  } else if (scenario == 1) {
    aug_task_start_pointer(&roots[0], fail, NULL, NULL, 0, mask);
    roots[1] = resource(); const unsigned char owned[1] = {1};
    aug_task_start_pointer(&roots[2], forbidden, NULL, &roots[1], 1, owned);
    roots[3] = aug_task_wait(&roots[0], 1);
    require(aug_error_is("ProbeError"), "child error missing");
    aug_scope_leave(); require(aug_error_is("ProbeError"), "scope changed primary error");
    roots[3] = aug_take_error(); aug_cancelled = false;
    require(atomic_load(&forbidden_entries) == 0, "cancelled owned child entered");
  } else if (scenario == 2) {
    uint64_t before = atomic_load(&entered);
    aug_task_start_worker_pointer(&roots[0], spin, NULL, NULL, 0, mask);
    double deadline = now() + 10;
    while (atomic_load(&entered) == before) {
      require(now() < deadline, "worker did not enter");
      struct timespec pause = {0, 1000000}; nanosleep(&pause, NULL);
    }
    roots[1] = aug_error_named("ParentError");
    aug_scope_leave();
    require(aug_error_is("ParentError"), "cancellation replaced parent error");
    roots[1] = aug_take_error(); aug_cancelled = false;
  } else if (scenario == 3) {
    roots[0] = aug_int(19);
    aug_task_start_worker_pointer(&roots[1], nested, NULL, roots, 1, mask);
    roots[2] = aug_task_wait(&roots[1], 1);
    require(!aug_has_error && !aug_cancelled && roots[2].as.integer == 19, "nested wait did not progress");
    aug_scope_leave();
  } else {
    uint64_t before = atomic_load(&cleanup_calls);
    roots[0] = resource();
    roots[1] = aug_new_object("FailingDrop", 1, owned_child, dropping, 1);
    aug_set_field(roots[1], 0, roots[0]); roots[0] = aug_null();
    roots[2] = aug_error_named("PrimaryError");
    aug_drop(roots[1]); aug_drop(roots[1]);
    require(aug_error_is("PrimaryError"), "drop replaced the primary error");
    require(atomic_load(&cleanup_calls) == before + 1, "drop ran more than once");
    aug_scope_leave(); roots[2] = aug_take_error();
  }
  aug_frame_leave(&frame);
  /* Two passes allow objects allocated by a drop method their documented
     cleanup opportunity. These fixtures create no unbounded drop chain. */
  aug_collect(); aug_collect();
  require(atomic_load(&acquired) == atomic_load(&released), "native resource not released");
#ifdef AUG_PROBE_LEAK_CONTROL
  void *leak = malloc(4096); require(leak != NULL, "leak control failed"); memset(leak, 7, 4096);
#endif
  AugProbeAllocation allocation = aug_probe_allocation();
  require(allocation.live_blocks == 0 && allocation.live_bytes == 0, "outstanding runtime allocation at quiescence");
  require(allocation.allocations == allocation.releases, "allocation balance differs");
  cases[scenario]++;
}
static void sample(uint64_t cycles, double elapsed, bool final) {
  AugProbeAllocation value = aug_probe_allocation();
  printf("{\"cycles\":%" PRIu64 ",\"elapsedSeconds\":%.6f,\"allocations\":%" PRIu64
         ",\"releases\":%" PRIu64 ",\"liveBlocks\":%" PRIu64 ",\"liveBytes\":%" PRIu64
         ",\"peakBytes\":%" PRIu64 ",\"acquired\":%" PRIu64 ",\"released\":%" PRIu64
         ",\"cases\":[%" PRIu64 ",%" PRIu64 ",%" PRIu64 ",%" PRIu64 ",%" PRIu64 "],\"final\":%s}\n",
         cycles, elapsed, value.allocations, value.releases, value.live_blocks, value.live_bytes,
         value.peak_bytes, atomic_load(&acquired), atomic_load(&released),
         cases[0], cases[1], cases[2], cases[3], cases[4], final ? "true" : "false");
  fflush(stdout);
}
int main(int argc, char **argv) {
  require(argc == 3, "supply cycle count and minimum seconds");
  char *end; errno = 0; uint64_t minimum = strtoull(argv[1], &end, 10);
  require(!errno && !*end && minimum >= 5 && minimum <= 10000000, "invalid cycle count");
  errno = 0; double seconds = strtod(argv[2], &end);
  require(!errno && !*end && seconds >= 0 && seconds <= 86400, "invalid duration");
  double start = now(), next = start + 1; uint64_t cycles = 0;
  do {
    cycle((unsigned)(cycles % 5)); cycles++;
    if (now() >= next) { sample(cycles, now() - start, false); next = now() + 1; }
  } while (cycles < minimum || now() - start < seconds || cycles % 5);
  aug_shutdown();
  require(aug_probe_allocation().live_blocks == 0, "shutdown retained runtime allocation");
  sample(cycles, now() - start, true);
  return 0;
}
