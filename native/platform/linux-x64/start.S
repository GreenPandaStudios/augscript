# Independently authored System V/glibc process entry. No compiler startup
# objects or development SDK are redistributed. The dynamic loader supplies
# its finalizer in rdx; libc establishes the process before calling main.
.text
.globl _start
.type _start,@function
_start:
  xorl %ebp, %ebp
  movq %rdx, %r9
  popq %rsi
  movq %rsp, %rdx
  andq $-16, %rsp
  pushq %rax
  pushq %rsp
  xorl %r8d, %r8d
  xorl %ecx, %ecx
  leaq main(%rip), %rdi
  call __libc_start_main@PLT
  hlt
.size _start, .-_start
.section .note.GNU-stack,"",@progbits
