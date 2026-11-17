const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const image=(name,alt,extra='')=>`<img src="/assets/${esc(name)}.webp" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>`;
export function hypertypeSection(s,i){
 let art;
 if(s.type==='ht-social'){
  art=`<figure class="ht-full">${image('ht-social-original','HYPERTYPE Instagram profile and speaker posts — original mockup','width="2600" height="1733"')}</figure>`;
 }else if(s.type==='ht-motion'){
  art=`<div class="ht-motion-grid"><figure class="ht-motion-main">${image('ht-speaker-1','HYPERTYPE speaker identity on a freestanding screen','width="1890" height="1417"')}</figure><div class="ht-motion-sequence">${[2,3].map(n=>`<figure>${image('ht-speaker-'+n,'Speaker screen variation '+n,'width="1890" height="1417"')}</figure>`).join('')}</div></div>`;
 }else{
  art=`<figure class="ht-full">${image(s.images[0].file,s.images[0].alt,'width="1800" height="1350"')}</figure>`;
 }
 return `<section class="case-figure wass-section ht-section ${s.type}" id="case-image-${i+1}">${art}</section>`;
}
