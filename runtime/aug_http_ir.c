#include "aug_http_ir.h"
void aug_ir_http_operation(AugValue *out,int op,AugValue *a,int count,const char *text,int64_t number) {
  (void)number;*out=aug_null();
  switch(op){
    case AUG_IR_HTTP_HEADERS:*out=aug_headers_new();break;
    case AUG_IR_HTTP_HEADERS_WITH:*out=aug_headers_with(a[0],a[1],a[2]);break;
    case AUG_IR_HTTP_HEADERS_GET:*out=aug_headers_get(a[0],a[1]);break;
    case AUG_IR_HTTP_HEADERS_ALL:*out=aug_headers_all(a[0],a[1]);break;
    case AUG_IR_HTTP_RESPONSE:*out=aug_http_response_full(a[0],a[1],a[2]);break;
    case AUG_IR_HTTP_RESPONSE_STATUS:*out=aug_http_response(a[0],(int)aug_cint(a[1]));break;
    case AUG_IR_HTTP_FINISH:*out=aug_http_finish(a[0]);break;
    case AUG_IR_HTTP_EVENT:*out=aug_http_event(a[0],a[1],a[2],a[3]);break;
    case AUG_IR_HTTP_YIELD:aug_http_yield(a[0]);break;
    case AUG_IR_HTTP_CLIENT_REQUEST:*out=aug_httptestclient_request(a[0],a[1],a[2],a[3],a[4]);break;
    case AUG_IR_HTTP_ACTION:*out=aug_http_action(text,a,(size_t)count);break;
    default:aug_error_named("NativeContractError");break;
  }
}
void aug_ir_http_bind(AugValue *out,const AugValue *request,const char *source,const char *name,const AugSchema *schema){*out=aug_http_bind(*request,source,name,schema);}
void aug_ir_http_form(AugValue *out,const AugValue *request,const AugSchema *schema){*out=aug_httprequest_form(*request,schema);}
void aug_ir_http_policy(const AugHttpPolicy *policy,AugValue *args){aug_http_policy(policy,args[0],args[1],args[2]);}
void aug_ir_http_failure(AugValue *out,const AugIrHttpError *errors,int count){
  if(aug_http_head_response(out))return;
  int status=aug_http_error_status();
  for(int i=0;i<count;i++)if(aug_error_is(errors[i].type))status=errors[i].status;
  if(status==500)aug_report_error();aug_take_error();*out=aug_http_problem(status);
}
void aug_ir_http_test_client(AugValue *out,const AugRoute *routes,int count){*out=aug_http_test_client(routes,(size_t)count);}
void aug_ir_http_serve(const AugRoute *routes,int count,const AugValue *port){aug_http_serve(routes,(size_t)count,aug_cint(*port));}
void aug_ir_html(AugValue *out,const char *tag,AugValue *attributes,int count,AugValue *children,int child_count){*out=aug_html_element(tag,attributes,(size_t)count,children,(size_t)child_count);}
