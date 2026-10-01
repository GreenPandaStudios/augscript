#include "aug_runtime.h"
#include <libwebsockets.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <stdio.h>
#include <signal.h>
#include <errno.h>
#include <math.h>
#include <limits.h>
#include <time.h>
#include <zlib.h>

/* The transport owns buffers; managed request and response values remain GC roots. */
typedef struct AugHttpJob AugHttpJob;
typedef struct {
  AugValue roots[8]; AugRetained retained; bool rooted, submitted, headers_sent, head;
  char *body; size_t body_length, body_capacity, sent;
  const AugRoute *route;
  AugHttpJob *job;
  bool streaming, stream_pending, stream_done;
  bool compress;
} AugHttpSession;
struct AugHttpJob {
  struct lws *wsi; AugHttpSession *session; AugValue task;
  /* Request and loggers outlive transport session cleanup on a disconnect. */
  AugValue roots[2]; AugRetained retained;
  bool test, transport_complete, timed_out; int64_t started,deadline;
};
static const AugRoute *served_routes;
static AugValue route_call(const AugRoute *route,AugValue *args,int count) {
  AugValue result=aug_null();
  if(route->pointer_handler)route->pointer_handler(&result,NULL,args,count);
  else result=route->handler(args,count);
  return result;
}
static size_t served_count;
static size_t body_limit = 1024 * 1024;
static size_t response_limit = 4 * 1024 * 1024;
static const char *listen_host = "127.0.0.1", *tls_certificate = "", *tls_private_key = "", *tls_ca = "";
static bool enable_http3;
static void check_deadline(void) {
  AugHttpJob *job=aug_execution_current()->http_job;if(!job||!job->deadline)return;
  struct timespec now;clock_gettime(CLOCK_MONOTONIC,&now);int64_t current=(int64_t)now.tv_sec*1000+now.tv_nsec/1000000;
  if(current>=job->deadline){job->timed_out=true;aug_cancelled=true;}
}
static volatile sig_atomic_t stopped;
static struct lws_context *server_context;
static bool io_wakeup_pending;
static void service_io(bool wait);
/* All scheduler callbacks run on this event-loop thread. Coalesce wakeups
   until the next service call instead of writing one pipe byte per task. */
static void notify_io(void) {if(server_context)io_wakeup_pending=true;}
static int callback_client(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t length);
static void stop_server(int signal_number) { (void)signal_number; stopped = 1; }
void aug_http_configure(const char *host, const char *certificate, const char *private_key, const char *ca, size_t request_limit, size_t result_limit, bool http3) {
  listen_host = host; tls_certificate = certificate; tls_private_key = private_key; tls_ca = ca;
  body_limit = request_limit; response_limit = result_limit; enable_http3 = http3;
  aug_task_checkpoint_hook=check_deadline;
}

