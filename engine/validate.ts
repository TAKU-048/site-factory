import path from 'node:path';
import { lstat, realpath } from 'node:fs/promises';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import type { ClientBrief, Mode, ValidationIssue, ValidatedSite } from './domain.ts';

export const sectionTypes = ['hero','intro','services','strengths','projects','process','faq','company','cta','form','prose','custom'];
const safeSegment = /^[a-z][a-z0-9-]{0,63}$/;
export function safeRelative(value:unknown): value is string {
  return typeof value==='string' && value.length>0 && !path.isAbsolute(value) && !value.includes('\\') && !value.includes('\0') && value.split('/').every(s=>s!==''&&s!=='.'&&s!=='..'&&!s.startsWith('.'));
}
export function validateBrief(input:unknown, options:{mode:Mode}):{site?:ValidatedSite;issues:ValidationIssue[]} {
  const issues:ValidationIssue[]=[];
  const add=(p:string,c:string,m:string)=>issues.push({path:p,code:c,message:m});
  if(!input||typeof input!=='object'||Array.isArray(input)) return {issues:[{path:'',code:'OBJECT',message:'企業情報はオブジェクトで指定してください。'}]};
  const b=input as ClientBrief;
  for(const key of ['name','tagline','description','email','address']) if(typeof b.company?.[key as keyof ClientBrief['company']]!=='string'||!String(b.company[key as keyof ClientBrief['company']]).trim()) add(`company.${key}`,'REQUIRED','必要な企業情報を入力してください。');
  if(b.company?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.company.email)) add('company.email','EMAIL','メールアドレスの形式を確認してください。');
  if(b.company?.website) { try {const u=new URL(b.company.website);if(!['http:','https:'].includes(u.protocol)||u.username||u.password) throw new Error();}catch {add('company.website','URL','http/httpsのURLを指定してください。');} }
  if(typeof b.demo!=='boolean'||typeof b.factsConfirmed!=='boolean') add('factsConfirmed','TYPE','デモと事実確認の状態を明示してください。');
  const industries=readdirSync(new URL('../profiles/',import.meta.url)).filter(n=>/^[a-z][a-z0-9-]*\.json$/.test(n)).map(n=>n.slice(0,-5));
  if(!industries.includes(b.industry)) add('industry','INDUSTRY','登録済みの業種を選択してください。');
  if(!Array.isArray(b.assets)) add('assets','TYPE','素材一覧を配列で指定してください。');
  const assetIds=new Set<string>();
  for(const [i,a] of (Array.isArray(b.assets)?b.assets:[]).entries()) {
    if(!a||typeof a!=='object'){add(`assets.${i}`,'TYPE','素材の形式が不正です。');continue;}
    if(!safeSegment.test(a.id)||assetIds.has(a.id)) add(`assets.${i}.id`,'ASSET_ID','素材IDは重複しない半角英数字で指定してください。');
    assetIds.add(a.id);
    if(!safeRelative(a.path)||! /\.(svg|png|jpe?g|webp|avif)$/i.test(a.path)) add(`assets.${i}.path`,'ASSET_PATH','素材内の安全な画像パスを指定してください。');
    if(a.permitted!==true) add(`assets.${i}.permitted`,'PERMISSION','素材の掲載許可が必要です。');
    if(typeof a.alt!=='string'||!a.alt.trim()) add(`assets.${i}.alt`,'ALT','画像の説明を入力してください。');
  }
  if(b.company?.logoId&&!assetIds.has(b.company.logoId))add('company.logoId','LOGO_REF','登録済みの許可されたロゴ素材を指定してください。');
  if(!Array.isArray(b.pages)||b.pages.length===0) add('pages','TYPE','ページ構成を指定してください。');
  const pages=Array.isArray(b.pages)?b.pages:[];
  const regular=pages.filter(p=>p?.slug!=='privacy');
  if(regular.length>5||pages.filter(p=>p?.slug==='privacy').length>1) add('pages','PAGE_LIMIT','基本は5ページ＋プライバシーポリシー1ページです。');
  const slugs=new Set<string>();let forms=0;
  for(const [i,p] of pages.entries()) {
    if(!p||typeof p!=='object'){add(`pages.${i}`,'TYPE','ページの形式が不正です。');continue;}
    if(typeof p.slug!=='string'||(p.slug!==''&&!safeSegment.test(p.slug))) add(`pages.${i}.slug`,'SLUG','URLは安全な半角英数字とハイフンで指定してください。');
    if(slugs.has(p.slug)) add(`pages.${i}.slug`,'DUPLICATE_SLUG','同じURLのページが重複しています。'); slugs.add(p.slug);
    for(const key of ['title','description']) if(typeof p[key as keyof typeof p]!=='string'||!String(p[key as keyof typeof p]).trim()) add(`pages.${i}.${key}`,'REQUIRED','ページのタイトル・説明が必要です。');
    if(!Array.isArray(p.sections)||!p.sections.length){add(`pages.${i}.sections`,'TYPE','セクションを指定してください。');continue;}
    if(p.sections.length>(p.slug===''?8:5)) add(`pages.${i}.sections`,'SECTION_LIMIT','セクションの上限を超えています。');
    const ids=new Set<string>();
    for(const [j,s] of p.sections.entries()) {
      if(!s||typeof s!=='object'){add(`pages.${i}.sections.${j}`,'TYPE','部品の形式が不正です。');continue;}
      if(!safeSegment.test(s.id)||ids.has(s.id)) add(`pages.${i}.sections.${j}.id`,'SECTION_ID','重複しないセクションIDが必要です。'); ids.add(s.id);
      if(!sectionTypes.includes(s.type)) add(`pages.${i}.sections.${j}.type`,'COMPONENT','未登録の部品です。');
      if(s.type==='form') forms++;
      if(s.imageId&&!assetIds.has(s.imageId)) add(`pages.${i}.sections.${j}.imageId`,'ASSET_REF','指定した素材がありません。');
      if(s.items!==undefined&&(!Array.isArray(s.items)||s.items.some(t=>!t||typeof t.title!=='string'||typeof t.body!=='string'))) add(`pages.${i}.sections.${j}.items`,'ITEM','見出しと本文の配列が必要です。');
      for(const k of ['heading','body','variant']) if(s[k as keyof typeof s]!==undefined&&typeof s[k as keyof typeof s]!=='string') add(`pages.${i}.sections.${j}.${k}`,'TYPE','文章は文字列で指定してください。');
    }
  }
  if(!slugs.has('')) add('pages','HOME','トップページが必要です。');
  if(forms>1) add('pages','FORM_COUNT','フォームは1つまでです。');
  if(!b.form||typeof b.form.connected!=='boolean'||!Array.isArray(b.form.fields)||b.form.fields.some(f=>typeof f!=='string'||!safeSegment.test(f))) add('form','TYPE','フォーム設定が不正です。');
  if(Array.isArray(b.form?.fields)&&b.form.fields.length>10) add('form.fields','FORM_LIMIT','フォームは最大10項目です。');
  if(b.form?.mode!==undefined&&!['disconnected','local','production'].includes(b.form.mode)) add('form.mode','MODE','フォームの環境が不正です。');
  if(b.form?.mode&&b.form.mode!=='disconnected'&&(!['name','email','message'].every(k=>b.form.fields?.includes(k))||new Set(b.form.fields).size!==b.form.fields.length||b.form.fields.some(k=>! /^[a-z][a-z0-9_]{0,31}$/.test(k)))) add('form.fields','FIELDS','必須項目と重複しない安全な項目名が必要です。');
  if(b.form?.sitekey!==undefined&&(typeof b.form.sitekey!=='string'||! /^[a-zA-Z0-9_-]{1,100}$/.test(b.form.sitekey))) add('form.sitekey','KEY','公開sitekeyの形式が不正です。');
  if(options.mode==='publish') {
    if(b.form?.mode!=='production') add('form.mode','ENVIRONMENT','本番接続の確認が必要です。');
    if(b.factsConfirmed!==true) add('factsConfirmed','UNCONFIRMED','公開する事実を確認してください。');
    if(b.form?.connected!==true) add('form.connected','DISCONNECTED','フォームの接続と実送信確認が必要です。');
  }
  return issues.length?{issues}:{site:structuredClone(b),issues};
}

async function rejectSymlinks(base:string, relative:string, requireFile=false) {
  const canonical=await realpath(base);let current=canonical;
  const parts=relative.split('/');
  for(const [i,part] of parts.entries()) {
    current=path.join(current,part);
    try {const stat=await lstat(current);if(stat.isSymbolicLink()) throw new Error('symlinkは使用できません。'); if(i<parts.length-1&&!stat.isDirectory()) throw new Error('親ディレクトリが不正です。');if(requireFile&&i===parts.length-1&&!stat.isFile()) throw new Error('画像ファイルが必要です。');}
    catch(e:any){if(e.code==='ENOENT'&&!requireFile) return;throw e;}
  }
}
export async function resolveClientPath(root:string, clientId:string):Promise<string> {
  if(!safeSegment.test(clientId)) throw new Error('安全な顧客IDを指定してください。');
  await rejectSymlinks(root,`clients/${clientId}`);
  return path.resolve(root,'clients',clientId);
}
export async function validateAssetPath(base:string,relative:string):Promise<string> {
  if(!safeRelative(relative)) throw new Error('画像パスが不正です。');
  await rejectSymlinks(base,relative,true);return path.resolve(base,relative);
}
