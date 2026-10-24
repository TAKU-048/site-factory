import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {ContactStore} from '../src/store.ts';
export function sqlite(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../migrations/0001_contact.sql',import.meta.url),'utf8'));
 db.exec(readFileSync(new URL('../migrations/0002_outbox_reason.sql',import.meta.url),'utf8'));
 let batchFailure=false;
 const binding:any={prepare(sql:string){const raw=db.prepare(sql);let values:any[]=[];const stmt:any={bind(...args:any[]){values=args;return stmt},async first(){return raw.get(...values)||null},async all(){return {results:raw.all(...values)}},async run(){const r=raw.run(...values);return {meta:{changes:Number(r.changes)}}},_run(){if(batchFailure&&sql.startsWith('INSERT INTO outbox'))throw Error('simulated failure');return raw.run(...values)}};return stmt},async batch(statements:any[]){db.exec('BEGIN');try{const rows=statements.map(s=>s._run());db.exec('COMMIT');return rows}catch(e){db.exec('ROLLBACK');throw e}}};
 return {db,store:new ContactStore(binding),binding,failBatch(){batchFailure=true}};
}
export const config={mode:'local' as const,adapter:'local' as const,origin:'http://127.0.0.1:4350',hostname:'127.0.0.1',fields:['name','email','message'],from:'通知 <forms@example.invalid>',to:'owner@example.invalid',clientId:'test-client'};
export function payload(){return {requestId:crypto.randomUUID(),token:'local-pass',fields:{name:'検証担当',email:'visitor@example.invalid',message:'相談内容'}}}
export function request(p:any,origin=config.origin){return new Request(config.origin+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(p)})}
export function dependencies(store:any,more:any={}){return {store,config,now:()=>1000000,rate:{allow:async()=>true},rateKey:async()=> 'short-hash',verify:async()=>({success:true,hostname:'127.0.0.1',action:'contact'}),...more}}
