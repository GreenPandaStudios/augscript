import {createHash} from 'node:crypto';
import type {MethodDecl,TestDecl,Expr} from './ast.ts';
import {checkProject,type CheckedProject,tyName,type Ty} from './checker.ts';
import {parse} from './parser.ts';
import {lex} from './lexer.ts';
import {defaultText} from './parameters.ts';
import type {Definition} from './project.ts';
import {semanticGraph,semanticSourcePath} from './symbols.ts';
import {projectForTest} from './testing.ts';
import {snippetBody} from './snippets.ts';

export interface AuthorInputCases {format:1;rows:Record<string,string>[]}
export interface InputSuggestionOptions {combinations?:boolean;limit?:number;authorCases?:AuthorInputCases;authorDigest?:string}
const scalarDomains:Record<string,string[]>={
  int:['0','-1','1','-9223372036854775808','9223372036854775807'],
  c_int:['0','-1','1','-2147483648','2147483647'].map(value=>'c_int(value='+value+')'),
  bool:['false','true'],float:['0.0','-0.0','-1.0','0.5','1.0'],
  string:['""','"a"','"é"','"👋"','"\\\"\\n"'],
};
const failure=(message:string)=>new Error('TEST_INPUTS: '+message);

/** The first profile proposes finite scalar literals, never expected results or recovery policy. */
export function inputDomains(checked:CheckedProject,definition:Definition) {
  const method=definition.node;
  if(method.kind!=='function'||method.typeParams.length||method.externC||method.endpoint||method.annotations?.length)
    throw failure('This profile supports ordinary managed standalone functions with concrete scalar inputs; native, endpoint, generic and intercepted contracts are unsupported.');
  if(!method.params.length)throw failure('Input suggestions need at least one public scalar input.');
  return method.params.map(param=>{
    const type=checked.resolvedTypes.get(param.type);
    if(param.ownership!=='managed'||param.injected||!type||type.kind!=='builtin'||type.args.length||!scalarDomains[type.name])
      throw failure('Input '+param.name+' is unsupported. Supply an ordinary test for owned, borrowed, resolved or non-scalar values.');
    return {label:param.label??param.name,type:tyName(type),domain:[...(type.nullable||type.optional?['null']:[]),...scalarDomains[type.name]],
      ...(param.defaultValue?{default:defaultText(param.defaultValue)}:{})};
  });
}

/** Parse one literal through August; reject calls, statements and non-scalar source before checking types. */
function scalarLiteral(text:string):boolean {
  if(text.length>4096)return false;
  const parsed=parse('input-literal.aug','__input = '+text+'\n');
  const node=parsed.file.items[0];
  if(parsed.diagnostics.length||parsed.file.items.length!==1||node?.kind!=='assign')return false;
  const scalar=(expr:Expr)=>expr.kind==='literal'||expr.kind==='unary'&&expr.op==='-'&&expr.value.kind==='literal'&&typeof expr.value.value==='number';
  if(scalar(node.value))return true;
  const call=node.value;
  if(call.kind!=='call'||call.callee.kind!=='name'||call.callee.name!=='c_int'||call.args.length!==1||call.argLabels[0]!=='value'||call.typeArgs.length||!scalar(call.args[0]))return false;
  const value=defaultText(call.args[0]);
  return /^-?[0-9]+$/.test(value)&&BigInt(value)>=-2147483648n&&BigInt(value)<=2147483647n;
}

