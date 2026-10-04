import type { Ty } from './types.ts';

export const builtinTypes = {
  int: { arity: 0 }, c_int: { arity: 0 }, float: { arity: 0 }, bool: { arity: 0 }, string: { arity: 0 }, void: { arity: 0 },
  Error: { arity: 0 }, FileError: { arity: 0, error: true }, IndexError: { arity: 0, error: true }, ArithmeticError: { arity: 0, error: true }, ConversionError: { arity: 0, error: true },
  List: { arity: 1 }, Set: { arity: 1 }, Map: { arity: 2 }, Tuple: { arity: -1 },
  Bytes: { arity: 0 }, RsaPrivateKey: { arity: 0 }, RsaPublicKey: { arity: 0 },
  CryptoError: { arity: 0, error: true }, JsonError: { arity: 0, error: true },
  Json: { arity: 0 },
  Task: { arity: 1 }, ConcurrencyError: {arity: 0, error: true},
  HttpResponse: {arity: 1}, HttpRequest: {arity: 0}, Headers: {arity: 0}, Html: {arity: 0}, HttpAction: {arity: 0},
  ServerEvent: {arity: 1}, HttpTestClient: {arity: 0},
  HttpError: {arity: 0, error: true},
  Shared: {arity: 1},
  TimeError: {arity: 0, error: true},
  Data: {arity: 0},
} as const;
export const errorNames = Object.keys(builtinTypes).filter(name => 'error' in builtinTypes[name as keyof typeof builtinTypes]);
export const builtinType = (name: string): Ty => ({ id: `builtin:${name}`, name,
  kind: name === 'Error' || name === 'Data' ? 'interface' : errorNames.includes(name) ? 'class' : 'builtin', args: [], nullable: false });
