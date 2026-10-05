import {lex} from './lexer.ts';
/** Small starting points for ordinary August declarations and statements. */
export const snippetCatalog = [
  {prefix:'choice',description:'A closed choice of existing immutable records',body:'choice ${1:Outcome} from ${2:Accepted} and ${3:Rejected}'},
  {prefix:'forward',description:'Inherit an imported operation’s checked interface',body:'forward ${1:dispatch} to ${2:importedOperation}'},
  {prefix:'record',description:'Immutable data with named fields',body:'record ${1:User}(${2:string name})'},
  {prefix:'interface',description:'A public behavior contract',body:'interface ${1:Greeter}:\n    ${2:greet}(${3:string name}) returns ${4:string}'},
  {prefix:'capability',description:'An explicit I/O contract',body:'capability ${1:Logger}:\n    ${2:log}(${3:string message}) uses ${1:Logger}.${2:log}'},
  {prefix:'implementation',description:'A class implementing an interface',body:'${1:SimpleGreeter}(${2:resolve Logger logger}) implements ${3:Greeter}:\n    ${4:greet}(${5:string name}):\n        $0'},
  {prefix:'method',description:'A function or method with an inferred result',body:'${1:calculate}(${2:int value}):\n    $0'},
  {prefix:'generic',description:'A generic identity function',body:'${1:identity}<T>(T value):\n    return value'},
  {prefix:'initialize',description:'Initialize constructor fields or validate a record',body:'initialize:\n    $0'},
  {prefix:'import',description:'Import a public declaration',body:'import ${1:Name} from ${2:module}'},
  {prefix:'importurl',description:'Import directly from a public Git repository',body:'import ${1:Name} from "https://github.com/${2:owner}/${3:library}"'},
  {prefix:'export',description:'Expose one declaration from a sibling file',body:'export ${1:Name} from ${2:file}'},
  {prefix:'internal',description:'Keep a declaration available only to sibling files',body:'internal ${1:Name} from ${2:file}'},
  {prefix:'exportfolder',description:'Expose a child module with its own export.aug',body:'export folder ${1:module}'},
  {prefix:'implement',description:'Select a dependency provider in main.aug',body:'implement ${1:Contract} with ${2:Provider}'},
  {prefix:'resolve',description:'Resolve a dependency explicitly',body:'resolve ${1:Contract} to ${2:service}'},
  {prefix:'if',description:'Conditional code',body:'if ${1:condition}:\n    $0'},
  {prefix:'ifelse',description:'Two alternatives',body:'if ${1:condition}:\n    $2\nelse:\n    $0'},
  {prefix:'bindrecord',description:'Read selected immutable record fields into new names',body:'{${1:name}: ${2:displayName}} = ${3:person}'},
  {prefix:'bindtuple',description:'Unpack tuple positions into new names',body:'(${1:first}, (${2:second}, ${3:third})) = ${4:values}'},
  {prefix:'callback',description:'A pure expression for a typed single-method interface',body:'(${1:int value}) => ${2:value}'},
  {prefix:'select',description:'Select values into a new snapshot list',body:'${1:selected} = [${2:item} for ${2:item} in ${3:items} if ${4:true}]'},
  {prefix:'for',description:'Visit collection values',body:'for ${1:item} in ${2:items}:\n    $0'},
  {prefix:'while',description:'Repeat while a condition holds',body:'while ${1:condition}:\n    $0'},
  {prefix:'matchvalue',description:'Choose a value with exhaustive cases',body:'${1:result} = match ${2:condition}:\n    when true:\n        ${3:1}\n    when false:\n        ${4:0}'},
  {prefix:'matchoptional',description:'Handle a value or null',body:'match ${1:value}:\n    when some ${2:item}:\n        $3\n    when null:\n        $0'},
  {prefix:'try',description:'Recover from a checked failure',body:'try:\n    $1\ncatch ${2:FileError} ${3:error}:\n    $0'},
  {prefix:'borrow',description:'Grant bounded mutable access',body:'borrow ${1:value}:\n    $0'},
  {prefix:'scope',description:'Start and join a child computation',body:'scope:\n    ${1:pending} = start ${2:load}(${3:})\n    wait for ${1:pending} as ${4:result}\n    $0'},
  {prefix:'waitall',description:'Join two computations',body:'wait for ${1:loadingUsers} and ${2:loadingOrders} as ${3:users} and ${4:orders}'},
  {prefix:'lock',description:'Access shared mutable state inside a bounded lock',body:'lock ${1:shared} as ${2:value}:\n    $0'},
  {prefix:'unsafe',description:'Contain a native C call',body:'unsafe:\n    $0'},
  {prefix:'resource',description:'An opaque native package resource with checked cleanup',body:'extern C resource ${1:Handle}'},
  {prefix:'serve',description:'Start a native HTTP listener',body:'serve ${1:endpoint} on port ${2:8787}'},
  ...['GET','POST','PATCH','DELETE'].map(method => ({prefix:'endpoint'+method.toLowerCase(),description:`A typed ${method} endpoint`,body:`endpoint ${method} "\${1:/items}" as \${2:handler}(\${3:}):\n    $0`})),
  {prefix:'stream',description:'An endpoint yielding server-sent events',body:'endpoint GET "${1:/events}" as ${2:events}() streams ServerEvent<string>:\n    yield ServerEvent(data=${3:"hello"})'},
  {prefix:'component',description:'An embeddable server-rendered HTML component',body:'${1:Heading}(string text) returns Html:\n    return <h1>{text}</h1>'},
  {prefix:'test',description:'A same-file function test',body:'test ${1:calculate}:\n    when ${2:inputs}:\n        it ${3:works}:\n            assert(condition=${4:true})'},
  {prefix:'testclass',description:'Fresh setup for each class test',body:'test ${1:Worker} ${2:worker}:\n    when ${3:ready}:\n        ${2:worker} = ${1:Worker}(${4:})\n        it ${5:works}:\n            assert(condition=${6:true})'},
  {prefix:'testendpoint',description:'Exercise the real endpoint pipeline',body:'test endpoint ${1:handler} client:\n    when requests:\n        it succeeds:\n            response = client.request(method="GET", path="${2:/items}")\n            assert(condition=response.status == 200)'},
  {prefix:'it',description:'A named test case',body:'it ${1:works}:\n    assert(condition=${2:true})'},
  {prefix:'fixture',description:'A reusable same-file test fixture',body:'fixture ${1:sample}():\n    return ${2:42}'},
  {prefix:'interceptor',description:'Wrap a call and preserve its result',body:'interceptor ${1:Audit}<T>():\n    around():\n        result = next()\n        $0\n        return result'},
  {prefix:'javadoc',description:'Document intent and labeled inputs',body:'/**\n * ${1:Explain why this declaration exists.}\n * @param ${2:name} ${3:What the input means.}\n */'},
];

