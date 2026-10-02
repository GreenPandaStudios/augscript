import {createHash} from 'node:crypto';
import {readFileSync, realpathSync} from 'node:fs';
import {isAbsolute, relative, resolve, sep} from 'node:path';
import {release} from 'node:os';

/** The public native ABI never exposes August runtime layouts. */
export const nativeProfile = 'aug-native-abi-1' as const;
export interface NativeTarget {
  triple: string; os: 'macos'|'linux'|'windows'; arch: 'arm64'|'x64';
  minimumOS?: string; minimumLibc?: string; cpuBaseline: string; libc: string;
  cxxRuntime?: string; cxxABI?: string; features?: string[];
}
export interface NativeArtifact {
  id: string; target: NativeTarget; url: string; sha256: string;
  maximumDownloadBytes: number; maximumUnpackedBytes: number;
  link: {kind:'dynamic'|'static'; libraries:string[]};
  runtime: {files:string[]; relocation:'loader-relative'; closureManifest?:string};
  components: {id:string; version:string; compatibilityKey:string; linkage:'static'|'dynamic'; required:boolean}[];
  fileManifest:string; provenance:string; notices:string;
}
export interface NativeManifest {
  profile:typeof nativeProfile; bindings:string; bindingsSha256:string;
  upstream:{repository:string; version:string; sourceRevision:string};
  artifacts:NativeArtifact[];
  sourceBuild?:{recipe:string; inputs:string; tools:string[]; automatic:false};
}
export type NativeKind = 'void'|'i64'|'i32'|'f64'|'bool'|'utf8'|'bytes'|'f64-list'|'utf8-list'|'resource';
export interface NativeView {kind:NativeKind; resource?:string; ownership?:'read'|'borrow'|'consume'; release?:string; releaseLength?:boolean; minimum?:number; maximum?:number}
export interface NativeFunction {
  module:string; name:string; symbol:string; params:({name:string}&NativeView)[];
  result:NativeView; error?:string; callingConvention:'C'; status:'i32'|'direct';
  uses:string[]; changes:string[]; thread:'caller'; retainsInputs:false;
}
export interface NativeResource {module:string; name:string; release:string}
export interface NativeDescriptor {
  format:1; profile:typeof nativeProfile; resources:NativeResource[]; functions:NativeFunction[];
}

const digest=/^[0-9a-f]{64}$/;
const identifier=/^[A-Za-z_][A-Za-z0-9_]*$/;
const moduleName=/^[A-Za-z][A-Za-z0-9_]*(?:\/[A-Za-z][A-Za-z0-9_]*)*$/;
const fail=(message:string):never=>{throw new Error('NATIVE_ABI: '+message);};
const object=(value:unknown,label:string):Record<string,any>=>{
  if(!value||typeof value!=='object'||Array.isArray(value))fail(label+' must be an object');
  return value as Record<string,any>;
};
const fields=(value:Record<string,any>,allowed:string[],label:string)=>{
  for(const key of Object.keys(value))if(!allowed.includes(key))fail(`${label} contains unsupported field ${key}`);
};
const string=(value:unknown,label:string):string=>{
  if(typeof value!=='string'||!value||value.includes('\0'))fail(label+' must be a nonempty string');
  return value as string;
};
const array=(value:unknown,label:string):any[]=>{
  if(!Array.isArray(value)||value.length>10000)fail(label+' must be an array of at most 10,000 entries');
  return value as any[];
};
const strings=(value:unknown,label:string):string[]=>array(value,label).map(item=>string(item,label));
const positive=(value:unknown,label:string)=>{if(!Number.isSafeInteger(value)||Number(value)<=0)fail(label+' must be a positive safe integer');};
const hash=(value:unknown,label:string)=>{if(typeof value!=='string'||!digest.test(value))fail(label+' must be a lowercase SHA-256 digest');};
const symbol=(value:unknown,label:string)=>{if(typeof value!=='string'||!identifier.test(value))fail(label+' must be a C identifier');};
const https=(value:unknown,label:string)=>{
  let url:URL;try{url=new URL(string(value,label));}catch{fail(label+' must be an HTTPS URL');}
  if(url!.protocol!=='https:'||url!.username||url!.password||url!.hash)fail(label+' must be an HTTPS URL without credentials or a fragment');
};

/** Artifact paths are portable and cannot name a file outside their archive. */
export function nativePath(value:unknown):string {
  const path=string(value,'relative artifact path');
  if(isAbsolute(path)||path.includes('\\')||path.split('/').some(part=>!part||part==='.'||part==='..'||part.startsWith('.'))||/[:\r\n]/.test(path))
    fail('Expected a relative artifact path without traversal: '+path);
  return path;
}

