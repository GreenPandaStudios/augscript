import { parse } from './parser.ts';

// These declarations describe the native policy ABI. Package names do not determine compatibility.
// Keep this schema aligned with the capabilities exported by the web library.
const source = `record Principal(string subject, List<string> permissions)
capability Authentication:
    authenticate(HttpRequest request) returns optional Principal uses Authentication.authenticate unless HttpError
capability Authorization:
    authorize(Principal identity, string permission) returns bool uses Authorization.authorize unless HttpError
capability RequestLogger:
    complete(string method, string path, int status, int milliseconds) uses RequestLogger.complete
`;
export const nativeHttpContracts = new Map(parse('<native-http-contracts>', source).file.items
  .filter(item => item.kind === 'interface' || item.kind === 'class')
  .map(item => [item.name, item]));
