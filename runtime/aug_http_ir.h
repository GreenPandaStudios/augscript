#ifndef AUG_HTTP_IR_H
#define AUG_HTTP_IR_H
#include "aug_ir.h"
enum AugIrHttpOperation {
  AUG_IR_HTTP_HEADERS=1,AUG_IR_HTTP_HEADERS_WITH,AUG_IR_HTTP_HEADERS_GET,AUG_IR_HTTP_HEADERS_ALL,
  AUG_IR_HTTP_RESPONSE,AUG_IR_HTTP_RESPONSE_STATUS,AUG_IR_HTTP_FINISH,AUG_IR_HTTP_EVENT,
  AUG_IR_HTTP_YIELD,AUG_IR_HTTP_CLIENT_REQUEST,AUG_IR_HTTP_ACTION
};
typedef struct {const char *type; int status;} AugIrHttpError;
void aug_ir_http_operation(AugValue *out,int op,AugValue *args,int count,const char *text,int64_t number);
void aug_ir_http_bind(AugValue *out,const AugValue *request,const char *source,const char *name,const AugSchema *schema);
void aug_ir_http_form(AugValue *out,const AugValue *request,const AugSchema *schema);
void aug_ir_http_policy(const AugHttpPolicy *policy,AugValue *args);
void aug_ir_http_failure(AugValue *out,const AugIrHttpError *errors,int count);
void aug_ir_http_test_client(AugValue *out,const AugRoute *routes,int count);
void aug_ir_http_serve(const AugRoute *routes,int count,const AugValue *port);
void aug_ir_html(AugValue *out,const char *tag,AugValue *attributes,int count,AugValue *children,int child_count);
#endif
