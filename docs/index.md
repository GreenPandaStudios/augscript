---
layout: home
hero:
  name: August
  text: The world runs on language
  tagline: A programming language for understanding and changing code together—with teammates and coding agents.
  actions:
    - theme: brand
      text: Learn August
      link: /learn/
    - theme: alt
      text: Read a real project
      link: /examples/hello/
---

## Understand the change before you make it

A new teammate opens a module. A coding agent receives a change request. Both need to know what the module does, which dependencies it uses, and what a change could affect.

August puts that information close to the code. Calls name their inputs. Modules expose a deliberate public surface. Interfaces describe behavior and effects. Tests live beside the declarations they check. The compiler can turn each source file into a linked, readable specification.

Here is a complete application. Save these two files in the same folder:

**main.aug**

```aug project=wiki-home file=main.aug
import total from prices

print(value=total(price=7, quantity=3))
```

**prices.aug**

```aug project=wiki-home file=prices.aug
total(int price, int quantity) returns int:
    if quantity > 0:
        return price * quantity
    return 0

test total:
    when quantities:
        it calculates_a_total:
            assert(total(price=7, quantity=3) == 21)
        it treats_zero_as_empty:
            assert(total(price=7, quantity=0) == 0)
```

`aug run .` prints `21`. `aug test .` runs the two cases. `aug spec .` generates an explanation of `total`:

> It takes `price` and `quantity` as integers. It returns `price` times `quantity` if `quantity` is positive, or `0` otherwise.

The explanation is generated from checked code, offline and deterministically. It links to the dependencies the file uses. Comments can supply the intent that code alone cannot express. [See code and its actual compiled specification](examples/hello/app/greeter.md), or follow [a review of an unfamiliar module](guides/change-a-module.md).

## Learn it, then look things up

The [August book](learn/index.md) assumes you already program in another language. It starts with installation and a running application, then introduces values, errors, modules, dependencies, and mutable state. Each chapter gives you a program to run and something to change.

For a specific task, use the [guides](guides/index.md). For a syntax rule or API, use the [language reference](reference.md) and [library reference](api/io.md). The [project gallery](examples/index.md) shows complete applications with code and specifications side by side; you can switch between indentation and braces.

## Native programs, measured openly

August checks source and builds a native executable. The pending 0.21.0 release lowers checked execution IR through LLVM and downloads its compiler/runtime pack; the published 0.20.1 release uses C compilation. The [performance page](performance.md) publishes programs, graphs, raw samples, environment and reproduction commands. Its results describe those workloads on that host. Measure your own application's work before making a performance decision.

## A public preview

August is experimental and has not reached 1.0. Syntax and package compatibility can change. Tasks currently run cooperatively on one OS thread. HTTP and crypto libraries have working examples and documented operational gaps; the login example is a development demonstration.

Read [what August is designed for](about.md), [production readiness](production-readiness.md), and the [roadmap to 1.0](roadmap.md) before choosing it for a deployment. Installation options are maintained on the [packages page](packages.md). Source and issues are on [GitHub](https://github.com/GreenPandaStudios/augscript); the language repository is MIT licensed, and native dependencies have [their own terms](production-readiness.md#dependencies-and-licenses).
