#include "aug_runtime.h"
#include <pthread.h>
#include <stdatomic.h>
#include <stdlib.h>
#include <stdio.h>
/* This barrier makes serial execution fail by timeout, rather than treating
   two fast completions or a timing speedup as evidence of parallelism. */
static pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
static pthread_cond_t condition = PTHREAD_COND_INITIALIZER;
static int arrived;
static pthread_t threads[2];
static atomic_int released;
typedef struct { pthread_t owner; } Resource;
static void release_resource(void *pointer) {
  Resource *resource = pointer;
  if (!pthread_equal(resource->owner, pthread_self())) abort();
  atomic_fetch_add(&released, 1); free(resource);
}
static void work(AugValue *out, const AugValue *self, AugValue *args, int count) {
  (void)self; if (count != 1) abort();
  pthread_mutex_lock(&mutex);
  int index = arrived++; threads[index] = pthread_self(); pthread_cond_broadcast(&condition);
  while (arrived < 2) pthread_cond_wait(&condition, &mutex);
  if (pthread_equal(threads[0], threads[1])) abort(); pthread_mutex_unlock(&mutex);
  AugValue values[3] = {args[0], aug_null(), aug_null()}; AugFrame frame; aug_frame_enter(&frame, values, 3);
  values[1] = aug_new_object("WorkerResource", 0, NULL, NULL, 0);
  Resource *resource = malloc(sizeof(*resource)); resource->owner = pthread_self();
  values[1].as.object->native = resource; values[1].as.object->finalize = release_resource;
  for (int i = 0; i < 4000; i++) aug_string("collect this private garbage");
  aug_list_append(values[0], aug_int(7));
  values[2] = aug_map_new();
  aug_map_set(values[2], aug_string("values"), values[0]);
  *out = values[2]; aug_drop(values[1]); aug_frame_leave(&frame);
}
int main(void) {
  AugValue roots[4] = {aug_null(), aug_null(), aug_null(), aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 4);
  AugValue original = aug_int(41); roots[0] = aug_list_new(&original, 1);
  unsigned char mask[] = {0}; aug_scope_enter(mask);
  aug_task_start_worker_pointer(&roots[1], work, NULL, &roots[0], 1, mask);
  aug_task_start_worker_pointer(&roots[2], work, NULL, &roots[0], 1, mask);
  roots[3] = aug_task_wait(&roots[1], 2);
  if (aug_has_error || aug_cancelled || atomic_load(&released) != 2 || aug_list_length(roots[0]) != 1) abort();
  for (int i = 0; i < 2; i++) {
    AugValue map = aug_tuple_get(roots[3], i); AugValue list = aug_map_get(map, aug_string("values"));
    if (aug_list_length(list) != 2 || aug_list_get(list, 0).as.integer != 41 || aug_list_get(list, 1).as.integer != 7) abort();
  }
  aug_scope_leave(); aug_frame_leave(&frame); aug_shutdown(); puts("parallel copies cleanup ok");
}
