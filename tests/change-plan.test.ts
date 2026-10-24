import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile} from 'node:fs/promises';
import path from 'node:path';import {tmpdir} from 'node:os';
import {fixture} from './fixture.ts';import {createClient} from '../engine/generate.ts';import {updateClient} from '../engine/update.ts';
test('preview reports the proposed revision without applying changes or losing approvals',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-plan-'));const a=await createClient({root,clientId:'preview',brief:fixture(),presetId:'editorial'});
 const file=path.join(a.directory,'src/data/site.json'),state=path.join(a.directory,'client-state.json');const before=await readFile(file,'utf8'),oldState=await readFile(state,'utf8');
 const change=await updateClient({root,clientId:'preview',expectedRevision:a.revision,patch:{'company.tagline':'変更を事前確認する'},dryRun:true});
 assert.equal(change.applied,false);assert.notEqual(change.revision,a.revision);assert.equal(await readFile(file,'utf8'),before);assert.equal(await readFile(state,'utf8'),oldState);
 const applied=await updateClient({root,clientId:'preview',expectedRevision:a.revision,patch:{'company.tagline':'変更を事前確認する'}});assert.equal(applied.revision,change.revision);
});