function lexicalTemplate(body: string): string {
  return body.replace(/\$\{\d+(?::([^}]*))?\}|\$\d+/g, (token, value) => (value ?? '').padEnd(token.length));
}

/** Adapt the catalog's indented templates; parameter labels, strings and comments retain their spelling. */
export function snippetBody(body: string, style: 'braces' | 'indent', tabs = false, assignment: 'equals' | 'to' = 'equals'): string {
  if (assignment === 'to') {
    // Expand tab stops only for lexical inspection, preserving original offsets.
    const lexical = lexicalTemplate(body);
    const edits = lex('snippet.aug', lexical).tokens.filter(token => {
      if (token.kind !== '=') return false;
      const start = lexical.lastIndexOf('\n', token.span.start - 1) + 1;
      return /^\s*(?:[A-Za-z_]\w*|\([^\n]*\)|\{[^\n]*\})\s*$/.test(lexical.slice(start, token.span.start));
    });
    for (const token of edits.reverse()) body = body.slice(0, token.span.start) + 'to' + body.slice(token.span.end);
  }
  if (style === 'braces') {
    const lexical = lexicalTemplate(body);
    const colons = new Set(lex('snippet.aug',lexical).tokens.filter(token => token.kind === ':').map(token => token.span.start));
    const result: string[] = []; let depth = 0, offset = 0;
    for (const line of body.split('\n')) {
      const level = Math.floor((/^ */.exec(line)?.[0].length ?? 0) / 4);
      while (depth > level) result.push('    '.repeat(--depth) + '}');
      if (line.endsWith(':') && colons.has(offset + line.length - 1)) { result.push(line.slice(0,-1) + ' {'); depth = level + 1; }
      else result.push(line);
      offset += line.length + 1;
    }
    while (depth) result.push('    '.repeat(--depth) + '}');
    body = result.join('\n');
  }
  return tabs ? body.replace(/^(?: {4})+/gm, prefix => '\t'.repeat(prefix.length / 4)) : body;
}
