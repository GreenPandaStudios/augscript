#ifndef AUG_RUNTIME_H
#define AUG_RUNTIME_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <string.h>

typedef struct AugObject AugObject;
typedef struct AugValue AugValue;
typedef AugValue (*AugMethod)(AugValue self, AugValue *args, int count);
typedef void (*AugPointerMethod)(AugValue *out, const AugValue *self, AugValue *args, int count);

enum { AUG_NULL, AUG_INT, AUG_FLOAT, AUG_BOOL, AUG_STRING, AUG_OBJECT };
enum { AUG_LIST_KIND = 6, AUG_MAP_KIND, AUG_SET_KIND, AUG_TUPLE_KIND, AUG_RECORD_KIND, AUG_BYTES_KIND, AUG_PRIVATE_KEY_KIND, AUG_PUBLIC_KEY_KIND, AUG_JSON_KIND, AUG_HTTP_REQUEST_KIND, AUG_HTTP_RESPONSE_KIND, AUG_HEADERS_KIND, AUG_HTML_KIND, AUG_TASK_KIND, AUG_HTTP_ACTION_KIND, AUG_NATIVE_RESOURCE_KIND };

struct AugValue {
  int tag;
  union { int64_t integer; double floating; bool boolean; AugObject *object; } as;
};

typedef struct {
  const char *name;
  AugMethod function;
  AugPointerMethod pointer_function;
} AugMethodEntry;

struct AugObject {
  AugObject *next;
  bool marked;
  bool dropped;
  bool frozen;
  bool html_actions;
  int kind;
  const char *type_name;
  char *text;
  size_t text_length;
  AugValue *fields;
  size_t field_count;
  size_t capacity;
  size_t *buckets;
  size_t bucket_count;
  const unsigned char *owned_fields;
  const char *const *field_names;
  const AugMethodEntry *methods;
  size_t method_count;
  void *native;
  void (*finalize)(void *native);
};

typedef struct AugFrame {
  AugValue *slots;
  size_t count;
  struct AugFrame *previous;
} AugFrame;
typedef struct AugRetained { AugValue *values; size_t count; struct AugRetained *next; } AugRetained;
void aug_retain(AugRetained *root, AugValue *values, size_t count);
void aug_release(AugRetained *root);

typedef struct AugScope {
  struct AugScope *previous; AugValue *values; const unsigned char *mask; void *tasks;
} AugScope;
typedef struct AugExecution {
  AugFrame *root_frames; AugScope *scope_stack; size_t scope_depth;
  AugValue error; bool has_error; bool cancelled; void *fiber;
  struct AugExecution *next;
  void *held_locks; size_t lock_depth;
  void *http_job;
} AugExecution;
AugExecution *aug_execution_current(void);
AugExecution *aug_execution_switch(AugExecution *execution);
void aug_execution_init(AugExecution *execution);
void aug_execution_dispose(AugExecution *execution);
#define aug_error (aug_execution_current()->error)
#define aug_has_error (aug_execution_current()->has_error)
#define aug_cancelled (aug_execution_current()->cancelled)
typedef void (*AugScopeJoin)(AugScope *scope);
extern _Thread_local AugScopeJoin aug_scope_join_hook;
AugValue aug_binding_get(size_t index);
void aug_binding_set(size_t index, AugValue value);
AugValue aug_shared_new(AugValue value);
AugValue aug_shared_lock(AugValue value);
size_t aug_lock_depth(void);
void aug_lock_leave(void);
void aug_lock_restore(size_t depth);
extern _Thread_local void (*aug_mutex_wait_hook)(void);
typedef struct AugRuntimeContext AugRuntimeContext;
AugRuntimeContext *aug_runtime_new(void);
AugRuntimeContext *aug_runtime_switch(AugRuntimeContext *next);
void aug_runtime_delete(AugRuntimeContext *context);
typedef struct AugTransfer AugTransfer;
AugTransfer *aug_transfer_capture(AugValue *values, size_t count);
AugTransfer *aug_transfer_capture_bounded(AugValue *values, size_t count, size_t maximum);
size_t aug_transfer_bytes(AugTransfer *transfer);
void aug_transfer_restore(AugTransfer *transfer, AugValue *values, size_t count);
void aug_transfer_delete(AugTransfer *transfer);
typedef struct AugTask AugTask;
typedef void (*AugTaskCompletion)(AugValue task, void *data);
AugValue aug_task_start_worker(AugMethod function, AugValue receiver, AugValue *args, int count, const unsigned char *owned);
void aug_task_start_worker_pointer(AugValue *out, AugPointerMethod function, const AugValue *receiver, AugValue *args, int count, const unsigned char *owned);
AugValue aug_task_start(AugMethod function, AugValue receiver, AugValue *args, int count);
AugValue aug_task_start_owned(AugMethod function, AugValue receiver, AugValue *args, int count, const unsigned char *owned);
AugValue aug_task_spawn(AugMethod function, AugValue receiver, AugValue *args, int count, AugTaskCompletion completion, void *data);
/* Compiler-private entry points; native package callbacks have a separate ABI. */
void aug_task_start_pointer(AugValue *out, AugPointerMethod function, const AugValue *receiver, AugValue *args, int count, const unsigned char *owned);
void aug_task_spawn_pointer(AugValue *out, AugPointerMethod function, const AugValue *receiver, AugValue *args, int count, AugTaskCompletion completion, void *data);
AugValue aug_task_wait(AugValue *tasks, int count);
/* Public read-only cancellation probe; valid only during a native call on its
   original caller thread. It neither yields nor enters managed August code. */
