const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const target=process.env.STUDIO_TEST_URL||'file://'+__dirname+'/index.html';
(async()=>{
 let checks=0;
 for(const [engine,size] of [[chromium,{width:390,height:844}],[webkit,{width:390,height:844}],[chromium,{width:820,height:1180}],[chromium,{width:1440,height:900}]]){
 const browser=await engine.launch({headless:true});const page=await browser.newPage({viewport:size});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(target);
 const input=(name,value)=>page.locator('input[name="'+name+'"][value="'+value+'"]');
 const click=async(name,value)=>{await input(name,value).locator('..').click();checks++};
 const selected=async()=>page.locator('input[name="moscowPlace"]:checked').evaluateAll(es=>es.map(e=>e.value));
 const disabled=async(id)=>input('moscowPlace',id).isDisabled();
 const clear=async()=>{for(const id of await selected())await click('moscowPlace',id)};
 await click('city','moscow');
 await click('moscowPlace','M01');assert.deepEqual(await selected(),['M01']);assert(await disabled('M03'));await clear();
 await click('moscowPlace','M16');assert(await disabled('M01'));assert(!(await disabled('M16')));await click('freestyle','yes');
 assert((await page.locator('#copy').getAttribute('data-text')).includes('自由创作仅限该场地区域内'));
 await click('pkg','B');assert.deepEqual(await selected(),[]);assert(await disabled('M16'));assert((await page.locator('#moscowNotice').innerText()).includes('调整'));
 for(const id of ['M10','M05','M12','M13','M03','M04','M14','M02']){
 await click('moscowPlace',id);assert(!(await disabled('M01')));await click('moscowPlace','M01');assert((await selected()).includes(id));
 if(id==='M05')assert(await disabled('M10'));
 await clear();
 await click('moscowPlace','M01');assert(!(await disabled(id)));await click('moscowPlace',id);await clear();
 }
 await click('moscowPlace','M01');await click('moscowPlace','M05');await click('pkg','A');assert.deepEqual(await selected(),['M01']);
 await click('pkg','B');assert(!(await disabled('M05')));await clear();assert(!(await disabled('M10')));
 await click('pkg','A');await click('moscowPlace','M03');await click('moscowPlace','M04');assert.deepEqual(await selected(),['M03','M04']);await clear();
 // Reject a forged change event for a disabled option.
 await click('moscowPlace','M01');
 await input('moscowPlace','M05').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}))});
 assert.deepEqual(await selected(),['M01']);
 await click('film','short');assert.equal(await page.locator('#total').innerText(),'¥8,788');
 await click('pkg','B');await click('film','ceremony');await click('ceremony','yes');assert.equal(await page.locator('#total').innerText(),'¥12,158');
 let quote=await page.locator('#copy').getAttribute('data-text');assert(quote.includes('8,000₽'));assert(quote.includes('红场'));assert(!quote.includes('圣伊萨克'));
 await click('city','spb');quote=await page.locator('#copy').getAttribute('data-text');assert(!quote.includes('红场'));assert(!quote.includes('摄影师自由创作'));
 await click('mainplace','vladimir');assert.equal(await page.locator('#vladimirPrice').innerText(),'照片＋视频许可 13,000₽');
 await click('film','none');assert.equal(await page.locator('#vladimirPrice').innerText(),'照片许可 10,500₽');
 await click('outdoor','kazan');await click('outdoor','book');
 await click('mainplace','hermitage');await click('pkg','A');assert.equal(await page.locator('input[name="outdoor"]:checked').count(),0);
 assert(await input('outdoor','kazan').isDisabled());
 // All unchanged service prices, including combined ruble rounding.
 for(const city of ['moscow','spb'])for(const pkg of ['A','B'])for(const film of ['none','short','ceremony'])for(const ceremony of ['no','yes']){
 await click('city',city);await click('pkg',pkg);await click('film',film);await click('ceremony',ceremony);
 const base={moscow:{A:6988,B:8988},spb:{A:8988,B:10988}}[city][pkg];
 const rubles=(ceremony==='yes'?8000:0)+(city==='spb'?15000:0);
 assert.equal(await page.locator('#total').innerText(),'¥'+(base+{none:0,short:1800,ceremony:2500}[film]+Math.round(rubles*.08375)).toLocaleString('zh-CN'));
 }
 await click('city','moscow');
 assert.equal(await page.locator('#moscowLocations input').count(),16);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const visible=await page.locator('#moscowLocations').innerText();assert(!/分钟|剩余|累计拍摄|转场时间/.test(visible));
 // Exercise the actual copy button and its manual fallback.
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('test'))}});document.execCommand=()=>false});
 await page.locator('#copy').click();await page.locator('#manualCopy').waitFor({state:'visible'});
 assert.equal(await page.locator('#manualQuote').inputValue(),await page.locator('#copy').getAttribute('data-text'));
 assert.deepEqual(errors,[]);
 if(size.width===390&&engine===chromium)await page.screenshot({path:__dirname+'/moscow-mobile.png',fullPage:true});
 console.log(engine.name(),size.width,'PASS');await browser.close();
 }
 console.log('PASS',checks,'real UI interactions');
})().catch(e=>{console.error(e);process.exit(1)});
