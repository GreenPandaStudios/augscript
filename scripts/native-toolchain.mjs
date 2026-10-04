import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

export function compilerHelp() {
  const install = process.platform === 'darwin' ? 'Install the Apple Command Line Tools with: xcode-select --install' :
    process.platform === 'linux' ? 'Install a C toolchain (Debian/Ubuntu: sudo apt-get install build-essential; Fedora: sudo dnf install gcc make).' :
    'Use a Linux Dev Container or install a C11 compiler with POSIX threads support.';
  return `${install}\nIf a compiler is already installed, set CC to its executable path and retry aug run.`;
}

/** Select an executable, including installations with only Apple's Command Line Tools. */
export function cCompiler() {
  const xcode = '/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang';
  const candidates = process.env.CC ? [process.env.CC] : [...(existsSync(xcode) ? [xcode] : []), 'clang', 'cc', 'gcc'];
  for (const command of candidates) {
    const result = spawnSync(command, ['--version'], { encoding: 'utf8', timeout: 10000 });
    if (!result.error && result.status === 0) return command;
  }
  throw new Error(`Cannot use a C compiler${process.env.CC ? ` from CC=${process.env.CC}` : ' on this computer'}.\n${compilerHelp()}`);
}

export function requireBuildTool(command, args = ['--version']) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 10000 });
  if (!result.error && result.status === 0) return;
  const install = process.platform === 'darwin' ? 'Install the Apple Command Line Tools with xcode-select --install.' :
    'Install the build tools (Debian/Ubuntu: sudo apt-get install build-essential m4 cmake zlib1g-dev; Fedora: sudo dnf install gcc make m4 cmake zlib-devel).';
  throw new Error(`Native dependency setup needs ${command}, but it could not run.\n${install}\nRetry aug run after installing it.`);
}
