import {stockopolySection} from '/assets/stockopoly-sections.js?v=37-stock-layout';
import {portfolioShell} from '/assets/portfolio-shell.js?v=13-shared-shell';
import {interceptionSection} from '/assets/interception-sections.js?v=28-interception';
import {hypertypeSection} from '/assets/hypertype-sections.js?v=49-image-only';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=s=>s.startsWith('/media/')?s:'/assets/'+s+'.webp'+(s.startsWith('st-')?'?v=37-stock-layout':'');
const sectionMarkup=(s,i)=>{
 if(s.type.startsWith('rh-')){
  const m=s.images[0];
  return `<section class="case-figure wass-section rh-section ${s.type}" id="case-image-${i+1}"><img src="${asset(m.file)}" alt="${esc(m.alt)}" width="${m.width}" height="${m.height}" ${i===0?'fetchpriority="high"':'loading="lazy"'} decoding="async"></section>`;
 }
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
 const films=p.films??(p.video?[{title:p.title,poster:p.cover,source:p.video}]:[]);
 const video=films.length?renderProjectVideo(films):'';
 const gallery=sectioned?sections.map((s,i)=>sectionMarkup(s,i)).join(''):pictures.map(([file,alt,width=1800,height=1350],i)=>
  `<figure class="case-figure" id="case-image-${i+1}"><img src="${esc(asset(file))}" alt="${esc(alt)}" width="${width}" height="${height}" ${i||video?'loading="lazy"':'fetchpriority="high"'} decoding="async"></figure>`
 ).join('');
 const layout=video?'video-case':sectioned?(p.id==='reheaven'?'reheaven-case':p.id==='hypertype'?'hypertype-case':'wass-case'):'';
 document.body.classList.add('portfolio-mode','case-mode');
 app.innerHTML=`<article class="case-page ${layout}" aria-label="${esc(p.title)} 作品详情">${portfolioShell('work')}<aside class="case-info"><h1>${esc(p.title)}</h1><dl><div class="case-about-row"><dt>About</dt><dd><p>${esc(p.summary)}</p>${(p.description||[]).map(t=>`<p>${esc(t)}</p>`).join('')}</dd></div><div><dt>Role</dt><dd>${esc(p.tags).split(' / ').join('<br>')}</dd></div></dl><a class="case-back" href="/work">Back to work →</a></aside><div class="case-gallery">${video}${gallery||(!video&&!sectioned?'<p class="case-empty">Project images coming soon.</p>':'')}<a class="case-gallery-back" href="/work">Back to work →</a></div>${pictures.length?`<nav class="case-thumbnails" aria-label="项目图片导航">${pictures.map((g,i)=>`<button type="button" data-image="${i}" aria-label="跳转到第 ${i+1} 张：${esc(g[1])}"><img src="${esc(asset(sectioned?g[0]+'-thumb':g[0]))}" alt="" width="160" height="120" decoding="async"></button>`).join('')}</nav>`:''}<span class="case-scroll">Scroll</span></article>`;
 if(films.length)bindFilmSelection(app,films);
 const figures=[...app.querySelectorAll(sectioned?'.wass-section[id]':'.case-figure[id]')],buttons=[...app.querySelectorAll('.case-thumbnails button')];
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

function renderProjectVideo(films){
 const first=films[0];
 const poster=esc(asset(first.poster));
 const source=esc(first.source);
 const selector=films.length>1?`
  <section class="case-film-selector" aria-labelledby="case-films-title">
   <h2 id="case-films-title">Films</h2>
   <div class="case-film-list">
    ${films.map((film,i)=>`
     <button type="button" class="case-film-choice" data-film="${i}" aria-controls="case-player" aria-pressed="${i===0}">
      <span class="case-film-preview">
       <img src="${esc(asset(film.poster))}" alt="" width="160" height="90" decoding="async">
      </span>
      <span class="case-film-copy">
       <strong>${esc(film.title)}</strong>
       <span class="case-film-meta"><span>${esc(film.format)}</span><span aria-hidden="true">·</span><span>${esc(film.duration)}</span></span>
      </span>
      <span class="case-film-selected" aria-hidden="true">Selected</span>
     </button>`).join('')}
   </div>
  </section>`:'';
 return `
  <figure class="case-figure case-film-player">
   <video id="case-player" class="case-video" controls playsinline preload="none" poster="${poster}" width="1280" height="720" aria-label="${esc(first.title)}">
    <source src="${source}" type="video/mp4">
    <a href="${source}" download target="_blank" rel="noopener">Download video</a>
   </video>
  </figure>
  ${selector}`;
}

function bindFilmSelection(app,films){
 const player=app.querySelector('.case-video');
 const source=player.querySelector('source');
 const download=player.querySelector('a');
 const choices=app.querySelectorAll('.case-film-choice');
 for(const choice of choices){
  choice.addEventListener('click',()=>{
   if(choice.getAttribute('aria-pressed')==='true')return;
   const film=films[Number(choice.dataset.film)];
   player.pause();
   player.poster=asset(film.poster);
   player.setAttribute('aria-label',film.title);
   source.src=film.source;
   download.href=film.source;
   player.load();
   for(const button of choices)button.setAttribute('aria-pressed',String(button===choice));
  });
 }
}
