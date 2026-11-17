import {mountPaperBackground} from '/assets/paper-background.js?v=33-global-pointer';
import {portfolioShell} from '/assets/portfolio-shell.js?v=13-shared-shell';
export function mountPortfolio(app,items,{work=false}={}){
 document.body.classList.add('portfolio-mode');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const url=p=>'/project/'+encodeURIComponent(p.id);
 const image=p=>p.cover.startsWith('/media/')?p.cover:'/assets/'+p.cover+'.webp';
 const summaries={hypertype:'An exploration of letterforms through typography, print and motion.','wass-fresh':'A seasonal produce brand connecting packaging and digital experiences.',interception:'Playful characters bringing plant-based food closer to everyday life.',stockopoly:'Turning financial decisions and emotions into a playable experience.',seahi:'Connecting seafood shopping, information and character design.',greenhouse:'An interactive spatial narrative exploring protection and control.'};
 app.innerHTML=`<div class="portfolio-track"><section class="portfolio-stage" aria-label="Selected work"><div class="work-surface">${portfolioShell('work')}<div class="work-meta"><dl><dt>Project</dt><dd class="meta-title"></dd><dt>Role</dt><dd class="meta-role"></dd></dl><dl class="meta-context"><dt>Context</dt><dd>Selected work</dd><dt>Focus</dt><dd class="meta-focus"></dd></dl></div><div class="work-art" aria-label="项目封面"></div><nav class="work-index" aria-label="选择项目">${items.map((p,i)=>`<button data-select="${i}" aria-label="查看 ${esc(p.title)}"><span class="index-category">${esc(p.tags.split(' / ')[0])}</span><strong>${esc(p.title)}</strong><span class="index-rule">—</span><span class="index-summary">${esc(summaries[p.id]||p.summary)}</span></button>`).join('')}</nav><div class="work-count"><span>Selected work</span><b>01</b><small>/${String(items.length).padStart(2,'0')}</small></div><div class="work-controls"><button class="work-prev" aria-label="上一个项目">↑</button><button class="work-next" aria-label="下一个项目">↓</button></div><a class="view-project">View project ↗</a><span class="work-scroll">Scroll</span><a class="work-owner" href="/admin">Manage</a></div><section class="landing-cover" aria-label="Xichen Zhao — Kris Shaw"><div class="hero-paper-background" aria-hidden="true"></div><div class="hero-art"><img class="hero-avatar" src="/assets/home-avatar.png" alt="Kris Shaw 的 3D 人偶" fetchpriority="high" draggable="false"></div><button class="hero-enter" aria-label="向下拉开首页进入作品页"></button></section><div class="hero-title-layer"><div class="hero-art"><div class="hero-name"><h1>XICHEN<br>ZHAO</h1><p>KRIS SHAW</p></div></div></div></section></div>`;
 const track=app.querySelector('.portfolio-track'),stage=app.querySelector('.portfolio-stage'),cover=app.querySelector('.landing-cover'),titleLayer=app.querySelector('.hero-title-layer'),art=app.querySelector('.work-art'),index=[...app.querySelectorAll('[data-select]')];
 const disposeBackground=mountPaperBackground(app.querySelector('.hero-paper-background'),{home:true});
 const workStart=1.5,projectStep=.32;
 track.style.height=((workStart+projectStep*Math.max(0,items.length-1)+1)*100)+'dvh';
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 art.innerHTML=items.map((p,j)=>p.imagesPending?'':`<a class="project-paper" data-paper="${j}" href="${url(p)}" aria-label="打开 ${esc(p.title)}"><img src="${image(p)}" alt="${esc(p.title)}" draggable="false" loading="${j<2?'eager':'lazy'}"></a>`).join('');
 const papers=[...art.querySelectorAll('[data-paper]')];
 let active=-1,frame=0,disposed=false,drag=null,projectDrag=null,shown=null,lastTime=0,lastShown=0,snapTimer=0,lastPosition=0,wheelTimer=0,wheelBusy=false,wheelDelta=0,wheelGoal=0;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function choose(i){if(i===active)return;active=i;const p=items[i];index.forEach((n,j)=>{n.classList.toggle('active',j===i);n.setAttribute('aria-current',j===i?'true':'false')});app.querySelector('.meta-title').textContent=p.title;app.querySelector('.meta-role').textContent=p.tags.split(' / ')[0];app.querySelector('.meta-focus').innerHTML=p.tags.split(' / ').map(esc).join('<br>');app.querySelector('.work-count b').textContent=String(i+1).padStart(2,'0');app.querySelector('.view-project').href=url(p);app.querySelector('.work-prev').disabled=i===0;app.querySelector('.work-next').disabled=i===items.length-1;}
 function layoutPapers(progress,velocity){
  const width=stage.clientWidth,height=stage.clientHeight,mobile=width<=700;
  for(const node of papers){
   const d=Number(node.dataset.paper)-progress,distance=Math.abs(d),visible=distance<2.2;
   node.hidden=!visible;node.inert=distance>.55;
   if(!visible)continue;
   const x=d<0?-d*width*.095:-d*width*.155;
   const y=d*height*(d<0?.47:.52);
   const bend=reducedMotion.matches?0:clamp(velocity*55,-9,9);
   node.style.transform=mobile?`translate3d(0,${d*height*.7}px,0)`:`translate3d(${x}px,${y}px,${-distance*width*.018}px) rotateX(${bend}deg) rotateY(${-5+d*17}deg) rotateZ(${1+(d<0?-d*4:d*8)+bend*.15}deg)`;
   node.style.opacity=String(mobile?clamp(1-distance,0,1):clamp((2.2-distance)/.5,0,1));
   node.style.zIndex=String(20-Math.round(distance*5));
  }
  if(!mobile){index.forEach((node,j)=>{const d=j-progress;node.style.transform=`translate3d(0,${d*height*.177}px,0) translateY(-50%)`;node.style.opacity=String(.18+.82*Math.pow(Math.max(0,1-Math.abs(d)),2));node.style.visibility=Math.abs(d)>3?'hidden':'visible'})}
  else index.forEach(node=>{node.style.transform='';node.style.opacity='';node.style.visibility=''})
 }
 function render(time=performance.now()){
  frame=0;if(disposed)return;
  const pos=Math.max(0,-track.getBoundingClientRect().top)/innerHeight,pull=clamp(pos,0,1);
  lastPosition=pos;
  cover.style.transform=`translate3d(0,${pull*100}%,0)`;cover.style.visibility=pull>=1?'hidden':'visible';cover.inert=pull>=1;
  const fade=clamp((pos-1)/(workStart-1),0,1),eased=fade*fade*(3-2*fade);
  titleLayer.hidden=fade>=1;titleLayer.style.opacity=String(1-eased);titleLayer.style.filter=`blur(${eased*18}px)`;
  const target=clamp((pos-workStart)/projectStep,0,items.length-1),dt=lastTime?Math.min(64,time-lastTime):16.67;
  if(shown===null||reducedMotion.matches)shown=reducedMotion.matches?Math.round(target):target;
  else shown+=(target-shown)*(1-Math.pow(1-.075,dt/16.67));
  if(Math.abs(target-shown)<.0005)shown=target;
  const velocity=(shown-lastShown)*16.67/Math.max(dt,1);lastTime=time;lastShown=shown;
  choose(clamp(Math.round(shown),0,items.length-1));layoutPapers(shown,velocity);
  if(Math.abs(target-shown)>.0005)schedule();
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(render)}
 function go(i,smooth=true){const next=clamp(i,0,items.length-1),y=window.scrollY+track.getBoundingClientRect().top+(workStart+next*projectStep)*innerHeight;wheelGoal=next;if(!smooth)shown=next;window.scrollTo({top:y,behavior:smooth&&!reducedMotion.matches?'smooth':'instant'});schedule()}
 app.querySelector('.hero-enter').onclick=()=>go(0);
 index.forEach((n,i)=>n.onclick=()=>go(i));app.querySelector('.work-prev').onclick=()=>go(active-1);app.querySelector('.work-next').onclick=()=>go(active+1);
 cover.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={y:e.clientY,scroll:scrollY,moved:false}});
 cover.addEventListener('pointermove',e=>{if(!drag)return;if(!drag.moved&&Math.abs(e.clientY-drag.y)>5){drag.moved=true;cover.setPointerCapture(e.pointerId)}if(drag.moved)window.scrollTo({top:drag.scroll+Math.max(0,e.clientY-drag.y)*2,behavior:'instant'})});
 cover.addEventListener('pointerup',e=>{if(drag&&Math.abs(e.clientY-drag.y)>12){e.preventDefault();e.stopPropagation()}drag=null});
 cover.addEventListener('pointercancel',()=>drag=null);
 const surface=app.querySelector('.work-surface');
 function projectDown(e){if(e.button!==0||!titleLayer.hidden||e.target.closest('.site-chrome,.work-controls,.work-owner,.view-project'))return;projectDrag={y:e.clientY,scroll:scrollY,moved:false,id:e.pointerId};clearTimeout(snapTimer)}
 function projectMove(e){if(!projectDrag)return;const dy=e.clientY-projectDrag.y;if(Math.abs(dy)>6&&!projectDrag.moved){projectDrag.moved=true;surface.setPointerCapture(e.pointerId)}if(projectDrag.moved)window.scrollTo({top:projectDrag.scroll-dy*1.6,behavior:'instant'})}
 function projectUp(){if(!projectDrag)return;const moved=projectDrag.moved;projectDrag=null;if(moved){const pos=Math.max(0,-track.getBoundingClientRect().top)/innerHeight;go(Math.round((pos-workStart)/projectStep))}}
 surface.addEventListener('pointerdown',projectDown);surface.addEventListener('pointermove',projectMove);surface.addEventListener('pointerup',projectUp);surface.addEventListener('pointercancel',projectUp);
 let suppressClick=false;
 surface.addEventListener('pointermove',()=>{if(projectDrag?.moved)suppressClick=true});
 surface.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false}},true);
 function onScroll(){schedule();clearTimeout(snapTimer);if(projectDrag||reducedMotion.matches)return;snapTimer=setTimeout(()=>{if(disposed||projectDrag)return;const pos=Math.max(0,-track.getBoundingClientRect().top)/innerHeight;if(pos<workStart-.05)return;const raw=(pos-workStart)/projectStep;if(Math.abs(raw-Math.round(raw))>.015)go(Math.round(raw))},180)}
 function onWheel(e){
  if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||projectDrag)return;
  const pos=Math.max(0,-track.getBoundingClientRect().top)/innerHeight;
  if(pos<workStart-.04)return;
  if(wheelGoal===0&&e.deltaY<0&&!wheelBusy)return;
  e.preventDefault();clearTimeout(wheelTimer);
  wheelTimer=setTimeout(()=>{wheelBusy=false;wheelDelta=0},160);
  if(wheelBusy)return;
  wheelDelta+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
  if(Math.abs(wheelDelta)<18)return;
  const next=clamp(wheelGoal+Math.sign(wheelDelta),0,items.length-1);
  wheelBusy=true;wheelDelta=0;go(next);
 }
 function onResize(){const top=scrollY+track.getBoundingClientRect().top;window.scrollTo({top:top+lastPosition*innerHeight,behavior:'instant'});schedule()}
 const onKey=e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();go(titleLayer.hidden?active+1:0)}if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();if(active===0)window.scrollTo({top:0,behavior:'smooth'});else go(active-1)}};
 window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onResize);window.addEventListener('keydown',onKey);window.addEventListener('wheel',onWheel,{passive:false});
 render();if(work)requestAnimationFrame(()=>go(0,false));
 return ()=>{disposeBackground();disposed=true;document.body.classList.remove('portfolio-mode');cancelAnimationFrame(frame);clearTimeout(snapTimer);clearTimeout(wheelTimer);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onResize);window.removeEventListener('keydown',onKey);window.removeEventListener('wheel',onWheel)};
}
