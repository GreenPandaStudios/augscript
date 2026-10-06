## Follow the program’s interactions

```mermaid
flowchart TD
    n0["Greeter"]
    n1["IGreeter"]
    n2["Console"]
    n3["Logger"]
    n0 -->|"implements"| n1
    n0 -->|"depends on"| n2
    n0 -->|"calls log； depends on logger"| n3
    n1 -->|"depends on"| n2
```

This class view is generated from the greeting project. Start at its [project overview](examples/hello/diagrams/index.md), then follow the calls to their [sequence and explanation](examples/hello/app/greeter-diagrams.md). Generated diagrams are unreleased.
