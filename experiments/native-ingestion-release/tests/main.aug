// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import exercise from operations
import blocked and failAfterAdmission from cancellation
import checkResources from resources
import exerciseTransactions and exerciseDeadline from recovery
try:
    configuration = arguments().get(index=0)
    scope:
        work = start worker exercise(configuration)
        print(value=wait for work)
    try:
        scope:
            sleeping = start worker blocked(configuration)
            failing = start worker failAfterAdmission(configuration)
            wait for failing and sleeping
    catch FileError error:
        print(value="PostgreSQL worker cancellation passed")
    scope:
        recovery = start worker exerciseTransactions(configuration)
        print(value=wait for recovery)
    scope:
        deadline = start worker exerciseDeadline(configuration)
        print(value=wait for deadline)
    scope:
        jobs = [start worker exercise(configuration), start worker exercise(configuration), start worker exercise(configuration), start worker exercise(configuration), start worker exercise(configuration), start worker exercise(configuration), start worker exercise(configuration), start worker exercise(configuration)]
        wait for jobs as outputs
        if outputs.length() != 8:
            throw FileError()
    checkResources()
    print(value="PostgreSQL load and cleanup passed")
catch Error error:
    print(value="PostgreSQL qualification failed")
    exit(status=1)
