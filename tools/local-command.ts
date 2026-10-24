export function localCommand(action:string,candidateConfig?:string):string[]{
 const candidate=action.endsWith('-candidate'),kind=action.replace(/-candidate$/,'');if(candidate&&!candidateConfig)throw Error('候補設定が必要です。');const config=candidate?candidateConfig!:'wrangler.local.jsonc',persist=candidate?'.candidate-state':'.local-state';const base=['--config',config,'--local','--persist-to',persist];
 if(kind==='dev')return ['dev',...base,'--ip','127.0.0.1','--port','4350','--test-scheduled'];
 if(kind==='migrate')return ['d1','migrations','apply','contact-local',...base];
 if(kind==='summary')return ['d1','execute','contact-local',...base,'--command','SELECT state,reason,COUNT(*) AS count,MAX(updated_at) AS lastProcessed FROM outbox GROUP BY state,reason','--json'];
 if(action==='bundle')return ['deploy','--config',config,'--dry-run','--outdir','build'];throw Error('未対応のローカル操作です。');
}
