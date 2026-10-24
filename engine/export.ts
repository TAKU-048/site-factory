import path from 'node:path';import {mkdir,lstat} from 'node:fs/promises';
import type {ClientState,ExportReport} from './domain.ts';import {resolveClientPath} from './validate.ts';import {json,exists,copySafe,assertNoLinks} from './io.ts';
export async function exportClient({root,clientId,destination}:{root:string;clientId:string;destination:string}):Promise<ExportReport>{
 if(!/^[a-z][a-z0-9-]{0,63}$/.test(destination))throw new Error('出力名は安全な半角英数字で指定してください。');
 const source=await resolveClientPath(root,clientId);const directory=path.resolve(root,'exports',destination);
 const parent=path.dirname(directory);if(await exists(parent)&&(await lstat(parent)).isSymbolicLink())throw new Error('出力先のsymlinkは使用できません。');if(await exists(directory))throw new Error('出力先が存在します。');
 await assertNoLinks(source);const state=await json<ClientState>(path.join(source,'client-state.json'));
 const names=['src','public','package.json','package-lock.json','astro.config.mjs','tsconfig.json','README.md','THIRD_PARTY_NOTICES.md'];
 for(const name of [...names,'src/data/site.json','src/pages/[...slug].astro','src/layouts/SiteLayout.astro']){const file=path.join(source,name);if(!await exists(file))throw new Error(`納品必須ファイルがありません: ${name}`);const stat=await lstat(file);if((['src','public'].includes(name)?!stat.isDirectory():!stat.isFile()))throw new Error(`納品必須ファイルの型が不正です: ${name}`);await assertNoLinks(file);}
 await mkdir(directory,{recursive:true});let files=0;
 for(const name of names)if(await exists(path.join(source,name)))files+=await copySafe(path.join(source,name),path.join(directory,name));
 return {directory,files,revision:state.revision};
}
