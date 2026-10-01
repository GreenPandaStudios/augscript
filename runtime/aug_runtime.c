#include "aug_runtime.h"
#include <pthread.h>
#include <errno.h>

#include <stdio.h>
#include <limits.h>
#include <stdlib.h>
#include <string.h>

static AugObject *heap = NULL;
static AugExecution default_execution;
static AugExecution *executions = &default_execution;
static AugExecution *current_execution = &default_execution;
#define frames (current_execution->root_frames)
#define scopes (current_execution->scope_stack)
#define scope_count (current_execution->scope_depth)
AugScopeJoin aug_scope_join_hook = NULL;
void (*aug_task_checkpoint_hook)(void);
AugExecution *aug_execution_current(void) { return current_execution; }
AugExecution *aug_execution_switch(AugExecution *execution) { AugExecution *previous = current_execution; current_execution = execution; return previous; }
void aug_execution_init(AugExecution *execution) { memset(execution, 0, sizeof(*execution)); execution->next = executions; executions = execution; }
void aug_execution_dispose(AugExecution *execution) { AugExecution **cursor = &executions; while (*cursor && *cursor != execution) cursor = &(*cursor)->next; if (*cursor) *cursor = execution->next; }
static AugRetained *retained = NULL;
static AugValue *globals = NULL;
static size_t global_count = 0;
static size_t object_count = 0;
static size_t next_collection = 1024;
static bool collecting = false;
static AugValue cli_args = {0};
static bool equal(AugValue left, AugValue right);
bool aug_test_failed = false;
size_t aug_test_assertions = 0;

static void fail(const char *message) {
  fprintf(stderr, "AugScript runtime error: %s\n", message);
  exit(1);
}

AugValue aug_null(void) { return (AugValue){ .tag = AUG_NULL }; }
AugValue aug_int(int64_t value) { return (AugValue){ .tag = AUG_INT, .as.integer = value }; }
AugValue aug_float(double value) { return (AugValue){ .tag = AUG_FLOAT, .as.floating = value }; }
AugValue aug_bool(bool value) { return (AugValue){ .tag = AUG_BOOL, .as.boolean = value }; }

static AugValue checked_error(const char *name) {
  aug_throw(aug_new_object(name, 0, NULL, NULL, 0));
  return aug_null();
}
AugValue aug_error_named(const char *name) { return checked_error(name); }

/* Arithmetic is defined modulo 2^64, including negation and MIN / -1. */
static int64_t signed_bits(uint64_t bits) { int64_t result; memcpy(&result, &bits, sizeof(result)); return result; }

static AugObject *allocate(int kind, const char *type_name, size_t field_count,
                           const unsigned char *owned_fields,
                           const AugMethodEntry *methods, size_t method_count) {
  if (!collecting && object_count >= next_collection) aug_collect();
  AugObject *object = calloc(1, sizeof(AugObject));
  if (!object) fail("out of memory");
  object->kind = kind;
  object->type_name = type_name;
  object->field_count = field_count;
  object->capacity = field_count;
  object->owned_fields = owned_fields;
  object->fields = field_count ? calloc(field_count, sizeof(AugValue)) : NULL;
  if (field_count && !object->fields) fail("out of memory");
  object->methods = methods;
  object->method_count = method_count;
  object->next = heap;
  heap = object;
  object_count++;
  return object;
}

AugValue aug_string(const char *value) {
  return aug_string_n(value, strlen(value));
}

AugValue aug_string_n(const void *value, size_t length) {
  AugObject *object = allocate(AUG_STRING, "string", 0, NULL, NULL, 0);
  object->text = malloc(length + 1);
  if (!object->text) fail("out of memory");
  if (length) memcpy(object->text, value, length);
  object->text[length] = 0;
  object->text_length = length;
  return (AugValue){ .tag = AUG_STRING, .as.object = object };
}

AugValue aug_bytes(const void *value, size_t length, int kind) {
  AugObject *object = allocate(kind, kind == AUG_PRIVATE_KEY_KIND ? "RsaPrivateKey" : kind == AUG_PUBLIC_KEY_KIND ? "RsaPublicKey" : "Bytes", 0, NULL, NULL, 0);
  object->text = malloc(length + 1);
  if (!object->text) fail("out of memory");
  if (length) memcpy(object->text, value, length);
  object->text[length] = 0;
  object->text_length = length;
  return (AugValue){ .tag = AUG_OBJECT, .as.object = object };
}

AugValue aug_new_object(const char *name, size_t field_count,
                        const unsigned char *owned_fields,
                        const AugMethodEntry *methods, size_t method_count) {
  AugObject *object = allocate(AUG_OBJECT, name, field_count, owned_fields, methods, method_count);
  return (AugValue){ .tag = AUG_OBJECT, .as.object = object };
}

AugValue aug_list_new(AugValue *items, size_t count) {
  AugObject *object = allocate(AUG_LIST_KIND, "List", count, NULL, NULL, 0);
  for (size_t i = 0; i < count; i++) object->fields[i] = items[i];
  return (AugValue){ .tag = AUG_OBJECT, .as.object = object };
}