/** Source installation validates metadata; it does not run a native build recipe. */
export function validateNativeManifest(value:unknown):NativeManifest {
  const native=object(value,'native metadata');
  fields(native,['profile','bindings','bindingsSha256','upstream','artifacts','sourceBuild'],'native metadata');
  if(native.profile!==nativeProfile)fail('Unsupported native profile '+native.profile);
  nativePath(native.bindings);if(native.bindings!=='native.abi.json')fail('Bindings must be declared in native.abi.json at the package root');hash(native.bindingsSha256,'bindingsSha256');
  const upstream=object(native.upstream,'upstream');fields(upstream,['repository','version','sourceRevision'],'upstream');
  https(upstream.repository,'upstream.repository');string(upstream.version,'upstream.version');
  if(!/^[0-9a-f]{40,64}$/.test(upstream.sourceRevision??''))fail('upstream.sourceRevision must pin a full source revision or archive digest');
  const artifacts=array(native.artifacts,'artifacts');if(!artifacts.length)fail('At least one prebuilt artifact is required');
  const ids=new Set<string>(), selections=new Set<string>();
  for(const entry of artifacts){
    const artifact=object(entry,'artifact');
    fields(artifact,['id','target','url','sha256','maximumDownloadBytes','maximumUnpackedBytes','link','runtime','components','fileManifest','provenance','notices'],'artifact');
    string(artifact.id,'artifact.id');if(ids.has(artifact.id))fail('Duplicate artifact id '+artifact.id);ids.add(artifact.id);
    const target=object(artifact.target,'artifact.target');
    fields(target,['triple','os','arch','minimumOS','minimumLibc','cpuBaseline','libc','cxxRuntime','cxxABI','features'],'artifact.target');
    const expected=nativeTarget(string(target.triple,'target.triple'));
    if(expected.os!==target.os||expected.arch!==target.arch||expected.libc!==target.libc)fail('Target triple does not match its OS, architecture, or libc');
    string(target.cpuBaseline,'target.cpuBaseline');
    if(target.os==='macos'&&(!/^\d+\.\d+(?:\.\d+)?$/.test(target.minimumOS??'')))fail('macOS artifacts declare minimumOS');
    if(target.os==='linux'&&target.libc==='glibc'&&!/^\d+\.\d+(?:\.\d+)?$/.test(target.minimumLibc??''))fail('GNU/Linux artifacts declare minimumLibc');
    if(target.minimumLibc!==undefined&&(target.os!=='linux'||target.libc!=='glibc'))fail('minimumLibc belongs to GNU/Linux artifacts');
    for(const key of ['cxxRuntime','cxxABI'])if(target[key]!==undefined)string(target[key],key);
    if(target.features!==undefined)strings(target.features,'target.features');
    const selection=JSON.stringify([target.triple,target.minimumOS??'',target.minimumLibc??'',target.features??[]]);
    if(selections.has(selection))fail('Ambiguous artifact selection for '+target.triple);selections.add(selection);
    https(artifact.url,'artifact.url');hash(artifact.sha256,'artifact.sha256');
    positive(artifact.maximumDownloadBytes,'maximumDownloadBytes');positive(artifact.maximumUnpackedBytes,'maximumUnpackedBytes');
    const link=object(artifact.link,'link');fields(link,['kind','libraries'],'link');
    if(!['dynamic','static'].includes(link.kind))fail('link.kind must be dynamic or static');
    if(!array(link.libraries,'link.libraries').length)fail('An artifact must supply link libraries');
    link.libraries.forEach(nativePath);
    const runtime=object(artifact.runtime,'runtime');fields(runtime,['files','relocation','closureManifest'],'runtime');
    array(runtime.files,'runtime.files').forEach(nativePath);
    if(runtime.relocation!=='loader-relative')fail('Runtime libraries must use loader-relative relocation');
    if(runtime.closureManifest!==undefined)nativePath(runtime.closureManifest);
    for(const component of array(artifact.components,'components')){
      const c=object(component,'component');fields(c,['id','version','compatibilityKey','linkage','required'],'component');
      for(const key of ['id','version','compatibilityKey'])string(c[key],key);
      if(!['static','dynamic'].includes(c.linkage)||typeof c.required!=='boolean')fail('Invalid component linkage/required');
    }
    for(const key of ['fileManifest','provenance','notices'])nativePath(artifact[key]);
  }
  if(native.sourceBuild!==undefined){
    const build=object(native.sourceBuild,'sourceBuild');fields(build,['recipe','inputs','tools','automatic'],'sourceBuild');
    nativePath(build.recipe);nativePath(build.inputs);strings(build.tools,'sourceBuild.tools');
    if(build.automatic!==false)fail('Native source builds must be explicitly requested; automatic must be false');
  }
  return native as NativeManifest;
}

