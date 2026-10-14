import { writeFileSync, mkdirSync } from 'node:fs';
import { buildSchema } from '../src/contract/spec.js';
mkdirSync('schema', { recursive: true });
writeFileSync('schema/stage.v1.schema.json', JSON.stringify(buildSchema(), null, 2));
console.log('wrote schema/stage.v1.schema.json');
