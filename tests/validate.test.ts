import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fixture } from './fixture.ts';
import { validateBrief, resolveClientPath, validateAssetPath } from '../engine/validate.ts';

test('draft accepts complete demo, missing optional projects and disconnected form', () => {
  assert.equal(validateBrief(fixture(), {mode:'draft'}).issues.length, 0);
});
test('publish refuses unconfirmed facts and disconnected form', () => {
  const b=fixture(); b.factsConfirmed=false;
  const fields=validateBrief(b,{mode:'publish'}).issues.map(x=>x.path);
  assert.ok(fields.includes('factsConfirmed')); assert.ok(fields.includes('form.connected'));
});
test('page, section and form limits are enforced independently', () => {
  const b=fixture(); b.pages.push({...b.pages[1],slug:'extra'});
  assert.ok(validateBrief(b,{mode:'draft'}).issues.some(x=>x.code==='PAGE_LIMIT'));
  const c=fixture(); c.pages[0].sections=Array.from({length:9},(_,i)=>({...c.pages[0].sections[0],id:`s${i}`}));
  assert.ok(validateBrief(c,{mode:'draft'}).issues.some(x=>x.code==='SECTION_LIMIT'));
  const d=fixture(); d.form.fields=Array.from({length:11},(_,i)=>`field${i}`);
  assert.ok(validateBrief(d,{mode:'draft'}).issues.some(x=>x.code==='FORM_LIMIT'));
});
test('unknown components, duplicate slugs, unsafe URLs and asset paths are rejected', () => {
  const b:any=fixture(); b.pages[0].sections[0].type='arbitrary-code'; b.pages[1].slug='';
  b.assets=[{id:'bad',path:'../../outside.jpg',alt:'写真',permitted:true}];
  b.company.website='javascript:alert(1)';
  const codes=validateBrief(b,{mode:'draft'}).issues.map(x=>x.code);
  for(const code of ['COMPONENT','DUPLICATE_SLUG','ASSET_PATH','URL']) assert.ok(codes.includes(code),code);
});
test('client boundary rejects traversal, absolute paths and existing symlinks', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'site-boundary-'));
  await mkdir(path.join(root,'clients')); await mkdir(path.join(root,'elsewhere'));
  await symlink(path.join(root,'elsewhere'),path.join(root,'clients','linked'));
  for(const id of ['../other','/tmp/other','linked','a/b']) await assert.rejects(resolveClientPath(root,id));
  assert.equal(await resolveClientPath(root,'client-a'),path.join(root,'clients','client-a'));
});
test('asset resolver rejects symlink escape from a declared asset directory', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'asset-boundary-'));
  await mkdir(path.join(root,'assets')); await mkdir(path.join(root,'external'));
  await symlink(path.join(root,'external'),path.join(root,'assets','linked'));
  await assert.rejects(validateAssetPath(path.join(root,'assets'),'linked/photo.jpg'));
});
test('logo points only to an explicitly permitted registered asset',()=>{
 const b:any=fixture();b.company.logoId='missing-logo';
 assert.ok(validateBrief(b,{mode:'draft'}).issues.some(i=>i.code==='LOGO_REF'));
});
