import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const root=resolve(import.meta.dirname,'..'),mac=process.platform==='darwin';
test('streaming HEAD applies policies once, preserves failures, and logs a transport deadline', {skip:!process.env.AUG_LLVM_HOME},()=>{
  const folder=mkdtempSync(join(tmpdir(),'aug-head-policy-'));
  try {
    // Inspect the response before writable transport can send its first headers.
    // Socket checks alone can miss a second policy pass after headers are sent.
    const source=join(folder,'head.c'),binary=join(folder,'head');
    writeFileSync(source,`#define aug_task_suspend controlled_suspend
#define lws_callback_on_writable controlled_writable
#define lws_add_http_common_headers controlled_common_headers
#define lws_add_http_header_by_name controlled_header
#define lws_finalize_write_http_header controlled_legacy_write
#define lws_finalize_write_http_header_flags controlled_header_write
#define lws_http_transaction_completed controlled_transaction
#define aug_task_wake controlled_wake
#include ${JSON.stringify(join(root,'runtime/aug_http.c'))}
#include <assert.h>
static int waits, logged_status, header_flags, transactions, wakes;
int controlled_writable(struct lws *wsi) { (void)wsi; return 0; }
int controlled_common_headers(struct lws *wsi, unsigned int code, const char *type, lws_filepos_t length, unsigned char **p, unsigned char *end) {
  (void)wsi; (void)code; (void)type; (void)length; (void)p; (void)end; return 0;
}
int controlled_header(struct lws *wsi, const unsigned char *name, const unsigned char *value, int length, unsigned char **p, unsigned char *end) {
  (void)wsi; (void)name; (void)value; (void)length; (void)p; (void)end; return 0;
}
int controlled_header_write(struct lws *wsi, unsigned char *start, unsigned char **p, unsigned char *end, enum lws_write_protocol flags) {
  (void)wsi; (void)start; (void)p; (void)end; header_flags = flags; return 0;
}
int controlled_legacy_write(struct lws *wsi, unsigned char *start, unsigned char **p, unsigned char *end) {
  return controlled_header_write(wsi, start, p, end, LWS_WRITE_HTTP_HEADERS);
}
int controlled_transaction(struct lws *wsi) { (void)wsi; ++transactions; return 0; }
void controlled_wake(AugTask *task) { (void)task; ++wakes; }
void controlled_suspend(void) {
  AugHttpJob *job = aug_execution_current()->http_job;
  assert(job && job->head_complete && !job->timed_out);
  ++waits; job->timed_out = true;
}
static AugValue complete(AugValue self, AugValue *args, int count) {
  (void)self; assert(count == 4); logged_status = (int)aug_cint(args[2]);
  return aug_null();
}
static const AugMethodEntry logger_methods[] = {{"complete", complete, NULL}};
static void check_headers(AugValue response) {
  AugValue roots[] = {response, aug_null(), aug_null()};
  AugFrame frame; aug_frame_enter(&frame, roots, 3);
  roots[1] = aug_string("access-control-allow-origin");
  roots[2] = aug_headers_all(aug_field(roots[0], 2), roots[1]);
  assert(roots[2].as.object->field_count == 1);
  roots[1] = aug_string("access-control-allow-credentials");
  roots[2] = aug_headers_all(aug_field(roots[0], 2), roots[1]);
  assert(roots[2].as.object->field_count == 1);
  aug_frame_leave(&frame);
}
int main(void) {
  AugRoute route = {.stream=2, .status=200};
  AugHttpSession session = {.route=&route, .head=true, .streaming=true};
  AugHttpJob job = {.session=&session, .test=true, .head_complete=true};
  AugFrame session_frame; aug_frame_enter(&session_frame, session.roots, 8);
  AugFrame job_frame; aug_frame_enter(&job_frame, job.roots, 3);
  session.roots[4] = aug_headers_new();
  session.roots[4] = headers_with_name(session.roots[4], "access-control-allow-origin", aug_string("https://example.test"));
  session.roots[4] = headers_with_name(session.roots[4], "access-control-allow-credentials", aug_string("true"));
  session.roots[1] = policy_response(&session, aug_http_response(aug_null(), 200));
  job.roots[2] = session.roots[1];
  aug_execution_current()->http_job = &job; aug_cancelled = true;
  AugValue response; assert(aug_http_head_response(&response));
  response = aug_http_finish(response);
  assert(aug_cint(aug_field(response, 1)) == 200); check_headers(response);
  response = aug_http_finish(aug_http_problem(500));
  assert(aug_cint(aug_field(response, 1)) == 500); check_headers(response);
  session.roots[0] = aug_new_object("HttpRequest", 7, NULL, NULL, 0);
  aug_set_field(session.roots[0], 0, aug_string("HEAD"));
  aug_set_field(session.roots[0], 1, aug_string("/controlled"));
  job.roots[0] = session.roots[0];
  session.roots[5] = aug_new_object("Logger", 0, NULL, logger_methods, 1);
  job.roots[1] = aug_list_new(&session.roots[5], 1);
  session.roots[1] = policy_response(&session, aug_http_response(aug_null(), 200));
  job.roots[2] = session.roots[1];
  job.test = false;
  assert(aug_http_head_response(&response));
  response = aug_http_finish(response);
  assert(waits == 1); assert(aug_cint(aug_field(response, 1)) == 504);
  assert(logged_status == 504);
  // HEAD ends at its headers. A client can reuse the connection immediately.
  // Completion must not depend on a later writable callback for an empty body.
  job.timed_out = false; job.transport_complete = false;
  session.job = &job; session.roots[1] = aug_http_problem(500);
  session.roots[6] = aug_new_object("Task", 0, NULL, NULL, 0); job.task = session.roots[6];
  assert(callback_http(NULL, LWS_CALLBACK_HTTP_WRITEABLE, &session, NULL, 0) == 0);
  assert(job.transport_complete && job.session == NULL);
  assert(header_flags == (LWS_WRITE_HTTP_HEADERS | LWS_WRITE_H2_STREAM_END));
  assert(transactions == 1 && wakes == 1);
  assert(aug_http_head_response(&response));
  assert(aug_cint(aug_field(response, 1)) == 200); check_headers(response);
  aug_execution_current()->http_job = NULL; aug_cancelled = false;
  aug_frame_leave(&job_frame); aug_frame_leave(&session_frame); aug_collect();
}
`);
    const runtime=resolve(process.env.AUG_RUNTIME_PACK??join(root,'.aug-native/llvm/runtime'));
    const prefix=join(resolve(process.env.AUG_LLVM_NATIVE_HOME??join(root,'.aug-native')),'prefix');
    const cc=process.env.AUG_CC??(mac?'/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang':'clang');
    const flags=mac?['-isysroot',process.env.AUG_TEST_MACOS_SDK??'/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk','-mmacosx-version-min=14.0','-D_DARWIN_C_SOURCE']:['-pthread'];
    const suffix=mac?'.1.dylib':'.so.1';
    const dependencies=JSON.parse(readFileSync(join(runtime,'runtime.json'))).components.http.runtimeFiles.map(path=>join(runtime,path));
    const built=spawnSync(cc,[...flags,'-std=c11','-D_POSIX_C_SOURCE=200809L','-I'+join(root,'runtime'),'-I'+join(prefix,'include'),source,join(prefix,'lib/libwebsockets.a'),join(runtime,'lib/libaug_http'+suffix),join(runtime,'lib/libaug_runtime'+suffix),...dependencies,'-Wl,-rpath,'+join(runtime,'lib'),'-lz',...(mac?['-framework','CoreFoundation','-framework','SystemConfiguration']:[]),'-o',binary],{encoding:'utf8',timeout:30000});
    assert.equal(built.status,0,built.stderr||built.error?.message);
    const result=spawnSync(binary,[],{encoding:'utf8',timeout:10000});
    assert.equal(result.status,0,result.stderr||result.error?.message);
  } finally {rmSync(folder,{recursive:true,force:true});}
});
