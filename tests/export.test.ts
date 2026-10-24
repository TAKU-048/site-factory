import {test} from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,readdir,mkdir,symlink,rename,access} from 'node:fs/promises';import {tmpdir} from 'node:os';import path from 'node:path';
import {fixture} from './fixture.ts';import {createClient} from '../engine/generate.ts';import {exportClient} from '../engine/export.ts';
test('export contains independent sources, never management records, secrets or dependencies',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-export-'));const a=await createClient({root,clientId:'client-a',brief:fixture(),presetId:'editorial'});
 await writeFile(path.join(a.directory,'.env'),'PRIVATE=secret');await mkdir(path.join(a.directory,'records'));await writeFile(path.join(a.directory,'records','private.txt'),'private');
 const result=await exportClient({root,clientId:'client-a',destination:'delivery-a'});const names=await readdir(result.directory);
 for(const key of ['.env','records','client-state.json','node_modules','.git']) assert.ok(!names.includes(key));
 assert.ok(names.includes('package.json'));assert.ok(names.includes('src'));assert.ok(names.includes('README.md'));
 assert.equal(JSON.parse(await readFile(path.join(result.directory,'src/data/site.json'),'utf8')).company.name,fixture().company.name);
 await assert.rejects(exportClient({root,clientId:'client-a',destination:'../outside'}));
});
test('export refuses symlinks inside delivered sources',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-export-link-'));const a=await createClient({root,clientId:'client-a',brief:fixture(),presetId:'editorial'});
 await symlink('/etc/passwd',path.join(a.directory,'src','leak.txt'));
 await assert.rejects(exportClient({root,clientId:'client-a',destination:'delivery'}),/symlink/);
});

test('export rejects missing required files before creating a delivery',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-export-missing-'));const a=await createClient({root,clientId:'client-a',brief:fixture(),presetId:'editorial'});
 await rename(path.join(a.directory,'package-lock.json'),path.join(a.directory,'saved-lock.json'));
 await assert.rejects(exportClient({root,clientId:'client-a',destination:'incomplete'}),/必須/);
 await assert.rejects(access(path.join(root,'exports/incomplete')));
});
