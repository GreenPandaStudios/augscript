// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Resource from resource
import make from resource
import consume from resource
own Resource first = make()
consume(value=first)
own Resource second = make()
print(value="end of main")
