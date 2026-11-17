import * as THREE from 'three';
import {GLTFLoader} from './GLTFLoader.js';
import {RoomEnvironment} from './RoomEnvironment.js';

const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const spring=x=>x<=0?0:x>=1?1:1-Math.exp(-7*x)*Math.cos(9*x);
const tools=[
 {name:'Figma',icon:'figma',x:29,y:23,r:-13,theme:'figma'},
 {name:'Photoshop',text:'Ps',x:16,y:49,r:-11,theme:'ps'},
 {name:'Illustrator',text:'Ai',x:48,y:48,r:12,theme:'ai'},
 {name:'Codex',icon:'codex',x:70,y:22,r:12,theme:'codex'},
 {name:'Seedance',text:'Seedance',x:83,y:49,r:13,theme:'seedance'},
 {name:'Suno',icon:'suno',x:33,y:76,r:12,theme:'suno'},
 {name:'剪映',icon:'capcut',x:64,y:76,r:-9,theme:'capcut'}
];
export function mountIntro(app){
 document.body.classList.add('has-intro');
 app.innerHTML=`<section class="intro-track" aria-label="滚轮互动开场"><div class="intro-stage">
 <div class="camera-act"><div class="intro-halo"></div><div class="intro-heading"><span class="intro-kicker">XICHEN ZHAO / SELECTED WORK</span><h1>PORTFOLIO</h1></div><div class="camera-canvas" role="img" aria-label="Canon EOS RP 真实三维相机，背面视角"><span class="model-status" role="status">正在加载三维相机…</span></div><div class="camera-caption">A different way<br>of seeing.</div><details class="model-credit"><summary>模型来源 ↗</summary><p><a href="https://sketchfab.com/3d-models/canon-eos-rp-mirrorless-camera-3d-model-cd470005397c48ec8b68bb8a4609ecd1" target="_blank" rel="noopener">Canon EOS RP — fahadratul</a><br><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a> · 纹理优化与背面展示</p></details></div>
 <div class="tool-act" aria-hidden="true"><span class="tool-chapter">02 / CREATIVE TOOLKIT</span><div class="tool-floor"></div>${tools.map(t=>`<div class="app-tile-position" style="--tile-x:${t.x}%;--tile-y:${t.y}%;--tile-angle:${t.r}deg" data-tool="${t.name}"><div class="app-tile ${t.theme}" tabindex="-1" role="img" aria-label="${t.name}">${t.icon?`<img src="/assets/icon-${t.icon}.svg" alt="" draggable="false">`:`<span class="tile-letter">${t.text}</span>`}<span class="tile-edge"></span></div><span class="tile-name">${t.name}</span></div>`).join('')}</div>
 <div class="intro-room" aria-hidden="true"><a class="scene-hotspot hotspot-hyper" href="/project/hypertype" aria-label="查看 Hypertype"><span>HYPERTYPE ↗</span></a><a class="scene-hotspot hotspot-wass" href="/project/wass-fresh" aria-label="查看 WASS Fresh"><span>WASS Fresh ↗</span></a><a class="scene-hotspot hotspot-interception" href="/project/interception" aria-label="查看 Interception"><span>INTERCEPTION ↗</span></a><button class="intro-restart">↑ 返回开场</button></div>
 <div class="intro-scroll"><span class="scroll-mouse"></span><span class="scroll-label">向下滚动 · SCROLL TO EXPLORE</span></div><div class="intro-chapters" aria-label="开场章节"><button aria-label="相机开场" class="active"></button><button aria-label="软件图标"></button><button aria-label="作品展厅"></button></div><button class="skip-intro">进入展厅 ↗</button>
 </div></section>`;
 const root=app.querySelector('.intro-track'),stage=root.firstElementChild,camAct=root.querySelector('.camera-act'),toolAct=root.querySelector('.tool-act'),room=root.querySelector('.intro-room'),canvasHost=root.querySelector('.camera-canvas'),status=root.querySelector('.model-status'),tiles=[...root.querySelectorAll('.app-tile-position')],dots=[...root.querySelectorAll('.intro-chapters button')],scrollHint=root.querySelector('.intro-scroll');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let alive=true,renderer=null,screenRenderer=null,scene=null,view=null,model=null,raf=0,p=0,px=0,py=0,last=-1,modelScale=1;
 const progress=()=>clamp((parseFloat(getComputedStyle(stage).top)-root.getBoundingClientRect().top)/Math.max(1,root.offsetHeight-stage.offsetHeight));
 const jump=value=>window.scrollTo({top:root.offsetTop+(root.offsetHeight-stage.offsetHeight)*value-parseFloat(getComputedStyle(stage).top),behavior:reduce?'instant':'smooth'});
 root.querySelector('.skip-intro').onclick=()=>jump(1);root.querySelector('.intro-restart').onclick=()=>jump(0);
 dots.forEach((b,i)=>b.onclick=()=>jump([0,.64,1][i]));
 function update(){
  p=progress();const cameraFade=1-smooth((p-.28)/.09),toolsOpacity=smooth((p-.30)/.09)*(1-smooth((p-.79)/.07)),roomOpacity=smooth((p-.83)/.12);
  camAct.style.opacity=cameraFade;camAct.style.visibility=cameraFade<.001?'hidden':'visible';toolAct.style.opacity=toolsOpacity;toolAct.style.visibility=toolsOpacity<.001?'hidden':'visible';toolAct.setAttribute('aria-hidden',toolsOpacity<.5);room.style.opacity=roomOpacity;room.style.visibility=roomOpacity<.001?'hidden':'visible';room.style.transform=`scale(${1.07-.07*roomOpacity})`;room.setAttribute('aria-hidden',roomOpacity<.5);
  const interactiveRoom=roomOpacity>.8;room.style.pointerEvents=interactiveRoom?'auto':'none';room.querySelectorAll('a,button').forEach(a=>a.tabIndex=interactiveRoom?0:-1);
  tiles.forEach((el,i)=>{const t=tools[i],entry=clamp((p-.315-i*.024)/.19),s=reduce?entry:spring(entry),exit=smooth((p-.75-i*.006)/.105),rise=(1-s)*stage.offsetHeight*.95-exit*stage.offsetHeight*1.3;el.style.transform=`translate(-50%,calc(-50% + ${rise}px))`;el.style.opacity=clamp(entry*5)*(1-exit);const face=el.firstElementChild;face.tabIndex=toolsOpacity>.6&&entry>.3&&exit<.1?0:-1;face.style.transform=`perspective(1000px) rotateX(${reduce?0:9+(1-entry)*20}deg) rotateY(${reduce?0:(i%2?12:-12)}deg) rotateZ(${reduce?0:t.r+(1-s)*20-exit*15}deg) scale(${.8+.2*s})`});
  const chapter=p<.33?0:p<.85?1:2;dots.forEach((b,i)=>{b.classList.toggle('active',i===chapter);b.setAttribute('aria-current',i===chapter?'step':'false')});scrollHint.style.opacity=p>.93?0:1;scrollHint.querySelector('.scroll-label').textContent=chapter===0?'向下滚动 · SCROLL TO EXPLORE':'继续滚动 · SCROLL TO EXPLORE';root.querySelector('.skip-intro').style.opacity=interactiveRoom?0:1;root.querySelector('.skip-intro').tabIndex=interactiveRoom?-1:0;
  const zoom=smooth((p-.06)/.18);canvasHost.style.transform='none';if(renderer)renderer.domElement.style.filter=`blur(${zoom*14}px)`;for(const el of root.querySelectorAll('.intro-heading,.camera-caption,.intro-halo')){el.style.filter=`blur(${zoom*8}px)`;el.style.opacity=1-smooth(p/.23)}
  return zoom;
 }
 function draw(){if(!alive)return;const zoom=update();if(renderer&&model&&p<.38){model.rotation.set(0,Math.PI,0);model.scale.setScalar(modelScale);view.position.set(0,0,4.4*Math.max(1,1.4/view.aspect));view.lookAt(0,0,0);view.layers.set(0);renderer.render(scene,view);if(screenRenderer){view.layers.set(1);screenRenderer.render(scene,view)}}raf=requestAnimationFrame(draw)}
 const resize=()=>{if(renderer){const w=canvasHost.clientWidth,h=canvasHost.clientHeight;renderer.setSize(w,h,false);screenRenderer?.setSize(w,h,false);view.aspect=w/h;view.updateProjectionMatrix()}};
 const onPointer=e=>{px=(e.clientX/innerWidth-.5);py=(e.clientY/innerHeight-.5)};
 window.addEventListener('resize',resize);stage.addEventListener('pointermove',onPointer);draw();
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;renderer.domElement.className='camera-body-render';canvasHost.append(renderer.domElement);screenRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true});screenRenderer.setPixelRatio(Math.min(devicePixelRatio,1.75));screenRenderer.setClearColor(0x000000,0);screenRenderer.domElement.className='camera-screen-render';canvasHost.append(screenRenderer.domElement);scene=new THREE.Scene();view=new THREE.PerspectiveCamera(34,1,.01,100);const pmrem=new THREE.PMREMGenerator(renderer),envRoom=new RoomEnvironment();const env=pmrem.fromScene(envRoom,.04);scene.environment=env.texture;envRoom.dispose();pmrem.dispose();scene.add(new THREE.HemisphereLight(0xffffff,0x444444,2));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,5,4);scene.add(key);const rim=new THREE.DirectionalLight(0xdde4ed,2);rim.position.set(4,2,-2);scene.add(rim);resize();
  new GLTFLoader().load('/assets/canon-eos-rp.glb',g=>{if(!alive){g.scene.traverse(o=>{o.geometry?.dispose()});return}const obj=g.scene;const box=new THREE.Box3().setFromObject(obj),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());obj.position.sub(center);const normalizer=new THREE.Group();normalizer.add(obj);normalizer.scale.setScalar(2.65/Math.max(size.x,size.y,size.z));model=new THREE.Group();model.add(normalizer);scene.add(model);
   normalizer.updateMatrixWorld(true);const hit=new THREE.Raycaster(new THREE.Vector3(.30,-.29,-10),new THREE.Vector3(0,0,1)).intersectObject(normalizer,true)[0];if(hit){const preview=document.createElement('canvas');preview.width=1536;preview.height=1024;const context=preview.getContext('2d');context.fillStyle='#080808';context.fillRect(0,0,1536,1024);const tex=new THREE.CanvasTexture(preview);tex.colorSpace=THREE.SRGBColorSpace;const screenImage=new Image();screenImage.onload=()=>{if(!alive)return;const sy=Math.round(screenImage.height*88/720),sh=screenImage.height-sy,k=Math.min(1536/screenImage.width,1024/sh),w=screenImage.width*k,h=sh*k;context.drawImage(screenImage,0,sy,screenImage.width,sh,(1536-w)/2,(1024-h)/2,w,h);tex.needsUpdate=true};screenImage.src='/assets/toolkit-preview.png';const lcd=new THREE.Mesh(new THREE.PlaneGeometry(1.50,1.02),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));lcd.layers.set(1);lcd.rotation.y=Math.PI;lcd.position.set(.30,-.29,hit.point.z-.008);model.add(lcd)}
   status.hidden=true;canvasHost.dataset.loaded='true'},undefined,()=>{status.textContent='相机加载未完成，请刷新重试';canvasHost.dataset.loaded='error'});
 }catch{status.textContent='当前浏览器不支持三维显示，可继续滚动查看';canvasHost.dataset.loaded='unsupported'}
 return()=>{alive=false;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);stage.removeEventListener('pointermove',onPointer);document.body.classList.remove('has-intro');if(scene){scene.environment?.dispose();scene.traverse(o=>{o.geometry?.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m){Object.values(m).forEach(v=>{if(v?.isTexture)v.dispose()});m.dispose()}})})}renderer?.dispose();screenRenderer?.dispose()};
}



