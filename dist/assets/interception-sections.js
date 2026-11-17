const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function interceptionSection(s,i){
 const pictures=s.images||[];
 const image=m=>`<figure class="ic-art"><img src="/assets/${escape(m.file)}.webp" alt="${escape(m.alt)}" width="${m.width}" height="${m.height}" ${i===0?'fetchpriority="high"':'loading="lazy"'} decoding="async"></figure>`;
 const facts=s.facts?`<dl class="ic-facts">${s.facts.map(([k,v])=>`<div><dt>${escape(k)}</dt><dd>${escape(v)}</dd></div>`).join('')}</dl>`:'';
 const steps=s.steps?`<ol class="ic-journey" aria-label="Food choice journey">${s.steps.map(x=>`<li>${escape(x)}</li>`).join('')}</ol>`:'';
 const palette=s.palette?`<div class="ic-palette"><div><span class="ic-micro">COLOUR PALETTE</span><div class="ic-swatches"><i style="--swatch:#3d281a"></i><i style="--swatch:#df8038"></i><i style="--swatch:#f9d785"></i><i style="--swatch:#82a854"></i></div></div><div><span class="ic-micro">TYPE SAMPLE</span><strong>ABCDEF</strong><span class="ic-alphabet">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>0123456789</span></div></div>`:'';
 return `<section class="wass-section ic-section ${escape(s.type)}" ${pictures.length?`id="case-image-${i+1}"`:''}><div class="ic-copy"><span class="ic-kicker">${escape(s.label)}</span><h2>${escape(s.title)}</h2>${s.text?`<p>${escape(s.text)}</p>`:''}${facts}${steps}</div>${pictures.map(image).join('')}${palette}</section>`;
}
