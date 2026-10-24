import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,readFile,writeFile,rename,symlink} from 'node:fs/promises';import {tmpdir} from 'node:os';import path from 'node:path';
import {fixture} from './fixture.ts';import {createClient} from '../engine/generate.ts';import {updateClient} from '../engine/update.ts';
test('state-file symlink cannot cause writes outside a client',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'state-link-'));const c=await createClient({root,clientId:'client-a',brief:fixture(),presetId:'editorial'});
 const state=path.join(c.directory,'client-state.json');const outside=path.join(root,'outside-state.json');await rename(state,outside);await symlink(outside,state);
 const before=await readFile(outside,'utf8');
 await assert.rejects(updateClient({root,clientId:'client-a',expectedRevision:c.revision,patch:{'company.tagline':'変更'}}),/symlink/);
 assert.equal(await readFile(outside,'utf8'),before);
});
test('duplicate simultaneous updates cannot both succeed',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'concurrent-update-'));const c=await createClient({root,clientId:'client-a',brief:fixture(),presetId:'editorial'});
 const results=await Promise.allSettled([1,2].map(n=>updateClient({root,clientId:'client-a',expectedRevision:c.revision,patch:{'company.tagline':`変更${n}`}})));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
});
