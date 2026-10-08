const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const model=script.slice(script.indexOf('var MOSCOW_PLACES='),script.indexOf('var cityMemory='));
const ctx={};vm.createContext(ctx);vm.runInContext(model,ctx);
let checks=0;
function test(pkg,ids,expected){assert.equal(ctx.moscowValid(pkg,ids),expected);checks++}
test('A',['M01'],true);test('A',['M16'],true);test('B',['M16'],false);test('A',['M16','M03'],false);
for(const id of ['M10','M12','M05','M13','M03','M04','M14','M02']){
 test('B',['M01',id],true);test('B',[id,'M01'],true);
}
test('B',['M01','M05','M10'],false);test('A',['M01','M03'],false);
test('A',['M03','M04'],true);test('B',['M01','M01'],false);test('B',['bad'],false);
function brute(ids){
 if(ids.length<2)return 0;
 let best=Infinity;
 function walk(left,last,cost){
  if(!left.length){best=Math.min(best,cost);return}
  left.forEach((id,i)=>walk(left.filter((_,j)=>j!==i),id,cost+(last?ctx.transfer(last,id):0)));
 }
 walk(ids,null,0);return best;
}
// Independent route reference: enumerate all visit orders for representative clusters.
for(const ids of [['M02','M01','M03'],['M14','M04','M01','M03'],['M06','M07','M08'],['M03','M04','M01','M02','M14']]){
 assert.equal(ctx.shortestTransfers(ids),brute(ids));checks++;
}
// Every subset must produce the same validity regardless of selection order.
for(let mask=0;mask<65536;mask++){
 const ids=ctx.MOSCOW_PLACES.filter((p,i)=>mask&(1<<i)).map(p=>p.id);
 for(const pkg of ['A','B']){
  assert.equal(ctx.moscowValid(pkg,ids),ctx.moscowValid(pkg,ids.slice().reverse()));checks++;
 }
}
const expected={PRICE:'{moscow:{A:6988,B:8988},spb:{A:8988,B:10988}}',FILM:'{none:0,short:1800,ceremony:2500}',VENUE:'{hermitage:15000,vladimirPhoto:10500,vladimirVideo:13000}',RUB_RATE:'0.08375'};
for(const variable of ['PRICE','FILM','VENUE','RUB_RATE']){
 const re=new RegExp('var '+variable+'=([^;]+);');
 assert.equal(html.match(re)[1],expected[variable]);checks++;
}
console.log('PASS',checks,'route and unchanged-price checks; JavaScript syntax valid');
