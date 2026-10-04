#include "aug_runtime.h"
#include <stdatomic.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
static atomic_bool released;
static AugValue waiting;
static bool inject;
void aug_test_before_scheduler_step(void) {
  if (!inject) return;
  inject = false; atomic_store(&released, true);
  /* Deliver completion between await_task's initial poll and its scheduler
     retry. Public runtime operations observe the event; no Task fields are
     altered. This hook exists only in the fault-injection build. */
  for (int i = 0; !aug_task_finished(waiting); i++) {
    if (i == 5000) abort();
    aug_scheduler_step();
    if (!aug_task_finished(waiting)) {struct timespec delay={0,1000000};nanosleep(&delay,NULL);}
  }
}
static void answer(AugValue *out, const AugValue *self, AugValue *args, int count) {
  (void)self; (void)args; if (count != 0) abort();
  while (!atomic_load(&released)) aug_task_checkpoint();
  *out = aug_int(19);
}
int main(void) {
  const unsigned char mask[1] = {0};
  for (int i = 0; i < 30; i++) {
    AugValue roots[2] = {aug_null(),aug_null()};
    AugFrame frame; aug_frame_enter(&frame,roots,2); aug_scope_enter(mask);
    atomic_store(&released,false); inject=true;
    aug_task_start_worker_pointer(&roots[0],answer,NULL,NULL,0,mask);waiting=roots[0];
    roots[1] = aug_task_wait(roots,1);
    if (aug_has_error || aug_cancelled || roots[1].as.integer != 19) abort();
    aug_scope_leave();aug_frame_leave(&frame);aug_collect();waiting=aug_null();
  }
  aug_shutdown();puts("worker waits completed");
}
