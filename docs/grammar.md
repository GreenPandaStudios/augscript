# Grammar and line boundaries

Grammar for the current August preview; additions marked unreleased are not in 0.23.0. `Name` is an identifier; bracketed groups are optional. The blocks below describe syntax and are not executable programs.

## Blocks and declarations

```text
Block       := "{" Statements "}"
             | ":" NEWLINE INDENT Statements DEDENT

Function    := [Tags] ["fixture"] Name [Generics] "(" Parameters ")"
               ["returns" ["own"] Type] ["changes" Paths]
               ["uses" Paths] ["unless" Types] (Block | End)

Class       := [Tags] Name [Generics] ["(" Fields ")"]
               ["unless" Types] "implements" Type {"," Type} ClassBlock
ClassBlock  := BlockOfFieldsAndMethodsWithOptionalInitialize
Initialize  := "initialize" Block

Error       := "error" Name [Generics] "(" ReadOnlyFields ")" End  // unreleased

Record      := "record" Name [Generics] "(" Fields ")"
               ["unless" Types] [BlockOfInitialize]

Interface   := ("interface" | "capability") Name [Generics]
               ["extends" Type {"," Type}] Block

Interceptor := "interceptor" Name [Generics] ["(" ResolveFields ")"] Block
Composition := "composition" Name BlockOfBindings
Endpoint    := [Tags] "endpoint" HttpMethod String "as" Name "(" Parameters ")"
               ["returns" Type | "streams" Type] ["uses" Paths]
               ["unless" Type ["with status" Integer] {"and" Type ["with status" Integer]}]
               ["with status" Integer] Block
```

An interface/class/interceptor block contains method declarations. A record ends after its header or validation block and has no behavior body. An executable body infers an absent returns clause; no returned value means void. A bodyless signature defaults to void. Omitted changes, uses, and unless clauses are inferred from executable bodies; explicit clauses remain checked bounds. A callable needs a body unless declared `extern C`. There is no class or function prefix.

The implements clause identifies a class. Its initialize block appears inside the class before methods, and runs after field initialization. Records can contain one initialize block for validation. Nested function declarations are not supported. A root `counter()` statement is a call, not a declaration.

```text
Generics    := "<" Generic {"," Generic} ">"
Generic     := ["in" | "out"] Name ["implements" Type {"and" Type}]
Type        := ["optional"] Name ["<" Types ">"]
Parameter   := ["resolve"] ["mutable"] ["own" | "borrow"] Type Label ["to" Storage]
               ["from" WireSource [String]]
Types       := Type {("and" | ",") Type}
Paths       := Path {("and" | ",") Path}
Tags        := {"[" Name ["<" Types ">"] ["(" Mappings ")"] "]"}
Mapping     := AroundLabel ("=" | "to") TargetLabel
PolicyOption := Name ("=" | "to") (TargetLabel | Literal | ListOfStringLiterals)
```

Variance is accepted only on interfaces; mutable storage applies to class headers. Resolve cannot be combined with own/borrow. General parameters still use Type name order. Public labels and private storage are explicit in headers.

## Imports, bindings, and calls

```text
Import      := "import" (Name {"and" Name} | "everything") "from" (DottedPath | RepositoryUrl {"." Name}) End
Export      := "export" Name "from" SiblingName End
             | "export" "folder" ChildName End
Binding     := "implement" Key ["<" Types ">"] "with" Type
               ["shared" | "fresh" | "scoped"] ["mutable"] End
Include     := "include" Name End
CallInput   := Label ("=" | "to") Expression | Name
Assignment  := [["own" | "borrow"] Type] Target ("=" | "to") Expression End
Resolve     := "resolve" Key ["<" Types ">"] "to" Name End
```

A quoted public repository URL declares a source dependency. A URL can select a tag or commit with `#REVISION`. See [packages](packages.md) for aliases and commit locks.

The formatter uses implement/with and resolve/to, and preserves wildcard imports. Assignment style remains a project preference. Repeated paths/errors can use and or comma; canonical error clauses use and. Collection constructor elements are positional because their order carries meaning. Assert also accepts its single bool positionally.

## Control flow and tests

```text
Statement   := Assignment | Expression End | "pass" End
             | "return" [Expression] End | "throw" Expression End
             | "if" Expression Block ["else" (Block | If)]
             | ("break" | "continue") End
             | "while" Expression Block
             | "for" BindingPattern "in" Expression Block
             | BindingPattern ("=" | "to") Expression End
             | "match" Expression BlockOfCases
             | "try" Block {"catch" Type Name Block}
               ["always" Block]
             | "borrow" Name Block | "unsafe" Block | "scope" Block
             | "lock" Expression "as" Name Block
             | "freeze" Expression "as" Name End
             | "yield" Expression End
             | "serve" Name {"and" Name} "on port" Expression End

BindingPattern := Name | "(" [BindingPattern {"," BindingPattern} [","]] ")"
               | "{" [FieldPattern {"," FieldPattern} [","]] "}"
FieldPattern   := Name [":" BindingPattern]
TestPattern    := Name | "(" Name {"," Name} [","] ")"
MatchCase   := "when" ("null" | "some" Name | ScalarLiteral | Type Name) Block
             | "else" Block

Test        := "test" LocalFunction BlockOfGroups
             | "test" LocalClassType SubjectName BlockOfGroups
             | "test endpoint" LocalEndpoint ClientName BlockOfGroups
Group       := "when" TestName BlockOfSetupAndCases
Case        := "it" TestName ["for" TestPattern "in" ListOfTupleRows] Block
TestName    := Identifier | String
```

