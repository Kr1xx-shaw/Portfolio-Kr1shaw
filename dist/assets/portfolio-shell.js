// One viewport-based shell shared by Work and every About state.
export function portfolioShell(active){
 const link=(id,label,url)=>`<a href="${url}"${active===id?' aria-current="page"':''}>${active===id?'→':''}${label}</a>`;
 return `<div class="site-chrome"><a class="site-brand" href="/">XICHEN ZHAO</a><small class="site-copyright">© 2026 · Beijing / London / Hong Kong</small><span class="site-menu-label">Menu</span><nav class="site-nav" aria-label="Portfolio navigation">${link('work','WORK','/work')}${link('about','ABOUT','/about')}${link('contact','CONTACT','mailto:Chris190731@qq.com')}</nav><div class="site-meta"><div class="site-location">Visual / Multimedia<br>Beijing / London / Hong Kong</div><a class="site-email" href="mailto:Chris190731@qq.com">For inquiries&nbsp; <u>Chris190731@qq.com</u></a></div></div>`;
}
