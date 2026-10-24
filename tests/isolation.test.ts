import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,mkdir,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fixture} from './fixture.ts';
import {createClient} from '../engine/generate.ts';
import {updateClient} from '../engine/update.ts';
test('generation and updates preserve other clients and custom files',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-isolation-'));
 const a=await createClient({root,clientId:'client-a',brief:fixture(),presetId:'editorial'});
 const b=await createClient({root,clientId:'client-b',brief:fixture(),presetId:'structured'});
 const before=await readFile(path.join(b.directory,'src/data/site.json'),'utf8');
 await writeFile(path.join(a.directory,'src/custom/client.css'),'/* customer-owned */');
 await assert.rejects(createClient({root,clientId:'client-a',brief:fixture(),presetId:'photographic'}),/存在/);
 const changed=await updateClient({root,clientId:'client-a',expectedRevision:a.revision,patch:{'company.tagline':'長い日本語でも伝わる見出しへ。'}});
 assert.notEqual(changed.revision,a.revision);
 assert.equal(await readFile(path.join(a.directory,'src/custom/client.css'),'utf8'),'/* customer-owned */');
 assert.equal(await readFile(path.join(b.directory,'src/data/site.json'),'utf8'),before);
 await assert.rejects(updateClient({root,clientId:'client-a',expectedRevision:a.revision,patch:{'company.tagline':'古い変更'}}),/版/);
});
test('failed validation never modifies existing data or revision',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-atomic-'));
 const a=await createClient({root,clientId:'client-a',brief:fixture(),presetId:'editorial'});
 const file=path.join(a.directory,'src/data/site.json');const before=await readFile(file,'utf8');
 await assert.rejects(updateClient({root,clientId:'client-a',expectedRevision:a.revision,patch:{'company.email':'bad'}}));
 assert.equal(await readFile(file,'utf8'),before);
 await assert.rejects(updateClient({root,clientId:'client-a',expectedRevision:a.revision,patch:{'__proto__.x':'bad'}}));
 assert.equal(({} as any).x,undefined);
});
test('generation refuses symlink and unsafe SVG assets without creating a client',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-asset-'));const assets=path.join(root,'incoming');await mkdir(assets);
 await writeFile(path.join(assets,'bad.svg'),'<svg><script>alert(1)</script></svg>');
 const brief=fixture();brief.assets=[{id:'bad',path:'bad.svg',alt:'図版',permitted:true}];
 await assert.rejects(createClient({root,clientId:'client-a',brief,presetId:'editorial',assetRoot:assets}),/SVG/);
});

test('uppercase SVG scripts are refused before creating a client',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-uppercase-'));const assets=path.join(root,'incoming');await mkdir(assets);
 await writeFile(path.join(assets,'bad.SVG'),'<svg><script>alert(1)</script></svg>');
 const brief=fixture();brief.assets=[{id:'bad',path:'bad.SVG',alt:'図版',permitted:true}];
 await assert.rejects(createClient({root,clientId:'client-a',brief,presetId:'editorial',assetRoot:assets}),/SVG/);
});

test('generation never includes template images that the client did not register',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-assets-isolated-'));
 const result=await createClient({root,clientId:'no-images',brief:fixture(),presetId:'editorial'});
 await assert.rejects(readFile(path.join(result.directory,'public/assets/space-study.svg')),/ENOENT/);
});

test('generation copies the registered asset while excluding unregistered source assets',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-selected-assets-'));
 const assets=path.join(root,'incoming');await mkdir(assets);
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>';
 await writeFile(path.join(assets,'chosen.svg'),svg);
 await writeFile(path.join(assets,'other.svg'),svg);
 const brief=fixture();brief.assets=[{id:'chosen',path:'chosen.svg',alt:'登録した図版',permitted:true}];
 const result=await createClient({root,clientId:'selected-image',brief,presetId:'editorial',assetRoot:assets});
 assert.equal(await readFile(path.join(result.directory,'public/assets/chosen.svg'),'utf8'),svg);
 await assert.rejects(readFile(path.join(result.directory,'public/assets/other.svg')),/ENOENT/);
 await assert.rejects(readFile(path.join(result.directory,'public/assets/space-study.svg')),/ENOENT/);
});
