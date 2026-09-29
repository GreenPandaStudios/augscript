#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "yyjson.h"

// A specialized integer table is a useful C baseline, not August's generic value representation.
typedef struct { int64_t key, value; unsigned char occupied; } Entry;
static size_t slot(Entry *table, size_t mask, int64_t key) {
  uint64_t hash = (uint64_t)key;
  hash ^= hash >> 30; hash *= UINT64_C(0xbf58476d1ce4e5b9);
  hash ^= hash >> 27; hash *= UINT64_C(0x94d049bb133111eb); hash ^= hash >> 31;
  size_t index = (size_t)hash & mask;
  while (table[index].occupied && table[index].key != key) index = (index + 1) & mask;
  return index;
}
int main(int argc, char **argv) {
  if (argc != 3) return 2;
  int64_t count = strtoll(argv[2], NULL, 10);
  if (!strcmp(argv[1], "startup")) puts("7");
  else if (!strcmp(argv[1], "cpu")) {
    int64_t state = 123;
    for (int64_t i = 0; i < count; i++) {
      int64_t product = state * 48271;
      state = product - (product / 2147483647) * 2147483647;
    }
    printf("%lld\n", (long long)state);
  } else if (!strcmp(argv[1], "collections")) {
    size_t capacity = 8; while (capacity < (size_t)count * 2) capacity *= 2;
    Entry *values = calloc(capacity, sizeof(Entry)), *unique = calloc(capacity, sizeof(Entry));
    if (!values || !unique) return 3;
    for (int64_t i = 0; i < count; i++) {
      values[slot(values, capacity - 1, i)] = (Entry){i, i * 3, 1};
      unique[slot(unique, capacity - 1, i)] = (Entry){i, 0, 1};
    }
    int64_t checksum = 0;
    for (size_t i = 0; i < capacity; i++) if (values[i].occupied && unique[slot(unique, capacity - 1, values[i].key)].occupied) checksum += values[i].value;
    printf("%lld\ntrue\n", (long long)checksum);
    free(values); free(unique);
  } else if (!strcmp(argv[1], "json")) {
    const char *input = "{\"id\":7,\"message\":\"hello\",\"values\":[1,2,3]}";
    int64_t checksum = 0;
    for (int64_t i = 0; i < count; i++) {
      yyjson_doc *doc = yyjson_read(input, strlen(input), 0); if (!doc) return 4;
      yyjson_val *root = yyjson_doc_get_root(doc);
      yyjson_val *id = yyjson_obj_get(root, "id");
      if (!yyjson_is_int(id) || !yyjson_is_str(yyjson_obj_get(root, "message")) || !yyjson_is_arr(yyjson_obj_get(root, "values"))) return 5;
      size_t length = 0; char *encoded = yyjson_write(doc, 0, &length); if (!encoded) return 6;
      checksum += yyjson_get_sint(id) + (int64_t)length;
      free(encoded); yyjson_doc_free(doc);
    }
    printf("%lld\n", (long long)checksum);
  } else return 2;
  return 0;
}
