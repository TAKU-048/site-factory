import http from 'node:http';import path from 'node:path';import fs from 'node:fs/promises';
const definitions=[['editorial',4340],['photographic',4341],['structured',4342]];
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.webp':'image/webp'};
const servers=[];
for(const [id,port] of definitions){
 const root=await fs.realpath(path.resolve('clients',`qa-edge-${id}`,'dist'));
 const server=http.createServer(async(req,res)=>{
  try{
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   let filename=path.resolve(root,'.'+pathname);if(filename!==root&&!filename.startsWith(root+path.sep))throw new Error('boundary');
   let st=await fs.stat(filename);if(st.isDirectory())filename=path.join(filename,'index.html');
   const real=await fs.realpath(filename);if(!real.startsWith(root+path.sep))throw new Error('boundary');
   const buffer=await fs.readFile(real);res.writeHead(200,{'Content-Type':types[path.extname(real)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; frame-ancestors 'none'"});res.end(req.method==='HEAD'?undefined:buffer);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('ページが見つかりません。');}
 });
 server.listen(port,'127.0.0.1',()=>console.log(`${id}: http://127.0.0.1:${port}/`));servers.push(server);
}
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{for(const s of servers)s.close();});