uint8_t aug_native_cancelled_v1(void);
extern _Thread_local uint8_t (*aug_native_cancel_probe)(void);
AugTask *aug_task_current(void);
bool aug_task_finished(AugValue task);
void aug_task_cancel(AugValue task);
void aug_task_release(AugValue task);
void aug_task_suspend(void);
void aug_task_wake(AugTask *task);
void aug_task_checkpoint(void);
extern _Thread_local void (*aug_task_checkpoint_hook)(void);
bool aug_scheduler_step(void);
extern _Thread_local void (*aug_scheduler_io)(bool wait);
extern _Thread_local void (*aug_scheduler_notify)(void);
extern _Thread_local bool aug_test_failed;
extern _Thread_local size_t aug_test_assertions;

AugValue aug_null(void);
AugValue aug_int(int64_t value);
AugValue aug_float(double value);
AugValue aug_bool(bool value);
/* The checker proves these operand types. Keep scalar arithmetic visible to
   the C optimizer while preserving August's wrapping and checked semantics. */
static inline AugValue aug_scalar_int(int64_t value) { return (AugValue){.tag=AUG_INT, .as.integer=value}; }
static inline AugValue aug_scalar_float(double value) { return (AugValue){.tag=AUG_FLOAT, .as.floating=value}; }
static inline AugValue aug_scalar_bool(bool value) { return (AugValue){.tag=AUG_BOOL, .as.boolean=value}; }
static inline AugValue aug_scalar_null(void) { return (AugValue){.tag=AUG_NULL}; }
static inline int64_t aug_signed_bits(uint64_t bits) {
  /* Unsigned-to-signed casts are implementation-defined above INT64_MAX. */
  int64_t value; memcpy(&value, &bits, sizeof(value)); return value;
}
AugValue aug_error_named(const char *name);
static inline AugValue aug_scalar_int_divide(int64_t left, int64_t right) {
  if (!right) return aug_error_named("ArithmeticError");
  return aug_scalar_int(left == INT64_MIN && right == -1 ? INT64_MIN : left / right);
}
static inline AugValue aug_scalar_float_divide(double left, double right) {
  if (right == 0) return aug_error_named("ArithmeticError");
  return aug_scalar_float(left / right);
}
AugValue aug_string(const char *value);
AugValue aug_string_n(const void *value, size_t length);
AugValue aug_bytes(const void *value, size_t length, int kind);
int64_t aug_string_length(AugValue value);
AugValue aug_string_trim(AugValue value);
int64_t aug_string_utf16_length(AugValue value);
bool aug_string_is_decimal(AugValue value);
int64_t aug_string_compare(AugValue value, AugValue other);
int64_t aug_string_compare_decimal(AugValue value, AugValue other);
AugValue aug_bytes_slice(AugValue value, int64_t start, int64_t end);
AugValue aug_bytes_hex(AugValue value);
bool aug_float_is_finite(AugValue value);
AugValue aug_float_float32(AugValue value);
bool aug_json_has(AugValue value, AugValue name);
AugValue aug_string_bytes(AugValue value);
AugValue aug_string_split(AugValue value, AugValue separator);
AugValue aug_list_join(AugValue list, AugValue separator);
bool aug_string_ends_with(AugValue value, AugValue suffix);
AugValue aug_string_replace(AugValue value, AugValue search, AugValue replacement);
int64_t aug_string_code_point_length(AugValue value);
int64_t aug_string_parse_integer(AugValue value);
AugValue aug_string_parse_float(AugValue value);
bool aug_string_starts_with(AugValue value, AugValue prefix);
bool aug_string_is_token(AugValue value, int64_t minimum, int64_t maximum);
int64_t aug_bytes_length(AugValue value);
AugValue aug_bytes_text(AugValue value);
bool aug_valid_utf8(const void *text, size_t size);
AugValue aug_bytes_base64url(AugValue value);
AugValue aug_base64url_decode(AugValue value);

