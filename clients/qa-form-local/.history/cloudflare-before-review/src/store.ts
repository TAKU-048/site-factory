import type {Database,ValidatedContact,Receipt} from './types.ts';
export class Conflict extends Error {}
export function escapeHtml(value:string){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
export class ContactStore {
 db:Database;constructor(db:Database){this.db=db}
 async find(id:string):Promise<Receipt|null>{return this.db.prepare('SELECT id AS receiptId,payload_hash AS payloadHash FROM inquiries WHERE request_id=?').bind(id).first<Receipt>()}
 async accept(input:ValidatedContact):Promise<{receiptId:string;duplicate:boolean}>{
 const {requestId,payloadHash,fields,now,config}=input;const id=crypto.randomUUID();
 const payload={from:config.from,to:config.to,reply_to:fields.email,subject:`${config.clientId} お問い合わせ受付 ${id}`,html:Object.entries(fields).map(([k,v])=>`<p><strong>${escapeHtml(k)}</strong><br>${escapeHtml(v).replace(/\n/g,'<br>')}</p>`).join('')};
 await this.db.batch([
 this.db.prepare('INSERT INTO inquiries (id,request_id,payload_hash,fields,created_at) VALUES (?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING').bind(id,requestId,payloadHash,JSON.stringify(fields),now),
 this.db.prepare('INSERT INTO outbox (id,payload,idempotency_key,created_at,next_at,updated_at) SELECT id,?,?,?, ?,? FROM inquiries WHERE request_id=? AND payload_hash=? ON CONFLICT(id) DO NOTHING').bind(JSON.stringify(payload),`contact/${id}`,now,now,now,requestId,payloadHash)
 ]);
 const found=await this.find(requestId);if(!found)throw Error('save failed');if(found.payloadHash!==payloadHash)throw new Conflict('request conflict');
 return {receiptId:found.receiptId,duplicate:found.receiptId!==id};
 }
}
