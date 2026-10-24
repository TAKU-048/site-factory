export interface Statement {bind(...values:unknown[]):Statement;first<T=any>():Promise<T|null>;all<T=any>():Promise<{results:T[]}>;run():Promise<{meta:{changes:number}}>}
export interface Database {prepare(sql:string):Statement;batch(statements:Statement[]):Promise<unknown>}
export interface Config {mode:'local'|'production';adapter:'local'|'production';origin:string;hostname:string;fields:string[];from:string;to:string;clientId:string}
export interface ValidatedContact {requestId:string;payloadHash:string;fields:Record<string,string>;now:number;config:Config}
export interface Receipt {receiptId:string;payloadHash:string}
export interface RateGate {allow(key:string):Promise<boolean>}
export interface ContactDeps {config:Config;store:{find(id:string):Promise<Receipt|null>;accept(input:ValidatedContact):Promise<{receiptId:string;duplicate:boolean}>};now():number;rate:RateGate;rateKey(request:Request):Promise<string>;verify(token:string):Promise<{success:boolean;hostname?:string;action?:string}>}
export interface NotificationPayload {from:string;to:string;reply_to:string;subject:string;html:string}
export interface NotificationJob {id:string;payload:NotificationPayload;key:string;firstAttempt:number;attempts:number;lease:string}
export type SendResult={kind:'accepted';providerId:string}|{kind:'retryable';retryAfterMs?:number}|{kind:'permanent'}|{kind:'uncertain'};
export interface NotificationSender {send(job:NotificationJob):Promise<SendResult>}
export interface OutboxStore {claim(now:number):Promise<NotificationJob|null>;finish(job:NotificationJob,state:string,now:number,nextAt:number,providerId?:string):Promise<void>}
