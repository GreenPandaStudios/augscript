// aug-spec: "routes.aug.md" explains this file. Read it before changes; refresh with aug spec.
record Reply(int id, string message)
endpoint GET "/bench" as reply() returns Reply:
    return Reply(id=7, message="hello")
