'use strict';
const projects = [
  {id:'hypertype',number:'01',title:'HYPERTYPE',category:['identity','experimental'],tags:'VISUAL IDENTITY / TYPOGRAPHY / MOTION',cover:'hypertype',summary:'从文字实验出发，构建跨越平面与动态媒介的视觉系统。',description:['以 AI 幻觉与字形重构为探索方向，将理性的网格结构与不稳定的视觉变化结合，发展字体实验及整体视觉语言。','设计延伸至海报、户外广告、社交媒体、网页和动态视觉，探索同一套视觉规则如何在不同媒介中保持联系。'],gallery:[['hypertype','HYPERTYPE / 海报应用'],['hypertype-billboard','户外广告应用'],['hypertype-web','网页视觉应用'],['hypertype-motion','动态视觉画面']]},
  {id:'wass-fresh',number:'02',title:'WASS Fresh',category:['identity','digital'],tags:'BRAND IDENTITY / PACKAGING / UI',cover:'wass-fresh',summary:'以四季蔬果为灵感，让当季饮食成为可识别的品牌体验。',description:['WASS Fresh 是围绕英国当季植物性食材展开的品牌概念。名称取自 Winter、Autumn、Spring、Summer，将季节变化转化为图形、色彩与包装语言。','以蔬果插画建立视觉识别，并延伸至食材包装与移动端购物界面，让品牌在实体与数字场景中形成连贯体验。'],gallery:[['wass-fresh','品牌概览 / 手机与包装组合'],['wass-ui','移动端界面设计'],['wass-packaging','包装系统与应用']]},
  {id:'interception',number:'03',title:'INTERCEPTION',category:['identity'],tags:'CAMPAIGN / CHARACTER / PACKAGING',cover:'interception',summary:'用有性格的食物角色，拉近可持续饮食与日常生活的距离。',description:['围绕 UAL 食堂与 Earth Week 的传播场景，将植物性食物转化为亲切的角色形象，探索轻松、有趣的视觉沟通方式。','通过角色、包装、玩具与宣传应用建立系列化表达，让食物的形态成为品牌识别和传播的一部分。'],gallery:[['interception','Burrito / 角色与包装'],['interception-family','系列角色与包装'],['interception-salad','Salad / 包装应用']]},
  {id:'stockopoly',number:'04',title:'Stockopoly',category:['digital','experimental'],tags:'GAME DESIGN / UI / BEHAVIOURAL EXPERIENCE',cover:'stockopoly',summary:'将金融行为中的选择与情绪，转化为可参与的游戏体验。',description:['以贪婪、恐惧与决策行为为切入点，将股票市场相关概念转译为多人游戏的规则、视觉与互动反馈。','从游戏流程到移动端界面，结合棋盘、角色、图表与事件反馈，探索玩家如何在不同情境下作出选择。'],gallery:[['stockopoly','移动端游戏展示'],['stockopoly-interface','游戏界面设计'],['stockopoly-flow','流程与界面草图']]},
  {id:'seahi',number:'05',title:'SeaHi',category:['digital','identity'],tags:'E-COMMERCE / UI / IP DESIGN',cover:'seahi',summary:'将海鲜购物、信息服务与角色体验连接在一起。',description:['围绕海鲜电商小程序的使用场景，结合用户流程、信息架构与视觉识别设计，组织商品浏览和购物体验。','通过 SeaHi 品牌标识、蓝色视觉系统与角色 Nargeza，把电商界面与更具亲和力的互动内容联系起来。'],gallery:[['seahi','SeaHi / 小程序与角色概览'],['seahi-system','信息架构、标识与界面框架'],['seahi-character','角色设计与最终界面']]},
  {id:'greenhouse',number:'06',title:'The Greenhouse Condition',category:['digital','experimental'],tags:'3D SPACE / INTERACTIVE NARRATIVE',cover:'greenhouse',summary:'当保护逐渐成为控制，空间如何改变我们的感受？',description:['以温室状态为隐喻，通过不同空间的形态、尺度与氛围，探索保护、依赖和控制之间的关系。','结合 3D 场景与交互实验，将叙事融入空间行进与感知变化，让观众在参与中理解作品的主题。'],gallery:[['greenhouse','空间场景 / 走廊'],['greenhouse-development','空间概念与场景发展'],['greenhouse-spaces','空间序列与交互探索']]}
];
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const grid=$('#project-grid');
const dialog=$('#project-dialog');
const resume=$('#resume-dialog');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let activeFilter='all',lastProjectTrigger=null,currentProject=null;

function renderCards(){
  grid.innerHTML=projects.map((p,i)=>`<article class="project-card reveal" data-id="${p.id}" data-categories="${p.category.join(' ')}"><button class="project-open" data-project="${p.id}" aria-label="查看 ${p.title} 项目"><div class="project-media"><img src="assets/${p.cover}.webp" alt="${p.gallery[0][1]}" loading="lazy" decoding="async"><span class="image-hint" aria-hidden="true">↗</span></div><div class="project-caption"><span class="project-number">${p.number}</span><h3>${p.title}</h3><span aria-hidden="true">↗</span><p>${p.tags}</p></div></button>${i===0?'<p class="gallery-statement" aria-hidden="true">FORM.<br>CHARACTER.<br><span>EXPERIENCE.</span></p>':''}</article>`).join('');
}
renderCards();

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target)}}),{threshold:.07});
if(!reduced.matches){document.documentElement.classList.add('js-motion');$$('.reveal').forEach(el=>observer.observe(el))}

