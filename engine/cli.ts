#!/usr/bin/env node
import path from 'node:path';import {fileURLToPath} from 'node:url';
import {prepareRelease,verifyRelease} from './release.ts';
import {factoryRoot,json} from './io.ts';import {validateBrief} from './validate.ts';import {createClient} from './generate.ts';import {updateClient} from './update.ts';import {exportClient} from './export.ts';import {prepareProposal,validateProposal} from './propose.ts';import {buildClientReport} from './report.ts';
export async function main(argv:string[]){
 const command=argv[0];const flags:Record<string,string>={};
 for(let i=1;i<argv.length;i+=2){if(!argv[i]?.startsWith('--')||!argv[i+1]||argv[i+1].startsWith('--'))throw new Error('引数は --名前 値 で指定してください。');const key=argv[i].slice(2);if(!['root','brief','client','preset','mode','patch','revision','destination','proposal','secret-revision'].includes(key)||Object.hasOwn(flags,key))throw new Error('未対応または重複した引数です。');flags[key]=argv[i+1];}
 const root=path.resolve(flags.root||factoryRoot);const required=(key:string)=>{if(!flags[key])throw new Error(`--${key} が必要です。`);return flags[key];};
 if(command==='validate'){if(flags.mode&&!['draft','publish'].includes(flags.mode))throw new Error('modeはdraftまたはpublishです。');const result=validateBrief(await json(required('brief')),{mode:flags.mode==='publish'?'publish':'draft'});if(result.issues.length)process.exitCode=1;return result;}
 if(command==='propose'){const b=await json(required('brief'));const check=validateBrief(b,{mode:'draft'});if(!check.site)throw new Error(JSON.stringify(check.issues));return prepareProposal(check.site);}
 if(command==='validate-proposal')return validateProposal(await json(required('proposal')),{brief:await json(required('brief'))});
 if(command==='create')return createClient({root,clientId:required('client'),brief:await json(required('brief')),presetId:required('preset')});
 if(command==='update'||command==='plan-update')return updateClient({root,clientId:required('client'),patch:await json(required('patch')),expectedRevision:required('revision'),dryRun:command==='plan-update'});
 if(command==='export')return exportClient({root,clientId:required('client'),destination:required('destination')});
 if(command==='prepare-release')return prepareRelease({clientRoot:path.join(root,'clients',required('client')),outputRoot:path.join(root,'releases'),secretRevision:required('secret-revision')});
 if(command==='verify-release'){const id=required('destination');if(!/^[a-f0-9]{24}$/.test(id))throw new Error('候補IDが不正です。');return verifyRelease({releaseRoot:path.join(root,'releases',id)});}
 if(command==='report')return buildClientReport(root);
 throw new Error('コマンド: validate / propose / validate-proposal / create / plan-update / update / report / export');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main(process.argv.slice(2)).then(r=>process.stdout.write(JSON.stringify(r,null,2)+'\n')).catch(e=>{process.stderr.write(e.message+'\n');process.exitCode=1;});
