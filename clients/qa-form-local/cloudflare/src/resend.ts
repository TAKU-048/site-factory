import type {NotificationSender,NotificationJob,SendResult} from './types.ts';
export class ResendSender implements NotificationSender {
 key:string;transport:typeof fetch;endpoint:string;
 constructor(key:string,transport:typeof fetch,endpoint='https://api.resend.com/emails'){this.key=key;this.transport=transport;this.endpoint=endpoint}
 async send(job:NotificationJob):Promise<SendResult>{try{const r=await this.transport(this.endpoint,{method:'POST',headers:{Authorization:`Bearer ${this.key}`,'Content-Type':'application/json','Idempotency-Key':job.key},body:JSON.stringify(job.payload),signal:AbortSignal.timeout(10000)});if(r.ok){const body=await r.json() as {id?:string};return typeof body.id==='string'&&body.id?{kind:'accepted',providerId:body.id}:{kind:'uncertain'}}if(r.status===429||r.status>=500){const h=r.headers.get('Retry-After');let retryAfterMs=h?(Number.isFinite(Number(h))?Number(h)*1000:Math.max(0,Date.parse(h)-Date.now())):0;if(!Number.isFinite(retryAfterMs))retryAfterMs=0;return {kind:'retryable',retryAfterMs}}return {kind:'permanent'}}catch{return {kind:'uncertain'}}}
}
