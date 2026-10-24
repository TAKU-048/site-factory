import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,symlink,readFile,access} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {createClient} from '../engine/generate.ts';
import {fixture} from './fixture.ts';
test('a one-page site renders without broken internal links or missing anchors',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-render-'));
 const brief=fixture();brief.pages=[{...brief.pages[0],sections:[...brief.pages[0].sections,{id:'idea',type:'intro',heading:'理念'},{id:'consult',type:'cta',heading:'相談'},{id:'enquiry',type:'form',heading:'お問い合わせ'},{id:'optional',type:'custom'}]}];
 const result=await createClient({root,clientId:'one-page',brief,presetId:'editorial'});
 await symlink(path.resolve('site-template/node_modules'),path.join(result.directory,'node_modules'),'dir');
 execFileSync('npm',['run','build'],{cwd:result.directory,env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},stdio:'pipe'});
 const html=await readFile(path.join(result.directory,'dist/index.html'),'utf8');
 for(const match of html.matchAll(/href="([^"\s]+)"/g)){
  const href=match[1];if(!href.startsWith('/')&&!href.startsWith('#'))continue;
  const [pathname,fragment]=href.split('#');
  const file=path.join(result.directory,'dist',pathname.endsWith('/')?pathname+'index.html':pathname||'index.html');
  await assert.doesNotReject(access(file),`broken link: ${href}`);
  if(fragment){const target=await readFile(file,'utf8');assert.ok(target.includes(`id="${fragment}"`),`missing anchor: ${href}`);}
 }
 assert.ok(!html.includes('暮らし方から、設計の条件を一緒に整理します。'),'custom component must not invent business copy');
 assert.ok(html.includes('/#enquiry'),'CTA points to the actual form section');
});
