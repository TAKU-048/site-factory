import {test} from 'node:test';import assert from 'node:assert/strict';import {ResendSender} from '../src/resend.ts';
const job:any={id:'receipt',payload:{from:'forms@example.invalid',to:'owner@example.invalid',reply_to:'visitor@example.invalid',subject:'受付',html:'<p>内容</p>'},key:'contact/receipt',firstAttempt:0,attempts:1,lease:'l'};
test('Resend adapter preserves fixed destination and key, and classifies API outcomes',async()=>{
 for(const [status,body,want]of [[200,{id:'mail-1'},'accepted'],[429,{},'retryable'],[500,{},'retryable'],[422,{},'permanent'],[200,{},'uncertain']] as any[]){let sent:any;const sender=new ResendSender('not-a-real-key',async(_url:any,opts:any)=>{sent=opts;return Response.json(body,{status,headers:{'Retry-After':'60'}})});const r=await sender.send(job);assert.equal(r.kind,want);assert.equal(sent.headers['Idempotency-Key'],'contact/receipt');assert.equal(JSON.parse(sent.body).to,'owner@example.invalid');if(status===429)assert.equal((r as any).retryAfterMs,60000)}
 const timeout=new ResendSender('test',async()=>{throw Error('timeout')});assert.equal((await timeout.send(job)).kind,'uncertain');
});
