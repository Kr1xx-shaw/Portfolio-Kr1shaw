import {stockopolySection} from '/assets/stockopoly-sections.js?v=37-stock-layout';
import {portfolioShell} from '/assets/portfolio-shell.js?v=13-shared-shell';
import {interceptionSection} from '/assets/interception-sections.js?v=28-interception';
import {hypertypeSection} from '/assets/hypertype-sections.js?v=46-hypertype';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=s=>s.startsWith('/media/')?s:'/assets/'+s+'.webp'+(s.startsWith('st-')?'?v=37-stock-layout':'');
const sectionMarkup=(s,i)=>{
 if(s.type.startsWith('ht-'))return hypertypeSection(s,i);
 if(s.type.startsWith('st-'))return stockopolySection(s,i);
 if(s.type.startsWith('ic-'))return interceptionSection(s,i);
 const images=s.images||[];
 const img=(m,j)=>`<figure class="wass-photo"><img src="${asset(m.file)}" alt="${esc(m.alt)}" width="${m.width}" height="${m.height}" ${i===0&&j===0?'fetchpriority="high"':'loading="lazy"'} decoding="async"></figure>`;
 return `<section class="case-figure wass-section wass-${s.type}" ${images.length?`id="case-image-${i+1}"`:''}><div class="wass-section-copy"><span class="wass-kicker">${esc(s.label)}</span><h2>${esc(s.title)}</h2>${s.text?`<p>${esc(s.text)}</p>`:''}${s.facts?`<dl class="wass-facts">${s.facts.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`:''}</div>${images.length?`<div class="wass-image-grid">${images.map(img).join('')}</div>`:''}</section>`;
};
export function mountProjectPage(app,p){
 const sectioned=Array.isArray(p.caseSections),sections=sectioned?p.caseSections:[];
 const pictures=p.imagesPending?[]:(p.gallery||[]),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 document.body.classList.add('portfolio-mode','case-mode');
 app.innerHTML=`<article class="case-page ${sectioned?'wass-case':''}" aria-label="${esc(p.title)} 作品详情">${portfolioShell('work')}<aside class="case-info"><h1>${esc(p.title)}</h1><dl><div class="case-about-row"><dt>About</dt><dd><p>${esc(p.summary)}</p>${(p.description||[]).map(t=>`<p>${esc(t)}</p>`).join('')}</dd></div><div><dt>Role</dt><dd>${esc(p.tags).split(' / ').join('<br>')}</dd></div></dl><a class="case-back" href="/work">Back to work →</a></aside><div class="case-gallery">${sectioned?sections.map((s,i)=>sectionMarkup(s,i)).join(''):pictures.length?pictures.map((g,i)=>`<figure class="case-figure" id="case-image-${i+1}"><img src="${esc(asset(g[0]))}" alt="${esc(g[1])}" width="1800" height="1350" ${i?'loading="lazy"':'fetchpriority="high"'} decoding="async"></figure>`).join(''):'<p class="case-empty">Project images coming soon.</p>'}<a class="case-gallery-back" href="/work">Back to work →</a></div>${pictures.length?`<nav class="case-thumbnails" aria-label="项目图片导航">${pictures.map((g,i)=>`<button type="button" data-image="${i}" aria-label="跳转到第 ${i+1} 张：${esc(g[1])}"><img src="${esc(asset(sectioned?g[0]+'-thumb':g[0]))}" alt="" width="160" height="120" decoding="async"></button>`).join('')}</nav>`:''}<span class="case-scroll">Scroll</span></article>`;
 const figures=[...app.querySelectorAll(sectioned?'.wass-section[id]':'.case-figure')],buttons=[...app.querySelectorAll('.case-thumbnails button')];
 let frame=0,disposed=false,active=-1;
 function sync(){
  frame=0;if(disposed||!figures.length)return;
  const center=innerHeight*.5;
  let closest=0,distance=Infinity;
  figures.forEach((n,i)=>{const r=n.getBoundingClientRect(),d=Math.max(r.top-center,center-r.bottom,0);if(d<distance){distance=d;closest=i}});
  if(closest===active)return;active=closest;
  buttons.forEach((n,i)=>{n.classList.toggle('is-active',i===active);n.setAttribute('aria-current',i===active?'true':'false')});
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(sync)}
 buttons.forEach((n,i)=>n.addEventListener('click',()=>{
  const top=scrollY+figures[i].getBoundingClientRect().top-54;
  window.scrollTo({top:Math.max(0,top),behavior:reduced?'instant':'smooth'});
 }));
 figures.forEach(n=>n.querySelector('img')?.addEventListener('load',schedule));
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);sync();
 return ()=>{disposed=true;cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.body.classList.remove('portfolio-mode','case-mode')};
}
