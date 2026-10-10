const fs=require('node:fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),visual=fs.readFileSync(__dirname+'/studio-visual.js','utf8');
function page(saved,systemDark,reduced){
 const errors=[],listeners={},events=[],draws={arcs:0,frames:0};
 const dom=new JSDOM(html,{url:'https://torychiu.github.io/Studiooo_/#plan',runScripts:'dangerously',virtualConsole:new VirtualConsole().on('jsdomError',e=>errors.push(e)),beforeParse(w){
  if(saved)w.localStorage.setItem('studio-theme',saved);
  w.matchMedia=query=>({matches:query.includes('reduced')?reduced:systemDark,addEventListener:(type,cb)=>{listeners[query]=cb}});
  w.requestAnimationFrame=()=>{draws.frames++;return draws.frames};w.cancelAnimationFrame=()=>{};
  w.CanvasRenderingContext2D=function(){};
  w.HTMLCanvasElement.prototype.getContext=()=>({setTransform(){},clearRect(){},beginPath(){},moveTo(){},arc(){draws.arcs++},fill(){}});
  const add=w.document.addEventListener.bind(w.document);w.document.addEventListener=(type,...args)=>{events.push(type);return add(type,...args)};
 }});dom.window.eval(visual);return {dom,w:dom.window,d:dom.window.document,errors,listeners,events,draws};
}
for(const [saved,system,expected] of [[null,false,'light'],[null,true,'dark'],['light',true,'light'],['dark',false,'dark']]){
 const p=page(saved,system,false),before=p.d.getElementById('copy').dataset.text;
 assert.equal(p.d.documentElement.dataset.theme,expected);assert(p.draws.arcs>0);
 p.d.getElementById('themeToggle').click();assert.equal(p.d.documentElement.dataset.theme,expected==='dark'?'light':'dark');
 assert.equal(p.w.localStorage.getItem('studio-theme'),p.d.documentElement.dataset.theme);
 assert.equal(p.d.getElementById('copy').dataset.text,before);assert.equal(p.d.getElementById('total').textContent,'¥6,988');
 assert(!p.events.includes('mousemove'));assert(!p.events.includes('pointermove'));assert.deepEqual(p.errors,[]);p.w.close();
}
const p=page(null,false,true);assert.equal(p.draws.frames,0);assert(p.draws.arcs>0);p.listeners['(prefers-color-scheme: dark)']({matches:true});assert.equal(p.d.documentElement.dataset.theme,'dark');p.w.close();
console.log('PASS theme preferences, persistence, quote isolation, reduced motion and no mouse tracking');
