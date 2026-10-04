#include "aug_runtime.h"
#include <yyjson.h>
#include <string.h>
#include <limits.h>
#include <math.h>
#include <stdlib.h>

static AugValue invalid(void) { return aug_error_named("JsonError"); }
static AugValue unwrap(AugValue value) {
  return value.tag == AUG_OBJECT && value.as.object->kind == AUG_JSON_KIND ? aug_field(value, 0) : value;
}
AugValue aug_json_wrap(AugValue value) {
  AugValue root = value; AugFrame frame; aug_frame_enter(&frame, &root, 1);
  AugValue result = aug_new_object("Json", 1, NULL, NULL, 0);
  result.as.object->kind = AUG_JSON_KIND; aug_set_field(result, 0, root);
  aug_freeze(result);
  aug_frame_leave(&frame); return result;
}
static AugValue read_value(yyjson_val *value, size_t depth) {
  if (depth > 64) return invalid();
  if (yyjson_is_null(value)) return aug_null();
  if (yyjson_is_bool(value)) return aug_bool(yyjson_get_bool(value));
  if (yyjson_is_str(value)) return aug_string_n(yyjson_get_str(value), yyjson_get_len(value));
  if (yyjson_is_sint(value)) return aug_int(yyjson_get_sint(value));
  if (yyjson_is_uint(value)) return yyjson_get_uint(value) <= INT64_MAX ? aug_int((int64_t)yyjson_get_uint(value)) : invalid();
  if (yyjson_is_real(value)) return isfinite(yyjson_get_real(value)) ? aug_float(yyjson_get_real(value)) : invalid();
  AugValue roots[3] = {0}; AugFrame frame; aug_frame_enter(&frame, roots, 3);
  if (yyjson_is_arr(value)) {
    roots[0] = aug_list_new(NULL, 0); size_t index, count; yyjson_val *item;
    yyjson_arr_foreach(value, index, count, item) {
      roots[1] = read_value(item, depth + 1); if (aug_has_error) break;
      aug_list_append(roots[0], roots[1]);
    }
  } else if (yyjson_is_obj(value)) {
    roots[0] = aug_map_new(); size_t index, count; yyjson_val *key, *item;
    yyjson_obj_foreach(value, index, count, key, item) {
      roots[1] = aug_string_n(yyjson_get_str(key), yyjson_get_len(key));
      if (aug_map_contains(roots[0], roots[1])) { invalid(); break; }
      roots[2] = read_value(item, depth + 1); if (aug_has_error) break;
      aug_map_set(roots[0], roots[1], roots[2]);
    }
  } else invalid();
  AugValue result = roots[0]; aug_frame_leave(&frame); return result;
}
AugValue _aug_json_parse(AugValue input) {
  yyjson_read_err error;
  yyjson_doc *doc = yyjson_read_opts(input.as.object->text, input.as.object->text_length, YYJSON_READ_NOFLAG, NULL, &error);
  if (!doc) return invalid();
  AugValue root = read_value(yyjson_doc_get_root(doc), 0); yyjson_doc_free(doc);
  return aug_has_error ? aug_null() : aug_json_wrap(root);
}
static yyjson_mut_val *write_value(yyjson_mut_doc *doc, AugValue value, size_t depth) {
  value = unwrap(value);
  if (depth > 64) { invalid(); return NULL; }
  switch (value.tag) {
    case AUG_NULL: return yyjson_mut_null(doc);
    case AUG_INT: return yyjson_mut_sint(doc, value.as.integer);
    case AUG_BOOL: return yyjson_mut_bool(doc, value.as.boolean);
    case AUG_FLOAT: if (isfinite(value.as.floating)) return yyjson_mut_real(doc, value.as.floating); break;
    case AUG_STRING: return yyjson_mut_strncpy(doc, value.as.object->text, value.as.object->text_length);
    case AUG_OBJECT: {
      AugObject *object = value.as.object;
      if (object->kind == AUG_LIST_KIND || object->kind == AUG_TUPLE_KIND || object->kind == AUG_SET_KIND) {
        yyjson_mut_val *array = yyjson_mut_arr(doc);
        for (size_t i = 0; i < object->field_count; i++) {
          yyjson_mut_val *child = write_value(doc, object->fields[i], depth + 1); if (!child) return NULL;
          yyjson_mut_arr_append(array, child);
        }
        return array;
      }
      if (object->kind == AUG_MAP_KIND || object->kind == AUG_RECORD_KIND) {
        yyjson_mut_val *output = yyjson_mut_obj(doc);
        for (size_t i = 0; i < object->field_count; i += object->kind == AUG_MAP_KIND ? 2 : 1) {
          yyjson_mut_val *key;
          if (object->kind == AUG_MAP_KIND) {
            AugValue label = object->fields[i]; if (label.tag != AUG_STRING) { invalid(); return NULL; }
            key = yyjson_mut_strncpy(doc, label.as.object->text, label.as.object->text_length);
          } else {
            if (!object->field_names || object->field_names[i][0] == '_') { invalid(); return NULL; }
            key = yyjson_mut_strcpy(doc, object->field_names[i]);
          }
          yyjson_mut_val *child = write_value(doc, object->fields[i + (object->kind == AUG_MAP_KIND ? 1 : 0)], depth + 1);
          if (!child) return NULL; yyjson_mut_obj_add(output, key, child);
        }
        return output;
      }
    }
  }
  invalid(); return NULL;
}
AugValue aug_json_stringify(AugValue value) {
  yyjson_mut_doc *doc = yyjson_mut_doc_new(NULL); if (!doc) return invalid();
  yyjson_mut_val *root = write_value(doc, value, 0);
  if (!root) { yyjson_mut_doc_free(doc); return aug_null(); }
  yyjson_mut_doc_set_root(doc, root); size_t length;
  char *text = yyjson_mut_write(doc, YYJSON_WRITE_NOFLAG, &length);
  AugValue result = text ? aug_string_n(text, length) : invalid();
  free(text); yyjson_mut_doc_free(doc); return result;
}
AugValue aug_json_get(AugValue value, AugValue name) {
  AugValue object = unwrap(value);
  if (object.tag != AUG_OBJECT || object.as.object->kind != AUG_MAP_KIND || !aug_map_contains(object, name)) return aug_null();
  AugValue item = aug_map_get(object, name);
  return item.tag == AUG_NULL ? aug_null() : aug_json_wrap(item);
}
AugValue aug_json_require(AugValue value, AugValue name) {
  AugValue result = aug_json_get(value, name); return result.tag == AUG_NULL ? invalid() : result;
}
AugValue aug_json_string(AugValue value) { value = unwrap(value); return value.tag == AUG_STRING ? value : invalid(); }
int64_t aug_json_integer(AugValue value) { value = unwrap(value); if (value.tag == AUG_INT) return value.as.integer; invalid(); return 0; }
bool aug_json_boolean(AugValue value) { value = unwrap(value); if (value.tag == AUG_BOOL) return value.as.boolean; invalid(); return false; }
AugValue aug_json_items(AugValue value) {
  value = unwrap(value); if (value.tag != AUG_OBJECT || value.as.object->kind != AUG_LIST_KIND) return invalid();
  AugValue roots[2] = {value, aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
  roots[1] = aug_list_new(NULL, 0);
  for (size_t i = 0; i < value.as.object->field_count; i++) aug_list_append(roots[1], aug_json_wrap(value.as.object->fields[i]));
  AugValue result = roots[1]; aug_frame_leave(&frame); return result;
}
AugValue aug_schema_make(const AugSchema *schema, AugValue *fields, int count) {
  if(schema->pointer_make){AugValue result=aug_null();schema->pointer_make(&result,NULL,fields,count);return result;}
  if(schema->make)return schema->make(fields,count);
  return invalid();
}
static AugValue decode(AugValue value, const AugSchema *schema, size_t depth) {
  if (depth > 64) return invalid();
  if (value.tag == AUG_NULL && schema->nullable) return value;
  if (schema->kind == AUG_SCHEMA_JSON) return aug_json_wrap(value);
  if ((schema->kind == AUG_SCHEMA_INT && value.tag == AUG_INT) || (schema->kind == AUG_SCHEMA_BOOL && value.tag == AUG_BOOL) || (schema->kind == AUG_SCHEMA_STRING && value.tag == AUG_STRING)) return value;
  if (schema->kind == AUG_SCHEMA_C_INT && value.tag == AUG_INT && value.as.integer >= INT32_MIN && value.as.integer <= INT32_MAX) return value;
  if (schema->kind == AUG_SCHEMA_FLOAT && (value.tag == AUG_FLOAT || value.tag == AUG_INT)) return aug_float(aug_cfloat(value));
  if (value.tag != AUG_OBJECT) return invalid();
  AugObject *object = value.as.object;
  size_t count = schema->kind == AUG_SCHEMA_RECORD || schema->kind == AUG_SCHEMA_TUPLE ? schema->count : object->field_count;
  if (schema->kind == AUG_SCHEMA_RECORD) {
    if (object->kind != AUG_MAP_KIND || object->field_count > count * 2) return invalid();
    for (size_t i = 0; i < object->field_count; i += 2) {
      AugValue key = object->fields[i]; bool found = false;
      for (size_t j = 0; j < count; j++) if (key.tag == AUG_STRING && key.as.object->text_length == strlen(schema->names[j]) && !memcmp(key.as.object->text, schema->names[j], key.as.object->text_length)) found = true;
      if (!found) return invalid();
    }
  }
  if (schema->kind == AUG_SCHEMA_TUPLE && (object->kind != AUG_LIST_KIND || count != object->field_count)) return invalid();
  if ((schema->kind == AUG_SCHEMA_LIST || schema->kind == AUG_SCHEMA_SET) && object->kind != AUG_LIST_KIND) return invalid();
  if (schema->kind == AUG_SCHEMA_MAP && object->kind != AUG_MAP_KIND) return invalid();
  AugValue *items = calloc(count + 1, sizeof(AugValue)); if (!items) return invalid();
  items[count] = value; AugFrame frame; aug_frame_enter(&frame, items, count + 1);
  for (size_t i = 0; i < count; i++) {
    AugValue item; const AugSchema *field;
    if (schema->kind == AUG_SCHEMA_RECORD) {
      AugValue name = aug_string(schema->names[i]);
      field = schema->fields[i];
      bool present = aug_map_contains(value, name);
      if (!present && !field->optional) { invalid(); break; }
      item = present ? aug_map_get(value, name) : aug_null();
    } else { item = object->fields[i]; field = schema->fields[schema->kind == AUG_SCHEMA_TUPLE ? i : schema->kind == AUG_SCHEMA_MAP ? i % 2 : 0]; }
    items[i] = decode(item, field, depth + 1); if (aug_has_error) break;
  }
  AugValue result = aug_null();
  if (!aug_has_error) {
    if (schema->kind == AUG_SCHEMA_RECORD) result = aug_schema_make(schema,items,(int)count);
    else if (schema->kind == AUG_SCHEMA_TUPLE) result = aug_tuple_new(items, count);
    else if (schema->kind == AUG_SCHEMA_SET) result = aug_set_new(items, count);
    else if (schema->kind == AUG_SCHEMA_MAP) { result = aug_map_new(); items[count] = result; for (size_t i = 0; i < count; i += 2) aug_map_set(result, items[i], items[i + 1]); }
    else result = aug_list_new(items, count);
  }
  aug_frame_leave(&frame); free(items); return result;
}
AugValue aug_json_decode(AugValue value, const AugSchema *schema) {
  AugValue result = decode(unwrap(value), schema, 0); if (!aug_has_error) aug_freeze(result); return result;
}

bool aug_json_has(AugValue value,AugValue name) {
  AugValue object=unwrap(value);return object.tag==AUG_OBJECT&&object.as.object->kind==AUG_MAP_KIND&&aug_map_contains(object,name);
}

/* Explicit compatibility reader. The traversal uses heap frames, not recursion,
   so a sender cannot exhaust a coroutine's native stack with ignored fields. */
static AugValue compatible_scalar(yyjson_val *value) {
  if(yyjson_is_null(value))return aug_null();
  if(yyjson_is_bool(value))return aug_bool(yyjson_get_bool(value));
  if(yyjson_is_str(value))return aug_string_n(yyjson_get_str(value),yyjson_get_len(value));
  double number;
  if(yyjson_is_num(value))number=yyjson_get_num(value);
  else if(yyjson_is_raw(value)) {
    size_t size=yyjson_get_len(value);char *text=malloc(size+1);if(!text)abort();
    memcpy(text,yyjson_get_raw(value),size);text[size]=0;char *end;number=strtod(text,&end);
    bool valid=(size_t)(end-text)==size;free(text);if(!valid)return invalid();
  }else return invalid();
  if(isfinite(number)&&number>=-0x1p63&&number<0x1p63&&floor(number)==number)return aug_int((int64_t)number);
  return aug_float(number);
}
AugValue _aug_json_parse_compatible(AugValue input) {
  enum {LIMIT=4096};
  yyjson_read_err error;yyjson_doc *doc=yyjson_read_opts(input.as.object->text,input.as.object->text_length,YYJSON_READ_BIGNUM_AS_RAW,NULL,&error);
  if(!doc)return invalid();
  typedef struct {yyjson_val *value,*key;bool initialized;yyjson_arr_iter array;yyjson_obj_iter object;} Walk;
  Walk *walk=calloc(LIMIT+1,sizeof(*walk));AugValue *roots=calloc(LIMIT+2,sizeof(*roots));if(!walk||!roots)abort();
  AugFrame frame;aug_frame_enter(&frame,roots,LIMIT+2);size_t depth=0;walk[0].value=yyjson_doc_get_root(doc);
  while(!aug_has_error) {
    Walk *at=&walk[depth];
    if(!at->initialized){at->initialized=true;
      if(yyjson_is_arr(at->value)){roots[depth]=aug_list_new(NULL,0);yyjson_arr_iter_init(at->value,&at->array);}
      else if(yyjson_is_obj(at->value)){roots[depth]=aug_map_new();yyjson_obj_iter_init(at->value,&at->object);}
      else roots[depth]=compatible_scalar(at->value);
    }
    if(aug_has_error)break;
    yyjson_val *next=NULL;
    if(yyjson_is_arr(at->value))next=yyjson_arr_iter_next(&at->array);
    else if(yyjson_is_obj(at->value)){at->key=yyjson_obj_iter_next(&at->object);if(at->key)next=yyjson_obj_iter_get_val(at->key);}
    if(next){if(depth==LIMIT){invalid();break;}depth++;walk[depth]=(Walk){.value=next};continue;}
    if(!depth)break;
    Walk *parent=&walk[depth-1];
    if(yyjson_is_arr(parent->value))aug_list_append(roots[depth-1],roots[depth]);
    else{roots[LIMIT+1]=aug_string_n(yyjson_get_str(parent->key),yyjson_get_len(parent->key));aug_map_set(roots[depth-1],roots[LIMIT+1],roots[depth]);roots[LIMIT+1]=aug_null();}
    roots[depth]=aug_null();depth--;
  }
  AugValue result=aug_has_error?aug_null():aug_json_wrap(roots[0]);
  aug_frame_leave(&frame);free(roots);free(walk);yyjson_doc_free(doc);return result;
}
