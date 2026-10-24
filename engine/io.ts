import path from 'node:path';import { fileURLToPath } from 'node:url';
import {readFile,writeFile,mkdir,readdir,lstat,copyFile,open,rename} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
export const factoryRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const json=async<T=any>(file:string):Promise<T>=>JSON.parse(await readFile(file,'utf8'));
export const stringify=(value:unknown)=>JSON.stringify(value,null,2)+'\n';
export const saveJson=async(file:string,value:unknown)=>{await mkdir(path.dirname(file),{recursive:true});await writeFile(file,stringify(value));};
export const revision=(value:unknown)=>createHash('sha256').update(stringify(value)).digest('hex').slice(0,20);
export async function exists(file:string){try{await lstat(file);return true;}catch(e:any){if(e.code==='ENOENT')return false;throw e;}}
export async function copySafe(source:string,destination:string,excludedPaths:string[]=[]):Promise<number>{
 if(excludedPaths.includes(source))return 0;
 const st=await lstat(source);if(st.isSymbolicLink())throw new Error(`symlinkはコピーできません: ${path.basename(source)}`);
 if(st.isDirectory()){await mkdir(destination,{recursive:true});let count=0;for(const name of await readdir(source)){if(['node_modules','.astro','dist','.git','.history','records','.env'].includes(name)||name.startsWith('.env.'))continue;count+=await copySafe(path.join(source,name),path.join(destination,name),excludedPaths);}return count;}
 if(!st.isFile())throw new Error('通常ファイル以外は扱えません。');await mkdir(path.dirname(destination),{recursive:true});await copyFile(source,destination);return 1;
}
export async function assertNoLinks(directory:string){const s=await lstat(directory);if(s.isSymbolicLink())throw new Error('symlinkは使用できません。');if(s.isDirectory())for(const n of await readdir(directory)){if(['node_modules','.astro','dist','.git'].includes(n))continue;await assertNoLinks(path.join(directory,n));}}
export async function withClientLock<T>(dir:string,fn:()=>Promise<T>):Promise<T>{
 await assertNoLinks(dir);const lock=path.join(dir,'.operation-lock');let handle;
 try{handle=await open(lock,'wx');}catch{throw new Error('別の変更処理が進行中です。');}
 try{return await fn();}finally{await handle.close();const history=path.join(dir,'.history');if(await exists(history)&&(await lstat(history)).isSymbolicLink())throw new Error('履歴ディレクトリが不正です。');await mkdir(history,{recursive:true});await rename(lock,path.join(history,`lock-${randomUUID()}.txt`));}
}
