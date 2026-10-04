/* Test-only allocator accounting. Compile this translation unit without the
   forced allocator header; runtime/harness units include it before stdlib.
   The prefix preserves max_align_t alignment and owns no separate allocation.
   This counts explicit allocations in the instrumented units, not libc,
   pthreads, mmap stacks or third-party library internals. */
#define AUG_PROBE_IMPLEMENTATION
#include "reliability_alloc.h"
#include <stdatomic.h>
#include <stdio.h>
#include <string.h>
#include <limits.h>
typedef union {
  max_align_t alignment;
  struct { size_t size; uint64_t magic; } value;
} Header;
static const uint64_t magic = UINT64_C(0x41554750524f4245);
static atomic_uint_fast64_t allocations, releases, live_blocks, live_bytes, peak_bytes;
static void acquired(size_t size) {
  atomic_fetch_add(&allocations, 1);
  atomic_fetch_add(&live_blocks, 1);
  uint64_t live = atomic_fetch_add(&live_bytes, size) + size;
  uint64_t peak = atomic_load(&peak_bytes);
  while (live > peak && !atomic_compare_exchange_weak(&peak_bytes, &peak, live)) {}
}
void *aug_probe_malloc(size_t size) {
  if (size > SIZE_MAX - sizeof(Header)) return NULL;
  Header *header = malloc(sizeof(Header) + size);
  if (!header) return NULL;
  header->value.size = size; header->value.magic = magic;
  acquired(size); return header + 1;
}
void *aug_probe_calloc(size_t count, size_t size) {
  if (size && count > SIZE_MAX / size) return NULL;
  size_t bytes = count * size; void *value = aug_probe_malloc(bytes);
  if (value) memset(value, 0, bytes); return value;
}
void aug_probe_free(void *pointer) {
  if (!pointer) return;
  Header *header = (Header *)pointer - 1;
  if (header->value.magic != magic) {
    fprintf(stderr, "runtime probe: unknown or duplicate allocation release\n");
    abort();
  }
  header->value.magic = 0;
  atomic_fetch_add(&releases, 1);
  atomic_fetch_sub(&live_blocks, 1);
  atomic_fetch_sub(&live_bytes, header->value.size);
  free(header);
}
void *aug_probe_realloc(void *pointer, size_t size) {
  if (!pointer) return aug_probe_malloc(size);
  if (!size) { aug_probe_free(pointer); return NULL; }
  Header *previous = (Header *)pointer - 1;
  if (previous->value.magic != magic) abort();
  void *next = aug_probe_malloc(size);
  if (!next) return NULL;
  memcpy(next, pointer, previous->value.size < size ? previous->value.size : size);
  aug_probe_free(pointer); return next;
}
AugProbeAllocation aug_probe_allocation(void) {
  return (AugProbeAllocation){
    atomic_load(&allocations), atomic_load(&releases), atomic_load(&live_blocks),
    atomic_load(&live_bytes), atomic_load(&peak_bytes)
  };
}
