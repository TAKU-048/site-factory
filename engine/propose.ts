import path from 'node:path';
import {readdirSync} from 'node:fs';
import type {ValidatedSite,ProposalBrief,ProposalSet} from './domain.ts';import {factoryRoot,json} from './io.ts';import {loadPreset} from './generate.ts';import {validateBrief,sectionTypes} from './validate.ts';
export async function prepareProposal(site:ValidatedSite):Promise<ProposalBrief>{
 const presets=await Promise.all(['editorial','photographic','structured'].map(loadPreset));
 const profile=await json(path.join(factoryRoot,'profiles',`${site.industry}.json`));
 return {facts:site,presets,profile,components:[...sectionTypes],instructions:'この企業の確認済み情報だけを使い、構成・文字組み・余白・写真配置が異なる3方向を提案してください。既存の理念・こだわりを根拠に選定理由を記してください。実績・口コミ・資格・数値を補完せず、不明点は質問として分離してください。出力形式は directions: [{id,presetId,reason,pages}]。公開やシェルの実行はしません。'};
}
export function validateProposal(input:unknown,catalog:{brief:ValidatedSite}):ProposalSet{
 const p=input as ProposalSet;if(!p||!Array.isArray(p.directions)||p.directions.length!==3)throw new Error('方向性は3案必要です。');
 const ids=new Set<string>(),presets=new Set<string>();const available=readdirSync(path.join(factoryRoot,'presets')).filter(n=>/^[a-z][a-z0-9-]*\.json$/.test(n)).map(n=>n.slice(0,-5));
 for(const d of p.directions){if(!d||typeof d.id!=='string'||!/^[a-z][a-z0-9-]{0,63}$/.test(d.id)||ids.has(d.id)||!available.includes(d.presetId)||presets.has(d.presetId)||typeof d.reason!=='string'||!d.reason.trim())throw new Error('案のID・デザイン・理由を確認してください。');ids.add(d.id);presets.add(d.presetId);
   const b=structuredClone(catalog.brief);b.pages=d.pages;const checked=validateBrief(b,{mode:'draft'});if(checked.issues.length)throw new Error(JSON.stringify(checked.issues));
 }
 return structuredClone(p);
}
