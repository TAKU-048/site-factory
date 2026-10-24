import {test} from 'node:test';import assert from 'node:assert/strict';
import {handleContact} from '../src/contact.ts';import {sqlite,config,payload,request,dependencies} from './helpers.ts';
test('successful receipt is durable and a retry returns the same receipt without revalidating a used token',async()=>{
 const {store,db}=sqlite(),p=payload();let calls=0;
 const deps=dependencies(store,{verify:async()=>{calls++;return {success:calls===1,hostname:'127.0.0.1',action:'contact'}}});
 const first=await handleContact(request(p),deps);assert.equal(first.status,201);const value=await first.json();assert.deepEqual(Object.keys(value),['receiptId']);
 const second=await handleContact(request({...p,token:'used'}),deps);assert.equal(second.status,200);assert.deepEqual(await second.json(),value);assert.equal(calls,1);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM inquiries').get()!.n,1);assert.equal(db.prepare('SELECT COUNT(*) n FROM outbox').get()!.n,1);
 assert.equal((await handleContact(request({...p,fields:{...p.fields,message:'different'}}),deps)).status,409);
});
test('database failure never returns a receipt or leaves half a contact',async()=>{const s=sqlite();s.failBatch();const r=await handleContact(request(payload()),dependencies(s.store));assert.equal(r.status,503);assert.equal(s.db.prepare('SELECT COUNT(*) n FROM inquiries').get()!.n,0)});
test('rejected origin, expired token, wrong hostname/action and rate limit do not persist',async()=>{
 for(const [extra,origin,status] of [[{},'https://wrong.invalid',403],[{verify:async()=>({success:false})},config.origin,403],[{verify:async()=>({success:true,hostname:'wrong',action:'contact'})},config.origin,403],[{verify:async()=>({success:true,hostname:'127.0.0.1',action:'login'})},config.origin,403],[{rate:{allow:async()=>false}},config.origin,429]] as any[]){const s=sqlite();assert.equal((await handleContact(request(payload(),origin),dependencies(s.store,extra))).status,status);assert.equal(s.db.prepare('SELECT COUNT(*) n FROM inquiries').get()!.n,0)}
});
test('limits count actual UTF-8 bytes without trusting Content-Length',async()=>{const s=sqlite();const r=await handleContact(request({...payload(),fields:{name:'人',email:'a@example.invalid',message:'あ'.repeat(12000)}}),dependencies(s.store));assert.equal(r.status,413);assert.equal(s.db.prepare('SELECT COUNT(*) n FROM inquiries').get()!.n,0)});
test('field boundaries and header injection are rejected',async()=>{for(const changes of [{name:'a'.repeat(101)},{message:'a'.repeat(5001)},{email:'a@example.invalid\r\nBcc: victim@example.invalid'},{to:'injected@example.invalid'},{name:''}]){const s=sqlite(),p=payload();const r=await handleContact(request({...p,fields:{...p.fields,...changes}}),dependencies(s.store));assert.equal(r.status,400)}});
