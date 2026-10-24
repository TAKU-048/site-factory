import path from 'node:path';import {readFile,writeFile,mkdir,lstat} from 'node:fs/promises';
import type {ChangeReport,ClientState,ClientBrief} from './domain.ts';import {resolveClientPath,validateBrief} from './validate.ts';
import {json,saveJson,revision,withClientLock,exists} from './io.ts';
export async function updateClient({root,clientId,patch,expectedRevision,dryRun=false}:{root:string;clientId:string;patch:Record<string,unknown>;expectedRevision:string;dryRun?:boolean}):Promise<ChangeReport>{
 const directory=await resolveClientPath(root,clientId);
 return withClientLock(directory,async()=>{
 const state=await json<ClientState>(path.join(directory,'client-state.json'));const file=path.join(directory,'src/data/site.json');const original=await readFile(file,'utf8');const data=JSON.parse(original);
 if(state.revision!==expectedRevision||revision(data)!==expectedRevision)throw new Error('版が変わっています。最新の内容を確認してください。');
 const changed=Object.keys(patch);if(!changed.length)throw new Error('変更内容が空です。');
 for(const [key,value] of Object.entries(patch)) {
   if(/^company\.(name|tagline|description|email|phone|address|philosophy|website)$/.test(key)){if(typeof value!=='string')throw new Error('文章は文字列で指定してください。');data.company[key.split('.')[1]]=value;}
   else if(key==='pages'){if(!Array.isArray(value))throw new Error('ページ構成は配列です。');data.pages=value;}
   else throw new Error(`変更できないフィールドです: ${key}`);
 }
 data.factsConfirmed=false;
 const check=validateBrief(data,{mode:'draft'});if(!check.site)throw new Error(JSON.stringify(check.issues));
 const preview={applied:false,revision:revision(data),changed,requiredApprovals:['structure','design','content','publish'],files:['src/data/site.json','client-state.json'],before:JSON.parse(original),after:data};
 if(dryRun)return preview;
 const history=path.join(directory,'.history');if(await exists(history)&&(await lstat(history)).isSymbolicLink())throw new Error('履歴パスが不正です。');await mkdir(history,{recursive:true});
 await saveJson(path.join(history,`${state.revision}-${Date.now()}.json`),{site:JSON.parse(original),state});
 const next={...state,revision:revision(data),updatedAt:new Date().toISOString(),status:'review' as const,approvals:{}};
 try{await saveJson(file,data);await saveJson(path.join(directory,'client-state.json'),next);}catch(e){await writeFile(file,original);throw e;}
 return {applied:true,revision:next.revision,changed,requiredApprovals:['structure','design','content','publish']};
 });
}
