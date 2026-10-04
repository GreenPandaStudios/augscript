const fs=require('node:fs');

/** Explain subprocess setup failures using the settings users can repair. */
function setupError(error,command) {
  if(['ENOENT','EACCES','EPERM'].includes(error.code))return new Error(`Could not start ${command.command}: ${error.message}. Check augscript.nodePath and augscript.compilerPath. The bundled compiler requires Node.js 24 or newer.`);
  return error;
}
/** Node can start successfully even when the configured compiler file is missing. */
function validateInvocation(command) {
  const compiler=command.args[0];
  if(!compiler?.endsWith('.mjs'))return;
  try{
    if(!fs.statSync(compiler).isFile())throw new Error(`Compiler path is not a file: ${compiler}. Check augscript.compilerPath.`);
    fs.accessSync(compiler,fs.constants.R_OK);
  }catch(error){throw setupError(error,command);}
}
module.exports={setupError,validateInvocation};
