#include "aug_ir.h"
#include <limits.h>
#include <stdlib.h>
#include <stdio.h>

_Static_assert(sizeof(AugValue)==16, "LLVM pack must record its actual AugValue layout");
_Static_assert(offsetof(AugValue,as)==8, "LLVM pack must record its actual payload offset");

void aug_ir_operation(AugValue *out,int op,AugValue *a,int count,const char *text,int64_t n) {
  (void)count; *out=aug_null();
  switch(op) {
    case AUG_IR_PRINT: aug_print(a[0]); break;
    case AUG_IR_BINARY: *out=aug_binary(text,a[0],a[1]); break;
    case AUG_IR_LIST_JOIN:*out=aug_list_join(a[0],a[1]);break;
    case AUG_IR_STRING_ENDS_WITH:*out=aug_bool(aug_string_ends_with(a[0],a[1]));break;
    case AUG_IR_STRING_REPLACE:*out=aug_string_replace(a[0],a[1],a[2]);break;
    case AUG_IR_STRING_CODE_POINT_LENGTH:*out=aug_int(aug_string_code_point_length(a[0]));break;
    case AUG_IR_STRING_PARSE_INTEGER:*out=aug_int(aug_string_parse_integer(a[0]));break;
    case AUG_IR_STRING_PARSE_FLOAT:*out=aug_string_parse_float(a[0]);break;
    case AUG_IR_TEXT: *out=aug_text(a[0]); break;
    case AUG_IR_UNARY: *out=aug_unary(text,a[0]); break;
    case AUG_IR_FIELD: *out=aug_field(a[0],(size_t)n); break;
    case AUG_IR_SET_FIELD: aug_set_field(a[0],(size_t)n,a[1]); break;
    case AUG_IR_LIST: *out=aug_list_new(a,(size_t)count); break;
    case AUG_IR_TUPLE: *out=aug_tuple_new(a,(size_t)count); break;
    case AUG_IR_SET: *out=aug_set_new(a,(size_t)count); break;
    case AUG_IR_MAP: *out=aug_map_new(); break;
    case AUG_IR_MAP_SET: aug_map_set(a[0],a[1],a[2]); break;
    case AUG_IR_LIST_LENGTH: *out=aug_int(aug_list_length(a[0])); break;
    case AUG_IR_LIST_GET: *out=aug_list_get(a[0],aug_cint(a[1])); break;
    case AUG_IR_LIST_AT: *out=aug_list_at(a[0],aug_cint(a[1])); break;
    case AUG_IR_LIST_APPEND: aug_list_append(a[0],a[1]); break;
    case AUG_IR_TUPLE_LENGTH: *out=aug_int(aug_tuple_length(a[0])); break;
    case AUG_IR_TUPLE_GET: *out=aug_tuple_get(a[0],aug_cint(a[1])); break;
    case AUG_IR_SET_LENGTH: *out=aug_int(aug_set_length(a[0])); break;
    case AUG_IR_SET_ADD: aug_set_add(a[0],a[1]); break;
    case AUG_IR_SET_CONTAINS: *out=aug_bool(aug_set_contains(a[0],a[1])); break;
    case AUG_IR_MAP_LENGTH: *out=aug_int(aug_map_length(a[0])); break;
    case AUG_IR_MAP_GET: *out=aug_map_get(a[0],a[1]); break;
    case AUG_IR_MAP_TAKE: *out=aug_map_take(a[0],a[1]); break;
    case AUG_IR_MAP_CONTAINS: *out=aug_bool(aug_map_contains(a[0],a[1])); break;
    case AUG_IR_STRING_TRIM:*out=aug_string_trim(a[0]);break;
    case AUG_IR_STRING_UTF16_LENGTH:*out=aug_int(aug_string_utf16_length(a[0]));break;
    case AUG_IR_STRING_IS_DECIMAL:*out=aug_bool(aug_string_is_decimal(a[0]));break;
    case AUG_IR_STRING_COMPARE_DECIMAL:*out=aug_int(aug_string_compare_decimal(a[0],a[1]));break;
    case AUG_IR_BYTES_SLICE:*out=aug_bytes_slice(a[0],aug_cint(a[1]),aug_cint(a[2]));break;
    case AUG_IR_BYTES_HEX:*out=aug_bytes_hex(a[0]);break;
    case AUG_IR_FLOAT_IS_FINITE:*out=aug_bool(aug_float_is_finite(a[0]));break;
    case AUG_IR_FLOAT_FLOAT32:*out=aug_float_float32(a[0]);break;
    case AUG_IR_JSON_HAS:*out=aug_bool(aug_json_has(a[0],a[1]));break;
    case AUG_IR_STRING_LENGTH: *out=aug_int(aug_string_length(a[0])); break;
    case AUG_IR_STRING_BYTES: *out=aug_string_bytes(a[0]); break;
    case AUG_IR_STRING_SPLIT: *out=aug_string_split(a[0],a[1]); break;
    case AUG_IR_STRING_STARTS_WITH: *out=aug_bool(aug_string_starts_with(a[0],a[1])); break;
    case AUG_IR_STRING_IS_TOKEN: *out=aug_bool(aug_string_is_token(a[0],aug_cint(a[1]),aug_cint(a[2]))); break;
    case AUG_IR_BYTES_LENGTH: *out=aug_int(aug_bytes_length(a[0])); break;
    case AUG_IR_BYTES_TEXT: *out=aug_bytes_text(a[0]); break;
    case AUG_IR_BYTES_BASE64URL: *out=aug_bytes_base64url(a[0]); break;
    case AUG_IR_BASE64URL_DECODE: *out=aug_base64url_decode(a[0]); break;
    case AUG_IR_C_INT: *out=aug_to_c_int(a[0]); break;
    case AUG_IR_READ_FILE: *out=aug_read_file(a[0]); break;
    case AUG_IR_WRITE_FILE: *out=aug_write_file(a[0],a[1]); break;
    case AUG_IR_ARGUMENTS: *out=aug_arguments(); break;
    case AUG_IR_FREEZE: aug_freeze(a[0]); *out=a[0]; break;
    case AUG_IR_ITER: *out=aug_iter_snapshot(a[0]); break;
    case AUG_IR_MAP_ITER: *out=aug_map_entries_snapshot(a[0]); break;
    case AUG_IR_IS_TYPE: *out=aug_bool(a[0].tag==AUG_OBJECT&&a[0].as.object&&!strcmp(a[0].as.object->type_name,text)); break;
    case AUG_IR_SHARED: *out=aug_shared_new(a[0]); break;
    case AUG_IR_SHARED_LOCK: *out=aug_shared_lock(a[0]); break;
    case AUG_IR_JSON_WRAP: *out=aug_json_wrap(a[0]); break;
    case AUG_IR_JSON_PARSE_COMPATIBLE:*out=_aug_json_parse_compatible(a[0]);break;
    case AUG_IR_JSON_PARSE: *out=_aug_json_parse(a[0]); break;
    case AUG_IR_JSON_STRINGIFY: *out=aug_json_stringify(a[0]); break;
    case AUG_IR_JSON_GET: *out=aug_json_get(a[0],a[1]); break;
    case AUG_IR_JSON_REQUIRE: *out=aug_json_require(a[0],a[1]); break;
    case AUG_IR_JSON_STRING: *out=aug_json_string(a[0]); break;
    case AUG_IR_JSON_INTEGER: *out=aug_int(aug_json_integer(a[0])); break;
    case AUG_IR_JSON_BOOLEAN: *out=aug_bool(aug_json_boolean(a[0])); break;
    case AUG_IR_JSON_ITEMS: *out=aug_json_items(a[0]); break;
    case AUG_IR_TIME_NOW: *out=_aug_time_now(); break;
    case AUG_IR_EXIT: {int64_t status=aug_cint(a[0]);aug_cancelled=true;aug_shutdown();exit(status>=0&&status<=255?(int)status:1);}
    case AUG_IR_TEST_CASE: aug_test_assertions=0;break;
    default: *out=aug_error_named("NativeContractError"); break;
  }
}
void aug_ir_json_decode(AugValue *out,const AugValue *value,const AugSchema *schema){*out=aug_json_decode(*value,schema);}
void aug_ir_print(const AugValue *value){aug_print(*value);}
void aug_ir_binary(AugValue *out,const char *operation,const AugValue *left,const AugValue *right){*out=aug_binary(operation,*left,*right);}
void aug_ir_unary(AugValue *out,const char *operation,const AugValue *value){*out=aug_unary(operation,*value);}
void aug_ir_list_new(AugValue *out,AugValue *items,int count){*out=aug_list_new(items,(size_t)count);}
void aug_ir_tuple_new(AugValue *out,AugValue *items,int count){*out=aug_tuple_new(items,(size_t)count);}
void aug_ir_set_new(AugValue *out,AugValue *items,int count){*out=aug_set_new(items,(size_t)count);}
void aug_ir_map(AugValue *out){*out=aug_map_new();}
void aug_ir_iter(AugValue *out,const AugValue *value){*out=aug_iter_snapshot(*value);}
void aug_ir_map_iter(AugValue *out,const AugValue *value){*out=aug_map_entries_snapshot(*value);}
void aug_ir_list_append(const AugValue *list,const AugValue *value){aug_list_append(*list,*value);}
int64_t aug_ir_tuple_length(const AugValue *tuple){return aug_tuple_length(*tuple);}
void aug_ir_tuple_get(AugValue *out,const AugValue *tuple,const AugValue *index){*out=aug_tuple_get(*tuple,aug_cint(*index));}
int64_t aug_ir_string_length(const AugValue *value){return aug_string_length(*value);}
void aug_ir_string_bytes(AugValue *out,const AugValue *value){*out=aug_string_bytes(*value);}
void aug_ir_string_split(AugValue *out,const AugValue *value,const AugValue *separator){*out=aug_string_split(*value,*separator);}
void aug_ir_map_set(const AugValue *map,const AugValue *key,const AugValue *value){aug_map_set(*map,*key,*value);}
void aug_ir_set_add(const AugValue *set,const AugValue *value){aug_set_add(*set,*value);}
uint8_t aug_ir_set_contains(const AugValue *set,const AugValue *value){return aug_set_contains(*set,*value)?1:0;}
uint8_t aug_ir_map_contains(const AugValue *map,const AugValue *key){return aug_map_contains(*map,*key)?1:0;}
int64_t aug_ir_list_length(const AugValue *list){return (int64_t)aug_list_length(*list);}
int64_t aug_ir_set_length(const AugValue *set){return (int64_t)aug_set_length(*set);}
int64_t aug_ir_map_length(const AugValue *map){return (int64_t)aug_map_length(*map);}
void aug_ir_list_get(AugValue *out,const AugValue *list,const AugValue *index){*out=aug_list_get(*list,aug_cint(*index));}
void aug_ir_list_at(AugValue *out,const AugValue *list,const AugValue *index){*out=aug_list_at(*list,aug_cint(*index));}
void aug_ir_map_get(AugValue *out,const AugValue *map,const AugValue *key){*out=aug_map_get(*map,*key);}
void aug_ir_map_take(AugValue *out,const AugValue *map,const AugValue *key){*out=aug_map_take(*map,*key);}
void aug_ir_string(AugValue *out,const void *text,uint64_t count){*out=aug_string_n(text,(size_t)count);}
void aug_ir_assert(const AugValue *condition,const char *expression,const char *file,int line){aug_assert(*condition,expression,file,line);}
void aug_ir_drop(AugValue *value){aug_drop(*value);*value=aug_null();}
void aug_ir_failed_result(AugValue *value){if(aug_has_error){aug_drop_partial(*value);*value=aug_null();}}
void aug_ir_constructor_result(AugValue *value,const AugValue *result){aug_constructor_result_cleanup(*value,*result);*value=aug_null();}
void aug_ir_throw(const AugValue *value){aug_throw(*value);}
void aug_ir_take_error(AugValue *out){*out=aug_take_error();}
void aug_ir_save_error_state(AugValue *error,AugValue *cancelled){
  *error=aug_has_error?aug_take_error():aug_null();*cancelled=aug_bool(aug_cancelled);aug_cancelled=false;
}
void aug_ir_restore_error_state(const AugValue *error,const AugValue *cancelled){
  aug_cancelled=aug_truthy(*cancelled);if(!aug_has_error&&error->tag!=AUG_NULL)aug_throw(*error);
}
bool aug_ir_has_error(void){return aug_has_error;}
void aug_ir_task_wait(AugValue *out,AugValue *tasks,int count){*out=aug_task_wait(tasks,count);}
bool aug_ir_cancelled(void){return aug_cancelled;}
uint8_t aug_ir_state(void){
  AugExecution *execution=aug_execution_current();
  return execution->cancelled?1:execution->has_error?2:0;
}
bool aug_ir_is_null(const AugValue *value){return value->tag==AUG_NULL;}
bool aug_ir_truthy(const AugValue *value){return aug_truthy(*value);}
int64_t aug_ir_integer(const AugValue *value){return aug_cint(*value);}
double aug_ir_float(const AugValue *value){return aug_cfloat(*value);}
void aug_ir_frame_enter(AugFrame *frame,AugValue *values,uint64_t count){aug_frame_enter(frame,values,(size_t)count);}
void aug_ir_method(AugValue *out,const AugValue *self,const char *name,AugValue *args,int count){*out=aug_call_method(*self,name,args,count);}
void aug_ir_object(AugValue *out,const char *type,uint64_t fields,const unsigned char *owned,const AugMethodEntry *methods,uint64_t method_count,const char *const *names,bool record){
  *out=aug_new_object(type,(size_t)fields,owned,methods,(size_t)method_count);
  out->as.object->field_names=names;if(record)out->as.object->kind=AUG_RECORD_KIND;
}
void aug_ir_binding_get(AugValue *out,uint64_t index){*out=aug_binding_get((size_t)index);}
void aug_ir_binding_set(uint64_t index,const AugValue *value){aug_binding_set((size_t)index,*value);}
int aug_ir_exit_status(bool test){
  if(aug_has_error){aug_report_error();return 1;}
  if(test&&!aug_test_assertions){fputs("Test executed no assertions\n",stderr);return 1;}
  return aug_test_failed?1:0;
}
void *aug_ir_resource_pointer(const AugValue *value,const char *type){
  if(value->tag!=AUG_OBJECT||!value->as.object||value->as.object->kind!=AUG_NATIVE_RESOURCE_KIND||value->as.object->dropped||!value->as.object->native||strcmp(value->as.object->type_name,type)){
    aug_error_named("NativeContractError");return NULL;
  }
  return value->as.object->native;
}
void aug_ir_resource(AugValue *out,void *pointer,const char *type,void(*release)(void *)){
  if(!pointer||!release){*out=aug_null();aug_error_named("NativeContractError");return;}
  *out=aug_new_object(type,0,NULL,NULL,0);out->as.object->kind=AUG_NATIVE_RESOURCE_KIND;
  out->as.object->native=pointer;out->as.object->finalize=release;
}
void aug_ir_resource_move(AugValue *value){
  if(value->tag==AUG_OBJECT&&value->as.object&&value->as.object->kind==AUG_NATIVE_RESOURCE_KIND){
    value->as.object->native=NULL;value->as.object->finalize=NULL;value->as.object->dropped=true;
  }
  *value=aug_null();
}
void aug_ir_contract_error(AugValue *out){*out=aug_null();if(!aug_has_error)aug_error_named("NativeContractError");}
void aug_ir_native_error(AugValue *out,AugPointerMethod factory,int32_t code,const void *text,uint64_t length){
  if(aug_has_error)return;
  if(!factory){aug_ir_contract_error(out);return;}
  if(length>512||!aug_valid_utf8(text,(size_t)length)){text="Native library returned an invalid error message";length=strlen(text);}
  if(!length){text="Native call rejected its input or supplied no error message";length=strlen(text);}
  AugValue roots[3]={0};AugFrame frame;aug_frame_enter(&frame,roots,3);
  roots[0]=aug_int(code);roots[1]=aug_string_n(text,(size_t)length);
  factory(&roots[2],NULL,roots,2);
  if(!aug_has_error)aug_throw(roots[2]);aug_frame_leave(&frame);
}
bool aug_ir_data(const AugValue *v,const void **data,uint64_t *count){
  *data=NULL;*count=0;
  if((v->tag!=AUG_STRING&&v->tag!=AUG_OBJECT)||!v->as.object||v->as.object->dropped||(v->tag==AUG_OBJECT&&v->as.object->kind!=AUG_BYTES_KIND)){
    aug_error_named("NativeContractError");return false;
  }
  *data=v->as.object->text;*count=v->as.object->text_length;return true;
}
bool aug_ir_floats(const AugValue *v,double **data,uint64_t *count){
  *data=NULL;*count=0;
  if(v->tag!=AUG_OBJECT||!v->as.object||v->as.object->kind!=AUG_LIST_KIND||v->as.object->dropped||v->as.object->field_count>SIZE_MAX/sizeof(double)){
    aug_error_named("NativeContractError");return false;
  }
  size_t n=v->as.object->field_count;double *items=malloc((n?n:1)*sizeof(double));
  if(!items){aug_error_named("NativeContractError");return false;}
  for(size_t i=0;i<n;i++){
    AugValue item=v->as.object->fields[i];if(item.tag!=AUG_FLOAT&&item.tag!=AUG_INT){free(items);aug_error_named("NativeContractError");return false;}
    items[i]=item.tag==AUG_FLOAT?item.as.floating:(double)item.as.integer;
  }
  *data=items;*count=n;return true;
}
bool aug_ir_strings(const AugValue *v,const void ***data,uint64_t **lengths,uint64_t *count){
  *data=NULL;*lengths=NULL;*count=0;
  if(v->tag!=AUG_OBJECT||!v->as.object||v->as.object->kind!=AUG_LIST_KIND||v->as.object->dropped||v->as.object->field_count>SIZE_MAX/sizeof(uint64_t)){
    aug_error_named("NativeContractError");return false;
  }
  size_t n=v->as.object->field_count;const void **items=calloc(n?n:1,sizeof(void *));uint64_t *sizes=calloc(n?n:1,sizeof(uint64_t));
  if(!items||!sizes){free(items);free(sizes);aug_error_named("NativeContractError");return false;}
  for(size_t i=0;i<n;i++){
    AugValue item=v->as.object->fields[i];if(item.tag!=AUG_STRING||!item.as.object||item.as.object->dropped){free(items);free(sizes);aug_error_named("NativeContractError");return false;}
    items[i]=item.as.object->text;sizes[i]=item.as.object->text_length;
  }
  *data=items;*lengths=sizes;*count=n;return true;
}
void aug_ir_free(void *memory){free(memory);}
void aug_ir_copy_bytes(AugValue *out,const void *bytes,uint64_t count){
  if(count>SIZE_MAX-1||(!bytes&&count)){*out=aug_error_named("NativeContractError");return;}
  *out=aug_bytes(bytes,(size_t)count,AUG_BYTES_KIND);
}
void aug_ir_copy_utf8(AugValue *out,const void *text,uint64_t count){
  if(count>SIZE_MAX-1||!aug_valid_utf8(text,(size_t)count)){*out=aug_error_named("NativeContractError");return;}
  *out=aug_string_n(text,(size_t)count);
}
void aug_ir_copy_bool(AugValue *out,uint8_t value){*out=value>1?aug_error_named("NativeContractError"):aug_bool(value!=0);}
void aug_ir_copy_floats(AugValue *out,const double *values,uint64_t count){
  if(count>SIZE_MAX/sizeof(AugValue)||(!values&&count)){*out=aug_error_named("NativeContractError");return;}
  AugValue *items=malloc((count?count:1)*sizeof(AugValue));if(!items){*out=aug_error_named("NativeContractError");return;}
  for(uint64_t i=0;i<count;i++)items[i]=aug_float(values[i]);
  *out=aug_list_new(items,(size_t)count);free(items);
}
