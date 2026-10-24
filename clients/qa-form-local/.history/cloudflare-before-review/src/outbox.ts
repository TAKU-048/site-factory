import type {Database,NotificationJob} from './types.ts';
export class Outbox {
 db:Database;constructor(db:Database){this.db=db}
 async claim(now:number):Promise<NotificationJob|null>{const lease=crypto.randomUUID();const row=await this.db.prepare("UPDATE outbox SET state='sending',lease=?,lease_until=?,first_attempt=COALESCE(first_attempt,?),attempts=attempts+1,updated_at=? WHERE id=(SELECT id FROM outbox WHERE ((state IN ('pending','retrying') AND next_at<=?) OR (state='sending' AND lease_until<=?)) ORDER BY next_at,id LIMIT 1) RETURNING *").bind(lease,now+120000,now,now,now,now).first<any>();if(!row)return null;return {id:row.id,payload:JSON.parse(row.payload),key:row.idempotency_key,firstAttempt:row.first_attempt,attempts:row.attempts,lease}}
 async finish(job:NotificationJob,state:string,now:number,nextAt:number,providerId?:string){const r=await this.db.prepare('UPDATE outbox SET state=?,next_at=?,provider_id=COALESCE(?,provider_id),lease=NULL,lease_until=0,updated_at=? WHERE id=? AND lease=?').bind(state,nextAt,providerId??null,now,job.id,job.lease).run();if(r.meta.changes!==1)throw Error('lease lost')}
 async summary(){return this.db.prepare('SELECT state,COUNT(*) AS count,MAX(updated_at) AS lastProcessed FROM outbox GROUP BY state').all()}
}
