const fs=require('node:fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),visual=fs.readFileSync(__dirname+'/studio-visual.js','utf8');
function page(saved,systemDark,reduced,inView=true){
 const errors=[],listeners={},queue=new Map(),observers=[],counts={frames:0},events=[];
 const dom=new JSDOM(html,{url:'https://torychiu.github.io/Studiooo_/#plan',runScripts:'dangerously',virtualConsole:new VirtualConsole().on('jsdomError',e=>errors.push(e)),beforeParse(w){
  if(saved)w.localStorage.setItem('studio-theme',saved);
  w.matchMedia=query=>({matches:query.includes('reduced')?reduced:systemDark,addEventListener:(type,cb)=>{listeners[query]=cb}});
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){this.dataset.scrolled='true'};
  w.requestAnimationFrame=cb=>{queue.set(++counts.frames,cb);return counts.frames};w.cancelAnimationFrame=id=>queue.delete(id);
  if(inView)w.IntersectionObserver=class {constructor(callback){this.callback=callback;this.items=[];observers.push(this)}observe(el){this.items.push(el)}unobserve(el){this.items=this.items.filter(x=>x!==el)}disconnect(){this.items=[]}enter(){this.callback(this.items.map(target=>({target,isIntersecting:true})))}};
  const add=w.document.addEventListener.bind(w.document);w.document.addEventListener=(type,...args)=>{events.push(type);return add(type,...args)};
 }});dom.window.eval(visual);
 function flush(){const pending=[...queue.values()];queue.clear();pending.forEach(cb=>cb(100));observers.forEach(o=>o.enter())}
 return {dom,w:dom.window,d:dom.window.document,errors,listeners,events,counts,flush};
}
for(const [saved,system,expected] of [[null,false,'light'],[null,true,'dark'],['light',true,'light'],['dark',false,'dark']]){
 const p=page(saved,system,false);p.flush();const before=p.d.getElementById('copy').dataset.text;
 assert.equal(p.d.querySelectorAll('.foliage-crown').length,3);assert(p.d.querySelector('.studio-neon-tube'));
 function rollingAmount(){return Array.from(p.d.getElementById('stickyRolling').children).map(el=>el.classList.contains('price-symbol')?el.textContent:String(Math.round(Number(el.firstElementChild.style.transform.match(/-([0-9.]+)em/)[1])/1.25)%10)).join('')}
 for(const [name,value,expected] of [['pkg','B','¥8,988'],['city','spb','¥10,988'],['makeup','self','¥9,988'],['film','ceremony','¥12,488'],['ceremony','yes','¥13,158']]){
  p.d.querySelector('input[name="'+name+'"][value="'+value+'"]').click();
  assert.equal(p.d.getElementById('stickyTotal').textContent,expected);assert(p.d.getElementById('copy').dataset.text.includes('人民币参考总价：'+expected));p.flush();assert.equal(rollingAmount(),expected);
 }
 // Rapid clicks settle on the newest quote, even before a pending animation frame.
 p.d.querySelector('input[name="film"][value="none"]').click();p.d.querySelector('input[name="film"][value="short"]').click();p.d.getElementById('resetPlan').click();p.flush();assert.equal(rollingAmount(),'¥6,988');
 assert.equal(p.d.documentElement.dataset.theme,expected);assert.equal(p.d.querySelector('.signature'),null);assert.equal(p.d.querySelector('header .brand').textContent,'秋鸽 Studiooo_');assert.equal(p.d.querySelector('#waveCanvas'),null);
 p.d.getElementById('themeToggle').click();assert.equal(p.d.documentElement.dataset.theme,expected==='dark'?'light':'dark');
 assert.equal(p.w.localStorage.getItem('studio-theme'),p.d.documentElement.dataset.theme);assert.equal(p.d.getElementById('copy').dataset.text,before);assert.equal(p.d.getElementById('total').textContent,'¥6,988');
 assert.equal(p.d.querySelectorAll('#sectionLinks button').length,7);assert(p.d.getElementById('planPage').classList.contains('is-entering'));
 const headings=['cityHeading','photoHeading','makeupHeading','videoHeading','ceremonyHeading','locationHeading'];headings.forEach((id,i)=>{p.d.getElementById(id).closest('section').getBoundingClientRect=()=>({top:i*400-350})});p.d.getElementById('quote').getBoundingClientRect=()=>({top:3000});p.w.dispatchEvent(new p.w.Event('resize'));
 assert(p.d.querySelector('#sectionLinks button[aria-current="step"]').textContent.includes('套餐'));assert.equal(p.d.getElementById('scrollLabel').textContent,'套餐');
 p.d.querySelectorAll('#sectionLinks button')[2].click();assert.equal(p.w.location.hash,'#plan');assert.equal(p.d.getElementById('makeupHeading').closest('section').dataset.scrolled,'true');
 p.d.querySelector('input[name="makeup"][value="self"]').click();assert.equal(p.d.getElementById('total').textContent,'¥5,988');
 for(const key of ['gallery','faq','plan','gallery','plan']){
  p.w.location.hash='#'+key;p.w.dispatchEvent(new p.w.HashChangeEvent('hashchange'));p.flush();
  assert.equal(p.d.querySelectorAll('#sectionLinks button').length,key==='gallery'?3:key==='faq'?0:7);
  assert.equal(p.d.querySelector('.line-sidebar').hidden,key==='faq');assert.equal(p.d.getElementById('scrollLabel').hidden,key==='faq');
  if(key==='faq'){assert.equal(p.d.getElementById('faqHeading').textContent,'Your questions,answered.');assert.equal(p.d.querySelector('.page-tabs a[href="#faq"]').textContent,'FAQ');assert.equal(p.d.title,'秋鸽 Studiooo_｜FAQ');assert.equal(p.d.querySelectorAll('#faqPage .faq-toggle').length,5);assert.equal(p.d.querySelectorAll('#faqPage .faq-answer').length,5)}
  assert.equal(p.d.getElementById(key+'Page').hidden,false);assert(p.d.getElementById(key+'Page').classList.contains('is-entering'));
  assert.equal(p.d.getElementById('total').textContent,'¥5,988');
  assert(p.d.getElementById(key+'Page').querySelectorAll('.reveal-item.is-visible').length>0);
 }
 p.d.querySelector('.page-tabs a[href="#plan"]').click();p.flush();assert.equal(p.w.location.hash,'#plan');assert(p.d.querySelector('.page-tabs a[href="#plan"]').classList.contains('is-pressed'));
 p.d.getElementById('resetPlan').click();assert.equal(p.d.getElementById('total').textContent,'¥6,988');
 assert(!p.events.includes('mousemove'));assert(!p.events.includes('pointermove'));assert.deepEqual(p.errors,[]);p.w.close();
}
const reduced=page(null,false,true);assert.equal(reduced.counts.frames,0);assert.equal(reduced.d.querySelectorAll('.reveal-item:not(.is-visible)').length,0);reduced.d.querySelector('input[name="pkg"][value="B"]').click();assert.equal(reduced.d.getElementById('stickyTotal').textContent,'¥8,988');assert(!reduced.d.getElementById('stickyTotal').parentElement.classList.contains('is-rolling'));reduced.listeners['(prefers-color-scheme: dark)']({matches:true});assert.equal(reduced.d.documentElement.dataset.theme,'dark');reduced.w.close();
const fallback=page(null,false,false,false);fallback.flush();assert.equal(fallback.d.getElementById('total').textContent,'¥6,988');assert.equal(fallback.d.querySelectorAll('.reveal-item:not(.is-visible)').length,0);assert.deepEqual(fallback.errors,[]);fallback.w.close();
console.log('PASS rolling amounts up/down and digit carry, rapid quote updates, exact copy totals, leaf/neon layers, themes, page animations, reduced motion and observer fallback');
