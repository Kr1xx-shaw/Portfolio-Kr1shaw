let keyCache={};
const decodePart=s=>JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'=')),c=>c.charCodeAt(0))));
async function owner(req,env){
 const team=String(env.CF_ACCESS_TEAM_DOMAIN||'').trim().replace(/\/$/,'');
 const aud=String(env.CF_ACCESS_AUD||'').trim();const email=String(env.ADMIN_EMAIL||'').trim().toLowerCase();
 if(!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/i.test(team)||!aud||!email)return false;
 const cookie=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('CF_Authorization='));
 const token=req.headers.get('Cf-Access-Jwt-Assertion')||cookie?.slice('CF_Authorization='.length);
 if(!token)return false;
 try{
  const parts=token.split('.');if(parts.length!==3)return false;
  const header=decodePart(parts[0]),claims=decodePart(parts[1]);const now=Math.floor(Date.now()/1000);
  if(header.alg!=='RS256'||!header.kid||claims.iss!==team||!Array.isArray(claims.aud)||!claims.aud.includes(aud)||typeof claims.exp!=='number'||claims.exp<=now||(claims.nbf&&claims.nbf>now)||String(claims.email||'').toLowerCase()!==email)return false;
  if(!keyCache[team]||keyCache[team].until<Date.now()||!keyCache[team].keys.some(k=>k.kid===header.kid)){
   const response=await fetch(team+'/cdn-cgi/access/certs');if(!response.ok)return false;
   const data=await response.json();if(!Array.isArray(data.keys))return false;keyCache[team]={keys:data.keys,until:Date.now()+300000};
  }
  const jwk=keyCache[team].keys.find(k=>k.kid===header.kid&&k.kty==='RSA');if(!jwk)return false;
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const sig=Uint8Array.from(atob(parts[2].replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(parts[2].length/4)*4,'=')),c=>c.charCodeAt(0));
  return await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,sig,new TextEncoder().encode(parts[0]+'.'+parts[1]));
 }catch{return false}
}
const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function handle(request,env,assets,ctx){
 const url=new URL(request.url),path=url.pathname;
 try{
 if(path==='/api/me')return json({owner:await owner(request,env)});
 if(path==='/api/health')return json({storage:!!env.BUCKET});
 if(path==='/api/projects'&&request.method==='GET'){
  if(!env.BUCKET)return json({error:'项目存储尚未就绪'},503);
  let objects=[],cursor;do{const list=await env.BUCKET.list({prefix:'projects/',cursor});objects.push(...list.objects);cursor=list.truncated?list.cursor:undefined}while(cursor);
  const entries=await Promise.all(objects.map(async o=>{const v=await env.BUCKET.get(o.key);return v?JSON.parse(await v.text()):null}));
  return json(entries.filter(Boolean).sort((a,b)=>a.created.localeCompare(b.created)));
 }
 if(path==='/api/projects'&&request.method==='POST'){
  if(!await owner(request,env))return json({error:'只有网站所有者可以提交项目，请先登录。'},403);
  if(request.headers.get('origin')!==url.origin)return json({error:'请求来源不匹配'},403);
  if(!env.BUCKET)return json({error:'项目存储尚未就绪'},503);
  const bytes=await request.arrayBuffer();if(bytes.byteLength>33*1024*1024)return json({error:'图片总计不能超过 32MB'},413);
  let form;try{form=await new Response(bytes,{headers:{'content-type':request.headers.get('content-type')}}).formData()}catch{return json({error:'请使用项目上传表单提交'},400)}
  const fields={};for(const [key,max] of [['title',80],['tags',160],['summary',300],['description',6000]]){const v=form.get(key);if(typeof v!=='string'||!v.trim()||v.length>max)return json({error:'请填写完整的项目标题、类别与说明，并检查字数。'},400);fields[key]=v.trim()}
  const files=form.getAll('images');if(!files.length||files.length>8||files.some(f=>typeof f==='string'||!f.size||f.size>8*1024*1024)||files.reduce((a,f)=>a+f.size,0)>32*1024*1024)return json({error:'请选择 1–8 张图片，每张最多 8MB，总计最多 32MB。'},400);
  const payload=[];for(const file of files){const data=new Uint8Array(await file.arrayBuffer());let mime=null;if(data[0]===255&&data[1]===216&&data[2]===255)mime='image/jpeg';if(data[0]===137&&data[1]===80&&data[2]===78&&data[3]===71)mime='image/png';if(new TextDecoder().decode(data.slice(0,4))==='RIFF'&&new TextDecoder().decode(data.slice(8,12))==='WEBP')mime='image/webp';if(!mime)return json({error:'只支持 JPG、PNG 和 WebP 图片。'},400);payload.push({data,mime})}
  const id=crypto.randomUUID(),saved=[];try{for(let i=0;i<payload.length;i++){const key=`media/${id}/${i}`;await env.BUCKET.put(key,payload[i].data,{httpMetadata:{contentType:payload[i].mime}});saved.push(key)}
   const p={id,title:fields.title,tags:fields.tags,summary:fields.summary,description:fields.description.split(/\n+/).filter(Boolean),category:[],number:'NEW',cover:'/'+saved[0],gallery:saved.map((k,i)=>['/'+k,fields.title+' / '+(i+1)]),custom:true,created:new Date().toISOString()};
   await env.BUCKET.put('projects/'+id+'.json',JSON.stringify(p),{httpMetadata:{contentType:'application/json'}});return json(p,201);
  }catch(e){await Promise.allSettled(saved.map(k=>env.BUCKET.delete(k)));throw e}
 }
 if(path.startsWith('/api/'))return json({error:'接口不存在'},404);
 if(path.startsWith('/media/')){if(!env.BUCKET)return json({error:'项目存储尚未就绪'},503);if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});const obj=await env.BUCKET.get(path.slice(1));if(!obj)return new Response('Not found',{status:404});return new Response(request.method==='HEAD'?null:obj.body,{headers:{'Content-Type':obj.httpMetadata?.contentType||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'private, max-age=3600'}})}
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const route=path==='/'||path==='/work'||path==='/about'||path==='/admin'||path.startsWith('/project/')?'/index.html':path;
 if(env.ASSETS){const target=new URL(request.url);target.pathname=route;return env.ASSETS.fetch(new Request(target,request));}
 const entry=assets[route];if(!entry)return new Response('Not found',{status:404});
 const headers={'Content-Type':entry.type,'X-Content-Type-Options':'nosniff','Cache-Control':route.startsWith('/assets/')?'public,max-age=86400':'no-cache, must-revalidate','Referrer-Policy':'strict-origin-when-cross-origin','ETag':entry.etag};
 if(request.headers.get('If-None-Match')===entry.etag)return new Response(null,{status:304,headers});
 const body=request.method==='HEAD'?null:Uint8Array.from(atob(entry.data),c=>c.charCodeAt(0));
 const response=new Response(body,{headers});
 return response;
 }catch(e){console.error('Portfolio request failed',e.message);return json({error:'保存暂时失败，请稍后重试。'},500)}
}

export default {fetch:(request,env,ctx)=>handle(request,env,{},ctx)};
