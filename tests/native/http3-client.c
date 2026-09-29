/* A protocol probe using libwebsockets' public client API. h3 is the only ALPN
 * offered and fallback is disabled, so a successful request proves QUIC use. */
#include <libwebsockets.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static int finished, failed = 1, status;
static int callback(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t length) {
  (void)user;
  switch (reason) {
    case LWS_CALLBACK_CLIENT_CONNECTION_ERROR:
      fprintf(stderr,"HTTP/3: %s\n",in?(char *)in:"connection error"); finished=1; break;
    case LWS_CALLBACK_ESTABLISHED_CLIENT_HTTP: status=(int)lws_http_client_http_response(wsi); break;
    case LWS_CALLBACK_RECEIVE_CLIENT_HTTP_READ: fwrite(in,1,length,stdout); break;
    case LWS_CALLBACK_RECEIVE_CLIENT_HTTP: {
      char buffer[LWS_PRE+16384], *next=buffer+LWS_PRE; int size=16384;
      if(lws_http_client_read(wsi,&next,&size)<0)return -1; break;
    }
    case LWS_CALLBACK_COMPLETED_CLIENT_HTTP: failed=status!=200; finished=1; break;
    case LWS_CALLBACK_CLOSED_CLIENT_HTTP: finished=1; break;
    default: break;
  }
  return 0;
}
static const struct lws_protocols protocols[] = {{"probe",callback,0,16384,0,NULL,0},LWS_PROTOCOL_LIST_TERM};
int main(int argc,char **argv) {
  if(argc!=3)return 2;
  struct lws_context_creation_info context_info; memset(&context_info,0,sizeof(context_info));
  context_info.port=CONTEXT_PORT_NO_LISTEN;context_info.protocols=protocols;
  context_info.options=LWS_SERVER_OPTION_DO_SSL_GLOBAL_INIT;context_info.client_ssl_ca_filepath=argv[2];
  lws_set_log_level(LLL_ERR|LLL_WARN,NULL);
  struct lws_context *context=lws_create_context(&context_info);if(!context)return 3;
  struct lws_client_connect_info info;memset(&info,0,sizeof(info));
  info.context=context;info.address="127.0.0.1";info.host="127.0.0.1";info.port=atoi(argv[1]);info.path="/answer";info.method="GET";
  info.protocol="probe";info.alpn="h3";info.disable_h3_fallback=1;info.ssl_connection=LCCSCF_USE_SSL;
  if(!lws_client_connect_via_info(&info)){lws_context_destroy(context);return 4;}
  while(!finished)if(lws_service(context,50)<0)break;
  lws_context_destroy(context);return failed;
}
