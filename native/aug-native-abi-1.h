#ifndef AUG_NATIVE_ABI_1_H
#define AUG_NATIVE_ABI_1_H

#include <stdint.h>
#include <stddef.h>

/* Public adapter ABI. August's managed value and heap layouts are private. */
#define AUG_NATIVE_ABI_VERSION 1
#define AUG_NATIVE_ERROR_MESSAGE_CAPACITY 512

typedef struct {
    int32_t code;
    uint32_t message_length;
    unsigned char message[AUG_NATIVE_ERROR_MESSAGE_CAPACITY];
} aug_native_error_v1;

#ifdef __cplusplus
static_assert(sizeof(aug_native_error_v1) == 520, "August native error size");
static_assert(alignof(aug_native_error_v1) == 4, "August native error alignment");
extern "C" {
#else
_Static_assert(sizeof(aug_native_error_v1) == 520, "August native error size");
_Static_assert(_Alignof(aug_native_error_v1) == 4, "August native error alignment");
#endif

/* Caller-thread cancellation probe; never enter from a foreign thread. */
uint8_t aug_native_cancelled_v1(void);

#ifdef __cplusplus
}
#endif
#endif