static AugObject *expect_list(AugValue value) {
  if (value.tag != AUG_OBJECT || !value.as.object || value.as.object->kind != AUG_LIST_KIND ||
      value.as.object->dropped) fail("expected live List");
  return value.as.object;
}

void aug_list_append(AugValue list, AugValue item) {
  AugObject *object = expect_list(list);
  if (object->frozen) fail("cannot mutate a frozen List");
  if (object->field_count == object->capacity) {
    size_t capacity = object->capacity ? object->capacity * 2 : 4;
    AugValue *fields = realloc(object->fields, capacity * sizeof(AugValue));
    if (!fields) fail("out of memory");
    object->fields = fields;
    object->capacity = capacity;
  }
  object->fields[object->field_count++] = item;
}

AugValue aug_list_get(AugValue list, int64_t index) {
  AugObject *object = expect_list(list);
  if (index < 0 || (uint64_t)index >= object->field_count) return checked_error("IndexError");
  return object->fields[index];
}

AugValue aug_list_at(AugValue list, int64_t index) {
  AugObject *object = expect_list(list);
  return index < 0 || (uint64_t)index >= object->field_count ? aug_null() : object->fields[index];
}

int64_t aug_list_length(AugValue list) {
  return (int64_t)expect_list(list)->field_count;
}

AugValue aug_tuple_new(AugValue *items, size_t count) {
  AugObject *object = allocate(AUG_TUPLE_KIND, "Tuple", count, NULL, NULL, 0);
  for (size_t i = 0; i < count; i++) object->fields[i] = items[i];
  return (AugValue){ .tag = AUG_OBJECT, .as.object = object };
}

static AugObject *expect_tuple(AugValue value) {
  if (value.tag != AUG_OBJECT || !value.as.object || value.as.object->kind != AUG_TUPLE_KIND ||
      value.as.object->dropped) fail("expected live Tuple");
  return value.as.object;
}

AugValue aug_tuple_get(AugValue tuple, int64_t index) {
  AugObject *object = expect_tuple(tuple);
  if (index < 0 || (uint64_t)index >= object->field_count) fail("Tuple index out of range");
  return object->fields[index];
}

int64_t aug_tuple_length(AugValue tuple) { return (int64_t)expect_tuple(tuple)->field_count; }

static uint64_t hash_value(AugValue value) {
  switch (value.tag) {
    case AUG_NULL: return 0;
    case AUG_BOOL: return value.as.boolean ? 1231 : 1237;
    case AUG_INT:
    case AUG_FLOAT: {
      double number = value.tag == AUG_INT ? (double)value.as.integer : value.as.floating;
      if (number == 0) number = 0; /* normalize negative zero */
      uint64_t bits;
      memcpy(&bits, &number, sizeof(bits));
      bits ^= bits >> 33; bits *= UINT64_C(0xff51afd7ed558ccd);
      bits ^= bits >> 33; bits *= UINT64_C(0xc4ceb9fe1a85ec53);
      return bits ^ (bits >> 33);
    }
    case AUG_STRING: {
      uint64_t hash = UINT64_C(14695981039346656037);
      for (size_t i = 0; i < value.as.object->text_length; i++)
        hash = (hash ^ (unsigned char)value.as.object->text[i]) * UINT64_C(1099511628211);
      return hash;
    }
    default:
      if (value.as.object->kind == AUG_TUPLE_KIND || value.as.object->kind == AUG_RECORD_KIND) {
        uint64_t hash = UINT64_C(14695981039346656037);
        for (size_t i = 0; i < value.as.object->field_count; i++)
          hash = (hash ^ hash_value(value.as.object->fields[i])) * UINT64_C(1099511628211);
        return hash;
      }
      return (uint64_t)(uintptr_t)value.as.object;
  }
}

/* Buckets store field offsets + 1; zero is an empty bucket. Fields also keep
   entries in insertion order and remain visible to the garbage collector. */
static bool key_equal(AugValue left, AugValue right) {
  if (left.tag == AUG_INT && right.tag == AUG_INT) return left.as.integer == right.as.integer;
  return equal(left, right);
}
static size_t bucket_for_hash(AugObject *object, AugValue key, uint64_t hash) {
  size_t bucket = (size_t)hash & (object->bucket_count - 1);
  while (object->buckets[bucket] && !key_equal(object->fields[object->buckets[bucket] - 1], key))
    bucket = (bucket + 1) & (object->bucket_count - 1);
  return bucket;
}
static size_t bucket_for(AugObject *object, AugValue key) { return bucket_for_hash(object, key, hash_value(key)); }

