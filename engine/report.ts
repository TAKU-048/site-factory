import path from 'node:path';import {readdir} from 'node:fs/promises';import type {ClientReport,ClientState} from './domain.ts';
import {exists,json,revision,assertNoLinks} from './io.ts';import {resolveClientPath,validateBrief} from './validate.ts';
export async function buildClientReport(root:string):Promise<ClientReport[]>{
 const base=path.join(root,'clients');if(!await exists(base))return[];const result:ClientReport[]=[];
 for(const id of await readdir(base)){
   if(!/^[a-z][a-z0-9-]{0,63}$/.test(id))continue;
   try{const dir=await resolveClientPath(root,id);await assertNoLinks(dir);const state=await json<ClientState>(path.join(dir,'client-state.json'));const data=await json(path.join(dir,'src/data/site.json'));const issues:string[]=[];
   if(!data.form?.connected)issues.push('フォーム未接続');if(!data.factsConfirmed)issues.push('掲載事実が未確認');if(revision(data)!==state.revision)issues.push('管理外で内容が変更されています');
   if(state.approvals?.publish&&state.approvals.publish.revision!==state.revision)issues.push('公開承認が現在の版と不一致');
   const checked=validateBrief(data,{mode:'draft'});if(checked.issues.length)issues.push('入力検証に不合格の項目があります');
   result.push({id,path:dir,status:state.status==='review'?'review':'draft',revision:state.revision,presetId:state.presetId,url:null,domainExpiry:null,lastPublished:null,engineVersion:state.engineVersion||null,updatedAt:state.updatedAt||null,lastChecked:null,issues});
   }catch(e:any){result.push({id,path:path.join(base,id),status:'error',revision:'',presetId:'',url:null,domainExpiry:null,lastPublished:null,engineVersion:null,updatedAt:null,lastChecked:null,issues:[e.message]});}
 }
 return result;
}
