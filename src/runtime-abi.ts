import {createHash} from 'node:crypto';
import {httpPolicyNames,httpPolicyNativeName} from './http-policies.ts';

/** Compiler-private identifiers, checked against the compiled target headers. */
export const runtimeOperations=['PRINT','BINARY','UNARY','FIELD','SET_FIELD','LIST','TUPLE','SET','MAP','MAP_SET','LIST_LENGTH','LIST_GET','LIST_AT','LIST_APPEND','TUPLE_LENGTH','TUPLE_GET','SET_LENGTH','SET_ADD','SET_CONTAINS','MAP_LENGTH','MAP_GET','MAP_TAKE','MAP_CONTAINS','STRING_LENGTH','STRING_BYTES','STRING_SPLIT','STRING_STARTS_WITH','STRING_IS_TOKEN','BYTES_LENGTH','BYTES_TEXT','BYTES_BASE64URL','BASE64URL_DECODE','C_INT','READ_FILE','WRITE_FILE','ARGUMENTS','FREEZE','ITER','MAP_ITER','IS_TYPE','SHARED','SHARED_LOCK','JSON_WRAP','JSON_PARSE','JSON_STRINGIFY','JSON_GET','JSON_REQUIRE','JSON_STRING','JSON_INTEGER','JSON_BOOLEAN','JSON_ITEMS','TIME_NOW'] as const;
export const httpOperations=['HTTP_HEADERS','HTTP_HEADERS_WITH','HTTP_HEADERS_GET','HTTP_HEADERS_ALL','HTTP_RESPONSE','HTTP_RESPONSE_STATUS','HTTP_FINISH','HTTP_EVENT','HTTP_YIELD','HTTP_CLIENT_REQUEST','HTTP_ACTION'] as const;
export const schemaKinds=['INT','C_INT','FLOAT','BOOL','STRING','LIST','MAP','SET','TUPLE','RECORD','JSON'] as const;
export const runtimeIdentifiers=Object.fromEntries([
  ...runtimeOperations.map((name,index)=>['AUG_IR_'+name,index+1]),
  ...httpOperations.map((name,index)=>['AUG_IR_'+name,index+1]),
  ...schemaKinds.map((name,index)=>['AUG_SCHEMA_'+name,index]),
  ...httpPolicyNames.map((name,index)=>[httpPolicyNativeName(name),index+1]),
]);
export const runtimeIdentifierSha256=createHash('sha256').update(JSON.stringify(runtimeIdentifiers)).digest('hex');
