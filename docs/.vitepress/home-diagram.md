## Follow the program’s interactions

```mermaid
flowchart TD
    n0["Greeter · app/greeter.aug"]
    n1["IGreeter · app/greeter.aug"]
    n2["Console · august/io/contracts.aug"]
    n3["Logger · logging/logger.aug"]
    n0 -->|"implements"| n1
    n0 -->|"depends on"| n2
    n0 -->|"calls"| n3
    n0 -->|"depends on logger"| n3
    n1 -->|"depends on"| n2
```

This class view is generated from the greeting project. Start at its [project overview](examples/hello/diagrams/index.md), then follow the calls to their [sequence and explanation](examples/hello/app/greeter-diagrams.md). Generated diagrams are unreleased.
