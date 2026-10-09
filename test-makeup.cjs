const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const errors=[];let clipboard='';
function page(){return new JSDOM(html,{url:'https://torychiu.github.io/Studiooo_/#plan',runScripts:'dangerously',virtualConsole:new VirtualConsole().on('jsdomError',e=>errors.push(e)),beforeParse(w){Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async text=>{clipboard=text}}})}})}
const dom=page(),w=dom.window,d=w.document;
function pick(name,value){const input=d.querySelector(`input[name="${name}"][value="${value}"]`);assert(input);assert(!input.disabled);input.click()}
function total(){return Number(d.getElementById('total').textContent.replace(/[^0-9]/g,''))}
function quote(){return d.getElementById('copy').getAttribute('data-text')}
function discounted(){assert.equal(d.querySelector('input[name="makeup"]:checked').value,'self');assert.equal((d.getElementById('lines').textContent.match(/自备妆造优惠/g)||[]).length,1);assert.equal((quote().match(/自备妆造优惠：−¥1,000/g)||[]).length,1);assert(!quote().includes('含新娘妆造'))}
assert.equal(d.querySelector('input[name="makeup"]:checked').value,'included');assert.equal(total(),8988);
const bases={moscow:{A:6988,B:8988},spb:{A:8988,B:10988}},videos={none:0,short:1800,ceremony:2500};let count=0;
for(const city of ['moscow','spb'])for(const pkg of ['A','B'])for(const makeup of ['included','self'])for(const film of ['none','short','ceremony'])for(const ceremony of ['no','yes'])for(const main of (city==='spb'?['none','hermitage','vladimir']:['none'])){
 pick('city',city);pick('pkg',pkg);pick('makeup',makeup);pick('film',film);pick('ceremony',ceremony);pick('mainplace',main);
 const venue=city==='spb'?(main==='hermitage'?15000:main==='vladimir'?(film==='none'?10500:13000):0):0;
 const rub=venue+(ceremony==='yes'?8000:0);
 const expected=bases[city][pkg]-(makeup==='self'?1000:0)+videos[film]+Math.round(rub*0.08375);
 assert.equal(total(),expected,JSON.stringify({city,pkg,makeup,film,ceremony,main}));assert.equal(d.getElementById('stickyTotal').textContent,d.getElementById('total').textContent);
 assert(quote().includes('卢布部分：'+rub.toLocaleString('zh-CN')+'₽'));
 if(makeup==='self')discounted();else {assert(!quote().includes('自备妆造优惠'));assert(quote().includes('妆造服务：专业妆造及跟妆（已包含）'))}
 count++;
}
// Switching makeup leaves an established Moscow exception route untouched.
pick('city','moscow');pick('pkg','B');pick('film','none');pick('ceremony','no');pick('moscowPlace','M01');pick('moscowPlace','M05');
const routeBefore=Array.from(d.querySelectorAll('input[name="moscowPlace"]')).map(x=>[x.value,x.checked,x.disabled]);
pick('makeup','self');discounted();assert.equal(total(),7988);assert.deepEqual(Array.from(d.querySelectorAll('input[name="moscowPlace"]')).map(x=>[x.value,x.checked,x.disabled]),routeBefore);
pick('makeup','included');assert.equal(total(),8988);assert(d.getElementById('selfMakeupNotice').classList.contains('hidden'));assert(!d.getElementById('lines').textContent.includes('自备妆造优惠'));
pick('makeup','self');d.getElementById('copy').click();assert.equal(clipboard,quote());
d.getElementById('resetPlan').click();assert.equal(total(),8988);assert.equal(d.querySelector('input[name="makeup"]:checked').value,'included');assert.equal(d.querySelector('input[name="city"]:checked').value,'spb');assert.equal(d.querySelectorAll('input[name="moscowPlace"]:checked').length,0);
const refreshed=page();assert.equal(refreshed.window.document.querySelector('input[name="makeup"]:checked').value,'included');assert.equal(refreshed.window.document.getElementById('total').textContent,'¥8,988');
assert.deepEqual(errors,[]);dom.window.close();refreshed.window.close();console.log(`PASS ${count} quote combinations, route isolation, reset, refresh, clipboard and no runtime errors`);
