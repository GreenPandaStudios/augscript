#include <stdint.h>
#include <stdio.h>

int main(void) {
    for (int64_t greetings = 0; greetings < 1000000; ++greetings) {
        fputs("Hello, August! 👋\n", stdout);
        fflush(stdout);
    }
    return 0;
}
