import {compilerVersion} from './package-manager.ts';

/** Each idiom is an ordinary source unit checked by tests/syntax-idioms.test.mjs. */
export function syntaxIdioms(){return {compiler:compilerVersion(),checkedExample:'tests/syntax-idioms.test.mjs',items:[
 {id:'bindings-and-field-comparisons',files:{'main.aug':'pass\n','example.aug':`record Amount(int value)
adjust(Amount amount, int limit) returns int {
    nextValue = amount.value + 1
    if amount.value == limit { return nextValue }
    return amount.value
}
`},notes:'A first assignment creates an inferred local. Use == for comparisons; = and to assign values. Call inputs require labels.'},
 {id:'checked-call-and-catch',files:{'main.aug':'pass\n','example.aug':`Problem() implements Error {}
load(bool fail) returns int unless Problem {
    if fail { throw Problem() }
    return 7
}
read() returns int {
    try { return load(fail=false) }
    catch Problem error { return 0 }
}
`},notes:'Checked errors must be caught or propagated. A forwarding declaration inherits these checked errors.'},
 {id:'independent-typed-rows',files:{'main.aug':'pass\n','example.aug':`increment(int value) returns int { return value + 1 }
test increment {
    when "independent examples" {
        it "increments" for (value, expected) in [(0, 1), (3, 4)] {
            assert(condition=increment(value=value) == expected)
        }
    }
}
`},notes:'Expected values belong to independently authored requirements and examples. Generated specs describe the starting program.'}
]};}
