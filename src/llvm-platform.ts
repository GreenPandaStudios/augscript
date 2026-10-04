import {existsSync} from 'node:fs';
import {nativeHostTarget,type NativeTarget} from './native-contracts.ts';

/** Qualified native host/target pairs. No cross compiler or host SDK is guessed. */
export interface LLVMPlatform {
  host:string; target:string; triple:string; artifact:string; tools:string[];
  minimumOS?:string; minimumLibc?:string; entry?:string; loader?:string; libc?:string[];
}
export const llvmPlatforms:readonly LLVMPlatform[]=[
  {host:'darwin-arm64',target:'aarch64-apple-darwin',triple:'arm64-apple-macosx14.0.0',artifact:'macos-arm64',minimumOS:'14.0',tools:['llc','opt','lld','dsymutil']},
  {host:'linux-x64',target:'x86_64-unknown-linux-gnu',triple:'x86_64-unknown-linux-gnu',artifact:'linux-x64',minimumLibc:'2.36',tools:['llc','opt','lld'],entry:'linux-x64/start.S',loader:'/lib64/ld-linux-x86-64.so.2',libc:['/lib/x86_64-linux-gnu/libc.so.6','/usr/lib/x86_64-linux-gnu/libc.so.6']},
  {host:'linux-arm64',target:'aarch64-unknown-linux-gnu',triple:'aarch64-unknown-linux-gnu',artifact:'linux-arm64',minimumLibc:'2.36',tools:['llc','opt','lld'],entry:'linux-arm64/start.S',loader:'/lib/ld-linux-aarch64.so.1',libc:['/lib/aarch64-linux-gnu/libc.so.6','/usr/lib/aarch64-linux-gnu/libc.so.6']}
];
const atLeast=(actual:string|undefined,minimum:string)=>!!actual&&Number(actual.split('.')[0])*1000+Number(actual.split('.')[1])>=Number(minimum.split('.')[0])*1000+Number(minimum.split('.')[1]);
export function llvmPlatform(target:NativeTarget=nativeHostTarget()):LLVMPlatform {
  const platform=llvmPlatforms.find(platform=>platform.target===target.triple&&platform.host===process.platform+'-'+process.arch);
  if(!platform||platform.minimumOS&&!atLeast(target.minimumOS,platform.minimumOS)||platform.minimumLibc&&!atLeast(target.minimumLibc,platform.minimumLibc))
    throw new Error('NATIVE_TARGET: LLVM requires macOS 14+ ARM64 or GNU/Linux x86-64/ARM64 with glibc 2.36+. This host is '+target.triple+' ('+(target.minimumOS??target.minimumLibc??target.libc)+'). Cross compilation and musl are not supported.');
  return platform;
}
export function systemLibc(platform:LLVMPlatform):string {
  const libc=platform.libc?.find(path=>existsSync(path));
  if(!libc||!platform.loader||!existsSync(platform.loader))throw new Error('LLVM_RUNTIME: The qualified GNU/Linux libc/loader is absent. Use a glibc 2.36+ Debian/Ubuntu runtime. No development headers or compiler are required.');
  return libc;
}
