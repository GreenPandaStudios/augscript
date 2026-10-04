import {readFileSync} from 'node:fs';
import {compilerVersion, type PackageManifest} from './package-manager.ts';
import {acceptsCompiler} from './package-compatibility.ts';
import {validateNativeManifest, type NativeArtifact} from './native-contracts.ts';

interface NativeSnapshot {
  id:string; repository:string; tag:string; commit:string; manifest:PackageManifest;
  resources:string[]; exports:string[]; notices:string;
  evidence:{manifestSha256:string;descriptorSha256:string;exportsSha256:string;noticesSha256:string};
}
export interface LibraryEntry {
  id:string; title:string; summary:string; tasks:string[];
  source:{kind:'bundled'|'repository';module?:string;request?:string;commit?:string};
  version:string; compilerRequirement?:string; testedCompiler?:string; compilerCompatible:boolean|null; install?:string; example:string;
  requirements:string; ownership:string; license:{summary:string;url:string};
  artifacts:NativeArtifact[]; tests:{summary:string;url:string};
  evidence:{metadata:'bundled-source'|'curated-source-reference'|'tagged-source-snapshot';artifactBytes:'not-checked-by-catalog';sourceDigests?:NativeSnapshot['evidence']};
}
interface Description {
  id:string; title:string; summary:string; tasks:string[]; names:string[];
  ownership:string; requirements:string; license:string; tests:{summary:string;url:string};
}
const wiki = 'https://greenpandastudios.github.io/augscript/';
const repository = 'https://github.com/GreenPandaStudios/augscript';
const nativeDescriptions:Description[] = [
  {id:'sqlite',title:'SQLite',summary:'Embedded SQL databases with bound parameters and scalar queries.',tasks:['sql','database','storage','embedded'],
    names:['Database','SqliteError','openMemory','execute','queryScalar'],
    ownership:'Own Database; borrow it for writes. Scope exit releases the native connection. Query text is copied into August memory.',
    requirements:'No separate database server. File-backed databases require an explicit DatabaseStorage provider.',
    license:'SQLite core: public domain. August adapter: MIT.',
    tests:{summary:'Insert and query a bound value in a real in-memory SQLite database.',url:wiki+'examples/native-sqlite/database'}},
  {id:'postgres',title:'PostgreSQL',summary:'PostgreSQL connections, bounded queries and copied result access through libpq.',tasks:['sql','database','storage','server','postgresql'],
    names:['Pool','Connection','Result','PostgresError','DatabaseStorage','NativeDatabaseStorage','acquire','query','rows','text'],
    ownership:'Own pools, connection leases and results on their creating worker. Borrow a lease for a query; scope exit releases native resources and rolls back unfinished transactions.',
    requirements:'A reachable PostgreSQL server and explicit DatabaseStorage provider. Supply deadlines, row limits and copied-result byte limits.',
    license:'August adapter: MIT. libpq: PostgreSQL License. OpenSSL: Apache-2.0.',
    tests:{summary:'Live database tests include bound data, bytea, SQLSTATE, transactions, cancellation and HTTP drain.',url:'https://github.com/GreenPandaStudios/aug-postgres/tree/v0.1.0/tests'}},
  {id:'zlib',title:'zlib',summary:'Compress bytes and decompress within an explicit output limit.',tasks:['compression','decompression','bytes','buffers'],
    names:['CompressionError','compress','decompress'],ownership:'Managed Bytes inputs and copied Bytes results; the adapter releases temporary native buffers.',
    requirements:'Choose maximumOutput explicitly when decompressing.',license:'zlib: Zlib license. August adapter: MIT.',
    tests:{summary:'Compress and restore UTF-8 bytes with real zlib; verify the round trip.',url:wiki+'examples/native-zlib/compression'}},
  {id:'blake3',title:'BLAKE3',summary:'Hash bytes with the Rust BLAKE3 implementation.',tasks:['hash','hashing','digest','rust','bytes'],
    names:['HashError','hash'],ownership:'Managed Bytes input and copied digest text; no opaque resource is retained.',
    requirements:'A digest function, with no password hashing or signing API.',license:'BLAKE3/Rust components: MIT or Apache-2.0; see the retained crate notices. August adapter: MIT.',
    tests:{summary:'Verify the independently published abc digest against the real Rust library.',url:wiki+'examples/native-blake3/hashing'}},
  {id:'pytorch',title:'PyTorch / LibTorch',summary:'Create CPU float64 tensors, add them, and read sums or values.',tasks:['tensor','tensors','math','machine learning','cpu','c++','pytorch'],
    names:['Tensor','TensorError','tensor','add','sum','values'],ownership:'Own each Tensor. Inputs are borrowed for a call; scope exit releases the LibTorch object, including checked failures.',
    requirements:'CPU float64 preview. GPU support and the wider PyTorch API are absent. Linux includes its declared C++ runtime; macOS uses system libc++.',
    license:'August adapter: MIT. PyTorch: BSD-style plus component licenses. Linux closures include GPL/LGPL runtimes and the GCC Runtime Library Exception. The preview has no exhaustive binary SBOM; retain the full closure notices.',
    tests:{summary:'Create real LibTorch tensors, add them, and verify their values and sum.',url:wiki+'examples/native-pytorch/tensors'}},
  {id:'gpu',title:'Metal GPU operations',summary:'Upload float32 vectors, add them on a Metal GPU and copy results back.',tasks:['gpu','metal','vector','vectors','compute','workers'],
    names:['Device','Buffer','GpuError','openDevice','upload','add','download'],ownership:'Own devices and buffers on their creating worker. No handles cross workers; downloads copy values into that worker’s heap.',
    requirements:'Apple Silicon with an available Metal GPU. No CUDA artifact or CPU fallback.',license:'August adapter: MIT. Uses system Metal and Foundation frameworks; they are not redistributed.',
    tests:{summary:'Compare native GPU vector results in isolated workers with independently computed sums.',url:wiki+'examples/native-gpu/compute'}},
];
const sourceDescriptions:Description[] = [
  {id:'io',title:'Console, files and arguments',summary:'Explicit console, file and command-line capabilities.',tasks:['console','files','arguments','io','cli'],
    names:['Console','SystemConsole'],ownership:'Managed capability providers; immutable text and copied file content.',requirements:'Implement the capabilities the application needs in main.aug.',license:'MIT August source; retain the runtime’s redistribution notices.',
    tests:{summary:'A greeting project shows explicit console injection and same-file tests.',url:wiki+'examples/hello/index'}},
  {id:'collections',title:'Bounded ranges',summary:'Construct half-open integer ranges with checked steps and size limits.',tasks:['range','ranges','iteration','collections','integers'],
    names:['range','RangeError'],ownership:'A fresh managed List<int>; request bounded exclusive mutation with borrow.',requirements:'Set an allocation limit appropriate to the operation; the default is one million values.',license:'MIT.',
    tests:{summary:'Ascending, descending, empty, invalid-step and boundary tests on both native backends.',url:wiki+'reference#bounded-integer-ranges'}},
  {id:'math',title:'Checked integers and decimals',summary:'Checked int64 arithmetic and exact bounded fixed-scale decimals.',tasks:['math','decimal','decimals','money','overflow','integers'],
    names:['checkedAdd','Decimal','parseDecimal','formatDecimal'],ownership:'Integer values and immutable Decimal records.',requirements:'Decimal scale is 0–18 and coefficients are int64. Inexact arithmetic fails; there is no implicit rounding.',license:'MIT.',
    tests:{summary:'Independent BigInt comparison grids, boundary cases, parsing and exact arithmetic.',url:wiki+'reference#checked-mathematics-unreleased'}},
  {id:'json',title:'JSON',summary:'Parse JSON with strict or bounded ingestion-compatible number handling.',tasks:['json','parsing','serialization','ingestion'],
    names:['parse','parseCompatible'],ownership:'Managed immutable JSON views; extracted text and bytes have checked bounds.',requirements:'Choose strict parse or parseCompatible explicitly. Compatibility retains documented depth and Unicode limits.',license:'MIT August source; yyjson: MIT.',
    tests:{summary:'Parser and ingestion profiles include presence, numbers, malformed inputs and bounds.',url:repository+'/blob/main/tests/ingestion-values.test.mjs'}},
  {id:'time',title:'Clock',summary:'Read wall-clock time through a replaceable capability.',tasks:['time','clock','testing'],
    names:['Clock','SystemClock'],ownership:'Managed clock provider; whole Unix-second results in UTC.',requirements:'Bind Clock to SystemClock or a test implementation.',license:'MIT.',
    tests:{summary:'The LLVM clock consumer binds SystemClock and checks a native wall-clock read.',url:repository+'/blob/main/tests/llvm-backend.test.mjs'}},
  {id:'memory',title:'Expiring in-memory stores',summary:'Bounded generic in-memory stores with explicit expiry.',tasks:['store','cache','expiry','memory','storage'],
    names:['ExpiringStore','MemoryStore','StoreFull'],ownership:'Managed capability provider with an internally locked table. Stored values satisfy immutable Data.',requirements:'Bind ExpiringStore<T> explicitly. Time is supplied by the caller; each provider stores at most 512 live entries.',license:'MIT.',
    tests:{summary:'The session example supplies expiry times to the bounded store; its login checks exercise the surrounding flow.',url:repository+'/blob/main/tests/oidc-login.test.mjs'}},
  {id:'web',title:'HTTP client and web helpers',summary:'HTTP capabilities, redirects, cookies and server controls.',tasks:['http','web','network','cookies','request'],
    names:['HttpClient','WebHttpClient'],ownership:'Managed capability providers and checked request/response values.',requirements:'Endpoints and server-rendered HTML are language features. Import this package for its helper/client capabilities.',license:'MIT bindings; native HTTP/TLS closure notices apply.',
    tests:{summary:'The complete login example exercises the native HTTP pipeline and checked protocol helpers.',url:wiki+'examples/oidc-login/index'}},
  {id:'crypto',title:'Cryptography and JWT',summary:'Random bytes, digests, key operations and checked JWT helpers.',tasks:['crypto','cryptography','jwt','openid','signing','random'],
    names:['Crypto','GnuTlsCrypto','verifyJwt','signJwt'],ownership:'Managed capability values with bounded key/native operations; checked validation errors remain visible.',requirements:'Bind Crypto explicitly. Select validation policy and trusted issuer/key inputs in application code.',license:'MIT bindings; GnuTLS and its dependency closure retain their upstream licenses.',
    tests:{summary:'The same-app OpenID Connect example verifies real native signatures and session JWT behavior.',url:wiki+'examples/oidc-login/index'}},
];

