import {mountPaperBackground} from '/assets/paper-background.js?v=33-global-pointer';
import {portfolioShell} from '/assets/portfolio-shell.js?v=13-shared-shell';
const software=[['Photoshop',651],['剪映',1826],['Illustrator',940],['Seedance',1235],['Codex',360],['Suno',1535],['Figma',60]];
const interests=[
 ['Filmmaking',636,232,259,294],['Art & Design',359,256,262,272],
 ['Economics & Markets',48,224,304,304],['Gaming',905,290,334,238],
 ['Travel',1523,264,315,267],['Creative Coding',1853,258,266,272],['Basketball',1243,260,270,270]
];
const litSingles={
 'Figma':['icon-lit-figma',176,184,886,912,true],
 'Photoshop':['icon-lit-ps',202,227,842,847,true],
 'Illustrator':['icon-lit-ai',143,146,961,955,true],
 'Codex':['icon-lit-codex',154,158,940,942,true],
 'Gaming':['icon-lit-gaming',71,269,1107,799,false]
};
const hobbyDetails={
 'Economics & Markets':{title:'Trading & Finance',pretilted:true,image:'/assets/hobby-finance.png',description:'An intelligent quantitative trading agent built by creating a multi-source data layer to collect and filter information, developing specialised sub-agent skills based on personal trading experience, setting decision thresholds, and using a central agent to integrate the insights and make final trading decisions.'}
};
const toolStops=[[-2.5,-.12,.5],[-2,.0676,.5],[-1,.176,.5],[0,.338,.467],[1,.661,.5],[2,.75,.5],[3,.837,.52],[4,.944,.5],[4.5,1.12,.5]];
const interestStops=[[-2.5,-.12,.56],[-2,.055,.56],[-1,.197,.5],[0,.358,.447],[1,.66,.49],[2,.8,.5],[3,.915,.52],[4,1.15,.5],[4.5,1.3,.5]];
const mod=(n,m)=>(n%m+m)%m;
export function orbitGeometry(i,phase,family='tools'){
 const stops=family==='interests'?interestStops:toolStops,r=mod(i-phase+2.5,7)-2.5;
 let a=stops[0],b=stops[1];
 for(let j=1;j<stops.length;j++)if(r<=stops[j][0]){a=stops[j-1];b=stops[j];break}
 const t=(r-a[0])/(b[0]-a[0]),focus=Math.max(0,1-Math.abs(r));
 return {r,x:a[1]+(b[1]-a[1])*t,y:a[2]+(b[2]-a[2])*t,scale:1+(family==='interests'?.36:.92)*focus**1.4,rotate:Math.sin(r*2)*9*(1-focus),opacity:Math.min(1,(r+2.5)*2,(4.5-r)*2),selected:Math.abs(r)<.5};
}
export function mountAboutTools(app){
 document.body.classList.add('portfolio-mode');
 app.innerHTML=`<section class="about-stage" aria-label="About Kris Shaw">${portfolioShell('about')}<div class="about-artboard"><div class="about-backdrop"><div class="about-texture" aria-hidden="true"></div><div class="about-copy"><p class="about-statement">A MULTIDISCIPLINARY DESIGNER DRIVEN BY CURIOSITY AND A PASSION FOR EXPLORING THE WORLD. FASCINATED BY EMERGING TECHNOLOGIES, HUMAN BEHAVIOUR, AND THE FORCES SHAPING OUR SOCIETY, WITH A PARTICULAR INTEREST IN ECONOMICS AND FINANCIAL MARKETS.</p><div class="about-year" aria-label="2004"><span>20</span><span>&nbsp;&nbsp;&nbsp;&nbsp;04</span></div><span class="about-and">AND</span><p class="about-personal">BEYOND DESIGN, I’M AN AVID GAMER AND SPORTS ENTHUSIAST WHO ENJOYS EXPERIMENTING WITH IDEAS AND BRINGING THEM TO LIFE THROUGH INTERACTIVE EXPERIENCES AND GAMES OF MY OWN.</p><section class="about-education"><h2>Education</h2><div>University of the Arts London<br>BA (Hons) Graphic and Media Design<br>2023 — 2026</div><div>The Hong Kong Polytechnic University<br>MSc Innovative Multimedia Entertainment<br>Current studies<br>2026 — 2028</div></section><section class="about-experience"><h2>Experience</h2><div>昌荣传播有限公司｜北京</div><div>Charm Communications, Beijing, China</div><div>AI Short Drama Director Intern<br>Jun — Aug 2026</div><div>Storyboarding · AI production · Editing<br>Guidance for new interns<br>World Cup campaigns: Dongpeng / Mengniu</div></section></div><section class="about-capabilities"><h2>Capabilities</h2><p>Visual Identity &amp; Branding<br>Typography &amp; Editorial Design<br>Packaging &amp; Character Design<br>UI &amp; Interactive Experiences<br>Motion &amp; AI Filmmaking<br>3D Spatial Narratives</p></section></div><div class="about-orbit" aria-label="悬浮软件工具" hidden></div><button type="button" class="about-avatar-button" aria-label="点击人偶查看 Skills and Tools" aria-expanded="false"><span class="about-click-hint">CLICK TO KNOW MORE<br>ABOUT ME</span><img class="about-avatar-intro" src="/assets/about-intro-avatar.webp" alt="Kris Shaw 食指向上的 3D 人偶" draggable="false" fetchpriority="high"><img class="about-avatar-tools" data-src="/assets/about-tools-avatar.webp" decoding="async" alt="Kris Shaw 端平手掌展示工具" draggable="false"></button><h1 class="about-tools-title" hidden>SKILLS &amp; TOOLS</h1><span class="orbit-status" role="status" aria-live="polite"></span></div></section>`;
 const stage=app.querySelector('.about-stage'),board=app.querySelector('.about-artboard'),avatar=app.querySelector('.about-avatar-button'),orbit=app.querySelector('.about-orbit'),title=app.querySelector('.about-tools-title'),hint=app.querySelector('.about-click-hint'),status=app.querySelector('.orbit-status');
 const disposeBackground=mountPaperBackground(app.querySelector('.about-texture'));
 const detail=document.createElement('section');
 detail.className='hobby-detail';detail.hidden=true;detail.setAttribute('role','dialog');detail.setAttribute('aria-modal','true');detail.setAttribute('aria-labelledby','hobby-detail-title');
 detail.innerHTML=`<img class="hobby-card-paper" data-src="/assets/hobby-card-paper.png" alt="" draggable="false"><div class="hobby-card-content"><div class="hobby-card-photo"><img alt="" draggable="false"></div><h2 id="hobby-detail-title"></h2><p class="hobby-card-description"></p><button class="hobby-card-close" type="button" aria-label="关闭爱好详情">× CLOSE</button></div>`;
 board.append(detail);
 const closeButton=detail.querySelector('button'),photo=detail.querySelector('.hobby-card-photo img'),capabilities=board.querySelector('.about-capabilities'),originalCapabilities=capabilities.innerHTML;
 let detailOpen=false,returnFocus=null;
 function closeDetail(){
  if(!detailOpen)return;detailOpen=false;detail.hidden=true;stage.classList.remove('is-detail');
  [stage.querySelector('.site-chrome'),board.querySelector('.about-backdrop'),avatar,orbit].forEach(n=>n.inert=false);
  if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
 }
 function openDetail(index){
  const paper=detail.querySelector('.hobby-card-paper');if(!paper.src)paper.src=paper.dataset.src;
  const key=interests[index][0],entry=hobbyDetails[key]||{title:key};
  cancelAnimationFrame(raf);raf=0;clearTimeout(timer);phase=target=Math.round(phase);paint();
  detail.querySelector('h2').textContent=entry.title;detail.querySelector('p').textContent=entry.description||'';
  photo.classList.toggle('is-pretilted',!!entry.pretilted);
  photo.hidden=!entry.image;if(entry.image){photo.src=entry.image;photo.alt=entry.title+' — quantitative trading agent';}else photo.removeAttribute('src');
  detail.querySelector('.hobby-card-photo').classList.toggle('is-empty',!entry.image);
  returnFocus=icons[index];detailOpen=true;detail.hidden=false;stage.classList.add('is-detail');
  [stage.querySelector('.site-chrome'),board.querySelector('.about-backdrop'),avatar,orbit].forEach(n=>n.inert=true);
  closeButton.focus({preventScroll:true});
 }
 closeButton.addEventListener('click',closeDetail);
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let mode='intro',phase=2,target=2,raf=0,timer=0,drag=null,disposed=false,announced=-1,suppressClick=false,icons=[];
 const selections={tools:2,interests:2};
 function activeItems(){return mode==='interests'?interests:software}
 function renderIcons(){
  const personal=mode==='interests';
  orbit.setAttribute('aria-label',personal?'悬浮兴趣图标':'悬浮软件工具');
  orbit.innerHTML=activeItems().map((item,i)=>{
   let sprite;
   if(litSingles[item[0]]){
    const [file,x,y,w,h,tile]=litSingles[item[0]];
    sprite=`<span class="orbit-single" style="aspect-ratio:${w}/${h};border-radius:${tile?'24%':'0'}"><img src="/assets/${file}-web.webp" alt="${item[0]}" decoding="async" style="width:${1254/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%" draggable="false"></span>`;
   }else if(personal){
    const [,x,y,w,h]=item,max=Math.max(w,h);
    sprite=`<span class="orbit-crop interest-crop" style="width:${w/max*100}%;height:${h/max*100}%"><img src="/assets/icons-lit-interests-web.webp" alt="${item[0]}" decoding="async" style="width:${2172/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%" draggable="false"></span>`;
   }else sprite=`<span class="orbit-crop"><img src="/assets/icons-lit-tools-web.webp" alt="${item[0]}" decoding="async" style="left:${-item[1]/294*100}%" draggable="false"></span>`;
   return `<button type="button" class="orbit-icon" data-tool="${i}" aria-label="${item[0]} 移到手掌上方"><span class="orbit-bob">${sprite}</span></button>`;
  }).join('');
  icons=[...orbit.querySelectorAll('.orbit-icon')];
 }
 function paint(){
  const mobile=innerWidth<=700;
  icons.forEach((n,i)=>{
   const g=orbitGeometry(i,phase,mode),x=mobile?.2+g.r*.5:g.x;
   n.style.left=x*100+'%';n.style.top=(mobile?.55+(g.y-.467)*.9:g.y)*100+'%';
   const visible=!(mobile&&Math.abs(g.r)>1.5)&&g.opacity>0&&x>-.15&&x<1.15;
   n.style.opacity=visible?Math.max(0,g.opacity):0;n.style.pointerEvents=visible?'auto':'none';n.tabIndex=visible?0:-1;
   n.style.transform=`translate(-50%,-50%) scale(${g.scale}) rotate(${g.rotate}deg)`;
   n.style.zIndex=g.selected?'5':'1';n.classList.toggle('is-on-hand',g.selected);n.setAttribute('aria-current',g.selected?'true':'false');n.setAttribute('aria-label',activeItems()[i][0]+(mode==='interests'&&g.selected?' 查看详情':' 移到手掌上方'));
  });
  const selected=mod(Math.round(phase),7);
  if(announced!==selected){announced=selected;status.textContent=mode==='intro'?'':activeItems()[selected][0]}
 }
 function layout(){
  const scale=Math.min(document.documentElement.clientWidth/1440,innerHeight/792);
  board.style.setProperty('--about-scale',scale);
  board.style.setProperty('--about-side-gap',Math.max(0,(document.documentElement.clientWidth/scale-1440)/2)+'px');
  board.style.setProperty('--about-bottom-gap',Math.max(0,(innerHeight/scale-792)/2)+'px');paint();
 }
 function tick(){raf=0;if(disposed)return;phase+=reduced?target-phase:(target-phase)*.14;if(Math.abs(target-phase)<.001)phase=target;paint();if(phase!==target)raf=requestAnimationFrame(tick)}
 function animate(){if(!raf)raf=requestAnimationFrame(tick)}
 function setMode(next){
  closeDetail();
  if(mode!=='intro')selections[mode]=Math.round(target);
  cancelAnimationFrame(raf);raf=0;clearTimeout(timer);drag=null;suppressClick=false;
  if(next!=='intro'){const portrait=avatar.querySelector('.about-avatar-tools');if(!portrait.src)portrait.src=portrait.dataset.src;}
  mode=next;announced=-1;phase=target=mode==='intro'?2:selections[mode];
  stage.classList.toggle('is-tools',mode!=='intro');stage.classList.toggle('is-interests',mode==='interests');stage.classList.remove('is-preview');
  orbit.hidden=mode==='intro';title.hidden=mode==='intro';
  avatar.setAttribute('aria-expanded',String(mode!=='intro'));
  avatar.setAttribute('aria-label',mode==='intro'?'点击人偶查看 Skills and Tools':mode==='tools'?'点击人偶查看 More About Me':'点击人偶返回个人介绍');
  hint.innerHTML=mode==='intro'?'CLICK TO KNOW MORE<br>ABOUT ME':'CLICK AGAIN';
  capabilities.innerHTML=mode==='interests'?'<h2>Hobbies</h2><p>Finance &amp; Trading<br>Coding &amp; Programming<br>Photography &amp; Editing<br>Electronic Games<br>AI Video &amp; Director<br>Sports</p>':originalCapabilities;
  title.textContent=mode==='interests'?'MORE ABOUT ME':'SKILLS & TOOLS';
  if(mode!=='intro')renderIcons();paint();
 }
 function nextMode(){setMode(mode==='intro'?'tools':mode==='tools'?'interests':'intro')}
 avatar.addEventListener('pointerenter',()=>{if(mode==='intro')stage.classList.add('is-preview')});
 avatar.addEventListener('pointerleave',()=>stage.classList.remove('is-preview'));
 avatar.addEventListener('focus',()=>{if(mode==='intro')stage.classList.add('is-preview')});
 avatar.addEventListener('blur',()=>stage.classList.remove('is-preview'));avatar.addEventListener('click',nextMode);
 stage.addEventListener('wheel',e=>{
  if(detailOpen){e.preventDefault();return}if(mode==='intro'||e.ctrlKey)return;e.preventDefault();
  const d=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.deltaMode===1?16:1);
  target+=Math.max(-240,Math.min(240,d))/200;animate();clearTimeout(timer);timer=setTimeout(()=>{target=Math.round(target);animate()},170);
 },{passive:false});
 orbit.addEventListener('click',e=>{
  if(suppressClick){suppressClick=false;return}
  const n=e.target.closest('.orbit-icon');if(!n)return;
  const i=Number(n.dataset.tool);
  if(mode==='interests'&&mod(Math.round(phase),7)===i&&Math.abs(phase-target)<.05){openDetail(i);return}
  const current=mod(Math.round(target),7),delta=mod(i-current+3,7)-3;
  target=Math.round(target)+delta;clearTimeout(timer);animate();
 });
 orbit.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;drag={x:e.clientX,phase:target,moved:false}});
 orbit.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>5&&!drag.moved){drag.moved=true;orbit.setPointerCapture(e.pointerId)}target=drag.phase-dx/(innerWidth*.18);animate()});
 orbit.addEventListener('pointerup',()=>{if(!drag)return;suppressClick=drag.moved;drag=null;target=Math.round(target);animate()});orbit.addEventListener('pointercancel',()=>drag=null);
 const keyboard=e=>{
  if(detailOpen){if(e.key==='Escape'){e.preventDefault();closeDetail()}else if(e.key==='Tab'){e.preventDefault();closeButton.focus()}return}
  if(mode==='intro'||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
  if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();target=Math.round(target)+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1);animate()}
  if(e.key==='Escape')setMode('intro');
 };
 window.addEventListener('resize',layout);window.addEventListener('keydown',keyboard);layout();
 return ()=>{disposeBackground();disposed=true;cancelAnimationFrame(raf);clearTimeout(timer);document.body.classList.remove('portfolio-mode');window.removeEventListener('resize',layout);window.removeEventListener('keydown',keyboard)};
}