/** Author source literals are explicit inputs; this format has no expected-result field. */
export function parseAuthorInputCases(text:string):AuthorInputCases {
  if(Buffer.byteLength(text)>1024*1024)throw failure('Author cases exceed the 1 MiB limit.');
  let value:unknown;try{value=JSON.parse(text);}catch{throw failure('Author cases must be JSON: {"format":1,"rows":[{"input":"August literal"}]}.');}
  if(!value||typeof value!=='object'||Array.isArray(value))throw failure('Author cases need format 1 and a nonempty rows array.');
  const record=value as Record<string,unknown>;
  if(record.format!==1||Object.keys(record).some(key=>!['format','rows'].includes(key))||!Array.isArray(record.rows)||!record.rows.length||record.rows.length>4096)
    throw failure('Author cases need format 1 and 1–4096 rows; unknown fields are not accepted.');
  for(const row of record.rows)if(!row||typeof row!=='object'||Array.isArray(row)||Object.values(row).some(value=>typeof value!=='string'||!scalarLiteral(value)))
    throw failure('Each author row maps public input labels to scalar August source literals or bounded c_int(value=INTEGER) conversions. Other calls and executable source are unsupported.');
  return value as AuthorInputCases;
}

function inputCase(method:MethodDecl,rows:Record<string,string>[],result:Ty|undefined,assertion:string|undefined,names:ReturnType<typeof inputNames>) {
  const labels=method.params.map(param=>param.label??param.name),bindings=names.bindings;
  const call=method.name+'('+labels.map((label,index)=>label===bindings[index]?label:label+'='+bindings[index]).join(', ')+')';
  return 'it '+names.caseName+' for ('+bindings.join(', ')+') in [\n'+rows.map(row=>'    ('+labels.map(name=>row[name]).join(', ')+(labels.length===1?',':'')+')').join(',\n')+'\n]:\n'+
    (result?.name==='void'?'    '+call+'\n':'    '+names.resultBinding+' = '+call+'\n')+(assertion?'    assert(condition='+assertion+')\n':'');
}

function representativeRows(inputs:ReturnType<typeof inputDomains>):Record<string,string>[] {
  const first=Object.fromEntries(inputs.map(input=>[input.label,input.domain[0]]));
  return [first,...inputs.flatMap(input=>input.domain.slice(1).map(value=>({...first,[input.label]:value})))];
}

export interface InputTemplateScope {locals?:Iterable<string>;cases?:Iterable<string>}
function inputNames(checked:CheckedProject,definition:Definition,inputs:ReturnType<typeof inputDomains>,scope:InputTemplateScope={}) {
  const locals=new Set(scope.locals??[]);
  const occupied=new Set([...checked.project.scopes.get(definition.file)?.keys()??[],...inputs.map(input=>input.label),...locals]);
  const fresh=(base:string)=>{let name=base;while(occupied.has(name))name+='Input';occupied.add(name);return name;};
  const bindings=inputs.map(input=>input.label!==definition.name&&!locals.has(input.label)&&lex('binding.aug',input.label).tokens[0].kind==='identifier'?
    input.label:fresh('input'+input.label[0].toUpperCase()+input.label.slice(1)));
  const cases=new Set(scope.cases??[]);let caseName='boundaries';while(cases.has(caseName))caseName+='Input';
  return {bindings,caseName,resultBinding:fresh('actual'),assertionPlaceholder:fresh('__author_property')};
}

/** An editable case template uses known scalar types and leaves its independent assertion unresolved. */
export function boundaryInputSnippet(checked:CheckedProject,definition:Definition,scope:InputTemplateScope={}) {
  const inputs=inputDomains(checked,definition),rows=representativeRows(inputs);
  if(rows.length>64)throw failure('The editor template supports at most 64 input rows; use the CLI with an explicit limit.');
  const method=definition.node as MethodDecl,names=inputNames(checked,definition,inputs,scope);
  return {rows:rows.length,body:inputCase(method,rows,checked.callableContracts.get(method)?.result,
    '${1:'+names.assertionPlaceholder+'}',names)};
}

