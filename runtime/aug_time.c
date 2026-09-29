#include "aug_runtime.h"
#include <time.h>
AugValue _aug_time_now(void) {
  time_t now = time(NULL); return now < 0 ? aug_error_named("TimeError") : aug_int((int64_t)now);
}
