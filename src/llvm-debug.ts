import {basename,dirname} from 'node:path';
import type {Span} from './ast.ts';
import type {AugustIR,IrFunction,IrType,IrVariable} from './ir.ts';

const quote=(value:string)=>'"'+[...Buffer.from(value)].map(byte=>byte>=32&&byte<127&&byte!==34&&byte!==92?String.fromCharCode(byte):'\\'+byte.toString(16).padStart(2,'0').toUpperCase()).join('')+'"';
const typeName=(type:IrType):string=>(type.optional||type.nullable?'optional ':'')+type.name+(type.args.length?'<'+type.args.map(typeName).join(', ')+'>':'');

/** DWARF describes August source and the real boxed storage. Rich collection
 * views and an August-aware debugger are separate from source-line information. */
export class DebugMetadata {
  private readonly nodes:string[]=[];
  private readonly files=new Map<string,string>();
  private readonly functions=new Map<string,string>();
  private readonly retained=new Map<string,{node:string;variables:string[]}>();
  private readonly locations=new Map<string,string>();
  private readonly scopes=new Map<string,string>();
  private readonly variables=new Map<IrVariable,string>();
  private readonly types=new Map<string,string>();
  private readonly unit:string;
  private readonly subroutine:string;
  private readonly boxed:string;
  private readonly optimized:boolean;
  constructor(ir:AugustIR,optimized:boolean){
    this.optimized=optimized;
    const source=ir.functions.find(fn=>fn.name===ir.main)!;
    // 0x8000 is a vendor language code; August source is not labeled as C.
    this.unit=this.node(`distinct !DICompileUnit(language: 32768, file: ${this.file(source.span.file)}, producer: "August LLVM", isOptimized: ${optimized}, runtimeVersion: 0, emissionKind: FullDebug)`);
    this.subroutine=this.node(`!DISubroutineType(types: ${this.node('!{}')})`);
    const tag=this.node('!DIBasicType(name: "tag", size: 32, encoding: DW_ATE_unsigned)');
    const integer=this.node('!DIBasicType(name: "int64", size: 64, encoding: DW_ATE_signed)');
    const floating=this.node('!DIBasicType(name: "float64", size: 64, encoding: DW_ATE_float)');
    const pointer=this.node('!DIDerivedType(tag: DW_TAG_pointer_type, baseType: null, size: 64)');
    const payload=this.node(`!DICompositeType(tag: DW_TAG_union_type, name: "August payload", size: 64, align: 64, elements: ${this.node('!{'+[
      this.node(`!DIDerivedType(tag: DW_TAG_member, name: "integer", baseType: ${integer}, size: 64)`),
      this.node(`!DIDerivedType(tag: DW_TAG_member, name: "floating", baseType: ${floating}, size: 64)`),
      this.node(`!DIDerivedType(tag: DW_TAG_member, name: "object", baseType: ${pointer}, size: 64)`)
    ].join(', ')+'}')})`);
    this.boxed=this.node(`!DICompositeType(tag: DW_TAG_structure_type, name: "August value", size: 128, align: 64, elements: ${this.node('!{'+[
      this.node(`!DIDerivedType(tag: DW_TAG_member, name: "tag", baseType: ${tag}, size: 32, offset: 0)`),
      this.node(`!DIDerivedType(tag: DW_TAG_member, name: "payload", baseType: ${payload}, size: 64, offset: 64)`)
    ].join(', ')+'}')})`);
  }
  private node(value:string){const name='!'+this.nodes.length;this.nodes.push(name+' = '+value);return name;}
  private file(path:string){let file=this.files.get(path);if(!file){file=this.node(`!DIFile(filename: ${quote(basename(path))}, directory: ${quote(dirname(path))})`);this.files.set(path,file);}return file;}
  function(fn:IrFunction){let scope=this.functions.get(fn.name);if(!scope){
    const retained=this.node('!{}');this.retained.set(fn.name,{node:retained,variables:[]});
    scope=this.node(`distinct !DISubprogram(name: ${quote(fn.sourceName)}, linkageName: ${quote(fn.name)}, scope: ${this.file(fn.span.file)}, file: ${this.file(fn.span.file)}, line: ${fn.span.line}, type: ${this.subroutine}, scopeLine: ${fn.span.line}, spFlags: DISPFlagDefinition${fn.name==='main'?'':' | DISPFlagLocalToUnit'}${this.optimized?' | DISPFlagOptimized':''}, unit: ${this.unit}, retainedNodes: ${retained})`);this.functions.set(fn.name,scope);
  }return scope;}
  private scope(fn:IrFunction,name?:string):string {
    if(name===undefined)return this.function(fn);
    const key=fn.name+':'+name;let result=this.scopes.get(key);
    if(!result){const source=fn.scopes.find(scope=>scope.name===name)!;
      result=this.node(`distinct !DILexicalBlock(scope: ${this.scope(fn,source.parent)}, file: ${this.file(source.span.file)}, line: ${source.span.line}, column: ${source.span.column})`);this.scopes.set(key,result);
    }return result;
  }
  location(fn:IrFunction,span:Span,scopeName?:string){
    const key=[fn.name,span.file,span.line,span.column,scopeName].join(':');let location=this.locations.get(key);
    if(!location){
      const base=this.scope(fn,scopeName);
      const scope=span.file===fn.span.file?base:this.node(`!DILexicalBlockFile(scope: ${base}, file: ${this.file(span.file)}, discriminator: 0)`);
      location=this.node(`!DILocation(line: ${Math.max(1,span.line)}, column: ${Math.max(1,span.column)}, scope: ${scope})`);this.locations.set(key,location);
    }return location;
  }
  variable(fn:IrFunction,variable:IrVariable){
    const existing=this.variables.get(variable);if(existing)return existing;
    const key=JSON.stringify(variable.type);let type=this.types.get(key);
    if(!type){type=this.node(`!DIDerivedType(tag: DW_TAG_typedef, name: ${quote(typeName(variable.type))}, baseType: ${this.boxed})`);this.types.set(key,type);}
    const result=this.node(`!DILocalVariable(name: ${quote(variable.name)}, ${variable.argument?'arg: '+variable.argument+', ':''}scope: ${this.scope(fn,variable.scope)}, file: ${this.file(variable.span.file)}, line: ${variable.span.line}, type: ${type})`);
    this.retained.get(fn.name)!.variables.push(result);this.variables.set(variable,result);return result;
  }
  generate(){
    for(const entry of this.retained.values())this.nodes[Number(entry.node.slice(1))]=entry.node+' = !{'+entry.variables.join(', ')+'}';
    const dwarf=this.node('!{i32 7, !"Dwarf Version", i32 4}'),debug=this.node('!{i32 2, !"Debug Info Version", i32 3}');return [`!llvm.dbg.cu = !{${this.unit}}`,`!llvm.module.flags = !{${dwarf}, ${debug}}`,...this.nodes].join('\n');
  }
}
