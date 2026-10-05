#include "aug_runtime.h"
#include "aug_grapheme_data.h"
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <limits.h>
#include <errno.h>
#include <locale.h>

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
bool aug_valid_utf8(const void *data, size_t size) {
  if (!data && size) return false;
  const unsigned char *text = data;
  for (size_t i = 0; i < size;) {
    unsigned char first = text[i++];
    if (first < 0x80) continue;
    int extra = first >= 0xc2 && first <= 0xdf ? 1 : first >= 0xe0 && first <= 0xef ? 2 : first >= 0xf0 && first <= 0xf4 ? 3 : -1;
    if (extra < 0 || (size_t)extra > size - i) return false;
    uint32_t code = first & (extra == 1 ? 0x1f : extra == 2 ? 0x0f : 0x07);
    for (int j = 0; j < extra; j++) {
      unsigned char next = text[i++];
      if ((next & 0xc0) != 0x80) return false;
      code = (code << 6) | (next & 0x3f);
    }
    if (code < (extra == 1 ? 0x80u : extra == 2 ? 0x800u : 0x10000u) || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return false;
  }
  return true;
}
AugValue aug_bytes_text(AugValue value) {
  const void *text = value.as.object->text;
  size_t size = value.as.object->text_length;
  if (!aug_valid_utf8(text, size)) return aug_error_named("ConversionError");
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

int64_t aug_string_utf16_length(AugValue value) {
  const unsigned char *p=(const unsigned char *)value.as.object->text;size_t size=value.as.object->text_length;int64_t count=0;
  for(size_t i=0;i<size;i++)if((p[i]&0xc0)!=0x80)count+=p[i]>=0xf0?2:1;
  return count;
}
bool aug_string_is_decimal(AugValue value) {
  if(!value.as.object->text_length)return false;
  for(size_t i=0;i<value.as.object->text_length;i++)if(value.as.object->text[i]<'0'||value.as.object->text[i]>'9')return false;
  return true;
}
int64_t aug_string_compare(AugValue value, AugValue other) {
  size_t left=value.as.object->text_length,right=other.as.object->text_length;
  int order=memcmp(value.as.object->text,other.as.object->text,left<right?left:right);
  return order<0?-1:order>0?1:left<right?-1:left>right?1:0;
}
int64_t aug_string_compare_decimal(AugValue value,AugValue other) {
  if(!aug_string_is_decimal(value)||!aug_string_is_decimal(other)){aug_error_named("ConversionError");return 0;}
  const char *a=value.as.object->text,*b=other.as.object->text;size_t an=value.as.object->text_length,bn=other.as.object->text_length;
  while(an>1&&*a=='0'){a++;an--;}while(bn>1&&*b=='0'){b++;bn--;}
  if(an!=bn)return an<bn?-1:1;int order=memcmp(a,b,an);return order<0?-1:order>0?1:0;
}
AugValue aug_bytes_slice(AugValue value,int64_t start,int64_t end) {
  size_t size=value.as.object->text_length;
  if(start<0||end<start||(uint64_t)end>size)return aug_error_named("IndexError");
  return aug_bytes(value.as.object->text+(size_t)start,(size_t)(end-start),AUG_BYTES_KIND);
}
AugValue aug_bytes_hex(AugValue value) {
  size_t n=value.as.object->text_length;if(n>(SIZE_MAX-1)/2)abort();
  char *out=malloc(n*2+1);if(!out)abort();const char *digits="0123456789abcdef";
  for(size_t i=0;i<n;i++){unsigned char b=(unsigned char)value.as.object->text[i];out[i*2]=digits[b>>4];out[i*2+1]=digits[b&15];}
  AugValue result=aug_string_n(out,n*2);free(out);return result;
}
bool aug_float_is_finite(AugValue value){return isfinite(aug_cfloat(value));}
AugValue aug_float_float32(AugValue value){double x=aug_cfloat(value);float rounded=(float)x;if(!isfinite(x)||!isfinite(rounded))return aug_error_named("ConversionError");return aug_float((double)rounded);}

static uint32_t text_codepoint(const unsigned char *p,size_t *width) {
  unsigned char first=p[0];*width=first<0x80?1:first<0xe0?2:first<0xf0?3:4;
  uint32_t code=first&(*width==1?0x7f:*width==2?0x1f:*width==3?0x0f:0x07);
  for(size_t i=1;i<*width;i++)code=(code<<6)|(p[i]&63);return code;
}
static bool trim_space(uint32_t code) {return (code>=9&&code<=13)||code==32||code==0xa0||code==0x1680||(code>=0x2000&&code<=0x200a)||code==0x2028||code==0x2029||code==0x202f||code==0x205f||code==0x3000||code==0xfeff;}
AugValue aug_string_trim(AugValue value) {
  const unsigned char *p=(const unsigned char *)value.as.object->text;size_t begin=0,end=value.as.object->text_length,width;
  while(begin<end&&trim_space(text_codepoint(p+begin,&width)))begin+=width;
  while(end>begin){size_t last=end-1;while(last>begin&&(p[last]&0xc0)==0x80)last--;if(!trim_space(text_codepoint(p+last,&width)))break;end=last;}
  return aug_string_n((const char *)p+begin,end-begin);
}


bool aug_string_ends_with(AugValue value, AugValue suffix) {
  size_t size = value.as.object->text_length, count = suffix.as.object->text_length;
  return count <= size && !memcmp(value.as.object->text + size - count, suffix.as.object->text, count);
}
AugValue aug_string_replace(AugValue value, AugValue search, AugValue replacement) {
  size_t size = value.as.object->text_length, step = search.as.object->text_length, add = replacement.as.object->text_length;
  if (!step) return aug_error_named("ConversionError");
  size_t matches = 0;
  for (size_t i = 0; i <= size && step <= size - i;) {
    if (!memcmp(value.as.object->text + i, search.as.object->text, step)) {matches++; i += step;} else i++;
  }
  size_t length = size - matches * step;
  if (matches && add > (SIZE_MAX - length - 1) / matches) abort();
  length += matches * add;
  char *output = malloc(length + 1); if (!output) abort();
  size_t position = 0, i = 0;
  while (i < size) {
    if (step <= size - i && !memcmp(value.as.object->text + i, search.as.object->text, step)) {
      memcpy(output + position, replacement.as.object->text, add); position += add; i += step;
    } else output[position++] = value.as.object->text[i++];
  }
  AugValue result = aug_string_n(output, length); free(output); return result;
}
AugValue aug_list_join(AugValue list, AugValue separator) {
  size_t count = list.as.object->field_count, step = separator.as.object->text_length, length = 0;
  if (count > 1) {if (step > (SIZE_MAX - 1) / (count - 1)) abort(); length = step * (count - 1);}
  for (size_t i = 0; i < count; i++) {
    size_t size = list.as.object->fields[i].as.object->text_length;
    if (size > SIZE_MAX - length - 1) abort(); length += size;
  }
  char *output = malloc(length + 1); if (!output) abort(); size_t position = 0;
  for (size_t i = 0; i < count; i++) {
    if (i) {memcpy(output + position, separator.as.object->text, step); position += step;}
    AugObject *item = list.as.object->fields[i].as.object;
    memcpy(output + position, item->text, item->text_length); position += item->text_length;
  }
  AugValue result = aug_string_n(output, length); free(output); return result;
}
int64_t aug_string_code_point_length(AugValue value) {
  const unsigned char *p = (const unsigned char *)value.as.object->text; size_t size = value.as.object->text_length;
  if (!aug_valid_utf8(p, size)) {aug_error_named("ConversionError"); return 0;}
  int64_t count = 0;
  for (size_t i = 0; i < size; i++) if ((p[i] & 0xc0) != 0x80) count++;
  return count;
}
int64_t aug_string_parse_integer(AugValue value) {
  const char *text = value.as.object->text; size_t size = value.as.object->text_length, begin = size && text[0] == '-' ? 1 : 0;
  if (begin == size) {aug_error_named("ConversionError"); return 0;}
  uint64_t number = 0, limit = begin ? UINT64_C(9223372036854775808) : INT64_MAX;
  for (size_t i = begin; i < size; i++) {
    if (text[i] < '0' || text[i] > '9') {aug_error_named("ConversionError"); return 0;}
    unsigned digit = (unsigned)(text[i] - '0');
    if (number > (limit - digit) / 10) {aug_error_named("ConversionError"); return 0;}
    number = number * 10 + digit;
  }
  return (begin ? number == UINT64_C(9223372036854775808) ? INT64_MIN : -(int64_t)number : (int64_t)number);
}
AugValue aug_string_parse_float(AugValue value) {
  const char *text = value.as.object->text; size_t size = value.as.object->text_length, i = size && text[0] == '-' ? 1 : 0, digits = i;
  while (i < size && text[i] >= '0' && text[i] <= '9') i++;
  if (i == digits) return aug_error_named("ConversionError");
  if (i < size && text[i] == '.') {digits = ++i; while (i < size && text[i] >= '0' && text[i] <= '9') i++; if (i == digits) return aug_error_named("ConversionError");}
  if (i < size && (text[i] == 'e' || text[i] == 'E')) {
    i++; if (i < size && (text[i] == '+' || text[i] == '-')) i++;
    digits = i; while (i < size && text[i] >= '0' && text[i] <= '9') i++; if (i == digits) return aug_error_named("ConversionError");
  }
  if (i != size) return aug_error_named("ConversionError");
  locale_t invariant = newlocale(LC_NUMERIC_MASK, "C", (locale_t)0); if (!invariant) abort();
  locale_t previous = uselocale(invariant); errno = 0; char *end;
  double parsed = strtod(text, &end); int failed = errno == ERANGE || end != text + size || !isfinite(parsed);
  uselocale(previous); freelocale(invariant);
  return failed ? aug_error_named("ConversionError") : aug_float(parsed);
}

/* Default extended grapheme boundaries: Unicode 18.0.0, UAX #29 revision 49.
   The state follows GB9c, GB11 and GB12/13 without rescanning earlier text. */
typedef struct {
  unsigned previous;
  bool regional_odd, pictograph_extend, zwj_after_pictograph, indic_linker;
} AugGraphemeState;
static unsigned grapheme_property(uint32_t point) {
  if (point < 128) return point == 13 ? AUG_GCB_CR : point == 10 ? AUG_GCB_LF : point < 32 || point == 127 ? AUG_GCB_CONTROL : AUG_GCB_OTHER;
  size_t begin = 0, end = sizeof(aug_grapheme_ranges) / sizeof(aug_grapheme_ranges[0]);
  while (begin < end) {
    size_t middle = begin + (end - begin) / 2;
    const AugGraphemeRange *range = &aug_grapheme_ranges[middle];
    if (point < range->first) end = middle;
    else if (point > range->last) begin = middle + 1;
    else return range->properties;
  }
  return 0;
}
static bool grapheme_step(AugGraphemeState *state, unsigned property) {
  unsigned previous = state->previous & AUG_GCB_MASK, next = property & AUG_GCB_MASK;
  unsigned conjunct = property >> AUG_INCB_SHIFT;
  bool boundary = true;
  if (previous == AUG_GCB_CR && next == AUG_GCB_LF) boundary = false; /* GB3 */
  else if (previous == AUG_GCB_CR || previous == AUG_GCB_LF || previous == AUG_GCB_CONTROL ||
           next == AUG_GCB_CR || next == AUG_GCB_LF || next == AUG_GCB_CONTROL) boundary = true; /* GB4/5 */
  else if (previous == AUG_GCB_L && (next == AUG_GCB_L || next == AUG_GCB_V || next == AUG_GCB_LV || next == AUG_GCB_LVT)) boundary = false; /* GB6 */
  else if ((previous == AUG_GCB_LV || previous == AUG_GCB_V) && (next == AUG_GCB_V || next == AUG_GCB_T)) boundary = false; /* GB7 */
  else if ((previous == AUG_GCB_LVT || previous == AUG_GCB_T) && next == AUG_GCB_T) boundary = false; /* GB8 */
  else if (next == AUG_GCB_EXTEND || next == AUG_GCB_ZWJ || next == AUG_GCB_SPACINGMARK || previous == AUG_GCB_PREPEND) boundary = false; /* GB9/9a/9b */
  else if (conjunct == AUG_INCB_CONSONANT && state->indic_linker) boundary = false; /* GB9c: no leading consonant is required in revision 49 */
  else if ((property & AUG_EXTENDED_PICTOGRAPHIC) && previous == AUG_GCB_ZWJ && state->zwj_after_pictograph) boundary = false; /* GB11 */
  else if (previous == AUG_GCB_REGIONAL_INDICATOR && next == AUG_GCB_REGIONAL_INDICATOR && state->regional_odd) boundary = false; /* GB12/13 */
  state->zwj_after_pictograph = next == AUG_GCB_ZWJ && state->pictograph_extend;
  state->pictograph_extend = (property & AUG_EXTENDED_PICTOGRAPHIC) || (next == AUG_GCB_EXTEND && state->pictograph_extend);
  state->indic_linker = conjunct == AUG_INCB_LINKER || (conjunct == AUG_INCB_EXTEND && state->indic_linker);
  state->regional_odd = next == AUG_GCB_REGIONAL_INDICATOR ? previous == AUG_GCB_REGIONAL_INDICATOR ? !state->regional_odd : true : false;
  state->previous = property;
  return boundary;
}
static int64_t string_graphemes(AugValue value, AugValue *parts) {
  const unsigned char *text = (const unsigned char *)value.as.object->text;
  size_t size = value.as.object->text_length;
  if (!aug_valid_utf8(text, size)) { aug_error_named("ConversionError"); return 0; }
  AugValue roots[2] = {value, aug_null()}; AugFrame frame; aug_frame_enter(&frame, roots, 2);
  if (parts) roots[1] = aug_list_new(NULL, 0);
  AugGraphemeState state = {0}; int64_t count = 0; size_t start = 0, width;
  for (size_t position = 0; position < size; position += width) {
    bool boundary = grapheme_step(&state, grapheme_property(text_codepoint(text + position, &width)));
    if (!position || boundary) {
      count++;
      if (position && parts) aug_list_append(roots[1], aug_string_n(text + start, position - start));
      start = position;
    }
  }
  if (parts) {
    if (size) aug_list_append(roots[1], aug_string_n(text + start, size - start));
    *parts = roots[1];
  }
  aug_frame_leave(&frame); return count;
}
int64_t aug_string_grapheme_length(AugValue value) { return string_graphemes(value, NULL); }
AugValue aug_string_graphemes(AugValue value) { AugValue parts = aug_null(); string_graphemes(value, &parts); return parts; }
