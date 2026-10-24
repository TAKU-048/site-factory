import path from 'node:path';import {mkdir,readFile,writeFile,copyFile,lstat} from 'node:fs/promises';
import type {ClientBrief,DesignSpec,ClientState,GenerationResult} from './domain.ts';
import {validateBrief,resolveClientPath,validateAssetPath} from './validate.ts';
import {factoryRoot,json,saveJson,revision,exists,copySafe} from './io.ts';
export async function loadPreset(id:string):Promise<DesignSpec>{
 if(!/^[a-z][a-z0-9-]{0,63}$/.test(id))throw new Error('安全なデザインIDを指定してください。');
 const file=path.join(factoryRoot,'presets',`${id}.json`);if(!await exists(file))throw new Error('登録済みのデザインIDを指定してください。');
 if((await lstat(file)).isSymbolicLink())throw new Error('デザイン定義のsymlinkは使用できません。');
 const design=await json<DesignSpec>(file);
 if(design.id!==id||!['split','image','type'].includes(design.hero)||!design.tokens||Object.entries(design.tokens).some(([k,v])=>!['paper','ink','line','surface','focus','width','space','space-mobile','display'].includes(k)||typeof v!=='string'||/[;{}<>]|url\s*\(/i.test(v)))throw new Error('デザイン設定が不正です。');
 return design;
}
export function publicSite(b:ClientBrief,design:DesignSpec){
 const c=b.company;
 return {company:{name:c.name,tagline:c.tagline,description:c.description,email:c.email,address:c.address,phone:c.phone||'',philosophy:c.philosophy||'',website:c.website||'',logoId:c.logoId||''},industry:b.industry,demo:b.demo,factsConfirmed:b.factsConfirmed,assets:b.assets.map(a=>({id:a.id,path:a.path,alt:a.alt,permitted:a.permitted,source:a.source||''})),form:{connected:false,mode:b.form.mode||'disconnected',...(b.form.sitekey?{sitekey:b.form.sitekey}:{}),fields:[...b.form.fields]},pages:b.pages.map(p=>({slug:p.slug,title:p.title,description:p.description,sections:p.sections.map(s=>({id:s.id,type:s.type,...(s.variant?{variant:s.variant}:{}),...(s.heading?{heading:s.heading}:{}),...(s.body?{body:s.body}:{}),...(s.imageId?{imageId:s.imageId}:{}),...(s.items?{items:s.items.map(i=>({title:i.title,body:i.body}))}:{})}))})),design};
}
export async function createClient(options:{root:string;clientId:string;brief:unknown;presetId:string;assetRoot?:string}):Promise<GenerationResult>{
 const {root,clientId,presetId,assetRoot}=options;await mkdir(root,{recursive:true});
 const directory=await resolveClientPath(root,clientId);if(await exists(directory))throw new Error('生成先が存在します。上書きしません。');
 const checked=validateBrief(options.brief,{mode:'draft'});if(!checked.site)throw new Error(JSON.stringify(checked.issues));
 const design=await loadPreset(presetId);const data=publicSite(checked.site,design);
 const images:{source:string;target:string}[]=[];
 for(const asset of data.assets){
   const source=await validateAssetPath(assetRoot||path.join(factoryRoot,'site-template/public/assets'),asset.path);
   const stat=await lstat(source);if(stat.size>8*1024*1024)throw new Error('画像は8MB以下にしてください。');
   if(/\.svg$/i.test(source)){const svg=await readFile(source,'utf8');if(/<\s*(script|foreignObject)|\bon\w+\s*=|(?:href|src)\s*=\s*["']\s*(?:https?:|\/\/|data:|javascript:)|url\s*\(|<!ENTITY|<!DOCTYPE/i.test(svg))throw new Error('安全性を確認できないSVGです。');}
   images.push({source,target:asset.path});
 }
 await mkdir(path.dirname(directory),{recursive:true});await mkdir(directory);await copySafe(path.join(factoryRoot,'site-template'),directory,[path.join(factoryRoot,'site-template/public/assets')]);
 for(const image of images){const target=path.join(directory,'public/assets',image.target);await mkdir(path.dirname(target),{recursive:true});await copyFile(image.source,target);}
 await saveJson(path.join(directory,'src/data/site.json'),data);
 const now=new Date().toISOString();const rev=revision(data);
 const state:ClientState={id:clientId,revision:rev,presetId,createdAt:now,updatedAt:now,status:'draft',approvals:{},engineVersion:'0.1.0'};
 await saveJson(path.join(directory,'client-state.json'),state);
 await writeFile(path.join(directory,'README.md'),'# 顧客サイト\n\nNode.js 22.22以上で `npm ci`、`npm run check`、`npm run build` を実行してください。\n\nサイトは静的出力です。src/data/site.json が内容とデザイン設定、src/custom が専用部品です。フォームは未接続・デモはnoindexです。本番公開時は接続・送信・robots等を別途確認してください。\n');
 return {clientId,directory,revision:rev};
}