static AugValue request_error(const char *name) { return aug_error_named(name); }
static int64_t monotonic_ms(void){struct timespec now;clock_gettime(CLOCK_MONOTONIC,&now);return (int64_t)now.tv_sec*1000+now.tv_nsec/1000000;}
AugValue aug_headers_new(void) {
  AugValue root = aug_list_new(NULL, 0); AugFrame frame; aug_frame_enter(&frame, &root, 1);
  AugValue result = aug_new_object("Headers", 1, NULL, NULL, 0); result.as.object->kind = AUG_HEADERS_KIND;
  aug_set_field(result, 0, root); aug_frame_leave(&frame); return result;
}
static bool valid_header(AugValue name, AugValue value) {
  if (name.tag != AUG_STRING || value.tag != AUG_STRING || !name.as.object->text_length || name.as.object->text_length > 250 || value.as.object->text_length > 16000) return false;
  for (size_t i = 0; i < name.as.object->text_length; i++) {
    unsigned char c = (unsigned char)name.as.object->text[i];
    if (!c || !((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || strchr("!#$%&'*+-.^_`|~", c))) return false;
  }
  for (size_t i = 0; i < value.as.object->text_length; i++) {unsigned char c = (unsigned char)value.as.object->text[i]; if (c == 127 || (c < 32 && c != 9)) return false;}
  return true;
}
static void header_add(AugValue headers, const char *name, size_t name_size, const char *value, size_t value_size) {
  AugValue roots[3] = {0}; AugFrame frame; aug_frame_enter(&frame, roots, 3);
  roots[0] = aug_string_n(name, name_size); roots[1] = aug_string_n(value, value_size);
  roots[2] = aug_tuple_new(roots, 2); aug_list_append(aug_field(headers, 0), roots[2]); aug_frame_leave(&frame);
}
static AugValue header_get(AugValue headers, const char *name, bool singular) {
  AugValue entries = aug_field(headers, 0), result = aug_null();
  for (size_t i = 0; i < entries.as.object->field_count; i++) {
    AugValue pair = entries.as.object->fields[i], label = aug_field(pair, 0);
    if (label.as.object->text_length == strlen(name) && !strncasecmp(label.as.object->text, name, strlen(name))) {
      if (singular && result.tag != AUG_NULL) return request_error("HttpBadRequest");
      if (result.tag == AUG_NULL) result = aug_field(pair, 1);
    }
  }
  return result;
}
AugValue aug_headers_with(AugValue headers, AugValue name, AugValue value) {
  if (!valid_header(name, value) || !strcasecmp(name.as.object->text, "content-length") || !strcasecmp(name.as.object->text, "transfer-encoding") || !strcasecmp(name.as.object->text, "connection")) return request_error("HttpError");
  AugValue roots[3] = {headers, name, value}; AugFrame frame; aug_frame_enter(&frame, roots, 3);
  AugValue result = aug_headers_new(); AugRetained retained; aug_retain(&retained, &result, 1);
  AugValue entries = aug_field(headers, 0); for (size_t i = 0; i < entries.as.object->field_count; i++) aug_list_append(aug_field(result, 0), entries.as.object->fields[i]);
  header_add(result, name.as.object->text, name.as.object->text_length, value.as.object->text, value.as.object->text_length);
  aug_freeze(result); aug_release(&retained); aug_frame_leave(&frame); return result;
}
AugValue aug_headers_get(AugValue headers, AugValue name) {AugValue value = header_get(headers, aug_cstring(name), false); return value.tag == AUG_NULL ? aug_null() : value;}
AugValue aug_headers_all(AugValue headers, AugValue name) {
  AugValue result = aug_list_new(NULL, 0); AugFrame frame; aug_frame_enter(&frame, &result, 1); AugValue entries = aug_field(headers, 0);
  for (size_t i = 0; i < entries.as.object->field_count; i++) {AugValue pair = entries.as.object->fields[i]; if (!strcasecmp(aug_cstring(aug_field(pair, 0)), aug_cstring(name))) aug_list_append(result, aug_field(pair, 1));}
  aug_freeze(result); aug_frame_leave(&frame); return result;
}
typedef struct {struct lws *wsi; AugValue headers;} HeaderReader;
static void custom_header(const char *name, int name_size, void *opaque) {
  HeaderReader *reader = opaque;
  int length = lws_hdr_custom_length(reader->wsi, name, name_size); if (length < 0) return;
  char *value = malloc((size_t)length + 1); if (!value) return;
  if (lws_hdr_custom_copy(reader->wsi, value, length + 1, name, name_size) >= 0)
    header_add(reader->headers, name, name_size && name[name_size - 1] == ':' ? (size_t)name_size - 1 : (size_t)name_size, value, (size_t)length);
  free(value);
}
static void read_headers(struct lws *wsi, AugValue headers) {
  for (int token = 0; token < WSI_TOKEN_COUNT; token++) {
    const unsigned char *name = lws_token_to_string((enum lws_token_indexes)token);
    if (!name) continue; size_t size = strlen((const char *)name);
    if (!size || name[size - 1] != ':' || name[0] == ':') continue;
    int total = lws_hdr_total_length(wsi, (enum lws_token_indexes)token); if (total <= 0) continue;
    char *value = malloc((size_t)total + 1); if (!value) continue;
    for (int fragment = 0;; fragment++) {
      int length = lws_hdr_copy_fragment(wsi, value, total + 1, (enum lws_token_indexes)token, fragment);
      if (length < 0) break; header_add(headers, (const char *)name, size - 1, value, (size_t)length);
    }
    free(value);
  }
  HeaderReader reader = {wsi, headers}; lws_hdr_custom_name_foreach(wsi, custom_header, &reader);
}
static void map_add(AugValue map, AugValue key, AugValue value) {
  AugValue roots[3] = {key, value, aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 3);
  roots[2] = aug_map_get(map, key);
  if (roots[2].tag == AUG_NULL) { roots[2] = aug_list_new(NULL, 0); aug_map_set(map, key, roots[2]); }
  aug_list_append(roots[2], value); aug_frame_leave(&frame);
}
static AugValue map_scalar(AugValue map, const char *name) {
  AugValue key = aug_string(name), values = aug_map_get(map, key);
  if (values.tag == AUG_NULL) return aug_null();
  return values.as.object->field_count == 1 ? values.as.object->fields[0] : request_error("HttpBadRequest");
}
static bool match_path(const char *pattern, const char *path, AugValue captures, int *specificity) {
  const char *p = pattern, *v = path; *specificity = 0;
  while (*p && *v) {
    if (*p == '{') {
      const char *end = strchr(p, '}'); if (!end) return false;
      const char *last = strchr(v, '/'); if (!last) last = v + strlen(v);
      if (last == v) return false;
      if (captures.tag == AUG_OBJECT) {
        AugValue roots[2] = {0}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
        roots[0] = aug_string_n(p + 1, (size_t)(end - p - 1)); roots[1] = aug_string_n(v, (size_t)(last - v));
        map_add(captures, roots[0], roots[1]); aug_frame_leave(&frame);
      }
      p = end + 1; v = last;
    } else {
      if (*p != *v) return false; (*specificity)++; p++; v++;
    }
  }
  return !*p && !*v;
}
static bool cors_apply(const AugHttpPolicy *policy,AugValue request,AugValue *headers,bool preflight);
/* Both the listening transport and the in-file test client enter through this router. */
static const AugRoute *select_route(AugValue request, const AugRoute *routes, size_t count, AugValue *failure) {
  const char *verb=aug_cstring(aug_field(request,0)), *path=aug_cstring(aug_field(request,1));
  if(!strcmp(verb,"OPTIONS")) {
    AugValue requested=header_get(aug_field(request,2),"access-control-request-method",true);
    if(aug_has_error){aug_take_error();*failure=aug_http_problem(400);return NULL;}
    if(requested.tag==AUG_STRING)for(size_t i=0;i<count;i++) {
      int specificity;if(strcmp(routes[i].method,aug_cstring(requested))||!match_path(routes[i].path,path,aug_null(),&specificity))continue;
      for(size_t layer=0;layer<routes[i].policy_count;layer++)if(routes[i].policies[layer].kind==AUG_HTTP_POLICY_CORS){
        AugValue headers=aug_headers_new();AugFrame frame;aug_frame_enter(&frame,&headers,1);
        if(cors_apply(&routes[i].policies[layer],request,&headers,true)) {
          headers=aug_headers_with(headers,aug_string("access-control-allow-methods"),requested);
          *failure=aug_http_response_full(aug_null(),aug_int(204),headers);
        }else {int status=aug_has_error?aug_http_error_status():403;if(aug_has_error)aug_take_error();*failure=aug_http_problem(status);}
        aug_frame_leave(&frame);return NULL;
      }
    }
  }
  const AugRoute *selected=NULL; bool path_found=false; int best=-1;
  for(size_t i=0;i<count;i++) {
    int specificity;if(!match_path(routes[i].path,path,aug_null(),&specificity))continue;path_found=true;
    if((!strcmp(routes[i].method,verb)||(!strcmp(verb,"HEAD")&&!strcmp(routes[i].method,"GET")))&&specificity>best){selected=&routes[i];best=specificity;}
  }
  if(selected){int specificity;match_path(selected->path,path,aug_field(request,4),&specificity);return selected;}
  *failure=aug_http_problem(path_found?405:404);
  if(path_found) {
    char allow[1024]="";
    for(size_t i=0;i<count;i++) {
      int specificity;if(!match_path(routes[i].path,path,aug_null(),&specificity))continue;
      if(*allow)strncat(allow,", ",sizeof(allow)-strlen(allow)-1);strncat(allow,routes[i].method,sizeof(allow)-strlen(allow)-1);
      if(!strcmp(routes[i].method,"GET"))strncat(allow,", HEAD",sizeof(allow)-strlen(allow)-1);
    }
    header_add(aug_field(*failure,2),"allow",5,allow,strlen(allow));
  }
  return NULL;
}
static AugValue coerce(AugValue value, const AugSchema *schema) {
  if (aug_has_error) return aug_null();
  if (value.tag == AUG_NULL) return schema->optional ? value : request_error("HttpBadRequest");
  if (value.tag != AUG_STRING) return request_error("HttpBadRequest");
  const char *text = value.as.object->text; size_t size = value.as.object->text_length;
  if (memchr(text, 0, size)) return request_error("HttpBadRequest");
  if (schema->nullable && size == 4 && !memcmp(text, "null", 4)) return aug_null();
  if (schema->kind == AUG_SCHEMA_STRING) return value;
  if (schema->kind == AUG_SCHEMA_BOOL) {
    if (!strcmp(text, "true")) return aug_bool(true); if (!strcmp(text, "false")) return aug_bool(false);
    return request_error("HttpBadRequest");
  }
  if (schema->kind == AUG_SCHEMA_RECORD || schema->kind == AUG_SCHEMA_LIST || schema->kind == AUG_SCHEMA_SET ||
      schema->kind == AUG_SCHEMA_TUPLE || schema->kind == AUG_SCHEMA_MAP || schema->kind == AUG_SCHEMA_JSON) {
    AugValue roots[2] = {value, aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
    roots[1] = _aug_json_parse(roots[0]);
    if (aug_has_error) {aug_take_error(); aug_frame_leave(&frame); return request_error("HttpBadRequest");}
    AugValue result = aug_json_decode(roots[1], schema);
    if (aug_has_error) {aug_take_error(); aug_frame_leave(&frame); return request_error("HttpValidationError");}
    aug_frame_leave(&frame); return result;
  }
  if (!size || *text == ' ' || *text == '\t' || *text == '+') return request_error("HttpBadRequest");
  char *end; errno = 0;
  if (schema->kind == AUG_SCHEMA_INT || schema->kind == AUG_SCHEMA_C_INT) {
    long long number = strtoll(text, &end, 10);
    return errno || end != text + size || (schema->kind == AUG_SCHEMA_C_INT && (number < INT32_MIN || number > INT32_MAX)) ? request_error("HttpBadRequest") : aug_int((int64_t)number);
  }
  if (schema->kind == AUG_SCHEMA_FLOAT) {
    double number = strtod(text, &end);
    return errno || !isfinite(number) || end != text + size ? request_error("HttpBadRequest") : aug_float(number);
  }
  return request_error("HttpBadRequest");
}
static int hex_digit(unsigned char c) {return c >= '0' && c <= '9' ? c - '0' : c >= 'a' && c <= 'f' ? c - 'a' + 10 : c >= 'A' && c <= 'F' ? c - 'A' + 10 : -1;}
static AugValue decode_form_part(const char *text, size_t size) {
  char *decoded = malloc(size + 1); if (!decoded) return request_error("HttpBadRequest"); size_t written = 0;
  for (size_t i = 0; i < size; i++) {
    unsigned char c = (unsigned char)text[i];
    if (c == '%') {if (i + 2 >= size || hex_digit(text[i + 1]) < 0 || hex_digit(text[i + 2]) < 0) {free(decoded); return request_error("HttpBadRequest");} c = (unsigned char)(hex_digit(text[i + 1]) * 16 + hex_digit(text[i + 2])); i += 2;}
    else if (c == '+') c = ' ';
    if (!c) {free(decoded); return request_error("HttpBadRequest");} decoded[written++] = (char)c;
  }
  AugValue bytes = aug_bytes(decoded, written, AUG_BYTES_KIND); free(decoded);
  AugFrame frame; aug_frame_enter(&frame, &bytes, 1); AugValue result = aug_bytes_text(bytes); aug_frame_leave(&frame);
  if (aug_has_error) {aug_take_error(); return request_error("HttpBadRequest");} return result;
}
static AugValue form_map(AugValue body) {
  AugValue roots[3] = {aug_map_new(), aug_null(), aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 3);
  const char *text = body.as.object->text, *end = text + body.as.object->text_length;
  while (text < end && !aug_has_error) {
    const char *last = memchr(text, '&', (size_t)(end - text)); if (!last) last = end;
    const char *equal = memchr(text, '=', (size_t)(last - text)); if (!equal) equal = last;
    roots[1] = decode_form_part(text, (size_t)(equal - text));
    roots[2] = decode_form_part(equal == last ? last : equal + 1, equal == last ? 0 : (size_t)(last - equal - 1));
    if (!aug_has_error) map_add(roots[0], roots[1], roots[2]); text = last == end ? end : last + 1;
  }
  AugValue result = roots[0]; aug_frame_leave(&frame); return result;
}
static bool listed(const char *list,const char *value) {
  size_t size=strlen(value);for(const char *part=list;*part;){const char *end=strchr(part,'\n');if(!end)end=part+strlen(part);if((size_t)(end-part)==size&&!memcmp(part,value,size))return true;part=*end?end+1:end;}return false;
}
static bool cors_apply(const AugHttpPolicy *policy,AugValue request,AugValue *headers,bool preflight) {
  AugValue origin=header_get(aug_field(request,2),"origin",true);if(aug_has_error)return false;if(origin.tag==AUG_NULL)return !preflight;
  const char *name=aug_cstring(origin);bool wildcard=listed(policy->origins,"*");
  if(!wildcard&&!listed(policy->origins,name)){request_error("HttpForbidden");return false;}
  *headers=aug_headers_with(*headers,aug_string("access-control-allow-origin"),wildcard?aug_string("*"):origin);
  *headers=aug_headers_with(*headers,aug_string("vary"),aug_string("Origin"));
  if(policy->credentials)*headers=aug_headers_with(*headers,aug_string("access-control-allow-credentials"),aug_string("true"));
  if(preflight) {
    AugValue asked=header_get(aug_field(request,2),"access-control-request-headers",true);if(aug_has_error)return false;
    if(asked.tag==AUG_STRING){char *copy=strdup(aug_cstring(asked));if(!copy)abort();char *save=NULL;
      for(char *part=strtok_r(copy,",",&save);part;part=strtok_r(NULL,",",&save)){while(*part==' '||*part=='\t')part++;size_t size=strlen(part);while(size&&(part[size-1]==' '||part[size-1]=='\t'))part[--size]=0;
        bool found=false;const char *allowed=policy->headers;while(*allowed){const char *end=strchr(allowed,',');if(!end)end=allowed+strlen(allowed);if((size_t)(end-allowed)==size&&!strncasecmp(allowed,part,size))found=true;allowed=*end?end+1:end;while(*allowed==' ')allowed++;}
        if(!size||!found){free(copy);request_error("HttpForbidden");return false;}}
      free(copy);}
    *headers=aug_headers_with(*headers,aug_string("access-control-allow-headers"),aug_string(policy->headers));
  }
  return !aug_has_error;
}
static bool accepts_gzip(AugValue headers) {
  AugValue value=header_get(headers,"accept-encoding",false);if(value.tag!=AUG_STRING)return false;
  char *copy=strdup(aug_cstring(value));if(!copy)abort();char *save=NULL;double gzip=-1,wildcard=0;
  for(char *part=strtok_r(copy,",",&save);part;part=strtok_r(NULL,",",&save)){
    while(*part==' '||*part=='\t')part++;char *options=strchr(part,';');if(options)*options++=0;
    size_t size=strlen(part);while(size&&(part[size-1]==' '||part[size-1]=='\t'))part[--size]=0;
    double quality=1;if(options){while(*options==' '||*options=='\t')options++;if(strncmp(options,"q=",2))quality=0;else {char *end;quality=strtod(options+2,&end);while(*end==' '||*end=='\t')end++;if(*end||!isfinite(quality)||quality<0||quality>1)quality=0;}}
    if(!strcasecmp(part,"gzip"))gzip=quality;else if(!strcmp(part,"*"))wildcard=quality;
  }
  free(copy);return gzip<0?wildcard>0:gzip>0;
}
static AugValue gzip_bytes(AugValue value) {
  z_stream stream={0};if(deflateInit2(&stream,Z_DEFAULT_COMPRESSION,Z_DEFLATED,15+16,8,Z_DEFAULT_STRATEGY)!=Z_OK)return request_error("HttpError");
  size_t capacity=deflateBound(&stream,(uLong)value.as.object->text_length);unsigned char *buffer=malloc(capacity);if(!buffer)abort();
  stream.next_in=(unsigned char *)value.as.object->text;stream.avail_in=(uInt)value.as.object->text_length;stream.next_out=buffer;stream.avail_out=(uInt)capacity;
  int status=deflate(&stream,Z_FINISH);size_t size=stream.total_out;deflateEnd(&stream);
  AugValue result=status==Z_STREAM_END?aug_bytes(buffer,size,AUG_BYTES_KIND):request_error("HttpError");free(buffer);return result;
}
typedef struct {const AugHttpPolicy *policy;char peer[96];int64_t until;size_t used;} RateEntry;
static RateEntry rate_entries[2048];
void aug_http_policy(const AugHttpPolicy *policy,AugValue request,AugValue dependency,AugValue second) {
  AugHttpJob *job=aug_execution_current()->http_job;AugHttpSession *session=job?job->session:NULL;
  if(!session){request_error("HttpError");return;}if(!job->started)job->started=monotonic_ms();
  if(session->roots[4].tag==AUG_NULL)session->roots[4]=aug_headers_new();
  if(policy->kind==AUG_HTTP_POLICY_REQUIRE_LOGIN||policy->kind==AUG_HTTP_POLICY_REQUIRE_PERMISSION) {
    session->roots[5]=aug_call_method(dependency,"authenticate",&request,1);if(aug_has_error)return;
    if(session->roots[5].tag==AUG_NULL){request_error("HttpUnauthorized");return;}
    if(policy->kind==AUG_HTTP_POLICY_REQUIRE_PERMISSION){AugValue arguments[]={session->roots[5],aug_string(policy->permission)};AugFrame frame;aug_frame_enter(&frame,arguments,2);
      AugValue allowed=aug_call_method(second,"authorize",arguments,2);aug_frame_leave(&frame);if(!aug_has_error&&!aug_truthy(allowed))request_error("HttpForbidden");}
  } else if(policy->kind==AUG_HTTP_POLICY_LOG_REQUEST){if(job->roots[1].tag==AUG_NULL)job->roots[1]=aug_list_new(NULL,0);aug_list_append(job->roots[1],dependency);}
  else if(policy->kind==AUG_HTTP_POLICY_RATE_LIMIT) {
    const char *peer=aug_cstring(aug_field(request,6));int64_t now=monotonic_ms();RateEntry *entry=NULL,*free_entry=NULL;
    for(size_t i=0;i<2048;i++){RateEntry *candidate=&rate_entries[i];if(candidate->policy==policy&&!strcmp(candidate->peer,peer)){entry=candidate;break;}if(!free_entry&&(!candidate->policy||candidate->until<=now))free_entry=candidate;}
    if(!entry){entry=free_entry;if(!entry){request_error("HttpTooManyRequests");return;}entry->policy=policy;snprintf(entry->peer,sizeof(entry->peer),"%s",peer);entry->until=now+policy->seconds*1000;entry->used=0;}
    if(entry->until<=now){entry->until=now+policy->seconds*1000;entry->used=0;}
    if(entry->used>= (size_t)policy->amount){request_error("HttpTooManyRequests");return;}entry->used++;
  } else if(policy->kind==AUG_HTTP_POLICY_TIMEOUT) {
    int64_t deadline=monotonic_ms()+policy->amount;if(!job->deadline||deadline<job->deadline)job->deadline=deadline;
    if(!job->test&&job->wsi)lws_set_timer_usecs(job->wsi,(lws_usec_t)(job->deadline-monotonic_ms())*1000);
  } else if(policy->kind==AUG_HTTP_POLICY_CORS)cors_apply(policy,request,&session->roots[4],false);
  else if(policy->kind==AUG_HTTP_POLICY_COMPRESS)session->compress=accepts_gzip(aug_field(request,2));
}
static AugValue policy_response(AugHttpSession *session,AugValue response) {
  int64_t status=aug_cint(aug_field(response,1));
  if(status==204||status==304||header_get(aug_field(response,2),"content-encoding",false).tag!=AUG_NULL)session->compress=false;
  if(session->roots[4].tag==AUG_NULL&&!session->compress)return response;
  AugValue roots[2]={response,aug_field(response,2)};AugFrame frame;aug_frame_enter(&frame,roots,2);
  if(session->roots[4].tag==AUG_OBJECT){AugValue entries=aug_field(session->roots[4],0);for(size_t i=0;i<entries.as.object->field_count;i++){AugValue pair=entries.as.object->fields[i];roots[1]=aug_headers_with(roots[1],aug_field(pair,0),aug_field(pair,1));}}
  if(session->compress){roots[1]=aug_headers_with(roots[1],aug_string("content-encoding"),aug_string("gzip"));roots[1]=aug_headers_with(roots[1],aug_string("vary"),aug_string("Accept-Encoding"));}
  AugValue result=aug_http_response_full(aug_field(roots[0],0),aug_field(roots[0],1),roots[1]);aug_frame_leave(&frame);return result;
}
AugValue _aug_http_log(AugValue method,AugValue path,AugValue status,AugValue milliseconds) {
  AugValue roots[]={method,path,status,milliseconds,aug_null(),aug_null()};AugFrame frame;aug_frame_enter(&frame,roots,6);
  static const char *const names[]={"method","path","status","milliseconds"};
  roots[4]=aug_new_object("RequestLog",4,NULL,NULL,0);roots[4].as.object->kind=AUG_RECORD_KIND;roots[4].as.object->field_names=names;
  for(size_t i=0;i<4;i++)aug_set_field(roots[4],i,roots[i]);roots[5]=aug_json_stringify(roots[4]);
  if(aug_has_error){aug_take_error();fputs("August HTTP log serialization failed\n",stderr);}else fprintf(stderr,"%s\n",aug_cstring(roots[5]));fflush(stderr);
  aug_frame_leave(&frame);return aug_null();
}
typedef struct {const AugRoute *routes;size_t count;} AugHttpTestClient;
AugValue aug_http_test_client(const AugRoute *routes,size_t count) {
  aug_task_checkpoint_hook=check_deadline;
  AugHttpTestClient *client=malloc(sizeof(*client));if(!client)abort();*client=(AugHttpTestClient){routes,count};
  AugValue result=aug_new_object("HttpTestClient",0,NULL,NULL,0);result.as.object->native=client;result.as.object->finalize=free;result.as.object->frozen=true;return result;
}
AugValue aug_httptestclient_request(AugValue client,AugValue method,AugValue target,AugValue headers,AugValue body) {
  AugHttpTestClient *native=client.as.object->native;
  AugHttpSession session={0};AugFrame frame;aug_frame_enter(&frame,session.roots,8);
  const char *path=aug_cstring(target), *query=strchr(path,'?');size_t size=query?(size_t)(query-path):strlen(path);
  if(!size||*path!='/'||strchr(path,'#')||memchr(path,0,target.as.object->text_length)||memchr(aug_cstring(method),0,method.as.object->text_length)){aug_frame_leave(&frame);return request_error("HttpError");}
  session.roots[0]=aug_new_object("HttpRequest",7,NULL,NULL,0);session.roots[0].as.object->kind=AUG_HTTP_REQUEST_KIND;
  aug_set_field(session.roots[0],0,method);aug_set_field(session.roots[0],1,decode_form_part(path,size));
  aug_set_field(session.roots[0],2,headers.tag==AUG_NULL?aug_headers_new():headers);
  aug_set_field(session.roots[0],3,body.tag==AUG_NULL?aug_bytes("",0,AUG_BYTES_KIND):body);
  aug_set_field(session.roots[0],4,aug_map_new());
  aug_set_field(session.roots[0],6,aug_string("127.0.0.1"));
  session.roots[3]=aug_bytes(query?query+1:"",query?strlen(query+1):0,AUG_BYTES_KIND);
  aug_set_field(session.roots[0],5,form_map(session.roots[3]));
  if(aug_has_error){aug_take_error();session.roots[1]=aug_http_problem(400);goto serialize;}
  session.route=select_route(session.roots[0],native->routes,native->count,&session.roots[1]);
  if(!session.route)goto serialize;
  if(aug_field(session.roots[0],3).as.object->text_length>body_limit){session.roots[1]=aug_http_problem(413);goto serialize;}
  aug_freeze(session.roots[0]);
  AugHttpJob job={.session=&session,.test=true,.roots={session.roots[0],aug_null()}};
  aug_retain(&job.retained,job.roots,2);
  void *previous=aug_execution_current()->http_job;bool previous_cancelled=aug_cancelled;aug_execution_current()->http_job=&job;
  session.roots[1]=route_call(session.route,session.roots,1);aug_execution_current()->http_job=previous;aug_release(&job.retained);
  if(job.timed_out)aug_cancelled=previous_cancelled;
  if(aug_has_error){aug_report_error();aug_take_error();session.roots[1]=aug_http_problem(500);}
  if(session.streaming&&aug_cint(aug_field(session.roots[1],1))>=400){aug_frame_leave(&frame);return request_error("HttpError");}
serialize:;
  AugValue value=aug_field(session.roots[1],0);int status=(int)aug_cint(aug_field(session.roots[1],1));
  const char *type="application/json";
  if(session.streaming)type=session.route->stream==1?"text/event-stream":session.route->stream==2?"application/octet-stream":"text/html; charset=utf-8";
  else if(value.tag==AUG_OBJECT&&value.as.object->kind==AUG_HTML_KIND){session.roots[2]=aug_html_transport(value);type="text/html; charset=utf-8";}
  else if(value.tag==AUG_OBJECT&&value.as.object->kind==AUG_BYTES_KIND){session.roots[2]=value;type="application/octet-stream";}
  else session.roots[2]=aug_json_stringify(value);
  if(session.compress&&!session.streaming)session.roots[2]=gzip_bytes(session.roots[2]);
  if(aug_has_error||session.roots[2].as.object->text_length>response_limit){if(aug_has_error)aug_take_error();session.roots[1]=aug_http_problem(500);status=500;session.roots[2]=aug_json_stringify(aug_field(session.roots[1],0));}
  session.roots[3]=aug_field(session.roots[1],2);
  if(header_get(session.roots[3],"content-type",false).tag==AUG_NULL)session.roots[3]=aug_headers_with(session.roots[3],aug_string("content-type"),aug_string(type));
  if(!strcmp(aug_cstring(method),"HEAD")||status==204||status==304)session.roots[2]=aug_bytes("",0,AUG_BYTES_KIND);
  session.roots[1]=aug_http_response_full(session.roots[2],aug_int(status),session.roots[3]);
  AugValue result=session.roots[1];aug_frame_leave(&frame);return result;
}
static AugValue cookie_value(AugValue headers, const char *name) {
  AugValue entries = aug_field(headers, 0), found = aug_null(); AugFrame frame; aug_frame_enter(&frame, &found, 1);
  for (size_t i = 0; i < entries.as.object->field_count; i++) {
    AugValue pair = entries.as.object->fields[i]; if (strcasecmp(aug_cstring(aug_field(pair, 0)), "cookie")) continue;
    AugValue value = aug_field(pair, 1); const char *text = value.as.object->text, *end = text + value.as.object->text_length;
    while (text < end) {
      while (text < end && (*text == ' ' || *text == '\t' || *text == ';')) text++;
      const char *last = memchr(text, ';', (size_t)(end - text)); if (!last) last = end;
      const char *equal = memchr(text, '=', (size_t)(last - text));
      if (equal && (size_t)(equal - text) == strlen(name) && !memcmp(text, name, strlen(name))) {
        if (found.tag != AUG_NULL) {aug_frame_leave(&frame); return request_error("HttpBadRequest");}
        found = aug_string_n(equal + 1, (size_t)(last - equal - 1));
      }
      text = last == end ? end : last + 1;
    }
  }
  aug_frame_leave(&frame); return found;
}
AugValue _aug_http_url_encode(AugValue input) {
  static const char hex[] = "0123456789ABCDEF"; size_t size = input.as.object->text_length;
  if (size > SIZE_MAX / 3 - 1) return request_error("HttpError");
  char *text = malloc(size * 3 + 1); if (!text) return request_error("HttpError"); size_t count = 0;
  for (size_t i = 0; i < size; i++) {unsigned char c = (unsigned char)input.as.object->text[i];
    if (c && ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || strchr("-._~", c))) text[count++] = (char)c;
    else {text[count++] = '%'; text[count++] = hex[c >> 4]; text[count++] = hex[c & 15];}
  }
  AugValue result = aug_string_n(text, count); free(text); return result;
}
AugValue _aug_http_cookie(AugValue name, AugValue value, AugValue path, AugValue maxAge, AugValue secure) {
  if (!valid_header(name, value) || !path.as.object->text_length || path.as.object->text[0] != '/' || maxAge.as.integer < 0 || maxAge.as.integer > 31536000) return request_error("HttpError");
  for (size_t i = 0; i < value.as.object->text_length; i++) {unsigned char c = (unsigned char)value.as.object->text[i]; if (c < 33 || c >= 127 || c == '"' || c == ',' || c == ';' || c == '\\') return request_error("HttpError");}
  for (size_t i = 0; i < path.as.object->text_length; i++) {unsigned char c = (unsigned char)path.as.object->text[i]; if (c < 33 || c >= 127 || c == ';') return request_error("HttpError");}
  size_t size = name.as.object->text_length + value.as.object->text_length + path.as.object->text_length + 128;
  char *content = malloc(size); if (!content) return request_error("HttpError");
  snprintf(content, size, "%s=%s; Path=%s; Max-Age=%lld; HttpOnly; SameSite=Lax%s", aug_cstring(name), aug_cstring(value), aug_cstring(path), (long long)maxAge.as.integer, secure.as.boolean ? "; Secure" : "");
  AugValue roots[2] = {aug_headers_new(), aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
  header_add(roots[0], "set-cookie", 10, content, strlen(content)); free(content); aug_freeze(roots[0]);
  AugValue result = roots[0]; aug_frame_leave(&frame); return result;
}
AugValue aug_http_bind(AugValue request, const char *source, const char *name, const AugSchema *schema) {
  if (!strcmp(source, "request")) return request;
  if (!strcmp(source, "path") || !strcmp(source, "query")) return coerce(map_scalar(aug_field(request, !strcmp(source, "path") ? 4 : 5), name), schema);
  if (!strcmp(source, "header")) return coerce(header_get(aug_field(request, 2), name, true), schema);
  if (!strcmp(source, "cookie")) return coerce(cookie_value(aug_field(request, 2), name), schema);
  if (!strcmp(source, "form")) {
    AugValue type = header_get(aug_field(request, 2), "content-type", true);
    if (aug_has_error) return aug_null();
    if (type.tag != AUG_STRING || strncasecmp(aug_cstring(type), "application/x-www-form-urlencoded", 33) || (type.as.object->text_length > 33 && type.as.object->text[33] != ';')) return request_error("HttpUnsupportedMedia");
    AugValue map = form_map(aug_field(request, 3)); AugFrame frame; aug_frame_enter(&frame, &map, 1);
    if (aug_has_error) {aug_frame_leave(&frame); return aug_null();}
    if (schema->kind != AUG_SCHEMA_RECORD) {AugValue result = coerce(map_scalar(map, name), schema); aug_frame_leave(&frame); return result;}
    AugValue *fields = calloc(schema->count ? schema->count : 1, sizeof(AugValue)); AugFrame field_frame; aug_frame_enter(&field_frame, fields, schema->count);
    for (size_t i = 0; i < schema->count && !aug_has_error; i++) fields[i] = coerce(map_scalar(map, schema->names[i]), schema->fields[i]);
    for (size_t i = 0; i < map.as.object->field_count && !aug_has_error; i += 2) {
      bool known = false; for (size_t j = 0; j < schema->count; j++) if (!strcmp(aug_cstring(map.as.object->fields[i]), schema->names[j])) known = true;
      if (!known) request_error("HttpBadRequest");
    }
    AugValue result = aug_has_error ? aug_null() : aug_schema_make(schema,fields,(int)schema->count);
    aug_frame_leave(&field_frame); free(fields); aug_frame_leave(&frame); return result;
  }
  if (!strcmp(source, "body")) {
    AugValue headers = aug_field(request, 2), type = header_get(headers, "content-type", true), encoding = header_get(headers, "content-encoding", true);
    if (aug_has_error) return aug_null();
    if (type.tag != AUG_STRING || (strncasecmp(type.as.object->text, "application/json", 16) || (type.as.object->text_length > 16 && type.as.object->text[16] != ';'))) return request_error("HttpUnsupportedMedia");
    if (encoding.tag != AUG_NULL && strcasecmp(encoding.as.object->text, "identity")) return request_error("HttpUnsupportedMedia");
    AugValue roots[2] = {aug_field(request, 3), aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
    roots[1] = aug_bytes_text(roots[0]);
    if (!aug_has_error) roots[1] = _aug_json_parse(roots[1]);
    if (aug_has_error) { aug_take_error(); aug_frame_leave(&frame); return request_error("HttpBadRequest"); }
    AugValue result = aug_json_decode(roots[1], schema);
    if (aug_has_error) { aug_take_error(); aug_frame_leave(&frame); return request_error("HttpValidationError"); }
    aug_frame_leave(&frame); return result;
  }
  return request_error("HttpBadRequest");
}
AugValue aug_http_response(AugValue body, int status) {
  if (body.tag == AUG_OBJECT && body.as.object->kind == AUG_HTTP_RESPONSE_KIND) return body;
  AugValue roots[2] = {body, aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
  roots[1] = aug_headers_new(); AugValue result = aug_new_object("HttpResponse", 3, NULL, NULL, 0);
  result.as.object->kind = AUG_HTTP_RESPONSE_KIND; aug_set_field(result, 0, body); aug_set_field(result, 1, aug_int(status)); aug_set_field(result, 2, roots[1]);
  aug_frame_leave(&frame); return result;
}
AugValue aug_httprequest_form(AugValue request, const AugSchema *schema) {
  AugValue result = aug_http_bind(request, "form", "", schema);
  if (aug_has_error) {aug_take_error(); return request_error("HttpError");} return result;
}
AugValue aug_http_response_full(AugValue body, AugValue status, AugValue headers) {
  int64_t code = status.tag == AUG_NULL ? 200 : aug_cint(status);
  if (code < 200 || code > 599) return request_error("HttpError");
  AugValue result = aug_http_response(body, (int)code);
  if (headers.tag != AUG_NULL) aug_set_field(result, 2, headers);
  return result;
}
int aug_http_error_status(void) {
  return aug_error_is("HttpBadRequest") ? 400 : aug_error_is("HttpUnauthorized") ? 401 : aug_error_is("HttpForbidden") ? 403 : aug_error_is("HttpTooManyRequests") ? 429 : aug_error_is("HttpTimedOut") ? 504 : aug_error_is("HttpBodyTooLarge") ? 413 : aug_error_is("HttpUnsupportedMedia") ? 415 : aug_error_is("HttpValidationError") ? 422 : 500;
}
AugValue aug_http_problem(int status) {
  const char *title = status == 400 ? "Bad Request" : status == 404 ? "Not Found" : status == 405 ? "Method Not Allowed" : status == 413 ? "Content Too Large" : status == 415 ? "Unsupported Media Type" : status == 422 ? "Unprocessable Content" : status == 401 ? "Unauthorized" : status == 403 ? "Forbidden" : status == 429 ? "Too Many Requests" : status == 504 ? "Gateway Timeout" : "Internal Server Error";
  char json[256]; snprintf(json, sizeof(json), "{\"type\":\"about:blank\",\"title\":\"%s\",\"status\":%d}", title, status);
  AugValue roots[2] = {0}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
  roots[0] = aug_string(json); roots[0] = _aug_json_parse(roots[0]); roots[1] = aug_http_response(roots[0], status);
  header_add(aug_field(roots[1], 2), "content-type", 12, "application/problem+json", 24);
  AugValue result = roots[1]; aug_frame_leave(&frame); return result;
}
static void cleanup(AugHttpSession *session) {
  if (session->job) {AugHttpJob *job=session->job;if(job->wsi)lws_set_timer_usecs(job->wsi,LWS_SET_TIMER_USEC_CANCEL);job->session = NULL; job->wsi = NULL;if(job->transport_complete)aug_task_wake(job->task.as.object->native);else aug_task_cancel(job->task);}
  if (session->rooted) aug_release(&session->retained);
  free(session->body); memset(session, 0, sizeof(*session));
}
static AugValue request_task(AugValue self, AugValue *args, int count) {
  (void)self; (void)count; aug_execution_current()->http_job=(void *)(intptr_t)aug_cint(args[2]); size_t index = (size_t)aug_cint(args[1]); return route_call(&served_routes[index],args,1);
}
AugValue aug_http_event(AugValue data, AugValue id, AugValue event, AugValue retry) {
  AugValue values[]={data,id,event,retry};
  for(size_t i=1;i<3;i++)if(values[i].tag!=AUG_NULL&&(values[i].tag!=AUG_STRING||memchr(values[i].as.object->text,0,values[i].as.object->text_length)||strchr(values[i].as.object->text,'\r')||strchr(values[i].as.object->text,'\n')))return request_error("HttpError");
  if(retry.tag!=AUG_NULL&&(retry.tag!=AUG_INT||retry.as.integer<0||retry.as.integer>2147483647))return request_error("HttpError");
  AugFrame frame;aug_frame_enter(&frame,values,4);AugValue result=aug_new_object("ServerEvent",4,NULL,NULL,0);
  for(size_t i=0;i<4;i++)aug_set_field(result,i,values[i]);result.as.object->frozen=true;aug_frame_leave(&frame);return result;
}
void aug_http_yield(AugValue value) {
  AugHttpJob *job=aug_execution_current()->http_job;
  if(!job||!job->session||(!job->test&&!job->wsi)){aug_cancelled=true;return;}
  AugHttpSession *session=job->session;AugValue encoded=value;AugFrame frame;aug_frame_enter(&frame,&encoded,1);
  if(value.tag==AUG_OBJECT&&value.as.object->kind==AUG_HTML_KIND)encoded=aug_html_transport(value);
  if(session->route->stream==1) {
    if(value.tag!=AUG_OBJECT||strcmp(value.as.object->type_name,"ServerEvent")){request_error("HttpError");goto finished;}
    encoded=aug_json_stringify(aug_field(value,0));if(aug_has_error){aug_take_error();request_error("HttpError");goto finished;}
    size_t size=encoded.as.object->text_length+16;
    for(size_t i=1;i<3;i++){AugValue field=aug_field(value,i);if(field.tag==AUG_STRING)size+=field.as.object->text_length+8;}
    AugValue retry=aug_field(value,3);if(retry.tag==AUG_INT)size+=32;
    if(size>65536){request_error("HttpError");goto finished;}
    char *buffer=malloc(size+1);if(!buffer)abort();size_t used=0;
    for(size_t i=1;i<3;i++){AugValue field=aug_field(value,i);if(field.tag==AUG_STRING)used+=(size_t)snprintf(buffer+used,size+1-used,"%s: %s\n",i==1?"id":"event",field.as.object->text);}
    if(retry.tag==AUG_INT)used+=(size_t)snprintf(buffer+used,size+1-used,"retry: %lld\n",(long long)retry.as.integer);
    memcpy(buffer+used,"data: ",6);used+=6;memcpy(buffer+used,encoded.as.object->text,encoded.as.object->text_length);used+=encoded.as.object->text_length;memcpy(buffer+used,"\n\n",2);used+=2;
    encoded=aug_bytes(buffer,used,AUG_BYTES_KIND);free(buffer);
  }
  if(encoded.tag!=AUG_OBJECT||(encoded.as.object->kind!=AUG_BYTES_KIND&&encoded.as.object->kind!=AUG_HTML_KIND)||encoded.as.object->text_length>65536){request_error("HttpError");goto finished;}
  if(session->compress){encoded=gzip_bytes(encoded);if(aug_has_error||encoded.as.object->text_length>65536){if(!aug_has_error)request_error("HttpError");goto finished;}}
  if(job->test) {
    size_t old=session->roots[2].tag==AUG_OBJECT?session->roots[2].as.object->text_length:0, size=encoded.as.object->text_length;
    if(size>response_limit-old){request_error("HttpError");goto finished;}
    char *buffer=malloc(old+size+1);if(!buffer)abort();
    if(old)memcpy(buffer,session->roots[2].as.object->text,old);memcpy(buffer+old,encoded.as.object->text,size);
    session->roots[2]=aug_bytes(buffer,old+size,AUG_BYTES_KIND);free(buffer);session->streaming=true;goto finished;
  }
  session->roots[1]=policy_response(session,aug_http_response(aug_null(),session->route->status));session->roots[3]=encoded;session->streaming=true;session->stream_pending=true;session->sent=0;
  lws_callback_on_writable(job->wsi);
  if(session->head){session->stream_pending=false;aug_cancelled=true;goto finished;}
  while(job->session&&job->session->stream_pending&&!aug_cancelled)aug_task_suspend();
finished:
  aug_frame_leave(&frame);
}
AugValue aug_http_finish(AugValue response) {
  AugHttpJob *job=aug_execution_current()->http_job;if(!job)return response;
  AugHttpSession *session=job->session;AugValue roots[3]={response,job->roots[1],job->roots[0]};AugFrame frame;aug_frame_enter(&frame,roots,3);
  if(job->timed_out)roots[0]=aug_http_problem(504);
  else if(job->test&&job->deadline&&monotonic_ms()>=job->deadline)roots[0]=aug_http_problem(504);
  if(session) {
    roots[0]=policy_response(session,roots[0]);
    bool stream_success=session->route->stream&&aug_cint(aug_field(roots[0],1))<400;
    if(job->test&&stream_success&&!session->streaming) {
      session->roots[2]=aug_bytes("",0,AUG_BYTES_KIND);
      if(session->compress)session->roots[2]=gzip_bytes(session->roots[2]);
    }
    if(job->test&&stream_success)session->streaming=true;
    if(!job->test) {
      if(session->headers_sent&&aug_cint(aug_field(roots[0],1))>=400)lws_set_timeout(job->wsi,PENDING_TIMEOUT_USER_OK,LWS_TO_KILL_ASYNC);
      else {
        session->roots[1]=roots[0];
        if(session->route->stream&&aug_cint(aug_field(roots[0],1))<400){if(session->compress&&!session->streaming){session->roots[3]=gzip_bytes(aug_bytes("",0,AUG_BYTES_KIND));session->stream_pending=true;}session->streaming=true;session->stream_done=true;}
        else session->streaming=false;
        lws_callback_on_writable(job->wsi);
      }
      while(job->session&&!job->transport_complete&&!aug_cancelled)aug_task_suspend();
    }
  }
  int status=aug_cancelled&&!job->timed_out?499:(int)aug_cint(aug_field(roots[0],1));
  bool cancelled=aug_cancelled;aug_cancelled=false;aug_execution_current()->http_job=NULL;
  if(roots[1].tag==AUG_OBJECT)for(size_t i=roots[1].as.object->field_count;i>0;i--){
    AugValue arguments[]={aug_field(roots[2],0),aug_field(roots[2],1),aug_int(status),aug_int(monotonic_ms()-job->started)};
    aug_call_method(roots[1].as.object->fields[i-1],"complete",arguments,4);
    if(aug_has_error){aug_report_error();aug_take_error();}
  }
  aug_execution_current()->http_job=job;aug_cancelled=cancelled;
  AugValue result=roots[0];aug_frame_leave(&frame);return result;
}
static void request_complete(AugValue task, void *data) {
  AugHttpJob *job = data;
  if (job->session && job->wsi) {
    AugValue response = aug_field(task, 2), error = aug_field(task, 3);
    if (error.tag != AUG_NULL) {aug_throw(error); aug_report_error(); aug_take_error(); response = aug_http_problem(500);}
    if(job->timed_out)response=aug_http_problem(504);
    AugHttpSession *session=job->session;session->job=NULL;
    if(session->route->stream&&aug_cint(aug_field(response,1))<400) {session->roots[1]=response;session->streaming=true;session->stream_done=true;}
    else if(session->streaming&&session->headers_sent) {lws_set_timeout(job->wsi,PENDING_TIMEOUT_USER_OK,LWS_TO_KILL_ASYNC);}
    else {session->roots[1]=response;session->streaming=false;}
    lws_callback_on_writable(job->wsi);
  }
  aug_task_release(task);aug_release(&job->retained);free(job);
}
static void dispatch(struct lws *wsi, AugHttpSession *session) {
  if (session->submitted) return; session->submitted = true;
  aug_set_field(session->roots[0], 3, aug_bytes(session->body, session->body_length, AUG_BYTES_KIND));
  aug_freeze(session->roots[0]);
  if (!session->route) {session->roots[1] = aug_http_problem(404); lws_callback_on_writable(wsi); return;}
  AugHttpJob *job = calloc(1, sizeof(*job)); if (!job) return;
  job->wsi = wsi; job->session = session; session->job = job;job->started=monotonic_ms();
  job->roots[0]=session->roots[0];aug_retain(&job->retained,job->roots,2);
  AugValue arguments[3] = {session->roots[0], aug_int(session->route - served_routes),aug_int((int64_t)(intptr_t)job)};
  job->task = aug_task_spawn(request_task, aug_null(), arguments, 3, request_complete, job);
}
static int callback_http(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t length) {
  AugHttpSession *session = user;
  switch (reason) {
    case LWS_CALLBACK_HTTP: {
      cleanup(session); aug_retain(&session->retained, session->roots, 8); session->rooted = true;
      char *uri; int uri_size; int method = lws_http_get_uri_and_method(wsi, &uri, &uri_size);
      const char *methods[] = {"GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE", "CONNECT", "HEAD"};
      const char *verb = method >= 0 && method < 8 ? methods[method] : "UNKNOWN";
      session->head = !strcmp(verb, "HEAD");
      session->roots[0] = aug_new_object("HttpRequest", 7, NULL, NULL, 0); session->roots[0].as.object->kind = AUG_HTTP_REQUEST_KIND;
      aug_set_field(session->roots[0], 0, aug_string(verb)); aug_set_field(session->roots[0], 1, aug_string_n(uri, (size_t)uri_size));
      aug_set_field(session->roots[0], 2, aug_headers_new()); read_headers(wsi, aug_field(session->roots[0], 2));
      aug_set_field(session->roots[0], 4, aug_map_new()); aug_set_field(session->roots[0], 5, aug_map_new());
      char peer[96];lws_get_peer_simple(wsi,peer,sizeof(peer));aug_set_field(session->roots[0],6,aug_string(peer));
      char *fragment = malloc(65536); if (!fragment) return -1;
      for (int index = 0;; index++) {
        int size = lws_hdr_copy_fragment(wsi, fragment, 65536, WSI_TOKEN_HTTP_URI_ARGS, index); if (size < 0) break;
        char *equal = memchr(fragment, '=', (size_t)size); size_t key_size = equal ? (size_t)(equal - fragment) : (size_t)size;
        AugValue roots[2] = {0}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
        roots[0] = aug_string_n(fragment, key_size); roots[1] = aug_string_n(equal ? equal + 1 : "", equal ? (size_t)size - key_size - 1 : 0);
        map_add(aug_field(session->roots[0], 5), roots[0], roots[1]); aug_frame_leave(&frame);
      }
      free(fragment);
      session->route=select_route(session->roots[0],served_routes,served_count,&session->roots[1]);
      if (!session->route) {
        session->submitted = true; lws_callback_on_writable(wsi); return 0;
      }
      AugValue content_length = header_get(aug_field(session->roots[0], 2), "content-length", true);
      bool has_body = !strcmp(verb, "POST") || !strcmp(verb, "PUT") || !strcmp(verb, "PATCH");
      if (aug_has_error) {aug_take_error(); session->roots[1] = aug_http_problem(400); session->submitted = true; lws_callback_on_writable(wsi); return 0;}
      if (content_length.tag == AUG_STRING) {
        errno = 0; char *last; unsigned long long amount = strtoull(content_length.as.object->text, &last, 10);
        bool invalid = !content_length.as.object->text_length || content_length.as.object->text[0] < '0' || content_length.as.object->text[0] > '9' || *last;
        if (invalid || errno || amount > body_limit) { session->roots[1] = aug_http_problem(invalid ? 400 : 413); session->submitted = true; lws_callback_on_writable(wsi); return 0; }
        has_body = amount > 0;
      }
      if (header_get(aug_field(session->roots[0], 2), "transfer-encoding", false).tag == AUG_STRING) has_body = true;
      if (!has_body) dispatch(wsi, session);
      return 0;
    }
    case LWS_CALLBACK_HTTP_BODY:
      if (session->submitted) return 0;
      if (length > body_limit - session->body_length) { session->roots[1] = aug_http_problem(413); session->submitted = true; lws_callback_on_writable(wsi); return 0; }
      if (session->body_length + length > session->body_capacity) {
        session->body_capacity = session->body_length + length;
        char *next = realloc(session->body, session->body_capacity); if (!next) return -1; session->body = next;
      }
      memcpy(session->body + session->body_length, in, length); session->body_length += length; return 0;
    case LWS_CALLBACK_HTTP_BODY_COMPLETION: dispatch(wsi, session); return 0;
    case LWS_CALLBACK_HTTP_WRITEABLE: {
      if (!session) return 0;
      if (session->roots[1].tag != AUG_OBJECT) return 0;
      AugValue response = session->roots[1], body = aug_field(response, 0), headers = aug_field(response, 2);
      if (!session->headers_sent) {
        session->roots[2] = session->streaming ? aug_bytes("",0,AUG_BYTES_KIND) : body.tag == AUG_OBJECT && body.as.object->kind == AUG_HTML_KIND ? aug_html_transport(body) : body.tag == AUG_OBJECT && body.as.object->kind == AUG_BYTES_KIND ? body : aug_json_stringify(body);
        if (aug_has_error || session->roots[2].as.object->text_length > response_limit) { if (aug_has_error) aug_take_error(); session->compress=false;session->roots[1] = aug_http_problem(500); session->roots[2] = aug_json_stringify(aug_field(session->roots[1], 0)); response = session->roots[1]; headers = aug_field(response, 2); }
        if(session->compress&&!session->streaming)session->roots[2]=gzip_bytes(session->roots[2]);
        const char *type = body.tag == AUG_OBJECT && body.as.object->kind == AUG_HTML_KIND ? "text/html; charset=utf-8" : body.tag == AUG_OBJECT && body.as.object->kind == AUG_BYTES_KIND ? "application/octet-stream" : "application/json";
        if(session->streaming)type=session->route->stream==1?"text/event-stream":session->route->stream==2?"application/octet-stream":"text/html; charset=utf-8";
        AugValue specified = header_get(headers, "content-type", false); if (specified.tag == AUG_STRING) type = specified.as.object->text;
        unsigned char buffer[LWS_PRE + 16384], *start = buffer + LWS_PRE, *next = start, *end = buffer + sizeof(buffer);
        int status = (int)aug_cint(aug_field(response, 1)); size_t size = session->roots[2].as.object->text_length;
        bool no_body = status == 204 || status == 304; if (no_body) session->head = true;
        if (lws_add_http_common_headers(wsi, (unsigned int)status, no_body ? NULL : type, no_body || session->streaming ? LWS_ILLEGAL_HTTP_CONTENT_LEN : (lws_filepos_t)size, &next, end)) return -1;
        AugValue entries = aug_field(headers, 0);
        for (size_t i = 0; i < entries.as.object->field_count; i++) {
          AugValue pair = entries.as.object->fields[i], label = aug_field(pair, 0), value = aug_field(pair, 1);
          if (!strcasecmp(label.as.object->text, "content-type") || !strcasecmp(label.as.object->text, "content-length") ||
              !strcasecmp(label.as.object->text, "transfer-encoding") || !strcasecmp(label.as.object->text, "connection") ||
              !strcasecmp(label.as.object->text, "keep-alive") || !strcasecmp(label.as.object->text, "upgrade")) continue;
          char name[256]; if (label.as.object->text_length > 250) return -1;
          snprintf(name, sizeof(name), "%s:", label.as.object->text);
          if (lws_add_http_header_by_name(wsi, (unsigned char *)name, (unsigned char *)value.as.object->text, (int)value.as.object->text_length, &next, end)) return -1;
        }
        if (lws_finalize_write_http_header(wsi, start, &next, end)) return -1;
        session->headers_sent = true; lws_callback_on_writable(wsi); return 0;
      }
      if(session->streaming&&!session->stream_pending&&!session->stream_done)return 0;
      AugValue encoded = session->streaming&&session->stream_pending?session->roots[3]:session->roots[2]; size_t remaining = session->head ? 0 : encoded.as.object->text_length - session->sent;
      size_t amount = remaining > 16384 ? 16384 : remaining; unsigned char buffer[LWS_PRE + 16384];
      if (amount) memcpy(buffer + LWS_PRE, encoded.as.object->text + session->sent, amount);
      int mode = amount == remaining && (!session->streaming || session->stream_done) ? LWS_WRITE_HTTP_FINAL : LWS_WRITE_HTTP;
      if (lws_write(wsi, buffer + LWS_PRE, amount, (enum lws_write_protocol)mode) < 0) return -1;
      session->sent += amount;
      if(session->streaming&&amount==remaining&&session->stream_pending){session->stream_pending=false;session->roots[3]=aug_null();session->sent=0;if(session->job)aug_task_wake(session->job->task.as.object->native);}
      if (mode == LWS_WRITE_HTTP_FINAL) {if(session->job)session->job->transport_complete=true; cleanup(session); return lws_http_transaction_completed(wsi) ? -1 : 0; }
      lws_callback_on_writable(wsi); return 0;
    }
    case LWS_CALLBACK_HTTP_DROP_PROTOCOL:
    case LWS_CALLBACK_CLOSED_HTTP: if (session) cleanup(session); return 0;
    case LWS_CALLBACK_TIMER:
      if(session&&session->job){AugHttpJob *job=session->job;job->timed_out=true;aug_task_cancel(job->task);if(session->headers_sent)lws_set_timeout(wsi,PENDING_TIMEOUT_USER_OK,LWS_TO_KILL_ASYNC);}return 0;
    default: return 0;
  }
}
static const struct lws_protocols protocols[] = {
  {"august-http", callback_http, sizeof(AugHttpSession), 16384, 0, NULL, 0},
  {"august-client", callback_client, 0, 16384, 0, NULL, 0}, LWS_PROTOCOL_LIST_TERM
};
static void service_io(bool wait) {
  if (!server_context) return;
  if (!wait || io_wakeup_pending) lws_cancel_service(server_context);
  io_wakeup_pending=false;
  lws_service(server_context, wait ? 100 : 0);
}
typedef struct {
  struct lws *wsi; AugTask *task; AugValue roots[6]; AugRetained retained;
  bool done, failed; size_t sent, size; char *bytes;
} AugClientRequest;
static void client_done(AugClientRequest *request, bool failed) {
  if (!request || request->done) return;
  request->done = true; request->failed = failed;
  if (!failed) {
    request->roots[4] = aug_bytes(request->bytes, request->size, AUG_BYTES_KIND);
    request->roots[4] = aug_http_response_full(request->roots[4], request->roots[5], request->roots[2]);
  }
  if (request->task) aug_task_wake(request->task);
  notify_io();
}
static int callback_client(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t length) {
  (void)user; AugClientRequest *request = lws_get_opaque_user_data(wsi); if (!request) return 0;
  switch (reason) {
    case LWS_CALLBACK_CLIENT_APPEND_HANDSHAKE_HEADER: {
      unsigned char **next = in, *end = *next + length;
      AugValue entries = aug_field(request->roots[2], 0);
      for (size_t i = 0; i < entries.as.object->field_count; i++) {
        AugValue pair = entries.as.object->fields[i], name = aug_field(pair, 0), value = aug_field(pair, 1); char label[256];
        snprintf(label, sizeof(label), "%s:", aug_cstring(name));
        if (lws_add_http_header_by_name(wsi, (const unsigned char *)label, (const unsigned char *)aug_cstring(value), (int)value.as.object->text_length, next, end)) return -1;
      }
      if (request->roots[3].tag != AUG_NULL) {
        char size[32]; snprintf(size, sizeof(size), "%zu", request->roots[3].as.object->text_length);
        if (lws_add_http_header_by_token(wsi, WSI_TOKEN_HTTP_CONTENT_LENGTH, (unsigned char *)size, (int)strlen(size), next, end)) return -1;
        lws_client_http_body_pending(wsi, 1); lws_callback_on_writable(wsi);
      }
      return 0;
    }
    case LWS_CALLBACK_CLIENT_HTTP_WRITEABLE: {
      AugValue body = request->roots[3]; if (body.tag == AUG_NULL) return 0;
      size_t remaining = body.as.object->text_length - request->sent, amount = remaining > 16384 ? 16384 : remaining;
      unsigned char buffer[LWS_PRE + 16384]; if (amount) memcpy(buffer + LWS_PRE, body.as.object->text + request->sent, amount);
      bool final = amount == remaining;
      if (final) lws_client_http_body_pending(wsi, 0);
      if (lws_write(wsi, buffer + LWS_PRE, amount, final ? LWS_WRITE_HTTP_FINAL : LWS_WRITE_HTTP) != (int)amount) return -1;
      request->sent += amount; if (!final) lws_callback_on_writable(wsi); return 0;
    }
    case LWS_CALLBACK_ESTABLISHED_CLIENT_HTTP:
      request->roots[5] = aug_int(lws_http_client_http_response(wsi)); request->roots[2] = aug_headers_new(); read_headers(wsi, request->roots[2]); aug_freeze(request->roots[2]); return 0;
    case LWS_CALLBACK_RECEIVE_CLIENT_HTTP_READ: {
      if (length > response_limit - request->size) {client_done(request, true); return -1;}
      char *bytes = realloc(request->bytes, request->size + length + 1); if (!bytes) {client_done(request, true); return -1;}
      request->bytes = bytes; memcpy(bytes + request->size, in, length); request->size += length; return 0;
    }
    case LWS_CALLBACK_RECEIVE_CLIENT_HTTP: {
      char buffer[LWS_PRE + 16384], *next = buffer + LWS_PRE; int size = 16384;
      if (lws_http_client_read(wsi, &next, &size) < 0) return -1; return 0;
    }
    case LWS_CALLBACK_COMPLETED_CLIENT_HTTP: client_done(request, false); return 0;
    case LWS_CALLBACK_CLIENT_CONNECTION_ERROR:
      fprintf(stderr, "August HTTP connection failed: %.*s\n", 250, in ? (const char *)in : "connection closed");
      client_done(request, true); request->wsi = NULL; return 0;
    case LWS_CALLBACK_CLOSED_CLIENT_HTTP: client_done(request, !request->done); request->wsi = NULL; return 0;
    default: return 0;
  }
}
static bool ensure_context(void) {
  if (server_context) return true;
  struct lws_context_creation_info info; memset(&info, 0, sizeof(info)); info.port = CONTEXT_PORT_NO_LISTEN;
  info.protocols = protocols; info.options = LWS_SERVER_OPTION_DO_SSL_GLOBAL_INIT | LWS_SERVER_OPTION_EXPLICIT_VHOSTS; info.max_http_header_data = 65535;
  lws_set_log_level(LLL_ERR | LLL_WARN | (getenv("AUG_HTTP_TRACE") ? LLL_NOTICE | LLL_INFO : 0), NULL); server_context = lws_create_context(&info); aug_scheduler_io = service_io; aug_scheduler_notify=notify_io;
  if (server_context) {
    info.options = LWS_SERVER_OPTION_DO_SSL_GLOBAL_INIT; info.vhost_name = "august-client";
    info.client_ssl_ca_filepath = *tls_ca ? tls_ca : NULL;
    if (!lws_create_vhost(server_context, &info)) {lws_context_destroy(server_context); server_context = NULL;}
  }
  return server_context != NULL;
}
AugValue _aug_http_request(AugValue method, AugValue url, AugValue headers, AugValue body) {
  if (strchr(aug_cstring(url), '#') || memchr(url.as.object->text, 0, url.as.object->text_length)) return request_error("HttpError");
  const char *verb = aug_cstring(method); for (const char *p = verb; *p; p++) if (*p < 'A' || *p > 'Z') return request_error("HttpError");
  if (!*verb || !ensure_context()) return request_error("HttpError");
  lws_parse_uri_t *uri = lws_parse_uri_create(aug_cstring(url));
  if (!uri || (strcmp(uri->scheme, "http") && strcmp(uri->scheme, "https"))) {if (uri) lws_parse_uri_destroy(&uri); return request_error("HttpError");}
  AugClientRequest *request = calloc(1, sizeof(*request)); if (!request) {lws_parse_uri_destroy(&uri); return request_error("HttpError");}
  request->roots[0] = method; request->roots[1] = url; request->roots[2] = headers; request->roots[3] = body;
  aug_retain(&request->retained, request->roots, 6);
  if (headers.tag == AUG_NULL) request->roots[2] = aug_headers_new();
  request->task = aug_task_current();
  struct lws_client_connect_info info; memset(&info, 0, sizeof(info));
  info.context = server_context; info.address = uri->host; info.host = uri->host; info.port = uri->port;
  info.vhost = lws_get_vhost_by_name(server_context, "august-client"); info.alpn = "h2,http/1.1";
  info.path = uri->path; info.method = verb; info.protocol = "august-client"; info.opaque_user_data = request; info.pwsi = &request->wsi;
  info.ssl_connection = LCCSCF_HTTP_NO_FOLLOW_REDIRECT | (!strcmp(uri->scheme, "https") ? LCCSCF_USE_SSL : 0);
  if (!lws_client_connect_via_info(&info)) client_done(request, true);
  while (!request->done && !aug_cancelled) {
    if (request->task) aug_task_suspend(); else {if (!aug_scheduler_step()) service_io(true); else service_io(false);}
  }
  if (request->wsi) {lws_set_opaque_user_data(request->wsi, NULL); lws_set_timeout(request->wsi, PENDING_TIMEOUT_USER_OK, LWS_TO_KILL_SYNC);}
  lws_parse_uri_destroy(&uri);
  bool failed = request->failed || aug_cancelled; AugValue result = request->roots[4];
  aug_release(&request->retained); free(request->bytes); free(request);
  return failed ? request_error("HttpError") : result;
}
void aug_http_serve(const AugRoute *routes, size_t count, int64_t port) {
  if (port < 0 || port > 65535 || served_routes) { request_error("HttpError"); return; }
  served_routes = routes; served_count = count; stopped = 0;
  if (!ensure_context()) {request_error("HttpError"); return;}
  struct lws_context_creation_info info; memset(&info, 0, sizeof(info));
  info.port = (int)port; info.iface = listen_host; info.protocols = protocols; info.vhost_name = "august"; info.options = LWS_SERVER_OPTION_DO_SSL_GLOBAL_INIT;
  info.ssl_cert_filepath = *tls_certificate ? tls_certificate : NULL; info.ssl_private_key_filepath = *tls_private_key ? tls_private_key : NULL;
  info.alpn = "h2,http/1.1";
  info.max_http_header_data = 65535; info.max_http_header_pool = 64;
  struct lws_vhost *vhost = lws_create_vhost(server_context, &info);
  if (!vhost) { request_error("HttpError"); return; }
  if (enable_http3) {
    info.port = CONTEXT_PORT_NO_LISTEN_SERVER; info.vhost_name = "august-h3";
    info.listen_accept_role = "quic"; info.listen_accept_protocol = "august-http"; info.alpn = "h3";
    struct lws_vhost *quic = lws_create_vhost(server_context, &info);
    struct lws *udp = quic ? lws_create_adopt_udp(quic, listen_host, lws_get_vhost_listen_port(vhost), LWS_CAUDP_BIND, "august-http", NULL, NULL, NULL, NULL, "quic_listen") : NULL;
    if (getenv("AUG_HTTP_TRACE") && udp) fprintf(stderr, "August QUIC socket %d bound for %s:%d\n", lws_get_socket_fd(udp), listen_host, lws_get_vhost_listen_port(vhost));
    if (!quic || !udp) {
      lws_context_destroy(server_context); server_context = NULL; request_error("HttpError"); return;
    }
  }
  printf("August HTTP listening on port %d\n", lws_get_vhost_listen_port(vhost)); fflush(stdout);
  struct sigaction action, previous_term, previous_int; memset(&action, 0, sizeof(action)); action.sa_handler = stop_server;
  sigaction(SIGTERM, &action, &previous_term); sigaction(SIGINT, &action, &previous_int);
  aug_scheduler_io = service_io;
  while (!stopped) {
    /* Drain a bounded batch before entering poll. One task per poll serialized
       ready requests and repeatedly paid the event-loop wake-up cost. */
    bool progressed = false;
    for (unsigned i = 0; i < 32 && aug_scheduler_step(); i++) progressed = true;
    if (progressed || io_wakeup_pending) lws_cancel_service(server_context);
    io_wakeup_pending=false;
    if (lws_service(server_context, 100) < 0) break;
  }
  lws_context_destroy(server_context); server_context = NULL;
  while (aug_scheduler_step()) {}
  sigaction(SIGTERM, &previous_term, NULL); sigaction(SIGINT, &previous_int, NULL);
}
