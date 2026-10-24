import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,writeFile,readFile,rename,symlink} from 'node:fs/promises';import {tmpdir} from 'node:os';import path from 'node:path';
import {fixture} from './fixture.ts';import {createClient} from '../engine/generate.ts';import {prepareProposal,validateProposal} from '../engine/propose.ts';import {buildClientReport} from '../engine/report.ts';
test('AI proposals are three distinct directions, using only registered components and designs',async()=>{
 const brief=fixture();const prepared=await prepareProposal(brief);assert.equal(prepared.presets.length,3);assert.ok(prepared.profile.questions.length);assert.ok(prepared.profile.cautions.length);assert.ok(prepared.components.includes("hero"));
 const directions=prepared.presets.map(p=>({id:p.id,presetId:p.id,reason:p.thesis,pages:brief.pages}));
 assert.equal(validateProposal({directions},{brief}).directions.length,3);
 directions[1].presetId='not-installed';assert.throws(()=>validateProposal({directions},{brief}));
});
test('report never calls disconnected or manually stale sites ready or published',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-report-'));const a=await createClient({root,clientId:'client-a',brief:fixture(),presetId:'editorial'});
 let report=(await buildClientReport(root))[0];assert.equal(report.status,'draft');assert.equal(report.url,null);assert.ok(report.issues.includes('フォーム未接続'));
 const statePath=path.join(a.directory,'client-state.json');const state=JSON.parse(await readFile(statePath,'utf8'));state.status='published';state.approvals.publish={revision:'old',date:'2026-01-01'};await writeFile(statePath,JSON.stringify(state));
 report=(await buildClientReport(root))[0];assert.notEqual(report.status,'published');assert.ok(report.issues.includes('公開承認が現在の版と不一致'));
});

test('report refuses symlinked internal data without reading another customer',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'factory-report-link-'));const a=await createClient({root,clientId:'client-a',brief:fixture(),presetId:'editorial'});
 const b=await createClient({root,clientId:'client-b',brief:fixture(),presetId:'editorial'});const file=path.join(a.directory,'src/data/site.json');
 await rename(file,file+'.saved');await symlink(path.join(b.directory,'src/data/site.json'),file);
 const row=(await buildClientReport(root)).find(r=>r.id==='client-a');assert.equal(row?.status,'error');assert.ok(row?.issues.some(i=>i.includes('symlink')));
});