export const builtinProperties: Record<string, {name: string; type: string; documentation: string; errors?: string[]}[]> = {
  HttpResponse: [{name: 'body', type: 'T', documentation: 'The typed response body.'},
    {name: 'status', type: 'int', documentation: 'HTTP response status.'}, {name: 'headers', type: 'Headers', documentation: 'Immutable response headers. Duplicate Set-Cookie values are preserved.'}],
  HttpRequest: [{name: 'method', type: 'string', documentation: 'The HTTP method.'}, {name: 'path', type: 'string', documentation: 'Decoded request path.'},
    {name: 'headers', type: 'Headers', documentation: 'Immutable request headers.'}, {name: 'body', type: 'Bytes', errors: ['HttpError'], documentation: 'Receive bounded request bytes when first read. Headers and authentication can reject the request before reception or 100 Continue. Reception failures raise HttpError.'}],
};
export interface BuiltinOperation {
  name: string; parameters: { label: string; type: string }[]; returns: string; changes?: boolean;
  errors?: string[]; documentation: string; native: string;
}
const length: BuiltinOperation = { name: 'length', parameters: [], returns: 'int', documentation: 'Read the number of elements.', native: 'length' };
export const collectionOperations: Record<string, BuiltinOperation[]> = {
  HttpTestClient: [{name:'request', parameters:[{label:'method',type:'string'},{label:'path',type:'string'},{label:'headers',type:'optional Headers'},{label:'body',type:'optional Bytes'}], returns:'HttpResponse<Bytes>', errors:['HttpError'], documentation:'Run this suite’s endpoint through native routing, typed binding, request-scoped DI, policies, and response serialization. No listening socket is opened. Streaming output is collected up to the configured response limit.',native:'request'}],
  HttpRequest: [{name: 'form', parameters: [], returns: 'decoded', errors: ['HttpError'], documentation: 'Decode a form record inside a handler so protocol-specific error responses can be returned.', native: 'form'}],
  Headers: [
    {name: 'with', parameters: [{label: 'name', type: 'string'}, {label: 'value', type: 'string'}], returns: 'Headers', errors: ['HttpError'], documentation: 'Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.', native: 'with'},
    {name: 'get', parameters: [{label: 'name', type: 'string'}], returns: 'optional string', documentation: 'Read the first case-insensitive header value, or null.', native: 'get'},
    {name: 'all', parameters: [{label: 'name', type: 'string'}], returns: 'List<string>', documentation: 'Read every value of this header in wire order.', native: 'all'},
  ],
  Json: [
    {name:'has',parameters:[{label:'name',type:'string'}],returns:'bool',documentation:'Test object-member presence. A present JSON null returns true; an absent member returns false.',native:'has'},
    {name: 'stringify', parameters: [], returns: 'string', errors: ['JsonError'], documentation: 'Serialize this JSON value with checked UTF-8 escaping and exact int64 values.', native: 'stringify'},
    {name: 'get', parameters: [{label: 'name', type: 'string'}], returns: 'optional Json', documentation: 'Read an object member. An absent member or JSON null returns null.', native: 'get'},
    {name: 'require', parameters: [{label: 'name', type: 'string'}], returns: 'Json', errors: ['JsonError'], documentation: 'Read a required object member or raise JsonError.', native: 'require'},
    {name: 'string', parameters: [], returns: 'string', errors: ['JsonError'], documentation: 'Require a JSON string.', native: 'string'},
    {name: 'integer', parameters: [], returns: 'int', errors: ['JsonError'], documentation: 'Require an exact signed 64-bit JSON integer.', native: 'integer'},
    {name: 'boolean', parameters: [], returns: 'bool', errors: ['JsonError'], documentation: 'Require a JSON bool.', native: 'boolean'},
    {name: 'items', parameters: [], returns: 'List<Json>', errors: ['JsonError'], documentation: 'Read an immutable JSON array.', native: 'items'},
    {name: 'decode', parameters: [], returns: 'decoded', errors: ['JsonError'], documentation: 'Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected.', native: 'decode'},
  ],
  float: [
    {name:'isFinite', parameters:[], returns:'bool', documentation:'Test whether this binary64 value is neither infinity nor NaN.',native:'is_finite'},
    {name:'float32', parameters:[], returns:'float', errors:['ConversionError'], documentation:'Round to IEEE 754 binary32 and return the rounded value as float. Reject nonfinite input or overflow.',native:'float32'},
  ],
  string: [
    {name:'endsWith',parameters:[{label:'suffix',type:'string'}],returns:'bool',documentation:'Test an exact UTF-8 suffix, including embedded NUL. An empty suffix matches.',native:'ends_with'},
    {name:'replace',parameters:[{label:'search',type:'string'},{label:'replacement',type:'string'}],returns:'string',errors:['ConversionError'],documentation:'Return new text with every nonoverlapping exact search replaced, left to right. Reject an empty search. This is not regular-expression replacement.',native:'replace'},
    {name:'codePointLength',parameters:[],returns:'int',errors:['ConversionError'],documentation:'Count Unicode scalar values in valid UTF-8. Combining marks count separately; this is not grapheme count.',native:'code_point_length'},
    {name:'parseInteger',parameters:[],returns:'int',errors:['ConversionError'],documentation:'Parse strict signed decimal int64. Permit an optional leading minus and decimal digits; reject whitespace, plus, trailing text, and overflow.',native:'parse_integer'},
    {name:'parseFloat',parameters:[],returns:'float',errors:['ConversionError'],documentation:'Parse invariant finite binary64 decimal text, with optional minus, fraction, and decimal exponent. Reject whitespace, nonfinite values, malformed text, overflow, and underflow.',native:'parse_float'},
    {name:'trim',parameters:[],returns:'string',documentation:'Remove ECMAScript whitespace and line terminators from both ends; preserve interior text.',native:'trim'},
    {name:'utf16Length',parameters:[],returns:'int',documentation:'Count UTF-16 code units for JavaScript wire limits; supplementary characters count as two.',native:'utf16_length'},
    {name:'isDecimal',parameters:[],returns:'bool',documentation:'Require a nonempty ASCII unsigned decimal string. Leading zeros are allowed.',native:'is_decimal'},
    {name:'compareDecimal',parameters:[{label:'other',type:'string'}],returns:'int',errors:['ConversionError'],documentation:'Compare unsigned decimal strings without integer conversion. Leading zeros do not affect the result; return -1, 0, or 1.',native:'compare_decimal'},
    {name:'isToken', parameters:[{label:'min', type:'int'},{label:'max', type:'int'}], returns:'bool', documentation:'Require an ASCII RFC 3986 unreserved token with a bounded length.', native:'is_token'},
    { ...length, documentation: 'Read the number of UTF-8 bytes. Unicode text is preserved losslessly.' },
    { name: 'bytes', parameters: [], returns: 'Bytes', documentation: 'Encode this string as immutable UTF-8 bytes.', native: 'bytes' },
    { name: 'split', parameters: [{label: 'separator', type: 'string'}], returns: 'List<string>', documentation: 'Split at an exact separator, preserving empty parts.', native: 'split' },
    { name: 'startsWith', parameters: [{label: 'prefix', type: 'string'}], returns: 'bool', documentation: 'Test an exact prefix.', native: 'starts_with' },
  ],
  Bytes: [length,
    {name:'slice',parameters:[{label:'start',type:'int'},{label:'end',type:'int'}],returns:'Bytes',errors:['IndexError'],documentation:'Copy bytes in the half-open range [start, end). Require 0 <= start <= end <= length.',native:'slice'},
    {name:'hex',parameters:[],returns:'string',documentation:'Encode bytes as lowercase hexadecimal, including embedded zeros.',native:'hex'},
    { name: 'text', parameters: [], returns: 'string', errors: ['ConversionError'], documentation: 'Decode UTF-8 strictly. Invalid input raises ConversionError; embedded NUL is preserved.', native: 'text' },
    { name: 'base64url', parameters: [], returns: 'string', documentation: 'Encode immutable bytes as unpadded RFC 4648 URL-safe base64.', native: 'base64url' },
  ],
  List: [
    {name:'join',parameters:[{label:'separator',type:'string'}],returns:'string',documentation:'Join List<string> in list order with exact separators. Empty lists produce empty text. Preserve empty elements and embedded NUL.',native:'join'},
    { name: 'append', parameters: [{ label: 'value', type: 'T' }], returns: 'void', changes: true,
      documentation: 'Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here.', native: 'append' },
    { name: 'get', parameters: [{ label: 'index', type: 'int' }], returns: 'T', errors: ['IndexError'],
      documentation: 'Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.', native: 'get' },
    { name: 'at', parameters: [{ label: 'index', type: 'int' }], returns: 'optional T',
      documentation: 'Read a zero-based position, returning null when it is absent. Narrow the result before using it.', native: 'at' }, length,
  ],
  Set: [
    { name: 'add', parameters: [{ label: 'value', type: 'T' }], returns: 'void', changes: true,
      documentation: 'Insert a unique element with exclusive mutable access.', native: 'add' },
    { name: 'contains', parameters: [{ label: 'value', type: 'T' }], returns: 'bool', documentation: 'Test structural or identity equality with a stored element.', native: 'contains' }, length,
  ],
  Map: [
    {name: 'take', parameters: [{label: 'key', type: 'K'}], returns: 'optional V', changes: true, documentation: 'Remove and return an entry under exclusive access. An absent key returns null.', native: 'take'},
    { name: 'set', parameters: [{ label: 'key', type: 'K' }, { label: 'value', type: 'V' }], returns: 'void', changes: true,
      documentation: 'Insert or replace an entry with exclusive mutable access.', native: 'set' },
    { name: 'get', parameters: [{ label: 'key', type: 'K' }], returns: 'optional V', documentation: 'Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.', native: 'get' },
    { name: 'contains', parameters: [{ label: 'key', type: 'K' }], returns: 'bool', documentation: 'Check for a key, including entries whose value is null.', native: 'contains' }, length,
  ],
  Tuple: [{ name: 'get', parameters: [{ label: 'index', type: 'int' }], returns: 'position', documentation: 'Read a statically checked constant position. Prefer tuple destructuring when reading several positions.', native: 'get' }, length],
};
export function operationType(text: string, receiver: Ty, position?: number): Ty {
  const optional = text.startsWith('optional '), name = text.replace(/^optional /, '').replace(/\?$/, '');
  const generic = /^(\w+)<(.+)>$/.exec(name);
  const type = generic ? {...builtinType(generic[1]), args: generic[2].split(',').map(arg => operationType(arg.trim(), receiver))} : name === 'position' ? receiver.args[position ?? -1] : name === 'T' || name === 'K' ? receiver.args[0] : name === 'V' ? receiver.args[1] : builtinType(name);
  const nullable=optional || text.endsWith('?') || !!type?.nullable || !!type?.optional;
  return { ...(type ?? builtinType('<error>')), nullable, optional:nullable || undefined };
}
export const builtinFunctions: BuiltinOperation[] = [
  {name:'exit', parameters:[{label:'status', type:'int'}], returns:'void', documentation:'Exit from main with a status from 0 to 255 after cancellation and cleanup.', native:'exit'},
  { name: 'c_int', parameters: [{ label: 'value', type: 'int' }], returns: 'c_int', errors: ['ConversionError'], documentation: 'Checked conversion to a signed 32-bit C int. Overflow raises ConversionError. AugScript int maps to int64_t at the C boundary.', native: 'to_c_int' },
  { name: 'int', parameters: [{ label: 'value', type: 'c_int' }], returns: 'int', documentation: 'Widen a C int to the signed 64-bit AugScript integer without loss.', native: 'to_int' },
  { name: 'print', parameters: [{ label: 'value', type: 'any' }], returns: 'void', documentation: 'Write application startup or test output. Other callables receive a Console dependency and call console.write; their bodies infer that capability use.', native: 'print' },
  { name: 'assertEqual', parameters: [{label:'actual',type:'any'},{label:'expected',type:'any'}], returns:'void', documentation:'Compare actual and expected using August equality in a test. Evaluate each input once in written order. Failures show bounded scalar, record and tuple values and the first public difference path. Private field names and values, and native contents, are omitted; bounded searches report when a path is unavailable. Other objects retain identity equality. Catching the failure cannot make the case pass.', native:'assert_equal' },
  { name: 'assert', parameters: [{ label: 'condition', type: 'bool' }], returns: 'void', documentation: 'Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.', native: 'assert' },
  { name: 'arguments', parameters: [], returns: 'List<string>', documentation: 'Composition arguments. Other callables receive the Arguments capability.', native: 'arguments' },
  { name: 'read_file', parameters: [{ label: 'path', type: 'string' }], returns: 'string', errors: ['FileError'], documentation: 'Root-only UTF-8 text input. Other callables receive FileReader. Invalid Unicode and NUL raise FileError.', native: 'read_file' },
  { name: 'write_file', parameters: [{ label: 'path', type: 'string' }, { label: 'content', type: 'string' }], returns: 'void', errors: ['FileError'], documentation: 'Root-only UTF-8 text output. Other callables receive FileWriter.', native: 'write_file' },
];