$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  activeFilter=button.dataset.filter;
  $$('[data-filter]').forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected))});
  grid.classList.toggle('filtered',activeFilter!=='all');
  let count=0;
  $$('.project-card').forEach(card=>{const visible=activeFilter==='all'||card.dataset.categories.split(' ').includes(activeFilter);card.hidden=!visible;if(visible){count++;card.classList.add('in-view')}});
  $('#work-count').textContent=String(count).padStart(2,'0');
  $('#filter-status').textContent=`已显示 ${count} 个${button.textContent==='全部'?'':button.textContent}项目`;
}));

function renderProject(id){
  const p=projects.find(x=>x.id===id);if(!p)return;
  currentProject=p;
  const next=projects[(projects.indexOf(p)+1)%projects.length];
  $('#project-content').innerHTML=`<div class="project-detail"><span class="eyebrow">${p.number} / ${p.tags}</span><h2 id="project-title">${p.title}</h2><div class="detail-meta"><p class="detail-summary">${p.summary}</p><div class="detail-description">${p.description.map(t=>`<p>${t}</p>`).join('')}</div></div>${p.gallery.map(([image,caption],i)=>`<figure class="detail-image"><img src="assets/${image}.webp" alt="${caption}" loading="${i?'lazy':'eager'}"><figcaption>${String(i+1).padStart(2,'0')} / ${caption}</figcaption></figure>`).join('')}<button class="detail-next" data-next="${next.id}"><span>NEXT PROJECT</span><strong>${next.title}</strong><span aria-hidden="true">↗</span></button></div>`;
  dialog.scrollTop=0;
  document.title=`${p.title} — Xichen Zhao`;
}
function openProject(id,trigger){
  if(!projects.some(p=>p.id===id))return;
  if(resume.open)resume.close();
  if(trigger)lastProjectTrigger=trigger;
  renderProject(id);
  if(!dialog.open){dialog.showModal();document.body.classList.add('modal-open')}
  history.replaceState(null,'',`#project/${id}`);
}
function closeProject(){if(dialog.open)dialog.close()}
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');document.title='Xichen Zhao — Portfolio';if(location.hash.startsWith('#project/'))history.replaceState(null,'','#work');if(lastProjectTrigger?.isConnected)lastProjectTrigger.focus({preventScroll:true})});
$$('.close-dialog').forEach(b=>b.addEventListener('click',closeProject));
grid.addEventListener('click',e=>{const button=e.target.closest('[data-project]');if(button)openProject(button.dataset.project,button)});
dialog.addEventListener('click',e=>{const next=e.target.closest('[data-next]');if(next){openProject(next.dataset.next);$('.close-dialog',dialog).focus({preventScroll:true})}});

function openResume(){if(dialog.open)dialog.close();resume.showModal();document.body.classList.add('modal-open')}
$$('[data-resume]').forEach(b=>b.addEventListener('click',()=>{closeMenu();openResume()}));
$('.close-resume').addEventListener('click',()=>resume.close());
resume.addEventListener('close',()=>document.body.classList.remove('modal-open'));
resume.addEventListener('click',e=>{if(e.target===resume){const b=resume.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)resume.close()}});
$('.print-resume').addEventListener('click',()=>window.print());

const menu=$('.menu-toggle'),header=$('.site-header');
function closeMenu(){header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','打开导航')}
menu.addEventListener('click',()=>{const open=!header.classList.contains('menu-open');header.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'关闭导航':'打开导航')});
$$('.site-header nav a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

$('.copy-email').addEventListener('click',async()=>{
  const status=$('#copy-status');
  try{await navigator.clipboard.writeText('Chris190731@qq.com');status.textContent='已复制';setTimeout(()=>{status.textContent=''},3500)}
  catch{status.textContent='请复制：Chris190731@qq.com'}
});

const hero=$('.hero-scroll'),scene=$('.hero-image'),title=$('#hero-title'),bottom=$('.hero-bottom'),meta=$('.hero-meta'),inside=$('.hero-reveal'),progress=$('.reading-progress');
let ticking=false;
function updateScroll(){
  const total=document.documentElement.scrollHeight-innerHeight;
  progress.style.transform=`scaleX(${total>0?scrollY/total:0})`;
  if(!reduced.matches){
    const travel=Math.max(1,hero.offsetHeight-innerHeight);
    const p=Math.min(1,Math.max(0,scrollY/travel));
    scene.style.transform=`scale(${1+p*.32})`;
    title.style.transform=`translateY(${-p*105}px)`;title.style.opacity=String(1-Math.min(1,p*1.65));
    bottom.style.opacity=String(1-Math.min(1,p*2.2));meta.style.opacity=String(1-Math.min(1,p*2));
    inside.style.opacity=String(Math.max(0,(p-.55)*2));
  }
  ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScroll);ticking=true}},{passive:true});
addEventListener('resize',updateScroll);
reduced.addEventListener('change',()=>{document.documentElement.classList.toggle('js-motion',!reduced.matches);$$('.reveal').forEach(el=>el.classList.add('in-view'));updateScroll()});
updateScroll();
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(e=>{const link=$(`.site-header nav a[href="#${e.target.id}"]`);if(link)link.classList.toggle('current',e.isIntersecting)}),{rootMargin:'-15% 0px -50% 0px'});
['work','about','contact'].forEach(id=>sectionObserver.observe(document.getElementById(id)));
function resolveProjectHash(){if(location.hash.startsWith('#project/'))openProject(location.hash.slice(9));else if(dialog.open)closeProject()}
addEventListener('hashchange',resolveProjectHash);
resolveProjectHash();
