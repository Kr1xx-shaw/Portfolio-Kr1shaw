const OWNER='qianzhihua7777@126.com';
const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const owner=req=>req.headers.get('oai-authenticated-user-email')?.trim().toLowerCase()===OWNER;
export async function handle(request,env,assets,ctx){
 const url=new URL(request.url),path=url.pathname;
 try{
 if(path==='/api/me')return json({owner:owner(request)});
 if(path==='/api/health')return json({storage:!!env.BUCKET});
 if(path==='/api/projects'&&request.method==='GET'){
  if(!env.BUCKET)return json({error:'项目存储尚未就绪'},503);
  let objects=[],cursor;do{const list=await env.BUCKET.list({prefix:'projects/',cursor});objects.push(...list.objects);cursor=list.truncated?list.cursor:undefined}while(cursor);
  const entries=await Promise.all(objects.map(async o=>{const v=await env.BUCKET.get(o.key);return v?JSON.parse(await v.text()):null}));
  return json(entries.filter(Boolean).sort((a,b)=>a.created.localeCompare(b.created)));
 }
 if(path==='/api/projects'&&request.method==='POST'){
  if(!owner(request))return json({error:'只有网站所有者可以提交项目，请先登录。'},403);
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
 if(path.startsWith('/media/')){if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});const obj=await env.BUCKET.get(path.slice(1));if(!obj)return new Response('Not found',{status:404});return new Response(request.method==='HEAD'?null:obj.body,{headers:{'Content-Type':obj.httpMetadata?.contentType||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'private, max-age=3600'}})}
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const route=path==='/'||path==='/work'||path==='/about'||path==='/admin'||path.startsWith('/project/')?'/index.html':path;
 const entry=assets[route];if(!entry)return new Response('Not found',{status:404});
 const headers={'Content-Type':entry.type,'X-Content-Type-Options':'nosniff','Cache-Control':route.startsWith('/assets/')?'public,max-age=86400':'no-cache, must-revalidate','Referrer-Policy':'strict-origin-when-cross-origin','ETag':entry.etag};
 if(request.headers.get('If-None-Match')===entry.etag)return new Response(null,{status:304,headers});
 const body=request.method==='HEAD'?null:Uint8Array.from(atob(entry.data),c=>c.charCodeAt(0));
 const response=new Response(body,{headers});
 return response;
 }catch(e){console.error('Portfolio request failed',e.message);return json({error:'保存暂时失败，请稍后重试。'},500)}
}