/** Complete delivered rows are compiler-checked, bounded inputs; no application or test is executed. */
export function suggestTestInputs(checked:CheckedProject,definition:Definition,options:InputSuggestionOptions={}) {
  if(checked.diagnostics.some(issue=>issue.severity!=='warning'))throw failure('The starting project must pass checking. Run aug check to repair its diagnostics.');
  const inputs=inputDomains(checked,definition),method=definition.node as MethodDecl,limit=options.limit??64;
  if(!Number.isInteger(limit)||limit<1||limit>4096)throw failure('The row limit must be an integer from 1 to 4096.');
  const author=options.authorCases?.rows??[];
  for(const row of author){
    if(Object.keys(row).length!==inputs.length||inputs.some(input=>!Object.hasOwn(row,input.label)))throw failure('Every author row must specify exactly these labels: '+inputs.map(input=>input.label).join(', ')+'.');
    if(Object.values(row).some(value=>!scalarLiteral(value)))throw failure('Author rows accept scalar August source literals only.');
  }
  const generated:Record<string,string>[]=[];
  const total=options.combinations?inputs.reduce((total,input)=>total*BigInt(input.domain.length),1n):1n+inputs.reduce((total,input)=>total+BigInt(input.domain.length-1),0n);
  if(total+BigInt(author.length)>BigInt(limit))throw failure('Selection needs '+(total+BigInt(author.length))+' rows, above --limit '+limit+'. Increase the explicit limit (maximum 4096), reduce inputs, or use ordinary author rows. No rows were omitted.');
  if(options.combinations){
    const visit=(index:number,row:Record<string,string>)=>{if(index===inputs.length){generated.push({...row});return;}const input=inputs[index];for(const value of input.domain)visit(index+1,{...row,[input.label]:value});};
    visit(0,{});
  }else{
    generated.push(...representativeRows(inputs));
  }
  const rows=[...generated.map(inputs=>({inputs,origin:'type-boundary' as const})),...author.map(inputs=>({inputs,origin:'author' as const}))];
  const result=checked.callableContracts.get(method)?.result;
  const names=inputNames(checked,definition,inputs),{resultBinding,assertionPlaceholder}=names;
  const validation=inputCase(method,rows.map(row=>row.inputs),result,undefined,names);
  // Validate the actual labeled calls using the same test checker, without running their bodies.
  const candidate='test '+method.name+' { when suggested {\n'+snippetBody(validation,'braces')+'\n} }';
  const parsed=parse(definition.file,candidate),suite=parsed.file.items[0] as TestDecl;
  if(parsed.diagnostics.length||suite.kind!=='test')throw failure('Could not parse the generated input rows.');
  for(const [rowIndex,row] of (suite.groups[0].cases[0].rows??[]).entries()){
    const unit={id:'suggested:'+rowIndex,file:definition.file,suite,group:suite.groups[0],test:suite.groups[0].cases[0],row,rowIndex};
    const issues=checkProject(projectForTest(checked.project,unit)).diagnostics.filter(issue=>issue.severity!=='warning');
    if(issues.length)throw failure('Row '+(rowIndex+1)+' was rejected by the compiler: '+issues.map(issue=>issue.code+': '+issue.message).join('; '));
  }
  const graph=semanticGraph(checked,true),source={definition:definition.id,file:semanticSourcePath(checked,definition.file),line:method.span.line,revision:graph.revision};
  const generator={id:'scalar-boundaries',version:1},selection=options.combinations?'cartesian':'one-input-at-a-time';
  const scaffold=snippetBody(inputCase(method,rows.map(row=>row.inputs),result,assertionPlaceholder,names),checked.project.config.block_style,checked.project.config.indentation==='tabs',checked.project.config.assignment);
  const report={format:1,compiler:graph.compiler,source,generator,selection,limit,inputs,rows,complete:true,discardedInputs:0,
    behavioralChecks:'not-run',oracle:'author-required',scaffoldScope:'new-empty-test-group',bindings:names.bindings,resultBinding,assertionPlaceholder,scaffold,...(options.authorCases?{authorCases:{sha256:options.authorDigest??createHash('sha256').update(JSON.stringify(options.authorCases)).digest('hex')}}:{})};
  return {...report,replayDigest:createHash('sha256').update(JSON.stringify({generator,selection,inputs,rows})).digest('hex')};
}