function view(value:unknown,result:boolean):NativeView {
  const v=object(value,'native view');fields(v,['kind','resource','ownership','release','releaseLength','minimum','maximum',...(result?[]:['name'])],'native view');
  if(!['void','i64','i32','f64','bool','utf8','bytes','f64-list','utf8-list','resource'].includes(v.kind))fail('Unsupported native kind '+v.kind);
  if(v.kind==='void'&&!result)fail('void is only a result');
  if(v.kind==='resource'){
    string(v.resource,'resource identity');
    if(!result&&!['read','borrow','consume'].includes(v.ownership))fail('A resource input requires read, borrow, or consume ownership');
    if(result&&v.ownership!==undefined)fail('Resource results always transfer ownership; do not declare an input loan');
  }else if(v.resource!==undefined||v.ownership!==undefined)fail('Resource ownership is only valid on resources');
  if(result&&['utf8','bytes','f64-list','utf8-list'].includes(v.kind)&&!v.release)fail('Allocated native results require a matching release symbol');
  if(result&&v.kind==='utf8-list')fail('utf8-list outputs are not in this ABI profile');
  if(v.release!==undefined)symbol(v.release,'result.release');
  if((v.release!==undefined||v.releaseLength!==undefined)&&(!result||!['utf8','bytes','f64-list'].includes(v.kind)))fail('Release metadata belongs only to allocated buffer results');
  if(v.releaseLength!==undefined&&typeof v.releaseLength!=='boolean')fail('releaseLength must be boolean');
  if((v.minimum!==undefined||v.maximum!==undefined)&&!['i64','i32'].includes(v.kind))fail('Integer bounds require i64 or i32');
  for(const key of ['minimum','maximum'])if(v[key]!==undefined&&!Number.isSafeInteger(v[key]))fail(key+' must be a safe integer');
  if(v.minimum!==undefined&&v.maximum!==undefined&&v.minimum>v.maximum)fail('Empty native integer range');
  return v as NativeView;
}

export function validateNativeDescriptor(value:unknown):NativeDescriptor {
  const descriptor=object(value,'binding descriptor');fields(descriptor,['format','profile','resources','functions'],'binding descriptor');
  if(descriptor.format!==1||descriptor.profile!==nativeProfile)fail('Unsupported binding descriptor version/profile');
  const ids=new Set<string>();
  for(const entry of array(descriptor.resources,'resources')){
    const r=object(entry,'resource');fields(r,['module','name','release'],'resource');
    if(!moduleName.test(r.module??''))fail('Resource module must be a source-relative module path');symbol(r.name,'resource.name');symbol(r.release,'resource.release');
    const id=r.module+'.'+r.name;if(ids.has(id))fail('Duplicate native resource '+id);ids.add(id);
  }
  const resources=new Set(ids);ids.clear();
  for(const entry of array(descriptor.functions,'functions')){
    const fn=object(entry,'function');fields(fn,['module','name','symbol','params','result','error','callingConvention','status','uses','changes','thread','retainsInputs'],'function');
    if(!moduleName.test(fn.module??''))fail('Function module must be a source-relative module path');symbol(fn.name,'function.name');symbol(fn.symbol,'function.symbol');
    const id=fn.module+'.'+fn.name;if(ids.has(id))fail('Duplicate native function '+id);ids.add(id);
    const names=new Set<string>();
    for(const p of array(fn.params,'function.params')){view(p,false);if(p.kind==='resource'&&!resources.has(p.resource))fail('Unknown resource identity '+p.resource);symbol(p.name,'parameter.name');if(names.has(p.name))fail('Duplicate parameter '+p.name);names.add(p.name);}
    const result=view(fn.result,true);
    if(result.kind==='resource'&&!resources.has(result.resource!))fail('Unknown result resource identity '+result.resource);
    if(fn.callingConvention!=='C'||!['i32','direct'].includes(fn.status)||fn.thread!=='caller'||fn.retainsInputs!==false)fail('Only C calls on the caller thread with call-duration loans are supported');
    if(fn.error!==undefined){string(fn.error,'function.error');const dot=fn.error.lastIndexOf('.');if(!moduleName.test(fn.error.slice(0,dot))||!identifier.test(fn.error.slice(dot+1)))fail('Native checked errors require a module-qualified declaration identity');}
    if(fn.status==='i32'&&!fn.error)fail('Status-returning native calls require a checked error type');
    if(fn.status==='direct'&&(fn.error||result.kind==='resource'||['utf8','bytes','f64-list','utf8-list'].includes(result.kind)))fail('Direct native calls support scalar results only');
    strings(fn.uses,'function.uses');strings(fn.changes,'function.changes');
  }
  return descriptor as NativeDescriptor;
}

