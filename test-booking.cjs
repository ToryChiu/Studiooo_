const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),visual=fs.readFileSync(__dirname+'/studio-visual.js','utf8'),data=require('./booking-content.json');
function page(hash,theme){const errors=[];const dom=new JSDOM(html,{url:'https://torychiu.github.io/Studiooo_/'+hash,runScripts:'dangerously',virtualConsole:new VirtualConsole().on('jsdomError',e=>errors.push(e)),beforeParse(w){w.localStorage.setItem('studio-theme',theme);w.matchMedia=()=>({matches:true,addEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{}}});dom.window.eval(visual);return {dom,w:dom.window,d:dom.window.document,errors}}
for(const theme of ['light','dark']){
 const p=page('#booking-info',theme),d=p.d;
 assert.equal(d.getElementById('bookingInfoPage').hidden,false);assert.equal(d.getElementById('planPage').hidden,true);assert.equal(d.title,'秋鸽 Studiooo_｜约拍须知');assert(d.getElementById('sticky').classList.contains('hidden'));assert(d.querySelector('.line-sidebar').hidden);
 assert.equal(d.querySelectorAll('.booking-chapter').length,6);
 data.sections.forEach((s,i)=>{const chapter=d.querySelectorAll('.booking-chapter')[i];assert.equal(chapter.querySelector('h3').textContent,s.title);assert.deepEqual(Array.from(chapter.querySelectorAll('p'),x=>x.textContent),s.paragraphs)});
 assert.deepEqual(Array.from(d.querySelectorAll('.booking-timeline li'),x=>x.lastElementChild.textContent),data.steps);assert.equal(d.querySelector('.booking-process .hint').textContent,data.note);
 assert.equal(d.documentElement.dataset.theme,theme);d.getElementById('themeToggle').click();assert.equal(d.documentElement.dataset.theme,theme==='light'?'dark':'light');
 function navigate(hash){p.w.history.replaceState(null,'',hash);p.w.dispatchEvent(new p.w.HashChangeEvent('hashchange'))}
 navigate('#plan');for(const [name,value] of [['city','spb'],['pkg','B'],['makeup','self'],['film','ceremony'],['mainplace','vladimir'],['ceremony','yes']])d.querySelector(`input[name="${name}"][value="${value}"]`).click();
 d.getElementById('locationNote').value='保留我的拍摄计划';d.getElementById('locationNote').dispatchEvent(new p.w.Event('input'));
 const quote=d.getElementById('copy').dataset.text;
 navigate('#faq');assert.equal(d.querySelectorAll('#faqPage details').length,5);assert(d.querySelector('#faqPage a[href="#booking-info"]'));
 navigate('#booking-info');assert.equal(d.activeElement.id,'bookingInfoHeading');navigate('#plan');assert.equal(d.getElementById('copy').dataset.text,quote);assert.equal(d.getElementById('locationNote').value,'保留我的拍摄计划');assert.equal(d.querySelector('input[name="city"]:checked').value,'spb');
 assert.equal(p.errors.length,0);p.w.close();
}
for(const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);new vm.Script(visual);
const css=fs.readFileSync(__dirname+'/studio-visual.css','utf8');assert(css.includes('@media(max-width:480px)'));assert(css.includes('@media(prefers-reduced-motion:reduce)'));
console.log('PASS exact 7-step/6-chapter content, direct route, refresh initialization, theme toggles, FAQ preserved, quote state retained and no script errors.');
