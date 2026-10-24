import path from 'node:path';
import {readFile,writeFile,symlink} from 'node:fs/promises';
import {createClient} from '../engine/generate.ts';
const base=JSON.parse(await readFile('briefs/demo-company.json','utf8'));
base.company.name='InternationalArchitectureAndCommunityDesignResearchLaboratory（検証用）';
base.company.tagline='住まいと地域のこれからを一緒に考え、時間の変化に寄り添う場所をつくる。'.repeat(3);
base.company.address='検証用の長い所在地情報です。'.repeat(12);
base.company.email='very-long-contact-address-for-layout-verification@example.invalid';
base.assets=[];
for(const page of base.pages){for(const section of page.sections){delete section.imageId;if(section.type==='hero')section.heading=base.company.tagline;if(section.body)section.body=section.body.repeat(4);}}
for(const presetId of ['editorial','photographic','structured']){
 const result=await createClient({root:path.resolve('.'),clientId:`qa-edge-${presetId}`,brief:base,presetId});
 await symlink(path.resolve('site-template/node_modules'),path.join(result.directory,'node_modules'),'dir');
 console.log(result.directory);
}
const server=await readFile('tools/preview.mjs','utf8');
await writeFile('tools/preview-edge-cases.mjs',server.replace("[['editorial',4337],['photographic',4338],['structured',4339]]","[['editorial',4340],['photographic',4341],['structured',4342]]").replace('`demo-${id}`','`qa-edge-${id}`'));
