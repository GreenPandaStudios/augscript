#include "aug_runtime.h"
#include <stdlib.h>
#include <string.h>

int64_t aug_string_length(AugValue value) { return (int64_t)value.as.object->text_length; }
AugValue aug_string_bytes(AugValue value) { return aug_bytes(value.as.object->text, value.as.object->text_length, AUG_BYTES_KIND); }
bool aug_string_starts_with(AugValue value, AugValue prefix) {
  return prefix.as.object->text_length <= value.as.object->text_length &&
    !memcmp(value.as.object->text, prefix.as.object->text, prefix.as.object->text_length);
}
AugValue aug_string_split(AugValue value, AugValue separator) {
  AugValue roots[2] = {value, aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
  roots[1] = aug_list_new(NULL, 0);
  size_t size = value.as.object->text_length, step = separator.as.object->text_length, begin = 0;
  if (!step) { aug_list_append(roots[1], value); }
  else {
    for (size_t i = 0; i + step <= size;) {
      if (!memcmp(value.as.object->text + i, separator.as.object->text, step)) {
        AugValue part = aug_string_n(value.as.object->text + begin, i - begin);
        aug_list_append(roots[1], part); i += step; begin = i;
      } else i++;
    }
    aug_list_append(roots[1], aug_string_n(value.as.object->text + begin, size - begin));
  }
  AugValue result = roots[1]; aug_frame_leave(&frame); return result;
}
int64_t aug_bytes_length(AugValue value) { return (int64_t)value.as.object->text_length; }
AugValue aug_bytes_text(AugValue value) {
  const unsigned char *text = (const unsigned char *)value.as.object->text;
  size_t size = value.as.object->text_length;
  for (size_t i = 0; i < size;) {
    unsigned char first = text[i++];
    if (first < 0x80) continue;
    int extra = first >= 0xc2 && first <= 0xdf ? 1 : first >= 0xe0 && first <= 0xef ? 2 : first >= 0xf0 && first <= 0xf4 ? 3 : -1;
    if (extra < 0 || i + (size_t)extra > size) return aug_error_named("ConversionError");
    uint32_t code = first & (extra == 1 ? 0x1f : extra == 2 ? 0x0f : 0x07);
    for (int j = 0; j < extra; j++) {
      unsigned char next = text[i++];
      if ((next & 0xc0) != 0x80) return aug_error_named("ConversionError");
      code = (code << 6) | (next & 0x3f);
    }
    if (code < (extra == 1 ? 0x80u : extra == 2 ? 0x800u : 0x10000u) || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return aug_error_named("ConversionError");
  }
  return aug_string_n(text, size);
}

static const char alphabet[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
AugValue aug_bytes_base64url(AugValue value) {
  const unsigned char *bytes = (const unsigned char *)value.as.object->text;
  size_t size = value.as.object->text_length, length = (size * 8 + 5) / 6;
  char *text = malloc(length + 1); if (!text) abort();
  uint32_t bits = 0; int count = 0; size_t next = 0;
  for (size_t i = 0; i < size; i++) {
    bits = (bits << 8) | bytes[i]; count += 8;
    while (count >= 6) { count -= 6; text[next++] = alphabet[(bits >> count) & 63]; }
  }
  if (count) text[next++] = alphabet[(bits << (6 - count)) & 63];
  AugValue result = aug_string_n(text, next); free(text); return result;
}
AugValue aug_base64url_decode(AugValue value) {
  size_t length = value.as.object->text_length;
  if (length % 4 == 1) return aug_error_named("CryptoError");
  unsigned char *output = malloc(length * 3 / 4 + 1); if (!output) abort();
  uint32_t bits = 0; int count = 0; size_t next = 0;
  for (size_t i = 0; i < length; i++) {
    unsigned char c = (unsigned char)value.as.object->text[i];
    const char *found = c ? strchr(alphabet, c) : NULL;
    if (!found) { free(output); return aug_error_named("CryptoError"); }
    bits = (bits << 6) | (uint32_t)(found - alphabet); count += 6;
    if (count >= 8) { count -= 8; output[next++] = (unsigned char)(bits >> count); }
  }
  if (count && (bits & ((1u << count) - 1))) { free(output); return aug_error_named("CryptoError"); }
  AugValue result = aug_bytes(output, next, AUG_BYTES_KIND); free(output); return result;
}
bool aug_string_is_token(AugValue value, int64_t minimum, int64_t maximum) {
  size_t size = value.as.object->text_length; if (minimum < 0 || maximum < minimum || size < (uint64_t)minimum || size > (uint64_t)maximum) return false;
  for (size_t i = 0; i < size; i++) {unsigned char c = (unsigned char)value.as.object->text[i];
    if (!((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '-' || c == '_' || c == '.' || c == '~')) return false;
  } return true;
}
