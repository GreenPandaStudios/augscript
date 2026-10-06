---
title: "packages/@greenpandastudios/aug-pytorch/0.2.0/api.aug · CPU tensors with PyTorch"
generated: true
source: "examples/native-pytorch/.aug-spec/packages/@greenpandastudios/aug-pytorch/0.2.0/api.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-pytorch/0.2.0/api.aug`

[CPU tensors with PyTorch](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOWZkZDg0OGY2NTYxNzlhZWY2OTI3YzUwYWUwM2U5Mjc3MTAzYzI1YmJlMGM1MjgyNWY4N2JhNDBjMWU5ZjBlZSIsImZvcm1hdHRlZFNoYTI1NiI6ImU4MWI0Yjg4ODU1ZmRjNzY0OTg1YzM5OTNmNTIwYTM1NTIwMTExMTVmN2NjOWQxZTJiNzUyODY3NTRlNjBiMmUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NSwibGFzdCI6NSwiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1fdGVuc29yIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1fYWRkIl19LHsiaWQiOiJzb3VyY2UtTDciLCJmaXJzdCI6NywibGFzdCI6NywiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1fc3VtIl19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6OCwiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00IiwiI3N5bWJvbC1fdmFsdWVzIl19LHsiaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjEwLCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01IiwiI3N5bWJvbC10ZW5zb3IiXX0seyJpZCI6InNvdXJjZS1MMTQiLCJmaXJzdCI6MTQsImxhc3QiOjE2LCJiYWNrbGlua3MiOlsiYXBpLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTYiLCIjc3ltYm9sLWFkZCJdfSx7ImlkIjoic291cmNlLUwxOCIsImZpcnN0IjoxOCwibGFzdCI6MjAsImJhY2tsaW5rcyI6WyJhcGktZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNyIsIiNzeW1ib2wtc3VtIl19LHsiaWQiOiJzb3VyY2UtTDIyIiwiZmlyc3QiOjIyLCJsYXN0IjoyNCwiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC04IiwiI3N5bWJvbC12YWx1ZXMiXX0seyJpZCI6InNvdXJjZS1MMjYiLCJmaXJzdCI6MjUsImxhc3QiOjI1LCJiYWNrbGlua3MiOlsiYXBpLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTkiLCIjc3ltYm9sLV9saXZlVGVuc29ycyJdfSx7ImlkIjoic291cmNlLUwyNyIsImZpcnN0IjoyNiwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyJhcGktZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTAiLCIjc3ltYm9sLV9saXZlQnVmZmVycyJdfSx7ImlkIjoic291cmNlLUwyOSIsImZpcnN0IjoyNywibGFzdCI6MjgsImJhY2tsaW5rcyI6WyJhcGktZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTEiLCIjc3ltYm9sLV9jb25zdW1lQW5kRmFpbCJdfSx7ImlkIjoic291cmNlLUwzMyIsImZpcnN0IjozMCwibGFzdCI6MzAsImJhY2tsaW5rcyI6WyJhcGktZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTIiLCIjc3ltYm9sLV9UZW5zb3JDb250YWluZXIudG90YWwiXX0seyJpZCI6InNvdXJjZS1MMzQiLCJmaXJzdCI6MzEsImxhc3QiOjMzLCJiYWNrbGlua3MiOlsiYXBpLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEzIiwiI3N5bWJvbC1fVGVuc29ySG9sZGVyIl19LHsiaWQiOiJzb3VyY2UtTDM1IiwiZmlyc3QiOjMyLCJsYXN0IjozMywiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xNCIsIiNzeW1ib2wtX1RlbnNvckhvbGRlci50b3RhbCJdfSx7ImlkIjoic291cmNlLUwzNyIsImZpcnN0IjozNCwibGFzdCI6MzUsImJhY2tsaW5rcyI6WyJhcGktZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTUiLCIjc3ltYm9sLV9yZXBsYWNlIl19LHsiaWQiOiJzb3VyY2UtTDExLUwxMiIsImZpcnN0IjoxMSwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxNS1MMTYiLCJmaXJzdCI6MTUsImxhc3QiOjE2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTktTDIwIiwiZmlyc3QiOjE5LCJsYXN0IjoyMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDIzLUwyNCIsImZpcnN0IjoyMywibGFzdCI6MjQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUwzMCIsImZpcnN0IjoyOCwibGFzdCI6MjgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNSJdfSx7ImlkIjoic291cmNlLUwzMiIsImZpcnN0IjoyOSwibGFzdCI6MzAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLV9UZW5zb3JDb250YWluZXIiXX0seyJpZCI6InNvdXJjZS1MMzYiLCJmaXJzdCI6MzMsImxhc3QiOjMzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTYiXX0seyJpZCI6InNvdXJjZS1MMzgiLCJmaXJzdCI6MzUsImxhc3QiOjM1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTciXX0seyJpZCI6InNvdXJjZS1MNDEiLCJmaXJzdCI6MzYsImxhc3QiOjk1LCJiYWNrbGlua3MiOlsiI3N5bWJvbC10ZXN0LTIwLXRlbnNvciJdfSx7ImlkIjoic291cmNlLUw0MyIsImZpcnN0IjozOCwibGFzdCI6NDQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtOCJdfSx7ImlkIjoic291cmNlLUw0NC1MNDciLCJmaXJzdCI6MzksImxhc3QiOjQyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTkiXX0seyJpZCI6InNvdXJjZS1MNDgtTDQ5IiwiZmlyc3QiOjQzLCJsYXN0Ijo0NCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMCJdfSx7ImlkIjoic291cmNlLUw1MiIsImZpcnN0Ijo0NiwibGFzdCI6NjAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTEiXX0seyJpZCI6InNvdXJjZS1MNTMtTDY0IiwiZmlyc3QiOjQ3LCJsYXN0Ijo1OCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMiJdfSx7ImlkIjoic291cmNlLUw1OC1MNjIiLCJmaXJzdCI6NTIsImxhc3QiOjU2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEzIl19LHsiaWQiOiJzb3VyY2UtTDU2LUw2NiIsImZpcnN0Ijo1MCwibGFzdCI6NjAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTQiXX0seyJpZCI6InNvdXJjZS1MNjUtTDY2IiwiZmlyc3QiOjU5LCJsYXN0Ijo2MCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xNSJdfSx7ImlkIjoic291cmNlLUw2NyIsImZpcnN0Ijo2MSwibGFzdCI6NjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTYiXX0seyJpZCI6InNvdXJjZS1MNjgtTDcwIiwiZmlyc3QiOjYyLCJsYXN0Ijo2NCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xNyJdfSx7ImlkIjoic291cmNlLUw3MS1MNzUiLCJmaXJzdCI6NjUsImxhc3QiOjY5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE4Il19LHsiaWQiOiJzb3VyY2UtTDc2IiwiZmlyc3QiOjcwLCJsYXN0Ijo4MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xOSJdfSx7ImlkIjoic291cmNlLUw3Ny1MODAiLCJmaXJzdCI6NzEsImxhc3QiOjc0LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIwIl19LHsiaWQiOiJzb3VyY2UtTDgxLUw4NiIsImZpcnN0Ijo3NSwibGFzdCI6ODAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjEiXX0seyJpZCI6InNvdXJjZS1MODctTDg5IiwiZmlyc3QiOjgxLCJsYXN0Ijo4MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yMiJdfSx7ImlkIjoic291cmNlLUw5MCIsImZpcnN0Ijo4NCwibGFzdCI6OTUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjMiXX0seyJpZCI6InNvdXJjZS1MOTEtTDk3IiwiZmlyc3QiOjg1LCJsYXN0Ijo5MSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yNCJdfSx7ImlkIjoic291cmNlLUw5NC1MMTAxIiwiZmlyc3QiOjg4LCJsYXN0Ijo5NSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yNSJdfV19
// Generated by aug spec. This is a copy of the installed dependency source.
// aug-spec: "api.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Tensor from bindings
import TensorError from contracts
extern C _tensor(List<float> values) returns own Tensor unless TensorError
extern C _add(Tensor left, Tensor right) returns own Tensor unless TensorError
extern C _sum(Tensor tensor) returns float unless TensorError
extern C _values(Tensor tensor) returns List<float> unless TensorError
/** Copy a list of float64 values into a CPU tensor. */
tensor(List<float> values) returns own Tensor:
    unsafe:
        return _tensor(values)
/** Add tensors without changing either input. */
add(Tensor left, Tensor right) returns own Tensor:
    unsafe:
        return _add(left, right)
/** Sum every element. */
sum(Tensor tensor) returns float:
    unsafe:
        return _sum(tensor)
/** Copy tensor values into an August list. */
values(Tensor tensor) returns List<float>:
    unsafe:
        return _values(tensor)
extern C _liveTensors() returns int
extern C _liveBuffers() returns int
_consumeAndFail(own Tensor value) unless TensorError:
    throw TensorError(code=99, message="expected cleanup test")
interface _TensorContainer:
    total() returns float unless TensorError
_TensorHolder(mutable own Tensor item) implements _TensorContainer:
    total() returns float:
        return sum(tensor=item)
_replace(borrow _TensorHolder holder, own Tensor replacement):
    holder.item = replacement
test tensor:
    when "cpu":
        it "adds_real_tensors":
            own Tensor left = tensor(values=[1.0, 2.0, 3.0])
            own Tensor right = tensor(values=[4.0, 5.0, 6.0])
            own Tensor result = add(left, right)
            assert(sum(tensor=result) == 21.0)
            List<float> output = values(tensor=result)
            assert(output.length() == 3)
    when "ownership":
        it "transfers_into_a_field_and_releases_the_old_tensor":
            int before = 0
            unsafe:
                before = _liveTensors()
            scope:
                own Tensor initial = tensor(values=[1.0])
                own _TensorHolder holder = _TensorHolder(item=initial)
                own Tensor replacement = tensor(values=[7.0])
                borrow holder:
                    _replace(holder, replacement)
                assert(holder.total() == 7.0)
                unsafe:
                    assert(_liveTensors() == before + 1)
            unsafe:
                assert(_liveTensors() == before)
        it "preserves_native_error_methods":
            bool caught = false
            own Tensor left = tensor(values=[1.0, 2.0])
            own Tensor right = tensor(values=[1.0, 2.0, 3.0])
            try:
                add(left, right)
            catch TensorError error:
                caught = error.explain().length() > 0
            assert(caught)
        it "releases_a_transferred_tensor_when_the_callee_fails":
            int before = 0
            unsafe:
                before = _liveTensors()
            bool caught = false
            try:
                own Tensor value = tensor(values=[1.0])
                _consumeAndFail(value)
            catch TensorError error:
                caught = error.code == 99
            assert(caught)
            unsafe:
                assert(_liveTensors() == before)
                assert(_liveBuffers() == 0)
        it "releases_scoped_and_unused_results":
            int before = 0
            unsafe:
                before = _liveTensors()
            scope:
                own Tensor value = tensor(values=[2.0])
                List<float> output = values(tensor=value)
                assert(output.get(index=0) == 2.0)
            tensor(values=[3.0])
            unsafe:
                assert(_liveTensors() == before)
                assert(_liveBuffers() == 0)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOWZkZDg0OGY2NTYxNzlhZWY2OTI3YzUwYWUwM2U5Mjc3MTAzYzI1YmJlMGM1MjgyNWY4N2JhNDBjMWU5ZjBlZSIsImZvcm1hdHRlZFNoYTI1NiI6IjhhYjA1N2NmMjBhN2YyYjhlYmU3YmZiNjUwMTRmNTM3OGNhZGNmZWI2YTYxMGZjNDc0YjdmMzRmMmZlNDVhYmYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NSwibGFzdCI6NSwiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1fdGVuc29yIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1fYWRkIl19LHsiaWQiOiJzb3VyY2UtTDciLCJmaXJzdCI6NywibGFzdCI6NywiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1fc3VtIl19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6OCwiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00IiwiI3N5bWJvbC1fdmFsdWVzIl19LHsiaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjEwLCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01IiwiI3N5bWJvbC10ZW5zb3IiXX0seyJpZCI6InNvdXJjZS1MMTQiLCJmaXJzdCI6MTYsImxhc3QiOjIwLCJiYWNrbGlua3MiOlsiYXBpLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTYiLCIjc3ltYm9sLWFkZCJdfSx7ImlkIjoic291cmNlLUwxOCIsImZpcnN0IjoyMiwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyJhcGktZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNyIsIiNzeW1ib2wtc3VtIl19LHsiaWQiOiJzb3VyY2UtTDIyIiwiZmlyc3QiOjI4LCJsYXN0IjozMiwiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC04IiwiI3N5bWJvbC12YWx1ZXMiXX0seyJpZCI6InNvdXJjZS1MMjYiLCJmaXJzdCI6MzMsImxhc3QiOjMzLCJiYWNrbGlua3MiOlsiYXBpLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTkiLCIjc3ltYm9sLV9saXZlVGVuc29ycyJdfSx7ImlkIjoic291cmNlLUwyNyIsImZpcnN0IjozNCwibGFzdCI6MzQsImJhY2tsaW5rcyI6WyJhcGktZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTAiLCIjc3ltYm9sLV9saXZlQnVmZmVycyJdfSx7ImlkIjoic291cmNlLUwyOSIsImZpcnN0IjozNSwibGFzdCI6MzcsImJhY2tsaW5rcyI6WyJhcGktZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTEiLCIjc3ltYm9sLV9jb25zdW1lQW5kRmFpbCJdfSx7ImlkIjoic291cmNlLUwzMyIsImZpcnN0IjozOSwibGFzdCI6MzksImJhY2tsaW5rcyI6WyJhcGktZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTIiLCIjc3ltYm9sLV9UZW5zb3JDb250YWluZXIudG90YWwiXX0seyJpZCI6InNvdXJjZS1MMzQiLCJmaXJzdCI6NDEsImxhc3QiOjQ1LCJiYWNrbGlua3MiOlsiYXBpLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEzIiwiI3N5bWJvbC1fVGVuc29ySG9sZGVyIl19LHsiaWQiOiJzb3VyY2UtTDM1IiwiZmlyc3QiOjQyLCJsYXN0Ijo0NCwiYmFja2xpbmtzIjpbImFwaS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xNCIsIiNzeW1ib2wtX1RlbnNvckhvbGRlci50b3RhbCJdfSx7ImlkIjoic291cmNlLUwzNyIsImZpcnN0Ijo0NiwibGFzdCI6NDgsImJhY2tsaW5rcyI6WyJhcGktZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTUiLCIjc3ltYm9sLV9yZXBsYWNlIl19LHsiaWQiOiJzb3VyY2UtTDExLUwxMiIsImZpcnN0IjoxMSwibGFzdCI6MTMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxNS1MMTYiLCJmaXJzdCI6MTcsImxhc3QiOjE5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTktTDIwIiwiZmlyc3QiOjIzLCJsYXN0IjoyNSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDIzLUwyNCIsImZpcnN0IjoyOSwibGFzdCI6MzEsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfSx7ImlkIjoic291cmNlLUwzMCIsImZpcnN0IjozNiwibGFzdCI6MzYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNSJdfSx7ImlkIjoic291cmNlLUwzMiIsImZpcnN0IjozOCwibGFzdCI6NDAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLV9UZW5zb3JDb250YWluZXIiXX0seyJpZCI6InNvdXJjZS1MMzYiLCJmaXJzdCI6NDMsImxhc3QiOjQzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTYiXX0seyJpZCI6InNvdXJjZS1MMzgiLCJmaXJzdCI6NDcsImxhc3QiOjQ3LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTciXX0seyJpZCI6InNvdXJjZS1MNDEiLCJmaXJzdCI6NDksImxhc3QiOjEzMCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtdGVzdC0yMC10ZW5zb3IiXX0seyJpZCI6InNvdXJjZS1MNDMiLCJmaXJzdCI6NTEsImxhc3QiOjU4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTgiXX0seyJpZCI6InNvdXJjZS1MNDQtTDQ3IiwiZmlyc3QiOjUyLCJsYXN0Ijo1NSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC05Il19LHsiaWQiOiJzb3VyY2UtTDQ4LUw0OSIsImZpcnN0Ijo1NiwibGFzdCI6NTcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTAiXX0seyJpZCI6InNvdXJjZS1MNTIiLCJmaXJzdCI6NjEsImxhc3QiOjgxLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTExIl19LHsiaWQiOiJzb3VyY2UtTDUzLUw2NCIsImZpcnN0Ijo2MiwibGFzdCI6NzcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTIiXX0seyJpZCI6InNvdXJjZS1MNTgtTDYyIiwiZmlyc3QiOjY4LCJsYXN0Ijo3MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xMyJdfSx7ImlkIjoic291cmNlLUw1Ni1MNjYiLCJmaXJzdCI6NjYsImxhc3QiOjgwLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE0Il19LHsiaWQiOiJzb3VyY2UtTDY1LUw2NiIsImZpcnN0Ijo3OCwibGFzdCI6ODAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTUiXX0seyJpZCI6InNvdXJjZS1MNjciLCJmaXJzdCI6ODIsImxhc3QiOjkzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE2Il19LHsiaWQiOiJzb3VyY2UtTDY4LUw3MCIsImZpcnN0Ijo4MywibGFzdCI6ODUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTciXX0seyJpZCI6InNvdXJjZS1MNzEtTDc1IiwiZmlyc3QiOjg2LCJsYXN0Ijo5MiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xOCJdfSx7ImlkIjoic291cmNlLUw3NiIsImZpcnN0Ijo5NCwibGFzdCI6MTEyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTE5Il19LHsiaWQiOiJzb3VyY2UtTDc3LUw4MCIsImZpcnN0Ijo5NSwibGFzdCI6OTksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjAiXX0seyJpZCI6InNvdXJjZS1MODEtTDg2IiwiZmlyc3QiOjEwMCwibGFzdCI6MTA3LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIxIl19LHsiaWQiOiJzb3VyY2UtTDg3LUw4OSIsImZpcnN0IjoxMDgsImxhc3QiOjExMSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yMiJdfSx7ImlkIjoic291cmNlLUw5MCIsImZpcnN0IjoxMTMsImxhc3QiOjEyOCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yMyJdfSx7ImlkIjoic291cmNlLUw5MS1MOTciLCJmaXJzdCI6MTE0LCJsYXN0IjoxMjIsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMjQiXX0seyJpZCI6InNvdXJjZS1MOTQtTDEwMSIsImZpcnN0IjoxMTgsImxhc3QiOjEyNywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yNSJdfV19
// Generated by aug spec. This is a copy of the installed dependency source.
// aug-spec: "api.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Tensor from bindings
import TensorError from contracts
extern C _tensor(List<float> values) returns own Tensor unless TensorError
extern C _add(Tensor left, Tensor right) returns own Tensor unless TensorError
extern C _sum(Tensor tensor) returns float unless TensorError
extern C _values(Tensor tensor) returns List<float> unless TensorError
/** Copy a list of float64 values into a CPU tensor. */
tensor(List<float> values) returns own Tensor {
    unsafe {
        return _tensor(values)
    }
}
/** Add tensors without changing either input. */
add(Tensor left, Tensor right) returns own Tensor {
    unsafe {
        return _add(left, right)
    }
}
/** Sum every element. */
sum(Tensor tensor) returns float {
    unsafe {
        return _sum(tensor)
    }
}
/** Copy tensor values into an August list. */
values(Tensor tensor) returns List<float> {
    unsafe {
        return _values(tensor)
    }
}
extern C _liveTensors() returns int
extern C _liveBuffers() returns int
_consumeAndFail(own Tensor value) unless TensorError {
    throw TensorError(code=99, message="expected cleanup test")
}
interface _TensorContainer {
    total() returns float unless TensorError
}
_TensorHolder(mutable own Tensor item) implements _TensorContainer {
    total() returns float {
        return sum(tensor=item)
    }
}
_replace(borrow _TensorHolder holder, own Tensor replacement) {
    holder.item = replacement
}
test tensor {
    when "cpu" {
        it "adds_real_tensors" {
            own Tensor left = tensor(values=[1.0, 2.0, 3.0])
            own Tensor right = tensor(values=[4.0, 5.0, 6.0])
            own Tensor result = add(left, right)
            assert(sum(tensor=result) == 21.0)
            List<float> output = values(tensor=result)
            assert(output.length() == 3)
        }
    }
    when "ownership" {
        it "transfers_into_a_field_and_releases_the_old_tensor" {
            int before = 0
            unsafe {
                before = _liveTensors()
            }
            scope {
                own Tensor initial = tensor(values=[1.0])
                own _TensorHolder holder = _TensorHolder(item=initial)
                own Tensor replacement = tensor(values=[7.0])
                borrow holder {
                    _replace(holder, replacement)
                }
                assert(holder.total() == 7.0)
                unsafe {
                    assert(_liveTensors() == before + 1)
                }
            }
            unsafe {
                assert(_liveTensors() == before)
            }
        }
        it "preserves_native_error_methods" {
            bool caught = false
            own Tensor left = tensor(values=[1.0, 2.0])
            own Tensor right = tensor(values=[1.0, 2.0, 3.0])
            try {
                add(left, right)
            }
            catch TensorError error {
                caught = error.explain().length() > 0
            }
            assert(caught)
        }
        it "releases_a_transferred_tensor_when_the_callee_fails" {
            int before = 0
            unsafe {
                before = _liveTensors()
            }
            bool caught = false
            try {
                own Tensor value = tensor(values=[1.0])
                _consumeAndFail(value)
            }
            catch TensorError error {
                caught = error.code == 99
            }
            assert(caught)
            unsafe {
                assert(_liveTensors() == before)
                assert(_liveBuffers() == 0)
            }
        }
        it "releases_scoped_and_unused_results" {
            int before = 0
            unsafe {
                before = _liveTensors()
            }
            scope {
                own Tensor value = tensor(values=[2.0])
                List<float> output = values(tensor=value)
                assert(output.get(index=0) == 2.0)
            }
            tensor(values=[3.0])
            unsafe {
                assert(_liveTensors() == before)
                assert(_liveBuffers() == 0)
            }
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](api-diagrams.md)

### `tensor` · [source](api.md#source-L10) {#symbol-tensor}

::: spec-paragraph specification-paragraph-1
Copy a list of float64 values into a CPU tensor. It takes `values` as `List<float>`. Within an unsafe block, it returns [`_tensor`](api.md#symbol-_tensor) with `values`. Native operations must satisfy their declared C contracts. [source](api.md#source-L11-L12)
:::

::: details Checked interface

```text
tensor(List<float> values) returns own Tensor unless TensorError
```

It takes `values` as `List<float>`. It returns ownership of [`Tensor`](bindings.md#symbol-Tensor). Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

:::

### `add` · [source](api.md#source-L14) {#symbol-add}

::: spec-paragraph specification-paragraph-2
Add tensors without changing either input. It takes `left` and `right` as [`Tensor`](bindings.md#symbol-Tensor). Within an unsafe block, it returns [`_add`](api.md#symbol-_add) with `left` and `right`. Native operations must satisfy their declared C contracts. [source](api.md#source-L15-L16)
:::

::: details Checked interface

```text
add(Tensor left, Tensor right) returns own Tensor unless TensorError
```

It takes `left` and `right` as [`Tensor`](bindings.md#symbol-Tensor). It returns ownership of [`Tensor`](bindings.md#symbol-Tensor). Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

:::

### `sum` · [source](api.md#source-L18) {#symbol-sum}

::: spec-paragraph specification-paragraph-3
Sum every element. It takes `tensor` as [`Tensor`](bindings.md#symbol-Tensor). Within an unsafe block, it returns [`_sum`](api.md#symbol-_sum) with `tensor`. Native operations must satisfy their declared C contracts. [source](api.md#source-L19-L20)
:::

::: details Checked interface

```text
sum(Tensor tensor) returns float unless TensorError
```

It takes `tensor` as [`Tensor`](bindings.md#symbol-Tensor). Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

:::

### `values` · [source](api.md#source-L22) {#symbol-values}

::: spec-paragraph specification-paragraph-4
Copy tensor values into an August list. It takes `tensor` as [`Tensor`](bindings.md#symbol-Tensor). Within an unsafe block, it returns [`_values`](api.md#symbol-_values) with `tensor`. Native operations must satisfy their declared C contracts. [source](api.md#source-L23-L24)
:::

::: details Checked interface

```text
values(Tensor tensor) returns List<float> unless TensorError
```

It takes `tensor` as [`Tensor`](bindings.md#symbol-Tensor). Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

:::

### `_tensor` · [source](api.md#source-L5) {#symbol-_tensor}

It is private to its defining scope. It takes `values` as `List<float>`. It returns ownership of [`Tensor`](bindings.md#symbol-Tensor). Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

Native implementation: `@greenpandastudios/aug-pytorch@0.2.0`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). It calls `aug_torch_tensor_from_f64_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. The caller owns the returned handle. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_add` · [source](api.md#source-L6) {#symbol-_add}

It is private to its defining scope. It takes `left` and `right` as [`Tensor`](bindings.md#symbol-Tensor). It returns ownership of [`Tensor`](bindings.md#symbol-Tensor). Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

Native implementation: `@greenpandastudios/aug-pytorch@0.2.0`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). It calls `aug_torch_tensor_add_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `left` lends read access for this call; `right` lends read access for this call. The caller owns the returned handle. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_sum` · [source](api.md#source-L7) {#symbol-_sum}

It is private to its defining scope. It takes `tensor` as [`Tensor`](bindings.md#symbol-Tensor). It returns `float`. Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

Native implementation: `@greenpandastudios/aug-pytorch@0.2.0`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). It calls `aug_torch_tensor_sum_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `tensor` lends read access for this call. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_values` · [source](api.md#source-L8) {#symbol-_values}

It is private to its defining scope. It takes `tensor` as [`Tensor`](bindings.md#symbol-Tensor). It returns `List<float>`. Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

Native implementation: `@greenpandastudios/aug-pytorch@0.2.0`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). It calls `aug_torch_tensor_values_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `tensor` lends read access for this call. August copies the returned buffer, then calls `aug_torch_values_release_v1` to release it. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_liveTensors` · [source](api.md#source-L26) {#symbol-_liveTensors}

It is private to its defining scope. It returns `int`.

Native implementation: `@greenpandastudios/aug-pytorch@0.2.0`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). It calls `aug_probe_live_tensors_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_liveBuffers` · [source](api.md#source-L27) {#symbol-_liveBuffers}

It is private to its defining scope. It returns `int`.

Native implementation: `@greenpandastudios/aug-pytorch@0.2.0`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). It calls `aug_probe_live_buffers_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_consumeAndFail` · [source](api.md#source-L29) {#symbol-_consumeAndFail}

::: spec-paragraph specification-paragraph-5
It is private to its defining scope. It takes `value` as [`Tensor`](bindings.md#symbol-Tensor) with ownership transferred. It raises a [`TensorError`](contracts.md#symbol-TensorError) with `code` `99` and `message` `"expected cleanup test"`. [source](api.md#source-L30)
:::

::: details Checked interface

```text
_consumeAndFail(own Tensor value) returns void unless TensorError
```

It takes `value` as [`Tensor`](bindings.md#symbol-Tensor) with ownership transferred. Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

:::

### `_TensorContainer` · interface · [source](api.md#source-L32) {#symbol-_TensorContainer}

It is private to this file.

#### `_TensorContainer.total` · [source](api.md#source-L33) {#symbol-_TensorContainer.total}

It returns `float`. Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

### `_TensorHolder` · class · [source](api.md#source-L34) {#symbol-_TensorHolder}

It implements [`_TensorContainer`](api.md#symbol-_TensorContainer). It is private to this file. It takes `item` as [`Tensor`](bindings.md#symbol-Tensor) with ownership transferred, kept mutable.

#### `_TensorHolder.total` · [source](api.md#source-L35) {#symbol-_TensorHolder.total}

::: spec-paragraph specification-paragraph-6
It returns [`sum`](api.md#symbol-sum) with `tensor` from `item`. [source](api.md#source-L36)
:::

::: details Checked interface

```text
total() returns float unless TensorError
```

Failures can raise [`TensorError`](contracts.md#symbol-TensorError).

:::

### `_replace` · [source](api.md#source-L37) {#symbol-_replace}

::: spec-paragraph specification-paragraph-7
It is private to its defining scope. It takes `holder` as [`_TensorHolder`](api.md#symbol-_TensorHolder) with permission to mutate it during the call and `replacement` as [`Tensor`](bindings.md#symbol-Tensor) with ownership transferred. It sets `holder.item` to `replacement`. [source](api.md#source-L38)
:::

::: details Checked interface

```text
_replace(borrow _TensorHolder holder, own Tensor replacement) returns void changes holder
```

It takes `holder` as [`_TensorHolder`](api.md#symbol-_TensorHolder) with permission to mutate it during the call and `replacement` as [`Tensor`](bindings.md#symbol-Tensor) with ownership transferred. It may change `holder`.

:::

### `test tensor` · [source](api.md#source-L41) {#symbol-test-20-tensor}

Tests [`tensor`](api.md#symbol-tensor). Each case gets fresh setup and dependencies.

#### `cpu`

::: spec-paragraph specification-paragraph-8
##### `adds_real_tensors` · [source](api.md#source-L43)
:::

::: spec-paragraph specification-paragraph-9
It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `1.0`, `2.0`, `3.0` and stores the result in owned `left` ([`Tensor`](bindings.md#symbol-Tensor)). It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `4.0`, `5.0`, `6.0` and stores the result in owned `right` ([`Tensor`](bindings.md#symbol-Tensor)). It calls [`add`](api.md#symbol-add) with `left` and `right` and stores the result in owned `result` ([`Tensor`](bindings.md#symbol-Tensor)). The test requires [`sum`](api.md#symbol-sum) with `tensor` from `result` equals `21.0`. [source](api.md#source-L44-L47)
:::

::: spec-paragraph specification-paragraph-10
It sets `output` of type `List<float>` to [`values`](api.md#symbol-values) with `tensor` from `result`. The test requires `output.length` equals `3`. [source](api.md#source-L48-L49)
:::

#### `ownership`

::: spec-paragraph specification-paragraph-11
##### `transfers_into_a_field_and_releases_the_old_tensor` · [source](api.md#source-L52)
:::

::: spec-paragraph specification-paragraph-12
It sets `before` to `0`. Within an unsafe block, it gets `before` from [`_liveTensors`](api.md#symbol-_liveTensors). Native operations must satisfy their declared C contracts. Within a task and ownership scope, it calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `1.0` and stores the result in owned `initial` ([`Tensor`](bindings.md#symbol-Tensor)). [source](api.md#source-L53-L64)
:::

::: spec-paragraph specification-paragraph-13
It creates [`_TensorHolder`](api.md#symbol-_TensorHolder) with `item` from `initial` and stores the result in owned `holder` ([`_TensorHolder`](api.md#symbol-_TensorHolder)). It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `7.0` and stores the result in owned `replacement` ([`Tensor`](bindings.md#symbol-Tensor)). With temporary permission to change `holder`, it calls [`_replace`](api.md#symbol-_replace) with `holder` and `replacement`. The test requires [`holder.total`](api.md#symbol-_TensorHolder.total) equals `7.0`. [source](api.md#source-L58-L62)
:::

::: spec-paragraph specification-paragraph-14
Within an unsafe block, the test requires [`_liveTensors`](api.md#symbol-_liveTensors) equals (`before` plus `1`). Native operations must satisfy their declared C contracts. On leaving this scope, join its child tasks and release its local values. Within an unsafe block, the test requires [`_liveTensors`](api.md#symbol-_liveTensors) equals `before`. [source](api.md#source-L56-L66)
:::

::: spec-paragraph specification-paragraph-15
Native operations must satisfy their declared C contracts. [source](api.md#source-L65-L66)
:::

::: spec-paragraph specification-paragraph-16
##### `preserves_native_error_methods` · [source](api.md#source-L67)
:::

::: spec-paragraph specification-paragraph-17
It sets `caught` to `false`. It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `1.0`, `2.0` and stores the result in owned `left` ([`Tensor`](bindings.md#symbol-Tensor)). It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `1.0`, `2.0`, `3.0` and stores the result in owned `right` ([`Tensor`](bindings.md#symbol-Tensor)). [source](api.md#source-L68-L70)
:::

::: spec-paragraph specification-paragraph-18
It tries to call [`add`](api.md#symbol-add) with `left` and `right`. If this work raises [`TensorError`](contracts.md#symbol-TensorError) as `error`, it sets `caught` to `length` on `error.explain` is positive. The test requires `caught` is true. [source](api.md#source-L71-L75)
:::

::: spec-paragraph specification-paragraph-19
##### `releases_a_transferred_tensor_when_the_callee_fails` · [source](api.md#source-L76)
:::

::: spec-paragraph specification-paragraph-20
It sets `before` to `0`. Within an unsafe block, it gets `before` from [`_liveTensors`](api.md#symbol-_liveTensors). Native operations must satisfy their declared C contracts. It sets `caught` to `false`. [source](api.md#source-L77-L80)
:::

::: spec-paragraph specification-paragraph-21
It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `1.0` and stores the result in owned `value` ([`Tensor`](bindings.md#symbol-Tensor)). It calls [`_consumeAndFail`](api.md#symbol-_consumeAndFail) with `value`. If this work raises [`TensorError`](contracts.md#symbol-TensorError) as `error`, it sets `caught` to `error.code` equals `99`. The test requires `caught` is true. [source](api.md#source-L81-L86)
:::

::: spec-paragraph specification-paragraph-22
Within an unsafe block, the test requires [`_liveTensors`](api.md#symbol-_liveTensors) equals `before`; then the test requires [`_liveBuffers`](api.md#symbol-_liveBuffers) equals `0`. Native operations must satisfy their declared C contracts. [source](api.md#source-L87-L89)
:::

::: spec-paragraph specification-paragraph-23
##### `releases_scoped_and_unused_results` · [source](api.md#source-L90)
:::

::: spec-paragraph specification-paragraph-24
It sets `before` to `0`. Within an unsafe block, it gets `before` from [`_liveTensors`](api.md#symbol-_liveTensors). Native operations must satisfy their declared C contracts. Within a task and ownership scope, it calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `2.0` and stores the result in owned `value` ([`Tensor`](bindings.md#symbol-Tensor)); then it sets `output` of type `List<float>` to [`values`](api.md#symbol-values) with `tensor` from `value`; then the test requires `output.get` with `index` `0` equals `2.0`. [source](api.md#source-L91-L97)
:::

::: spec-paragraph specification-paragraph-25
On leaving this scope, join its child tasks and release its local values. It calls [`tensor`](api.md#symbol-tensor) with `values` from a list containing `3.0`. Within an unsafe block, the test requires [`_liveTensors`](api.md#symbol-_liveTensors) equals `before`; then the test requires [`_liveBuffers`](api.md#symbol-_liveBuffers) equals `0`. Native operations must satisfy their declared C contracts. [source](api.md#source-L94-L101)
:::

### Dependencies

It uses [`Tensor`](bindings.md#symbol-Tensor) from `bindings`. It uses [`TensorError`](contracts.md#symbol-TensorError) from `contracts`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
