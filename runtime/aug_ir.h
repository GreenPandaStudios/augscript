#ifndef AUG_IR_H
#define AUG_IR_H
#include "aug_runtime.h"

/* Compiler-private pointer-call ABI. This is not the public native package ABI.
   All target packs record these layouts; LLVM validates that record before use. */
enum AugIrOperation {
  AUG_IR_PRINT=1, AUG_IR_BINARY, AUG_IR_UNARY, AUG_IR_FIELD, AUG_IR_SET_FIELD,
  AUG_IR_LIST, AUG_IR_TUPLE, AUG_IR_SET, AUG_IR_MAP, AUG_IR_MAP_SET,
  AUG_IR_LIST_LENGTH, AUG_IR_LIST_GET, AUG_IR_LIST_AT, AUG_IR_LIST_APPEND,
  AUG_IR_TUPLE_LENGTH, AUG_IR_TUPLE_GET, AUG_IR_SET_LENGTH, AUG_IR_SET_ADD,
  AUG_IR_SET_CONTAINS, AUG_IR_MAP_LENGTH, AUG_IR_MAP_GET, AUG_IR_MAP_TAKE,
  AUG_IR_MAP_CONTAINS, AUG_IR_STRING_LENGTH, AUG_IR_STRING_BYTES,
  AUG_IR_STRING_SPLIT, AUG_IR_STRING_STARTS_WITH, AUG_IR_STRING_IS_TOKEN,
  AUG_IR_BYTES_LENGTH, AUG_IR_BYTES_TEXT, AUG_IR_BYTES_BASE64URL,
  AUG_IR_BASE64URL_DECODE, AUG_IR_C_INT, AUG_IR_READ_FILE, AUG_IR_WRITE_FILE,
  AUG_IR_ARGUMENTS, AUG_IR_FREEZE, AUG_IR_ITER, AUG_IR_MAP_ITER, AUG_IR_IS_TYPE,
  AUG_IR_SHARED, AUG_IR_SHARED_LOCK
};
void aug_ir_operation(AugValue *out, int operation, AugValue *args, int count, const char *text, int64_t number);
void aug_ir_string(AugValue *out, const void *text, uint64_t count);
void aug_ir_assert(const AugValue *condition, const char *expression, const char *file, int line);
void aug_ir_drop(AugValue *value);
void aug_ir_failed_result(AugValue *value);
void aug_ir_throw(const AugValue *value);
void aug_ir_take_error(AugValue *out);
void aug_ir_save_error_state(AugValue *error,AugValue *cancelled);
void aug_ir_restore_error_state(const AugValue *error,const AugValue *cancelled);
void aug_ir_task_wait(AugValue *out, AugValue *tasks, int count);
bool aug_ir_has_error(void);
bool aug_ir_cancelled(void);
bool aug_ir_is_null(const AugValue *value);
bool aug_ir_truthy(const AugValue *value);
int64_t aug_ir_integer(const AugValue *value);
double aug_ir_float(const AugValue *value);
void aug_ir_frame_enter(AugFrame *frame, AugValue *values, uint64_t count);
void aug_ir_method(AugValue *out, const AugValue *self, const char *name, AugValue *args, int count);
void aug_ir_object(AugValue *out, const char *type, uint64_t fields, const unsigned char *owned,
                   const AugMethodEntry *methods, uint64_t method_count, const char *const *names, bool record);
void aug_ir_binding_get(AugValue *out, uint64_t index);
void aug_ir_binding_set(uint64_t index, const AugValue *value);
int aug_ir_exit_status(bool test);
void *aug_ir_resource_pointer(const AugValue *value, const char *type);
void aug_ir_resource(AugValue *out, void *pointer, const char *type, void (*release)(void *));
void aug_ir_resource_move(AugValue *value);
void aug_ir_contract_error(AugValue *out);
void aug_ir_native_error(AugValue *out, AugPointerMethod factory, int32_t code, const void *text, uint64_t length);
bool aug_ir_data(const AugValue *value, const void **data, uint64_t *count);
bool aug_ir_floats(const AugValue *value, double **data, uint64_t *count);
bool aug_ir_strings(const AugValue *value, const void ***data, uint64_t **lengths, uint64_t *count);
void aug_ir_free(void *memory);
void aug_ir_copy_bytes(AugValue *out, const void *bytes, uint64_t count);
void aug_ir_copy_utf8(AugValue *out, const void *text, uint64_t count);
void aug_ir_copy_bool(AugValue *out, uint8_t value);
void aug_ir_copy_floats(AugValue *out, const double *values, uint64_t count);
#endif
