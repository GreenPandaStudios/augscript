// Independent August workload fixtures. Expected outcomes are authored here;
// they are not derived from generated source, specs, C or LLVM output.
export function reliabilityWorkloads(rounds){
  return [{
    id:'worker-data-and-errors',rounds,drops:rounds*4,expected:String(rounds*45)+'\n'+String(rounds)+'\n',
    files:{
      'operations.aug':`interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
double(int value):
    return value * 2
sum(List<int> values):
    own Resource resource = Resource()
    own Map<int, string> entries = {}
    own Set<int> seen = {}
    int index = 0
    int key = 0
    while index < 1800:
        entries.set(key=key, value="retained")
        seen.add(value=key)
        garbage = ["heap", "pressure"]
        index = index + 1
        key = key + 1
        if key == 97:
            key = 0
    int result = 0
    for value in values:
        result = result + value
    return result
nested(List<int> values):
    scope:
        child = start sum(values)
        return wait for child
fail() returns int unless FileError:
    own Resource resource = Resource()
    throw FileError()
`,
      'main.aug':`import sum and nested and fail from operations
int iteration = 0
int total = 0
int failures = 0
while iteration < ${rounds}:
    try:
        scope:
            first = start worker sum(values=[1, 2, 3])
            second = start worker nested(values=[10, 20])
            third = start worker sum(values=[4, 5])
            wait for first and second and third as left and right and last
            total = total + left + right + last
    catch ConcurrencyError error:
        print(value="Unexpected worker admission failure")
    try:
        scope:
            child = start worker fail()
            wait for child
    catch FileError error:
        failures = failures + 1
    catch ConcurrencyError error:
        print(value="Unexpected worker admission failure")
    iteration = iteration + 1
print(value=total)
print(value=failures)
`
    },
    mutant:{file:'operations.aug',before:'return result\n',after:'return result + 1\n'}
  },{
    id:'cooperative-owned-failure',rounds,drops:rounds*2,expected:String(rounds)+'\n',
    files:{
      'operations.aug':`interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
fail() unless FileError:
    throw FileError()
consume(own Resource value):
    own List<string> retained = ["keep"]
    int index = 0
    while index < 2000:
        retained.append(value="retained")
        index = index + 1
outer() unless FileError:
    own Resource dependency = Resource()
    scope:
        first = start fail()
        own Resource input = Resource()
        second = start consume(value=input)
`,
      'main.aug':`import outer from operations
int iteration = 0
int caught = 0
while iteration < ${rounds}:
    try:
        outer()
    catch FileError error:
        caught = caught + 1
    iteration = iteration + 1
print(value=caught)
`
    }
  }];
}
