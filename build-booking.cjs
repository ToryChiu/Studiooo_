// Render from one content source at build time; no runtime fetch or dependency.
const fs=require('node:fs');
const data=require('./booking-content.json');
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const number=i=>String(i+1).padStart(2,'0');
const emphasis=['定金到账后，档期才正式保留。','定金不予退还。','距离约定拍摄日期3日以内取消：已支付款项全部退还，并额外补偿相当于预约定金10%的费用。','最长6个月的隐私保留期','费用为拍摄套餐金额的25%'];
function paragraph(s){let text=escape(s);emphasis.forEach(part=>{text=text.replace(escape(part),'<strong>'+escape(part)+'</strong>')});return '<p>'+text+'</p>'}
const process=`<section class="panel booking-process" id="bookingProcess" aria-labelledby="bookingProcessHeading">
<div class="eyebrow">BOOKING PROCESS</div><h2 id="bookingProcessHeading">约拍流程</h2>
<ol class="booking-timeline">${data.steps.map((s,i)=>`<li><span class="booking-number" aria-hidden="true">${number(i)}</span><span>${escape(s)}</span></li>`).join('')}</ol>
<p class="hint">${escape(data.note)}</p></section>`;
const info=`<section id="bookingInfoPage" class="page-section hidden" aria-labelledby="bookingInfoHeading" hidden>
<div class="page-intro"><div class="eyebrow">BOOKING INFORMATION</div><h2 id="bookingInfoHeading" tabindex="-1">约拍须知</h2><p>为确保拍摄顺利进行，请在预约前阅读以下说明。</p><a class="page-link" href="#plan">返回定制报价 →</a></div>
${data.sections.map((s,i)=>`<section class="panel booking-chapter" aria-labelledby="bookingChapter${i+1}"><div class="eyebrow" aria-hidden="true">${number(i)} /</div><h3 id="bookingChapter${i+1}">${escape(s.title)}</h3>${s.paragraphs.map(paragraph).join('\n')}</section>`).join('\n')}
<a class="page-link" href="#plan">返回定制报价 →</a></section>`;
const filename=__dirname+'/index.html';let html=fs.readFileSync(filename,'utf8');
for(const [key,value] of [['process',process],['info',info]]){const start='<!-- booking:'+key+' -->',end='<!-- /booking:'+key+' -->';if(!html.includes(start))throw Error('Missing '+start);html=html.replace(new RegExp(start+'[\\s\\S]*?'+end),start+'\n'+value+'\n'+end)}
fs.writeFileSync(filename,html);
console.log('Rendered 7 booking steps and 6 complete chapters.');