typedef struct AugSchema AugSchema;
typedef AugValue (*AugFunction)(AugValue *args, int count);
enum { AUG_SCHEMA_INT, AUG_SCHEMA_C_INT, AUG_SCHEMA_FLOAT, AUG_SCHEMA_BOOL, AUG_SCHEMA_STRING,
       AUG_SCHEMA_LIST, AUG_SCHEMA_MAP, AUG_SCHEMA_SET, AUG_SCHEMA_TUPLE, AUG_SCHEMA_RECORD, AUG_SCHEMA_JSON };
struct AugSchema {
  int kind; bool nullable; bool optional; size_t count;
  const AugSchema *const *fields; const char *const *names; AugFunction make;
  AugPointerMethod pointer_make;
};
AugValue aug_json_decode(AugValue value, const AugSchema *schema);
AugValue aug_schema_make(const AugSchema *schema, AugValue *fields, int count);
AugValue aug_json_stringify(AugValue value);
AugValue aug_json_get(AugValue value, AugValue name);
AugValue aug_json_require(AugValue value, AugValue name);
AugValue aug_json_string(AugValue value);
int64_t aug_json_integer(AugValue value);
bool aug_json_boolean(AugValue value);
AugValue aug_json_items(AugValue value);
AugValue aug_json_wrap(AugValue value);
AugValue _aug_json_parse(AugValue input);
AugValue _aug_json_parse_compatible(AugValue input);
AugValue _aug_time_now(void);
typedef enum {
  AUG_HTTP_POLICY_REQUIRE_LOGIN=1, AUG_HTTP_POLICY_REQUIRE_PERMISSION,
  AUG_HTTP_POLICY_LOG_REQUEST, AUG_HTTP_POLICY_RATE_LIMIT, AUG_HTTP_POLICY_TIMEOUT,
  AUG_HTTP_POLICY_CORS, AUG_HTTP_POLICY_COMPRESS
} AugHttpPolicyKind;
typedef struct {AugHttpPolicyKind kind;const char *permission;int64_t amount,seconds;bool credentials;const char *origins,*headers;} AugHttpPolicy;
typedef struct { const char *method; const char *path; AugFunction handler; int stream; int status; const AugHttpPolicy *policies;size_t policy_count; AugPointerMethod pointer_handler; } AugRoute;
void aug_http_policy(const AugHttpPolicy *policy, AugValue request, AugValue dependency, AugValue second);
AugValue aug_http_finish(AugValue response);
AugValue aug_http_body(AugValue request);
bool aug_http_head_response(AugValue *response);
AugValue aug_http_bind(AugValue request, const char *source, const char *name, const AugSchema *schema);
AugValue aug_httprequest_form(AugValue request, const AugSchema *schema);
AugValue aug_http_response(AugValue body, int status);
AugValue aug_http_response_full(AugValue body, AugValue status, AugValue headers);
AugValue aug_headers_new(void);
AugValue aug_headers_with(AugValue headers, AugValue name, AugValue value);
AugValue aug_headers_get(AugValue headers, AugValue name);
AugValue aug_headers_all(AugValue headers, AugValue name);
AugValue aug_html_element(const char *tag, AugValue *attributes, size_t count, AugValue *children, size_t child_count);
AugValue aug_http_action(const char *route, AugValue *values, size_t count);
AugValue aug_http_event(AugValue data, AugValue id, AugValue event, AugValue retry);
void aug_http_yield(AugValue value);
AugValue aug_http_test_client(const AugRoute *routes, size_t count);
AugValue aug_httptestclient_request(AugValue client, AugValue method, AugValue path, AugValue headers, AugValue body);
AugValue aug_html_transport(AugValue html);
AugValue aug_http_problem(int status);
int aug_http_error_status(void);
void aug_http_serve(const AugRoute *routes, size_t count, int64_t port);
void aug_http_configure(const char *host, const char *certificate, const char *private_key, const char *ca, size_t request_limit, size_t result_limit, bool http3, int64_t headers_timeout, int64_t request_timeout, int64_t drain_timeout, size_t max_requests);
AugValue aug_new_object(const char *name, size_t field_count,
                        const unsigned char *owned_fields,
                        const AugMethodEntry *methods, size_t method_count);
