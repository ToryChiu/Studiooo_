const fs=require('node:fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
for(const theme of ['light','dark']){
 const errors=[];
 const dom=new JSDOM(html,{url:'https://torychiu.github.io/Studiooo_/#about',runScripts:'dangerously',virtualConsole:new VirtualConsole().on('jsdomError',e=>errors.push(e)),beforeParse(w){w.localStorage.setItem('studio-theme',theme);w.matchMedia=()=>({matches:true,addEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{}}});
 const w=dom.window,d=w.document;
 assert(d.getElementById('aboutPage'),'Independent About page exists');
 w.eval(fs.readFileSync(__dirname+'/studio-visual.js','utf8'));
 assert.equal(d.getElementById('aboutPage').hidden,false);
 assert.equal(d.getElementById('planPage').hidden,true);
 assert.equal(d.title,'秋鸽 Studiooo_｜关于摄影师');
 assert(d.querySelector('.page-tabs a[href="#about"][aria-current="page"]'));
 assert(d.querySelector('.line-sidebar').hidden);
 assert.equal(d.getElementById('aboutHeading').textContent,'Tory Chiu');
 assert.equal(d.querySelectorAll('.about-copy p').length,5);
 const text=d.getElementById('aboutPage').textContent;
 for(const s of ['@秋鴿','EST. 2015','赴俄罗斯攻读硕博学位期间','两支品牌广告短片','中文 / English / Русский','审美与感受力是没有捷径。','记录我所感受到的世界。','vivo · 中国建设银行 · 浦发银行 · 广旅 · 阿嬷手作'])assert(text.includes(s),s);
 for(const s of ['@秋鸽','旅居俄罗斯','常驻莫斯科','官方摄影师'])assert(!text.includes(s),s);
 d.querySelectorAll('#aboutPage img,#aboutPage source').forEach(el=>{const files=(el.getAttribute('srcset')||el.getAttribute('src')).split(',').map(s=>s.trim().split(' ')[0]);files.forEach(file=>assert(fs.existsSync(__dirname+'/'+file),file))});
 function nav(hash){w.history.replaceState(null,'',hash);w.dispatchEvent(new w.HashChangeEvent('hashchange'))}
 nav('#plan');for(const [name,value] of [['city','spb'],['pkg','B'],['makeup','self'],['film','short']])d.querySelector(`input[name="${name}"][value="${value}"]`).click();
 const quote=d.getElementById('copy').dataset.text;
 nav('#about');assert.equal(d.activeElement.id,'aboutHeading');
 d.getElementById('themeToggle').click();assert.equal(d.documentElement.dataset.theme,theme==='light'?'dark':'light');
 nav('#plan');assert.equal(d.getElementById('copy').dataset.text,quote);
 assert.equal(errors.length,0);w.close();
}
console.log('PASS About direct route, exact identity/content, assets, themes, focus and quotation state retention.');