export function readNativeDescriptor(directory:string,native:NativeManifest):NativeDescriptor {
  const root=realpathSync(directory),file=realpathSync(resolve(root,native.bindings));
  if(relative(root,file).split(sep).includes('..'))fail('Binding descriptor escapes its package');
  const bytes=readFileSync(file);
  if(createHash('sha256').update(bytes).digest('hex')!==native.bindingsSha256)
    throw new Error('NATIVE_INTEGRITY: binding descriptor differs from bindingsSha256 in '+directory);
  return validateNativeDescriptor(JSON.parse(bytes.toString('utf8')));
}

/** A target is a deployment identity, not an assumption that the host can build it. */
export function nativeTarget(triple?:string,minimumOS?:string):NativeTarget {
  triple??=process.platform==='darwin'?(process.arch==='arm64'?'aarch64':'x86_64')+'-apple-darwin':process.platform==='linux'?(process.arch==='arm64'?'aarch64':'x86_64')+'-unknown-linux-gnu':(process.arch==='arm64'?'aarch64':'x86_64')+'-pc-windows-msvc';
  const match=/^(aarch64|x86_64)-(apple-darwin|unknown-linux-(gnu|musl)|pc-windows-msvc)$/.exec(triple);
  if(!match)throw new Error('NATIVE_TARGET: Unsupported target '+triple);
  const os=match[2]==='apple-darwin'?'macos':match[2].startsWith('unknown-linux')?'linux':'windows';
  const arch=match[1]==='aarch64'?'arm64':'x64';
  return {triple,os,arch,cpuBaseline:arch==='arm64'?'armv8-a':'x86-64',libc:os==='macos'?'libSystem':os==='windows'?'ucrt':match[3]==='musl'?'musl':'glibc',...(os==='macos'?{minimumOS:minimumOS??'14.0'}:{})};
}

export function nativeHostTarget():NativeTarget {
  // Darwin 23/24 are macOS 14/15. Apple's 2025 numbering change maps Darwin 25 to macOS 26.
  const darwin=Number(release().split('.')[0]),macos=darwin>=25?darwin+1:darwin-9;
  const target=nativeTarget(undefined,process.platform==='darwin'?`${macos}.0`:undefined);
  if(process.platform==='linux'){
    const header=(process.report.getReport() as {header?:{glibcVersionRuntime?:string}})?.header;
    if(header?.glibcVersionRuntime)target.minimumLibc=header.glibcVersionRuntime;
    else {target.libc='musl';target.triple=target.triple.replace(/-gnu$/,'-musl');}
  }
  return target;
}
const versionAtLeast=(actual:string,required:string):boolean=>{
  const a=actual.split('.').map(Number),b=required.split('.').map(Number);
  for(let i=0;i<Math.max(a.length,b.length);i++){if((a[i]??0)!==(b[i]??0))return (a[i]??0)>(b[i]??0);}return true;
};

export function selectNativeArtifact(artifacts:NativeArtifact[],target:NativeTarget):NativeArtifact {
  const matching=artifacts.filter(a=>a.target.triple===target.triple&&a.target.libc===target.libc&&
    a.target.cpuBaseline===target.cpuBaseline&&(!a.target.cxxRuntime||
      a.target.os==='macos'&&a.target.cxxRuntime==='system-libc++'&&a.target.cxxABI==='apple-libc++'||
      a.target.os==='linux'&&a.target.cxxRuntime==='bundled-libstdc++'&&a.target.cxxABI==='itanium-cxx11')&&
    (!a.target.minimumLibc||!!target.minimumLibc&&versionAtLeast(target.minimumLibc,a.target.minimumLibc))&&
    (!a.target.minimumOS||!!target.minimumOS&&versionAtLeast(target.minimumOS,a.target.minimumOS)));
  if(matching.length!==1){
    const floors=artifacts.filter(a=>a.target.triple===target.triple).map(a=>a.target.minimumOS??a.target.minimumLibc).filter(Boolean);
    const runtime=target.os==='linux'?'glibc':'macOS',actual=target.os==='linux'?target.minimumLibc:target.minimumOS;
    throw new Error('NATIVE_TARGET: '+(matching.length?'Ambiguous prebuilt artifacts':floors.length?`This package requires ${runtime} ${floors.join(' or ')}+ and its declared C++ ABI; requested ${actual??'unknown'}.`:'No compatible prebuilt artifact for '+target.triple)+` Supported artifacts: ${artifacts.map(a=>a.id+' ('+a.target.triple+')').join(', ')}. No source build was started.`);
  }
  return matching[0];
}
