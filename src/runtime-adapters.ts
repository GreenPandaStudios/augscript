/** Compiler-private adapters, checked before lowering and built into target packs.
 * These are not native package ABI declarations. Aggregate AugValue calls occur
 * only inside the maintainer-compiled bridge; LLVM calls pointers and scalars. */
export interface RuntimeAdapter {
  name: string; parameters: string[]; returns: string; component: 'crypto' | 'http';
}
export const runtimeAdapters: RuntimeAdapter[] = [
  {name:'_aug_crypto_random',parameters:['int'],returns:'Bytes',component:'crypto'},
  {name:'_aug_crypto_sha256',parameters:['Bytes'],returns:'Bytes',component:'crypto'},
  {name:'_aug_crypto_generate_rsa',parameters:[],returns:'RsaPrivateKey',component:'crypto'},
  {name:'_aug_crypto_public_rsa',parameters:['RsaPrivateKey'],returns:'RsaPublicKey',component:'crypto'},
  {name:'_aug_crypto_sign_rsa',parameters:['RsaPrivateKey','Bytes'],returns:'Bytes',component:'crypto'},
  {name:'_aug_crypto_verify_ed25519',parameters:['string','Bytes','Bytes'],returns:'bool',component:'crypto'},
  {name:'_aug_crypto_verify_rsa',parameters:['RsaPublicKey','Bytes','Bytes'],returns:'bool',component:'crypto'},
  {name:'_aug_crypto_decode_base64url',parameters:['string'],returns:'Bytes',component:'crypto'},
  {name:'_aug_crypto_equal',parameters:['Bytes','Bytes'],returns:'bool',component:'crypto'},
  {name:'_aug_crypto_export_rsa',parameters:['RsaPublicKey'],returns:'Tuple<Bytes,Bytes>',component:'crypto'},
  {name:'_aug_crypto_import_rsa',parameters:['Bytes','Bytes'],returns:'RsaPublicKey',component:'crypto'},
  {name:'_aug_crypto_password_hash',parameters:['Bytes','Bytes','int'],returns:'Bytes',component:'crypto'},
  {name:'_aug_http_stop',parameters:['int'],returns:'void',component:'http'},
  {name:'_aug_http_log',parameters:['string','string','int','int'],returns:'void',component:'http'},
  {name:'_aug_http_request',parameters:['string','string','optional Headers','optional Bytes'],returns:'HttpResponse<Bytes>',component:'http'},
  {name:'_aug_http_url_encode',parameters:['string'],returns:'string',component:'http'},
  {name:'_aug_http_cookie',parameters:['string','string','string','int','bool'],returns:'Headers',component:'http'}
];
export function adapterSymbol(adapter: RuntimeAdapter): string { return 'aug_ir_private' + adapter.name; }