static bool grow_table(AugObject *object, size_t stride) {
  size_t entries = object->field_count / stride;
  bool rehashed = !object->bucket_count || (entries + 1) * 10 > object->bucket_count * 7;
  if (rehashed) {
    size_t count = object->bucket_count ? object->bucket_count * 2 : 8;
    size_t *buckets = calloc(count, sizeof(size_t));
    if (!buckets) fail("out of memory");
    free(object->buckets);
    object->buckets = buckets;
    object->bucket_count = count;
    for (size_t i = 0; i < object->field_count; i += stride)
      object->buckets[bucket_for(object, object->fields[i])] = i + 1;
  }
  if (object->field_count + stride > object->capacity) {
    size_t capacity = object->capacity ? object->capacity * 2 : 8;
    AugValue *fields = realloc(object->fields, capacity * sizeof(AugValue));
    if (!fields) fail("out of memory");
    object->fields = fields;
    object->capacity = capacity;
  }
  return rehashed;
}

AugValue aug_map_new(void) {
  AugObject *object = allocate(AUG_MAP_KIND, "Map", 0, NULL, NULL, 0);
  return (AugValue){ .tag = AUG_OBJECT, .as.object = object };
}

static AugObject *expect_map(AugValue value) {
  if (value.tag != AUG_OBJECT || !value.as.object || value.as.object->kind != AUG_MAP_KIND ||
      value.as.object->dropped) fail("expected live Map");
  return value.as.object;
}

void aug_map_set(AugValue map, AugValue key, AugValue value) {
  AugObject *object = expect_map(map);
  if (object->frozen) fail("cannot mutate a frozen Map");
  uint64_t hash = hash_value(key); size_t bucket = 0;
  if (object->bucket_count) {
    bucket = bucket_for_hash(object, key, hash);
    size_t field = object->buckets[bucket];
    if (field) { object->fields[field] = value; return; }
  }
  if (grow_table(object, 2)) bucket = bucket_for_hash(object, key, hash);
  object->buckets[bucket] = object->field_count + 1;
  object->fields[object->field_count++] = key;
  object->fields[object->field_count++] = value;
}

AugValue aug_map_get(AugValue map, AugValue key) {
  AugObject *object = expect_map(map);
  if (!object->bucket_count) return aug_null();
  size_t field = object->buckets[bucket_for(object, key)];
  return field ? object->fields[field] : aug_null();
}
AugValue aug_map_take(AugValue map, AugValue key) {
  AugObject *object = expect_map(map); if (object->frozen) fail("cannot mutate a frozen Map");
  if (!object->bucket_count) return aug_null(); size_t field = object->buckets[bucket_for(object, key)];
  if (!field) return aug_null(); AugValue result = object->fields[field]; size_t first = field - 1;
  memmove(object->fields + first, object->fields + first + 2, (object->field_count - first - 2) * sizeof(AugValue));
  object->field_count -= 2; object->fields[object->field_count] = aug_null(); object->fields[object->field_count + 1] = aug_null();
  memset(object->buckets, 0, object->bucket_count * sizeof(size_t));
  for (size_t i = 0; i < object->field_count; i += 2) object->buckets[bucket_for(object, object->fields[i])] = i + 1;
  return result;
}

bool aug_map_contains(AugValue map, AugValue key) {
  AugObject *object = expect_map(map);
  return object->bucket_count && object->buckets[bucket_for(object, key)] != 0;
}

int64_t aug_map_length(AugValue map) {
  return (int64_t)(expect_map(map)->field_count / 2);
}

static AugObject *expect_set(AugValue value) {
  if (value.tag != AUG_OBJECT || !value.as.object || value.as.object->kind != AUG_SET_KIND ||
      value.as.object->dropped) fail("expected live Set");
  return value.as.object;
}

AugValue aug_set_new(AugValue *items, size_t count) {
  AugObject *object = allocate(AUG_SET_KIND, "Set", 0, NULL, NULL, 0);
  AugValue result = { .tag = AUG_OBJECT, .as.object = object };
  for (size_t i = 0; i < count; i++) aug_set_add(result, items[i]);
  return result;
}

void aug_set_add(AugValue set, AugValue item) {
  AugObject *object = expect_set(set);
  if (object->frozen) fail("cannot mutate a frozen Set");
  uint64_t hash = hash_value(item); size_t bucket = 0;
  if (object->bucket_count) {
    bucket = bucket_for_hash(object, item, hash);
    if (object->buckets[bucket]) return;
  }
  if (grow_table(object, 1)) bucket = bucket_for_hash(object, item, hash);
  object->buckets[bucket] = object->field_count + 1;
  object->fields[object->field_count++] = item;
}

bool aug_set_contains(AugValue set, AugValue item) {
  AugObject *object = expect_set(set);
  return object->bucket_count && object->buckets[bucket_for(object, item)] != 0;
}

int64_t aug_set_length(AugValue set) { return (int64_t)expect_set(set)->field_count; }

AugValue aug_iter_snapshot(AugValue collection) {
  AugObject *object = collection.as.object;
  bool map = object->kind == AUG_MAP_KIND;
  size_t count = map ? object->field_count / 2 : object->field_count;
  AugValue result = aug_list_new(NULL, 0);
  AugFrame frame; aug_frame_enter(&frame, &result, 1);
  for (size_t index = 0; index < count; index++) {
    AugValue item = map ? aug_tuple_new(&object->fields[index * 2], 2) : object->fields[index];
    aug_list_append(result, item);
  }
  aug_frame_leave(&frame);
  return result;
}

