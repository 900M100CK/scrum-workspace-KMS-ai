import {readFileSync} from 'node:fs';
import {Ajv2020} from 'ajv/dist/2020.js';
import {createRequire} from 'node:module';
const addFormats=createRequire(import.meta.url)('ajv-formats') as typeof import('ajv-formats').default;

// Source and compiled layouts have the same depth. Deployment must include this versioned artifact.
const api=JSON.parse(readFileSync(new URL('../../../../contracts/openapi/workspace.openapi.json',import.meta.url),'utf8'));
const ajv=new Ajv2020({strict:false,allErrors:true,removeAdditional:false,coerceTypes:false,useDefaults:false});
addFormats(ajv);
ajv.addSchema({$id:'urn:sacw:workspace-session',$schema:'https://json-schema.org/draft/2020-12/schema',components:api.components,paths:api.paths});
export const sessionSchemas={Login:api.components.schemas.Login,Session:api.components.schemas.Session,Error:api.components.schemas.Error};
export const sessionValidators=Object.fromEntries(Object.keys(sessionSchemas).map(name=>[name,ajv.compile({$ref:`urn:sacw:workspace-session#/components/schemas/${name}`})]));