function importExample(names: string[], module: string): string {
  const lines:string[] = [];let selected:string[] = [];
  for(const name of names) {
    if(selected.length&&`import ${[...selected,name].join(' and ')} from ${module}`.length>80) {
      lines.push(`import ${selected.join(' and ')} from ${module}`);selected=[];
    }
    selected.push(name);
  }
  if(selected.length)lines.push(`import ${selected.join(' and ')} from ${module}`);
  return lines.join('\n');
}

function nativeSnapshots(): NativeSnapshot[] {
  const value = JSON.parse(readFileSync(new URL('../native/library-catalog.json',import.meta.url),'utf8'));
  if(value.format!==1||!Array.isArray(value.packages))throw new Error('CATALOG: Unsupported bundled library snapshot');
  for(const entry of value.packages)validateNativeManifest(entry.manifest.native);
  return value.packages;
}

/** Search curated metadata offline. The catalog never resolves, installs or executes a dependency. */
export function libraryCatalog(query = ''): {format:1;compiler:string;query:string;entries:LibraryEntry[]} {
  const compiler = compilerVersion(),snapshots = nativeSnapshots();
  const entries:LibraryEntry[] = sourceDescriptions.map(description=>{
    const bundled = ['io','collections','math'].includes(description.id),sourceModule = bundled ? 'august.'+description.id : description.id;
    const request = `${repository}/tree/v0.23.0/src/stdlib/${description.id}`;
    return {id:description.id,title:description.title,summary:description.summary,tasks:description.tasks,
      source:bundled ? {kind:'bundled',module:sourceModule} : {kind:'repository',request},
      version:bundled ? compiler : 'v0.23.0 source',compilerRequirement:bundled ? compiler : undefined,testedCompiler:bundled ? compiler : '0.23.0',
      compilerCompatible:bundled ? true : null,
      install:bundled ? undefined : `aug add "${request}" --as ${description.id}`,
      example:importExample(description.names,sourceModule),
      ownership:description.ownership,requirements:description.requirements,license:{summary:description.license,url:repository+'/blob/v0.23.0/'+(['io','json','web','crypto'].includes(description.id)?'THIRD_PARTY_NOTICES.md':'LICENSE')},
      artifacts:[],tests:description.tests,evidence:{metadata:bundled ? 'bundled-source' : 'curated-source-reference',artifactBytes:'not-checked-by-catalog'}};
  });
  for(const description of nativeDescriptions) {
    const snapshot = snapshots.find(entry=>entry.id===description.id);
    if(!snapshot)throw new Error('CATALOG: Missing '+description.id+' snapshot');
    if(description.names.some(name=>!snapshot.exports.includes(name)))throw new Error('CATALOG: Import example no longer matches '+description.id+' exports');
    const request = snapshot.repository+'#'+snapshot.tag;
    entries.push({id:description.id,title:description.title,summary:description.summary,tasks:description.tasks,
      source:{kind:'repository',request,commit:snapshot.commit},version:snapshot.manifest.version,
      compilerRequirement:snapshot.manifest.compiler,compilerCompatible:acceptsCompiler(snapshot.manifest.compiler,compiler),
      install:`aug add "${request}" --as ${description.id}`,example:importExample(description.names,description.id),
      requirements:description.requirements,ownership:description.ownership,
      license:{summary:description.license,url:snapshot.repository+'/blob/'+snapshot.tag+'/THIRD_PARTY_NOTICES.md'},
      artifacts:snapshot.manifest.native!.artifacts,tests:description.tests,
      evidence:{metadata:'tagged-source-snapshot',artifactBytes:'not-checked-by-catalog',sourceDigests:snapshot.evidence}});
  }
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return {format:1,compiler,query,entries:entries.filter(entry=>{
    const text=[entry.id,entry.title,entry.summary,...entry.tasks,entry.example,entry.requirements,entry.ownership,
      entry.license.summary,entry.tests.summary,...entry.artifacts.flatMap(artifact=>Object.values(artifact.target).flat())]
      .join(' ').toLowerCase();
    const terms=text.match(/[a-z0-9][a-z0-9_.+:-]*/g) ?? [];
    return words.every(word=>terms.some(term=>term.startsWith(word)));
  }).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)};
}
