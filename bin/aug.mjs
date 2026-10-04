#!/usr/bin/env node
if (Number(process.versions.node.split('.')[0]) < 24) {
  process.stderr.write(`August needs Node.js 24 or newer; this is Node.js ${process.versions.node}.\nInstall a supported Node version, then retry aug run.\n`);
  process.exitCode = 1;
} else {
  try {
    const { main } = await import('../src/cli.ts');
    process.exitCode = await main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`August could not finish: ${error.message}\nRun aug --help for usage. If this persists, report the command and error at https://github.com/GreenPandaStudios/augscript/issues.\n`);
    process.exitCode = 1;
  }
}
