const fs=require('node:fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),visual=fs.readFileSync(__dirname+'/studio-visual.js','utf8');
function page(saved,systemDark,reduced,webgl=true){
 const errors=[],listeners={},events=[],draws={count:0,frames:0},values={};
 const dom=new JSDOM(html,{url:'https://torychiu.github.io/Studiooo_/#plan',runScripts:'dangerously',virtualConsole:new VirtualConsole().on('jsdomError',e=>errors.push(e)),beforeParse(w){
  if(saved)w.localStorage.setItem('studio-theme',saved);
  w.matchMedia=query=>({matches:query.includes('reduced')?reduced:systemDark,addEventListener:(type,cb)=>{listeners[query]=cb}});
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){this.dataset.scrolled='true'};
  w.requestAnimationFrame=()=>{draws.frames++;return draws.frames};w.cancelAnimationFrame=()=>{};
  if(webgl){w.WebGL2RenderingContext=function(){};w.HTMLCanvasElement.prototype.getContext=()=>({createShader:()=>({}),shaderSource(){},compileShader(){},getShaderParameter:()=>true,deleteShader(){},createProgram:()=>({}),attachShader(){},linkProgram(){},getProgramParameter:()=>true,useProgram(){},createBuffer:()=>({}),bindBuffer(){},bufferData(){},getAttribLocation:()=>0,enableVertexAttribArray(){},vertexAttribPointer(){},getUniformLocation:(_p,key)=>key,uniform1f:(key,v)=>{values[key]=v},uniform1i:(key,v)=>{values[key]=v},uniform2f(){},uniform3fv(){},viewport(){},drawArrays(){draws.count++}})}
  const add=w.document.addEventListener.bind(w.document);w.document.addEventListener=(type,...args)=>{events.push(type);return add(type,...args)};
 }});dom.window.eval(visual);return {dom,w:dom.window,d:dom.window.document,errors,listeners,events,draws,values};
}
for(const [saved,system,expected] of [[null,false,'light'],[null,true,'dark'],['light',true,'light'],['dark',false,'dark']]){
 const p=page(saved,system,false),before=p.d.getElementById('copy').dataset.text;
 assert.equal(p.d.documentElement.dataset.theme,expected);assert(p.draws.count>0);assert.equal(p.values.uEnableMouse,0);assert.equal(p.values.uParallax,0);
 p.d.getElementById('themeToggle').click();assert.equal(p.d.documentElement.dataset.theme,expected==='dark'?'light':'dark');
 assert.equal(p.w.localStorage.getItem('studio-theme'),p.d.documentElement.dataset.theme);assert.equal(p.d.getElementById('copy').dataset.text,before);assert.equal(p.d.getElementById('total').textContent,'¥6,988');
 assert.equal(p.d.querySelectorAll('#sectionLinks button').length,7);
 const headings=['cityHeading','photoHeading','makeupHeading','videoHeading','ceremonyHeading','locationHeading'];headings.forEach((id,i)=>{p.d.getElementById(id).closest('section').getBoundingClientRect=()=>({top:i*400-350})});p.d.getElementById('quote').getBoundingClientRect=()=>({top:3000});p.w.dispatchEvent(new p.w.Event('resize'));
 assert(p.d.querySelector('#sectionLinks button[aria-current="step"]').textContent.includes('套餐'));assert.equal(p.d.getElementById('scrollLabel').textContent,'套餐');
 p.d.querySelectorAll('#sectionLinks button')[2].click();assert.equal(p.w.location.hash,'#plan');assert.equal(p.d.getElementById('makeupHeading').closest('section').dataset.scrolled,'true');
 p.w.location.hash='#gallery';p.w.dispatchEvent(new p.w.HashChangeEvent('hashchange'));assert.equal(p.d.querySelectorAll('#sectionLinks button').length,3);assert.equal(p.d.getElementById('galleryPage').hidden,false);
 p.w.location.hash='#faq';p.w.dispatchEvent(new p.w.HashChangeEvent('hashchange'));assert.equal(p.d.querySelectorAll('#sectionLinks button').length,6);
 assert(!p.events.includes('mousemove'));assert(!p.events.includes('pointermove'));assert.deepEqual(p.errors,[]);p.w.close();
}
const p=page(null,false,true);assert.equal(p.draws.frames,0);assert(p.draws.count>0);p.listeners['(prefers-color-scheme: dark)']({matches:true});assert.equal(p.d.documentElement.dataset.theme,'dark');p.w.close();
const fallback=page(null,false,false,false);assert.equal(fallback.d.getElementById('total').textContent,'¥6,988');assert.deepEqual(fallback.errors,[]);fallback.w.close();
console.log('PASS themes, scroll chapters, section clicks, page navigation, quote isolation, reduced motion and WebGL fallback');
