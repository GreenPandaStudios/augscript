#ifndef AUG_RELIABILITY_ALLOC_H
#define AUG_RELIABILITY_ALLOC_H
#include <stddef.h>
#include <stdlib.h>
#include <stdint.h>
typedef struct {
  uint64_t allocations, releases, live_blocks, live_bytes, peak_bytes;
} AugProbeAllocation;
void *aug_probe_malloc(size_t size);
void *aug_probe_calloc(size_t count, size_t size);
void *aug_probe_realloc(void *pointer, size_t size);
void aug_probe_free(void *pointer);
AugProbeAllocation aug_probe_allocation(void);
#ifndef AUG_PROBE_IMPLEMENTATION
#define malloc aug_probe_malloc
#define calloc aug_probe_calloc
#define realloc aug_probe_realloc
#define free aug_probe_free
#endif
#endif
