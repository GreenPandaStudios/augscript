### Native performance, compared with C

A separate [million-greeting program](examples/greetings-benchmark/main.md) writes **1,000,000 greetings: 20 MB of UTF-8 text**. The output below is abbreviated:

```text
Hello, August! 👋
Hello, August! 👋
… 1,000,000 lines in total
```

The equivalent C program performs the same work and flushes each line, as August does:

::: details Show the C program

```c
#include <stdint.h>
#include <stdio.h>

int main(void) {
    for (int64_t greetings = 0; greetings < 1000000; ++greetings) {
        fputs("Hello, August! 👋\n", stdout);
        fflush(stdout);
    }
    return 0;
}
```

:::

::: benchmark-chart greetings
:::

August 1.0.0 on Apple M5 takes **1023.47 ms** and C takes **977.46 ms** (median of 30 runs after 3 warmups). Both programs use release optimization, write to a file, and flush each line. Every run must produce the same 20 MB output. The times include process startup and file I/O.

The [performance reports](performance.md) compare more programs: integer loops, collections, JSON, and HTTP. Results vary by workload; use the sources to build a comparison for your own application.

[Read the source and spec](examples/greetings-benchmark/main.md) · [Inspect every sample and the environment](greeting-results.json)