/* Destructured Map loops need a snapshot of fields, not one heap Tuple per
   entry. The copy preserves insertion order and isolates subsequent writes. */
AugValue aug_map_entries_snapshot(AugValue map) {
  AugObject *object = expect_map(map);
  AugFrame frame; aug_frame_enter(&frame, &map, 1);
  AugValue result = aug_list_new(object->fields, object->field_count);
  aug_frame_leave(&frame); return result;
}

void aug_set_cli_args(int argc, char **argv) {
  AugValue values[1] = { aug_null() };
  cli_args = aug_list_new(values, 0);
  for (int i = 1; i < argc; i++) {
    AugValue arg = aug_string(argv[i]);
    aug_list_append(cli_args, arg);
  }
}

AugValue aug_arguments(void) { return cli_args; }

static AugValue file_error(void) {
  AugValue error = aug_new_object("FileError", 0, NULL, NULL, 0);
  aug_throw(error);
  return aug_null();
}

static bool valid_text(const unsigned char *text, size_t size) {
  for (size_t i = 0; i < size;) {
    unsigned char first = text[i++];
    if (!first) return false;
    if (first < 0x80) continue;
    int extra = first >= 0xc2 && first <= 0xdf ? 1 : first >= 0xe0 && first <= 0xef ? 2 : first >= 0xf0 && first <= 0xf4 ? 3 : -1;
    if (extra < 0 || i + (size_t)extra > size) return false;
    uint32_t code = first & (extra == 1 ? 0x1f : extra == 2 ? 0x0f : 0x07);
    for (int j = 0; j < extra; j++) { unsigned char next = text[i++]; if ((next & 0xc0) != 0x80) return false; code = (code << 6) | (next & 0x3f); }
    if (code < (extra == 1 ? 0x80u : extra == 2 ? 0x800u : 0x10000u) || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return false;
  }
  return true;
}

AugValue aug_read_file(AugValue path) {
  FILE *file = fopen(aug_cstring(path), "rb");
  if (!file) return file_error();
  if (fseek(file, 0, SEEK_END) != 0) { fclose(file); return file_error(); }
  long length = ftell(file);
  if (length < 0 || fseek(file, 0, SEEK_SET) != 0) { fclose(file); return file_error(); }
  char *contents = malloc((size_t)length + 1);
  if (!contents) fail("out of memory");
  size_t count = fread(contents, 1, (size_t)length, file);
  bool failed = ferror(file) || count != (size_t)length;
  if (fclose(file) != 0) failed = true;
  if (failed || !valid_text((const unsigned char *)contents, count)) { free(contents); return file_error(); }
  contents[count] = '\0';
  AugValue value = aug_string(contents);
  free(contents);
  return value;
}

AugValue aug_write_file(AugValue path, AugValue content) {
  FILE *file = fopen(aug_cstring(path), "wb");
  if (!file) return file_error();
  const char *text = aug_cstring(content);
  size_t length = strlen(text);
  bool failed = fwrite(text, 1, length, file) != length;
  if (fclose(file) != 0) failed = true;
  return failed ? file_error() : aug_null();
}

AugValue aug_field(AugValue object, size_t index) {
  if (object.tag != AUG_OBJECT || !object.as.object || index >= object.as.object->field_count)
    fail("invalid field access");
  if (object.as.object->dropped) fail("use of dropped object");
  return object.as.object->fields[index];
}

void aug_set_field(AugValue object, size_t index, AugValue value) {
  if (object.tag != AUG_OBJECT || !object.as.object || index >= object.as.object->field_count)
    fail("invalid field assignment");
  if (object.as.object->dropped) fail("use of dropped object");
  if (object.as.object->frozen) fail("cannot assign a frozen field");
  AugValue previous = object.as.object->fields[index];
  if (object.as.object->owned_fields && object.as.object->owned_fields[index] &&
      !(previous.tag == AUG_OBJECT && value.tag == AUG_OBJECT && previous.as.object == value.as.object))
    aug_drop(previous);
  object.as.object->fields[index] = value;
}

AugValue aug_call_method(AugValue object, const char *name, AugValue *args, int count) {
  if (object.tag != AUG_OBJECT || !object.as.object) fail("method call on non-object");
  if (object.as.object->dropped) fail("use of dropped object");
  for (size_t i = 0; i < object.as.object->method_count; i++) {
    const AugMethodEntry *entry = &object.as.object->methods[i];
    if (strcmp(entry->name, name) == 0) {
      if(entry->pointer_function){AugValue result=aug_null();entry->pointer_function(&result,&object,args,count);return result;}
      return entry->function(object, args, count);
    }
  }
  fprintf(stderr, "AugScript runtime error: %s has no method %s\n",
          object.as.object->type_name, name);
  exit(1);
}

const char *aug_cstring(AugValue value) {
  if (value.tag != AUG_STRING || !value.as.object) fail("expected string");
  return value.as.object->text;
}

int64_t aug_cint(AugValue value) {
  if (value.tag != AUG_INT) fail("expected int");
  return value.as.integer;
}

AugValue aug_to_c_int(AugValue value) {
  _Static_assert(sizeof(int) == 4 && INT_MAX == INT32_MAX, "AugScript c_int requires a signed 32-bit C int");
  int64_t number = aug_cint(value);
  if (number < INT32_MIN || number > INT32_MAX) {
    return checked_error("ConversionError");
  }
  return value;
}

typedef struct AugCoverage { const char *file; size_t line, count; struct AugCoverage *next; } AugCoverage;
static AugCoverage *coverage = NULL;
void aug_coverage_register(const char *file, size_t line) {
  for (AugCoverage *point = coverage; point; point = point->next)
    if (point->line == line && !strcmp(point->file, file)) return;
  AugCoverage *point = malloc(sizeof(*point));
  if (!point) fail("out of memory");
  *point = (AugCoverage){ file, line, 0, coverage }; coverage = point;
}
void aug_cover(const char *file, size_t line) {
  for (AugCoverage *point = coverage; point; point = point->next)
    if (point->line == line && !strcmp(point->file, file)) { point->count++; return; }
}
static void write_coverage(void) {
  const char *path = getenv("AUG_COVERAGE_FILE");
  FILE *output = path && coverage ? fopen(path, "w") : NULL;
  while (coverage) {
    AugCoverage *point = coverage; coverage = point->next;
    if (output) fprintf(output, "%s\t%zu\t%zu\n", point->file, point->line, point->count);
    free(point);
  }
  if (output) fclose(output);
}

double aug_cfloat(AugValue value) {
  if (value.tag == AUG_FLOAT) return value.as.floating;
  if (value.tag == AUG_INT) return (double)value.as.integer;
  fail("expected number");
  return 0;
}

bool aug_truthy(AugValue value) {
  if (value.tag != AUG_BOOL) fail("expected bool");
  return value.as.boolean;
}

static bool equal(AugValue left, AugValue right) {
  if ((left.tag == AUG_INT && right.tag == AUG_FLOAT) || (left.tag == AUG_FLOAT && right.tag == AUG_INT))
    return aug_cfloat(left) == aug_cfloat(right);
  if (left.tag != right.tag) return false;
  switch (left.tag) {
    case AUG_NULL: return true;
    case AUG_INT: return left.as.integer == right.as.integer;
    case AUG_FLOAT: return left.as.floating == right.as.floating;
    case AUG_BOOL: return left.as.boolean == right.as.boolean;
    case AUG_STRING: return left.as.object->text_length == right.as.object->text_length &&
      memcmp(left.as.object->text, right.as.object->text, left.as.object->text_length) == 0;
    default:
      if ((left.as.object->kind == AUG_TUPLE_KIND && right.as.object->kind == AUG_TUPLE_KIND) ||
          (left.as.object->kind == AUG_RECORD_KIND && right.as.object->kind == AUG_RECORD_KIND && !strcmp(left.as.object->type_name, right.as.object->type_name))) {
        if (left.as.object->field_count != right.as.object->field_count) return false;
        for (size_t i = 0; i < left.as.object->field_count; i++)
          if (!equal(left.as.object->fields[i], right.as.object->fields[i])) return false;
        return true;
      }
      return left.as.object == right.as.object;
  }
}

AugValue aug_binary(const char *op, AugValue left, AugValue right) {
  if (!strcmp(op, "==")) return aug_bool(equal(left, right));
  if (!strcmp(op, "!=")) return aug_bool(!equal(left, right));
  if (!strcmp(op, "&&")) return aug_bool(aug_truthy(left) && aug_truthy(right));
  if (!strcmp(op, "||")) return aug_bool(aug_truthy(left) || aug_truthy(right));
  if (!strcmp(op, "+") && left.tag == AUG_STRING && right.tag == AUG_STRING) {
    const char *a = aug_cstring(left), *b = aug_cstring(right);
    size_t first_length = left.as.object->text_length, length = first_length + right.as.object->text_length;
    char *joined = malloc(length + 1);
    if (!joined) fail("out of memory");
    memcpy(joined, a, first_length);
    memcpy(joined + first_length, b, right.as.object->text_length);
    AugValue result = aug_string_n(joined, length);
    free(joined);
    return result;
  }
  if ((left.tag != AUG_INT && left.tag != AUG_FLOAT) ||
      (right.tag != AUG_INT && right.tag != AUG_FLOAT)) fail("invalid binary operands");
  double a = aug_cfloat(left), b = aug_cfloat(right);
  if (left.tag == AUG_INT && right.tag == AUG_INT) {
    int64_t x = left.as.integer, y = right.as.integer;
    if (!strcmp(op, "<")) return aug_bool(x < y);
    if (!strcmp(op, ">")) return aug_bool(x > y);
    if (!strcmp(op, "<=")) return aug_bool(x <= y);
    if (!strcmp(op, ">=")) return aug_bool(x >= y);
  }
  if (!strcmp(op, "<")) return aug_bool(a < b);
  if (!strcmp(op, ">")) return aug_bool(a > b);
  if (!strcmp(op, "<=")) return aug_bool(a <= b);
  if (!strcmp(op, ">=")) return aug_bool(a >= b);
  if (!strcmp(op, "/") && b == 0) return checked_error("ArithmeticError");
  if (left.tag == AUG_INT && right.tag == AUG_INT) {
    int64_t x = left.as.integer, y = right.as.integer;
    if (!strcmp(op, "<")) return aug_bool(x < y);
    if (!strcmp(op, ">")) return aug_bool(x > y);
    if (!strcmp(op, "<=")) return aug_bool(x <= y);
    if (!strcmp(op, ">=")) return aug_bool(x >= y);
    if (!strcmp(op, "+")) return aug_int(signed_bits((uint64_t)x + (uint64_t)y));
    if (!strcmp(op, "-")) return aug_int(signed_bits((uint64_t)x - (uint64_t)y));
    if (!strcmp(op, "*")) return aug_int(signed_bits((uint64_t)x * (uint64_t)y));
    if (!strcmp(op, "/")) return aug_int(x == INT64_MIN && y == -1 ? INT64_MIN : x / y);
  }
  if (!strcmp(op, "+")) return aug_float(a + b);
  if (!strcmp(op, "-")) return aug_float(a - b);
  if (!strcmp(op, "*")) return aug_float(a * b);
  if (!strcmp(op, "/")) return aug_float(a / b);
  fail("unknown binary operator");
  return aug_null();
}

AugValue aug_unary(const char *op, AugValue value) {
  if (!strcmp(op, "!")) return aug_bool(!aug_truthy(value));
  if (!strcmp(op, "-") && value.tag == AUG_INT) return aug_int(signed_bits(UINT64_C(0) - (uint64_t)value.as.integer));
  if (!strcmp(op, "-") && value.tag == AUG_FLOAT) return aug_float(-value.as.floating);
  fail("invalid unary operand");
  return aug_null();
}

void aug_print(AugValue value) {
  switch (value.tag) {
    case AUG_NULL: puts("null"); break;
    case AUG_INT: printf("%lld\n", (long long)value.as.integer); break;
    case AUG_FLOAT: printf("%g\n", value.as.floating); break;
    case AUG_BOOL: puts(value.as.boolean ? "true" : "false"); break;
    case AUG_STRING: fwrite(value.as.object->text, 1, value.as.object->text_length, stdout); putchar('\n'); break;
    case AUG_OBJECT:
      if (value.as.object->kind == AUG_HTML_KIND) {fwrite(value.as.object->text, 1, value.as.object->text_length, stdout); putchar('\n');}
      else printf("<%s>\n", value.as.object->type_name); break;
    default: fail("invalid value");
  }
  fflush(stdout);
}

void aug_assert(AugValue condition, const char *expression, const char *file, int line) {
  aug_test_assertions++;
  if (aug_truthy(condition)) return;
  aug_test_failed = true;
  fprintf(stderr, "%s:%d: assertion failed: %s\n", file, line, expression);
  aug_throw(aug_new_object("AssertionError", 0, NULL, NULL, 0));
}

void aug_frame_enter(AugFrame *frame, AugValue *slots, size_t count) {
  frame->slots = slots;
  frame->count = count;
  frame->previous = frames;
  frames = frame;
}

void aug_frame_leave(AugFrame *frame) {
  if (frames != frame) fail("invalid root frame");
  frames = frame->previous;
}
void aug_retain(AugRetained *root, AugValue *values, size_t count) {
  root->values = values; root->count = count; root->next = retained; retained = root;
}
void aug_release(AugRetained *root) {
  AugRetained **cursor = &retained; while (*cursor && *cursor != root) cursor = &(*cursor)->next;
  if (*cursor) *cursor = root->next;
}

void aug_register_globals(AugValue *values, size_t count) {
  globals = values;
  global_count = count;
}
AugValue aug_binding_get(size_t index) {
  return scopes && scopes->mask[index] ? scopes->values[index] : globals[index];
}
void aug_binding_set(size_t index, AugValue value) {
  if (scopes && scopes->mask[index]) scopes->values[index] = value; else globals[index] = value;
}

size_t aug_scope_depth(void) { return scope_count; }
typedef struct AugHeldLock {struct AugHeldLock *previous; pthread_mutex_t *mutex; AugValue value;} AugHeldLock;
void (*aug_mutex_wait_hook)(void);
static void destroy_mutex(void *native) {pthread_mutex_destroy(native); free(native);}
static const unsigned char shared_owned_field[] = {1};
AugValue aug_shared_new(AugValue value) {
  AugFrame frame; aug_frame_enter(&frame, &value, 1);
  AugValue result = aug_new_object("Shared", 1, shared_owned_field, NULL, 0);
  pthread_mutex_t *mutex = malloc(sizeof(*mutex)); if (!mutex || pthread_mutex_init(mutex, NULL)) fail("cannot initialize shared state");
  result.as.object->native = mutex; result.as.object->finalize = destroy_mutex; aug_set_field(result, 0, value);
  aug_frame_leave(&frame); return result;
}
size_t aug_lock_depth(void) {return current_execution->lock_depth;}
AugValue aug_shared_lock(AugValue value) {
  pthread_mutex_t *mutex = value.as.object->native; int status;
  while ((status = pthread_mutex_trylock(mutex)) == EBUSY && !aug_cancelled) {
    if (aug_mutex_wait_hook) aug_mutex_wait_hook(); else {status = pthread_mutex_lock(mutex); break;}
  }
  if (aug_cancelled) return aug_null(); if (status) fail("cannot lock shared state");
  AugHeldLock *lock = malloc(sizeof(*lock)); if (!lock) fail("out of memory");
  *lock = (AugHeldLock){current_execution->held_locks, mutex, value};
  current_execution->held_locks = lock; current_execution->lock_depth++; return aug_field(value, 0);
}
void aug_lock_leave(void) {
  AugHeldLock *lock = current_execution->held_locks; if (!lock) fail("invalid lock release");
  current_execution->held_locks = lock->previous; current_execution->lock_depth--; pthread_mutex_unlock(lock->mutex); free(lock);
}
void aug_lock_restore(size_t depth) {while (aug_lock_depth() > depth) aug_lock_leave();}
void aug_scope_enter(const unsigned char *mask) {
  AugScope *scope = calloc(1, sizeof(AugScope));
  if (!scope) fail("out of memory");
  scope->values = calloc(global_count ? global_count : 1, sizeof(AugValue));
  if (!scope->values) fail("out of memory");
  scope->mask = mask; scope->previous = scopes;
  scopes = scope; scope_count++;
}
void aug_scope_leave(void) {
  if (!scopes) fail("invalid composition scope");
  AugScope *scope = scopes;
  if (aug_scope_join_hook) aug_scope_join_hook(scope);
  scopes = scope->previous; scope_count--;
  free(scope->values); free(scope);
}
/* Join borrowers while the scope's injected resources are still available. */
void aug_scope_join_to(size_t depth) {
  AugScope *scope = scopes;
  for (size_t count = scope_count; count > depth && scope; count--, scope = scope->previous)
    if (aug_scope_join_hook) aug_scope_join_hook(scope);
}
void aug_scope_restore(size_t depth) { while (scope_count > depth) aug_scope_leave(); }

static void mark(AugValue value) {
  if (value.tag != AUG_STRING && value.tag != AUG_OBJECT) return;
  AugObject *object = value.as.object;
  if (!object || object->marked) return;
  object->marked = true;
  for (size_t i = 0; i < object->field_count; i++) mark(object->fields[i]);
}

void aug_freeze(AugValue value) {
  if ((value.tag != AUG_OBJECT && value.tag != AUG_STRING) || value.as.object->frozen) return;
  size_t count = 0, capacity = 16;
  AugObject **pending = malloc(capacity * sizeof(*pending)); if (!pending) fail("out of memory");
  value.as.object->frozen = true; pending[count++] = value.as.object;
  while (count) {
    AugObject *object = pending[--count];
    for (size_t i = 0; i < object->field_count; i++) {
      AugValue field = object->fields[i];
      if ((field.tag != AUG_OBJECT && field.tag != AUG_STRING) || field.as.object->frozen) continue;
      field.as.object->frozen = true;
      if (count == capacity) { capacity *= 2; pending = realloc(pending, capacity * sizeof(*pending)); if (!pending) fail("out of memory"); }
      pending[count++] = field.as.object;
    }
  }
  free(pending);
}

static void mark_execution_roots(void) {
  for (AugRetained *root = retained; root; root = root->next) for (size_t i = 0; i < root->count; i++) mark(root->values[i]);
  for (size_t i = 0; i < global_count; i++) mark(globals[i]);
  for (AugExecution *execution = executions; execution; execution = execution->next) {
    for (AugHeldLock *lock = execution->held_locks; lock; lock = lock->previous) mark(lock->value);
    for (AugScope *scope = execution->scope_stack; scope; scope = scope->previous)
      for (size_t i = 0; i < global_count; i++) mark(scope->values[i]);
    if (execution->has_error) mark(execution->error);
    for (AugFrame *frame = execution->root_frames; frame; frame = frame->previous)
      for (size_t i = 0; i < frame->count; i++) mark(frame->slots[i]);
  }
  mark(cli_args);
  if (aug_has_error) mark(aug_error);
  for (AugFrame *frame = frames; frame; frame = frame->previous)
    for (size_t i = 0; i < frame->count; i++) mark(frame->slots[i]);
}
void aug_collect(void) {
  if (collecting) return;
  collecting = true;
  mark_execution_roots();
  for (AugObject *object = heap; object; object = object->next) {
    if (!object->marked && object->kind == AUG_OBJECT && !object->dropped)
      aug_drop((AugValue){ .tag = AUG_OBJECT, .as.object = object });
  }
  // Cleanup may change an existing root or allocate values. Trace every suspended
  // execution again, including fields of objects marked by the first pass.
  for (AugObject *object = heap; object; object = object->next) object->marked = false;
  mark_execution_roots();
  // Objects created by cleanup receive their own cleanup opportunity next cycle.
  for (AugObject *object = heap; object; object = object->next)
    if (!object->marked && object->kind == AUG_OBJECT && !object->dropped)
      mark((AugValue){.tag=AUG_OBJECT, .as.object=object});
  AugObject **cursor = &heap;
  while (*cursor) {
    AugObject *object = *cursor;
    if (object->marked) { object->marked = false; cursor = &object->next; }
    else {
      *cursor = object->next;
      if (object->kind == AUG_PRIVATE_KEY_KIND && object->text) {
        volatile unsigned char *secret = (volatile unsigned char *)object->text;
        for (size_t i = 0; i < object->text_length; i++) secret[i] = 0;
      }
      if (object->finalize) object->finalize(object->native);
      free(object->text);
      free(object->fields);
      free(object->buckets);
      free(object);
      object_count--;
    }
  }
  next_collection = object_count * 2 + 1024;
  collecting = false;
}

void aug_drop(AugValue value) {
  if (value.tag != AUG_OBJECT && value.tag != AUG_STRING) return;
  AugObject *object = value.as.object;
  if (!object || object->dropped) return;
  AugValue roots[2] = {value, aug_error}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
  bool failed = aug_has_error, cancelled = aug_cancelled;
  aug_error = aug_null(); aug_has_error = false; aug_cancelled = false;
  if (object->kind == AUG_OBJECT) {
    if (getenv("AUG_TRACE_DROPS")) fprintf(stderr, "drop: %s\n", object->type_name);
    for (size_t i = 0; i < object->method_count; i++)
      if (strcmp(object->methods[i].name, "drop") == 0) {
        if(object->methods[i].pointer_function){AugValue ignored=aug_null();object->methods[i].pointer_function(&ignored,&value,NULL,0);}
        else object->methods[i].function(value, NULL, 0);
        break;
      }
  }
  object->dropped = true;
  if(object->kind==AUG_NATIVE_RESOURCE_KIND&&object->finalize){
    void *native=object->native;void(*release)(void *)=object->finalize;
    object->native=NULL;object->finalize=NULL;
    if(native)release(native);
  }
  for (size_t i = 0; i < object->field_count; i++)
    if (object->owned_fields && object->owned_fields[i]) aug_drop(object->fields[i]);
  if (failed) aug_throw(roots[1]); aug_cancelled = aug_cancelled || cancelled;
  aug_frame_leave(&frame);
}

void aug_throw(AugValue value) { aug_error = value; aug_has_error = true; }
void aug_constructor_result_cleanup(AugValue value, AugValue result) {
  if (value.tag != AUG_OBJECT || !value.as.object || value.as.object->dropped) return;
  if (aug_has_error || aug_cancelled || result.tag != AUG_OBJECT || result.as.object != value.as.object)
    aug_drop(value);
}
void aug_drop_partial(AugValue value) {
  if(value.tag!=AUG_OBJECT||!value.as.object||value.as.object->dropped)return;
  AugValue roots[2]={value,aug_error};AugFrame frame;aug_frame_enter(&frame,roots,2);
  bool pending=aug_has_error,cancelled=aug_cancelled;
  aug_error=aug_null();aug_has_error=false;aug_cancelled=false;
  AugObject *object=value.as.object;object->dropped=true;
  for(size_t i=0;i<object->field_count;i++)
    if(object->owned_fields&&object->owned_fields[i])aug_drop(object->fields[i]);
  /* A constructor's checked failure remains primary during implicit cleanup. */
  if(pending)aug_throw(roots[1]);aug_cancelled=aug_cancelled||cancelled;
  aug_frame_leave(&frame);
}
AugValue aug_take_error(void) {
  AugValue value = aug_error;
  aug_error = aug_null();
  aug_has_error = false;
  return value;
}
bool aug_error_is(const char *name) {
  if (!aug_has_error) return false;
  if (!strcmp(name, "Error")) return true;
  return aug_error.tag == AUG_OBJECT &&
         !strcmp(aug_error.as.object->type_name, name);
}
void aug_report_error(void) {
  if (!aug_has_error) return;
  if (aug_error.tag == AUG_OBJECT) fprintf(stderr, "Uncaught %s\n", aug_error.as.object->type_name);
  else fprintf(stderr, "Uncaught error\n");
}
void aug_shutdown(void) {
  write_coverage();
  aug_scope_restore(0);
  globals = NULL;
  global_count = 0;
  cli_args = aug_null();
  frames = NULL;
  aug_error = aug_null();
  aug_has_error = false;
  aug_collect();
}
