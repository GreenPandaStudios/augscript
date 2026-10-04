#include "aug_runtime.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <stdint.h>
#include <strings.h>
typedef struct {char *text; size_t size, capacity;} HtmlBuffer;
static void append(HtmlBuffer *buffer, const char *text, size_t size) {
  if (size >= SIZE_MAX - buffer->size) abort();
  size_t needed = buffer->size + size + 1;
  if (needed > buffer->capacity) {
    size_t capacity = buffer->capacity ? buffer->capacity : 32;
    while (capacity < needed) {
      if (capacity > SIZE_MAX / 2) { capacity = needed; break; }
      capacity *= 2;
    }
    char *grown = realloc(buffer->text, capacity);
    if (!grown) abort();
    buffer->text = grown;
    buffer->capacity = capacity;
  }
  if (size) memcpy(buffer->text + buffer->size, text, size);
  buffer->size += size;
  buffer->text[buffer->size] = 0;
}
static void text(HtmlBuffer *buffer, const char *value) {append(buffer, value, strlen(value));}
static void escape(HtmlBuffer *buffer, const char *value, size_t size) {
  for (size_t i = 0; i < size; i++) {
    const char *escaped = value[i] == '&' ? "&amp;" : value[i] == '<' ? "&lt;" : value[i] == '>' ? "&gt;" : value[i] == '"' ? "&quot;" : value[i] == '\'' ? "&#39;" : value[i] == 0 ? "&#xfffd;" : NULL;
    if (escaped) text(buffer, escaped); else append(buffer, value + i, 1);
  }
}
static void value(HtmlBuffer *buffer, AugValue item, bool attribute) {
  if (item.tag == AUG_NULL) return;
  if (item.tag == AUG_OBJECT && item.as.object->kind == AUG_HTML_KIND && !attribute) {append(buffer, item.as.object->text, item.as.object->text_length); return;}
  if (item.tag == AUG_OBJECT && item.as.object->kind == AUG_LIST_KIND && !attribute) {for (size_t i = 0; i < item.as.object->field_count; i++) value(buffer, item.as.object->fields[i], false); return;}
  if (item.tag == AUG_STRING) {escape(buffer, item.as.object->text, item.as.object->text_length); return;}
  char number[64]; if (item.tag == AUG_INT) snprintf(number, sizeof(number), "%lld", (long long)item.as.integer);
  else if (item.tag == AUG_FLOAT) snprintf(number, sizeof(number), "%.17g", item.as.floating);
  else if (item.tag == AUG_BOOL) snprintf(number, sizeof(number), "%s", item.as.boolean ? "true" : "false"); else return;
  text(buffer, number);
}
#ifdef AUG_HTTP_RUNTIME
AugValue aug_http_action(const char *route, AugValue *values, size_t count) {
  HtmlBuffer buffer = {0}; AugFrame frame; aug_frame_enter(&frame,values,count);
  AugValue encoded[2] = {0}; AugFrame encoded_frame; aug_frame_enter(&encoded_frame, encoded, 2);
  text(&buffer,"{\"route\":"); text(&buffer,route); text(&buffer,",\"values\":[");
  for (size_t i=0;i<count;i++) {
    if(i) text(&buffer,",");
    if(values[i].tag==AUG_NULL) text(&buffer,"null");
    else {
      encoded[0] = aug_json_stringify(values[i]);
      if (!aug_has_error) encoded[1] = aug_json_stringify(encoded[0]);
      if (aug_has_error) {aug_take_error();free(buffer.text);aug_frame_leave(&encoded_frame);aug_frame_leave(&frame);return aug_error_named("HttpError");}
      append(&buffer,encoded[1].as.object->text,encoded[1].as.object->text_length);
    }
  }
  text(&buffer,"],\"present\":[");for(size_t i=0;i<count;i++){if(i)text(&buffer,",");text(&buffer,values[i].tag==AUG_NULL?"false":"true");}text(&buffer,"]}");
  AugValue result=aug_bytes(buffer.text,buffer.size,AUG_HTTP_ACTION_KIND);free(buffer.text);aug_frame_leave(&encoded_frame);aug_frame_leave(&frame);return result;
}
#endif
static bool has_actions(AugValue item) {
  if(item.tag!=AUG_OBJECT)return false;
  if(item.as.object->html_actions)return true;
  if(item.as.object->kind==AUG_LIST_KIND)for(size_t i=0;i<item.as.object->field_count;i++)if(has_actions(item.as.object->fields[i]))return true;
  return false;
}
AugValue aug_html_transport(AugValue html) {
  if(!html.as.object->html_actions)return html;
  const char *script="<script src=\"/__aug/actions.js\" defer></script>", *end=strstr(html.as.object->text,"</body>");
  size_t offset=end?(size_t)(end-html.as.object->text):html.as.object->text_length;
  HtmlBuffer buffer={0};append(&buffer,html.as.object->text,offset);text(&buffer,script);append(&buffer,html.as.object->text+offset,html.as.object->text_length-offset);
  AugValue result=aug_bytes(buffer.text,buffer.size,AUG_HTML_KIND);free(buffer.text);return result;
}
static bool safe_url(AugValue input) {
  if (input.tag != AUG_STRING) return true;
  const char *text = input.as.object->text; size_t size = input.as.object->text_length;
  if (memchr(text, 0, size)) return false;
  char scheme[32]; size_t n = 0;
  for (size_t i = 0; i < size && n + 1 < sizeof(scheme); i++) {
    unsigned char c = (unsigned char)text[i]; if (c <= 32) continue; if (c == ':' || c == '/' || c == '?' || c == '#') break; scheme[n++] = (char)c;
  }
  scheme[n] = 0; return strcasecmp(scheme, "javascript") && strcasecmp(scheme, "vbscript") && strcasecmp(scheme, "data");
}
AugValue aug_html_element(const char *tag, AugValue *attributes, size_t count, AugValue *children, size_t child_count) {
  HtmlBuffer buffer = {0}; AugFrame frame; aug_frame_enter(&frame, attributes, count * 2); AugFrame child_frame; aug_frame_enter(&child_frame, children, child_count);
  bool actions=false;
  if (*tag) {
    text(&buffer, "<"); text(&buffer, tag);
    for (size_t i = 0; i < count; i++) {
      const char *name = aug_cstring(attributes[i * 2]); AugValue content = attributes[i * 2 + 1];
      if(content.tag==AUG_OBJECT&&content.as.object->kind==AUG_HTTP_ACTION_KIND) {
        text(&buffer," data-aug-event=\"");text(&buffer,!strcmp(name,"onSubmit")?"submit":"click");text(&buffer,"\" data-aug-action=\"");escape(&buffer,content.as.object->text,content.as.object->text_length);text(&buffer,"\"");actions=true;continue;
      }
      if ((!strcmp(name, "href") || !strcmp(name, "src") || !strcmp(name, "action") || !strcmp(name, "formaction") || !strcmp(name, "poster")) && !safe_url(content)) {free(buffer.text); aug_frame_leave(&child_frame); aug_frame_leave(&frame); return aug_error_named("HttpError");}
      if (content.tag == AUG_BOOL && !content.as.boolean) continue;
      text(&buffer, " "); text(&buffer, !strcmp(name, "className") ? "class" : !strcmp(name, "htmlFor") ? "for" : !strcmp(name, "tabIndex") ? "tabindex" : name);
      if (content.tag != AUG_BOOL) {text(&buffer, "=\""); value(&buffer, content, true); text(&buffer, "\"");}
    }
    text(&buffer, ">");
  }
  for (size_t i = 0; i < child_count; i++) {value(&buffer, children[i], false);actions=actions||has_actions(children[i]);}
  bool is_void = !strcmp(tag, "input") || !strcmp(tag, "img") || !strcmp(tag, "br") || !strcmp(tag, "hr") || !strcmp(tag, "meta") || !strcmp(tag, "link") || !strcmp(tag, "source") || !strcmp(tag, "track") || !strcmp(tag, "wbr") || !strcmp(tag, "area") || !strcmp(tag, "col") || !strcmp(tag, "embed") || !strcmp(tag, "param");
  if (*tag && !is_void) {text(&buffer, "</"); text(&buffer, tag); text(&buffer, ">");}
  AugValue result = aug_bytes(buffer.text ? buffer.text : "", buffer.size, AUG_HTML_KIND); free(buffer.text);
  result.as.object->html_actions=actions;
  aug_frame_leave(&child_frame); aug_frame_leave(&frame); return result;
}