AugValue aug_list_new(AugValue *items, size_t count);
void aug_list_append(AugValue list, AugValue item);
AugValue aug_list_get(AugValue list, int64_t index);
AugValue aug_list_at(AugValue list, int64_t index);
AugValue aug_iter_snapshot(AugValue collection);
AugValue aug_map_entries_snapshot(AugValue map);
int64_t aug_list_length(AugValue list);
AugValue aug_tuple_new(AugValue *items, size_t count);
AugValue aug_tuple_get(AugValue tuple, int64_t index);
int64_t aug_tuple_length(AugValue tuple);
AugValue aug_set_new(AugValue *items, size_t count);
void aug_set_add(AugValue set, AugValue item);
bool aug_set_contains(AugValue set, AugValue item);
int64_t aug_set_length(AugValue set);
AugValue aug_map_new(void);
void aug_map_set(AugValue map, AugValue key, AugValue value);
AugValue aug_map_get(AugValue map, AugValue key);
AugValue aug_map_take(AugValue map, AugValue key);
bool aug_map_contains(AugValue map, AugValue key);
int64_t aug_map_length(AugValue map);
void aug_set_cli_args(int argc, char **argv);
AugValue aug_arguments(void);
AugValue aug_read_file(AugValue path);
AugValue aug_write_file(AugValue path, AugValue content);
AugValue aug_field(AugValue object, size_t index);
void aug_set_field(AugValue object, size_t index, AugValue value);
AugValue aug_call_method(AugValue object, const char *name, AugValue *args, int count);
/* Invariant scalar text for interpolation; no locale or structured-object serialization. */
AugValue aug_text(AugValue value);
void aug_print(AugValue value);
void aug_assert_equal(AugValue actual, AugValue expected, const char *expression, const char *file, int line);
void aug_assert(AugValue condition, const char *expression, const char *file, int line);
AugValue aug_binary(const char *op, AugValue left, AugValue right);
AugValue aug_unary(const char *op, AugValue value);
bool aug_truthy(AugValue value);
const char *aug_cstring(AugValue value);
int64_t aug_cint(AugValue value);
AugValue aug_to_c_int(AugValue value);
void aug_coverage_register(const char *file, size_t line);
void aug_cover(const char *file, size_t line);
double aug_cfloat(AugValue value);

void aug_frame_enter(AugFrame *frame, AugValue *slots, size_t count);
void aug_frame_leave(AugFrame *frame);
void aug_register_globals(AugValue *values, size_t count);
size_t aug_scope_depth(void);
void aug_scope_enter(const unsigned char *mask);
void aug_scope_leave(void);
void aug_scope_join_to(size_t depth);
void aug_scope_restore(size_t depth);
void aug_collect(void);
void aug_freeze(AugValue value);
void aug_drop(AugValue value);
/* Failed construction releases initialized ownership without invoking drop. */
void aug_drop_partial(AugValue value);
void aug_constructor_result_cleanup(AugValue value, AugValue result);
void aug_throw(AugValue value);
AugValue aug_take_error(void);
bool aug_error_is(const char *name);
void aug_report_error(void);
void aug_shutdown(void);

#endif
