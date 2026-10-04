# Independently authored AAPCS64/glibc process entry. x0 carries the dynamic
# loader's finalizer. libc establishes the process before calling main.
.text
.globl _start
.type _start,%function
_start:
  mov x29, xzr
  mov x30, xzr
  mov x5, x0
  ldr x1, [sp]
  add x2, sp, #8
  mov x6, sp
  mov x3, xzr
  mov x4, xzr
  adrp x0, main
  add x0, x0, :lo12:main
  bl __libc_start_main
  bl abort
.size _start, .-_start
.section .note.GNU-stack,"",%progbits