Setup bindings precede setup statements, which precede cases. Empty bodies use pass. Includes are composition/setup operations; declarations and setup ordering are checked beyond parsing.

Unreleased record and nested tuple binding patterns apply to assignment and ordinary loops. A lone parenthesized name groups that name; a trailing comma creates a one-cell tuple pattern. Named fields select immutable record data; tuple arity, private access and new binding names are checked. Parameterized test rows retain TestPattern.

Unreleased expression matches reuse the case patterns above. An expression case block contains exactly one expression, not statements. Signed numeric, text and bool literals are scalar patterns. Result types must be compatible; null makes the result optional. Owned and native-resource results require statement matches.

Optional values have two cases: null and some. Omitted inputs become null. Type? and missing are obsolete spellings; use optional Type and null. Old matches with separate missing and null branches require one merged null branch.

## Expressions and ambiguity

| Spelling | Meaning |
| --- | --- |
| `[a, b]` | List literal. |
| `(a, b)`, `(a,)`, `()` | Tuple literals. |
| `(a)` | Grouping. |
| `{a, b}` | Set literal. |
| `{key: value}` | Map literal. |
| `{}` | Empty Set or Map determined by context. |
| `[Validator] header...` | Interceptor annotation on a declaration. |
| `receiver[index]` | Unreleased: checked List/Tuple read or optional Map lookup. |
| `match value { when true { a } when false { b } }` | Unreleased: exhaustive value-producing match; each case has one result expression. |
| `value otherwise fallback` | Unreleased: lazy null fallback. |
| `receiver.member(label=value)` | Labeled method call. |
| `receiver.member(value)` | Same-name label shorthand when value is a name. |
| `start load(input=value)` | A cooperative scope-owned task. |
| `start worker calculate(values)` | A scope-owned worker with copied data on an isolated heap. |
| `wait for first and second` | Ordered task results. |
| `wait for tasks` | Ordered collection of results. |
| `handle save(input from form)` | A checked deferred HTTP form action. |
| `<Panel title={name}>...</Panel>` | Checked server component producing Html. |

Operators from high to low precedence: member/call, unary minus, multiplication/division/remainder (remainder is unreleased), addition/subtraction, ordered comparisons, equality, not, and, or, otherwise (unreleased). Thus `not count == 0` means `not (count == 0)`. Boolean operations short-circuit from left to right. Only the word spellings are accepted; `&&`, `||`, and unary `!` are syntax errors. `!=` remains accepted. Binary operators associate left. No assignment expression or implicit truthiness is supported. Exponentiation and implicit casts are absent.

Function contract clauses may appear in any order, once each; the formatter writes returns, changes, uses, then unless. Storage aliases apply to class/record/interceptor fields rather than ordinary function parameters.

## Newlines, indentation, and comments

- A newline outside delimiters ends a complete statement. EOF and a closing block brace also end it; semicolons may separate same-line statements.
- An unfinished operator continues onto the next line. Parentheses, lists, tuples, sets, and maps continue until their matching delimiter.
- A leading operator or call parenthesis on a new line begins a new statement.
- A colon for a block is followed by a newline and increased indentation. A colon inside a Map literal separates key/value and creates no indentation block.
- Tabs and spaces are both valid. Mixed characters in one prefix, inconsistent sibling levels, extra unrequested indentation, or a dedent that matches no ancestor are errors.
- Blank lines and comment-only lines do not alter indentation. // line comments and /* block comments */ are supported.
- Return expressions begin on the return line; use parentheses to continue one.

The parser owns these rules. The formatter reparses and compares program structure before offering an edit, preserving comments while choosing the project's block and assignment styles.

`start worker name(...)` uses the existing task operations with copied data and an isolated heap. `worker` is contextual here; a function named `worker` can still be called normally. See [workers](workers.md) for checked boundary types and native package requirements.

Pure literal defaults are unreleased: an ordinary managed parameter can end with `= LiteralData` or `to LiteralData`. `LiteralData` is a scalar, negative numeric literal, or nested collection literal. The field storage alias, when present, comes before the default. Omission selects the default; explicit null does not.

Interpolated text is unreleased: `$"Text {Expression}"` permits scalar expressions between braces. Doubling an opening or closing brace inserts it literally; quoted strings inside an expression retain their ordinary syntax. An unterminated expression or unescaped closing brace is a diagnostic.

The unreleased `immutable` qualifier follows `optional`, when present, and precedes a collection type: `optional immutable List<int>`. It promises deep freezing; the underlying collection representation and element identities remain the same.

The unreleased record-copy postfix form is `Expression with (Name=Expression, ...)`. Replacements also accept `to` or same-name shorthand. It applies only to a narrowed, concrete record value.
