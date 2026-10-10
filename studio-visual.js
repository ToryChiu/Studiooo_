/* Local visual draft. Original neon and leaf-shadow prototypes.
   Official React Bits Pro components require a license and are not installed. */
(function(){
 'use strict';
 var root=document.documentElement,button=document.getElementById('themeToggle');
 var system=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
 var reduced=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
 var preference='';try{preference=localStorage.getItem('studio-theme')||''}catch(error){}
 function applyTheme(theme){root.dataset.theme=theme;button.setAttribute('aria-label',theme==='dark'?'切换亮色模式':'切换暗色模式');button.setAttribute('aria-pressed',String(theme==='dark'));document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#171817':'#f8f7f4'}
 button.addEventListener('click',function(){preference=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('studio-theme',preference)}catch(error){}applyTheme(preference)});
 if(system&&system.addEventListener)system.addEventListener('change',function(e){if(!preference)applyTheme(e.matches?'dark':'light')});
 applyTheme(preference==='dark'||preference==='light'?preference:system&&system.matches?'dark':'light');
 // Build a soft plant silhouette once; CSS moves the three crowns independently.
 var leaves=document.getElementById('dappledLeaves'),ns='http://www.w3.org/2000/svg';
 function path(parent,d,attributes){var el=document.createElementNS(ns,'path');el.setAttribute('d',d);Object.keys(attributes||{}).forEach(function(key){el.setAttribute(key,attributes[key])});parent.appendChild(el);return el}
 [[1220,-70,670,870],[1300,130,620,550],[1330,-90,830,420]].forEach(function(branch,crown){
  var group=document.createElementNS(ns,'g');group.setAttribute('class','foliage-crown');leaves.appendChild(group);
  var x=branch[0],y=branch[1],dx=branch[2]-x,dy=branch[3]-y;
  path(group,'M'+x+' '+y+' Q'+(x-90)+' '+(y+dy*.6)+' '+(x+dx)+' '+(y+dy),{fill:'none','stroke-width':'8','stroke-linecap':'round'});
  for(var i=0;i<12;i++){
   var t=(i+.5)/12,bx=x+dx*t+Math.sin(t*Math.PI)*55,by=y+dy*t;
   var side=i%2===0?-1:1,angle=(side<0?205:105)+crown*13+i*2,length=100+(i%4)*22;
   var twigEndX=bx+side*(65+i%3*16),twigEndY=by-45;
   path(group,'M'+bx+' '+by+' Q'+(bx+side*40)+' '+(by-8)+' '+twigEndX+' '+twigEndY,{fill:'none','stroke-width':'3'});
   path(group,'M0 0 Q'+(length*.4)+' -38 '+length+' 0 Q'+(length*.42)+' 36 0 0',{stroke:'none',transform:'translate('+twigEndX+' '+twigEndY+') rotate('+angle+')'});
   path(group,'M0 0 Q45 -22 88 0 Q35 24 0 0',{stroke:'none',transform:'translate('+bx+' '+by+') rotate('+(angle+70)+')'});
  }
 });
 // The semantic amount stays exact immediately; only the aria-hidden digits roll.
 var semanticPrice=document.getElementById('stickyTotal'),rollingPrice=document.getElementById('stickyRolling'),lastPrice=semanticPrice.textContent,priceFrame=null;
 semanticPrice.setAttribute('aria-live','polite');semanticPrice.setAttribute('aria-atomic','true');
 function rollPrice(text){
  if(priceFrame!==null){cancelAnimationFrame(priceFrame);priceFrame=null}
  var old=lastPrice;lastPrice=text;rollingPrice.replaceChildren();
  if(reduced&&reduced.matches){semanticPrice.parentElement.classList.remove('is-rolling');return}
  var digits=text.replace(/\D/g,''),previous=old.replace(/\D/g,'').padStart(digits.length,'0').slice(-digits.length),increase=Number(digits)>=Number(old.replace(/\D/g,'')),index=0,tracks=[];
  Array.from(text).forEach(function(char){
   if(!/\d/.test(char)){var symbol=document.createElement('span');symbol.className='price-symbol';symbol.textContent=char;rollingPrice.appendChild(symbol);return}
   var next=Number(char),before=Number(previous[index]),digit=document.createElement('span'),track=document.createElement('span');digit.className='price-digit';track.className='price-digit-track';
   for(var n=0;n<30;n++){var number=document.createElement('span');number.textContent=String(n%10);track.appendChild(number)}
   track.style.transform='translateY(-'+((10+before)*1.25)+'em)';digit.appendChild(track);rollingPrice.appendChild(digit);
   var delta=increase?(next-before+10)%10:-((before-next+10)%10);
   tracks.push({el:track,end:10+before+delta,index:index});index++;
  });
  semanticPrice.parentElement.classList.add('is-rolling');rollingPrice.dataset.value=text;
  if(text===old){tracks.forEach(function(t){t.el.style.transform='translateY(-'+(t.end*1.25)+'em)'});return}
  void rollingPrice.offsetWidth;
  priceFrame=requestAnimationFrame(function(){priceFrame=null;tracks.forEach(function(t){t.el.style.transition='transform 620ms cubic-bezier(.22,1,.36,1) '+t.index*22+'ms';t.el.style.transform='translateY(-'+(t.end*1.25)+'em)'})});
 }
 document.addEventListener('studio:price',function(event){if(event.detail.text!==lastPrice)rollPrice(event.detail.text)});
 if(reduced&&reduced.addEventListener)reduced.addEventListener('change',function(){rollPrice(semanticPrice.textContent)});
 rollPrice(lastPrice);
 var tabs=document.querySelector('.page-tabs'),marker=tabs.querySelector('.tab-indicator'),stage=document.querySelector('.studio-neon-stage'),observer=null,enterFrame=null;
 function moveMarker(){var link=tabs.querySelector('[aria-current="page"]');if(!link)return;marker.style.width=link.offsetWidth+'px';marker.style.transform='translateX('+link.offsetLeft+'px)'}
 function currentPage(){var key=location.hash.slice(1);return document.getElementById(({gallery:'galleryPage',faq:'faqPage'})[key]||'planPage')}
 function replay(){
  if(observer)observer.disconnect();
  if(enterFrame!==null)cancelAnimationFrame(enterFrame);
  var page=currentPage();document.querySelectorAll('.page-section').forEach(function(el){el.classList.remove('is-entering')});
  var items=Array.from(page.querySelectorAll('.panel,.summary,.gallery-card,.page-intro,.faq-item'));
  page.classList.remove('reveal-ready');
  items.forEach(function(el,i){el.classList.add('reveal-item');el.classList.remove('is-visible');el.style.setProperty('--reveal-delay',Math.min(i%4*75,225)+'ms')});
  moveMarker();
  if(reduced&&reduced.matches){items.forEach(function(el){el.classList.add('is-visible')});return}
  stage.classList.add('is-replaying');
  // Commit the reset before restarting; repeated clicks must replay the animation.
  void page.offsetWidth;void stage.offsetWidth;
  enterFrame=requestAnimationFrame(function(){
   enterFrame=null;page.classList.add('is-entering');stage.classList.remove('is-replaying');
   if(typeof window.IntersectionObserver==='function'){
    page.classList.add('reveal-ready');
    observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.08,rootMargin:'0px 0px 20px 0px'});
    items.forEach(function(el){observer.observe(el)});
   }else items.forEach(function(el){el.classList.add('is-visible')});
  });
 }
 tabs.querySelectorAll('a').forEach(function(link){link.addEventListener('click',function(e){link.classList.remove('is-pressed');void link.offsetWidth;link.classList.add('is-pressed');if(link.hash===location.hash||!location.hash&&link.hash==='#plan'){e.preventDefault();replay()}})});
 document.addEventListener('studio:page',replay);window.addEventListener('resize',moveMarker,{passive:true});
 if(reduced&&reduced.addEventListener)reduced.addEventListener('change',replay);
 // Gallery filtering creates new cards: reveal only new visible content, without resetting the page.
 if(typeof window.MutationObserver==='function')new MutationObserver(function(){var page=currentPage();page.querySelectorAll('.gallery-card:not(.reveal-item)').forEach(function(el,i){el.classList.add('reveal-item','is-visible');el.style.setProperty('--reveal-delay',Math.min(i%4*75,225)+'ms')})}).observe(document.getElementById('galleryGrid'),{childList:true});
 replay();
 // This sidebar tracks sections within the current page. It never changes the page hash.
 var list=document.getElementById('sectionLinks'),indicator=document.getElementById('scrollLabel'),chapters=[],scrollFrame=null;
 function setActive(index){chapters.forEach(function(c,i){if(i===index)c.button.setAttribute('aria-current','step');else c.button.removeAttribute('aria-current')});indicator.textContent=chapters[index]?chapters[index].label:''}
 function track(){scrollFrame=null;if(!chapters.length)return;var threshold=Math.min(180,window.innerHeight*.3),active=0;chapters.forEach(function(c,i){if(c.target.getBoundingClientRect().top<=threshold)active=i});if(window.scrollY>0&&window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-8)active=chapters.length-1;setActive(active)}
 function rebuild(){
  var page=location.hash==='#gallery'?'gallery':location.hash==='#faq'?'faq':'plan',targets=[];
  if(page==='plan')targets=[['城市','cityHeading'],['套餐','photoHeading'],['妆造','makeupHeading'],['视频','videoHeading'],['仪式','ceremonyHeading'],['地点','locationHeading'],['报价','quote']].map(function(x){var el=document.getElementById(x[1]);return {label:x[0],target:x[1]==='quote'?el:el.closest('section')}});
  else if(page==='gallery')targets=[{label:'概览',target:document.getElementById('galleryPage')},{label:'筛选',target:document.getElementById('gallerySearch')},{label:'客片',target:document.getElementById('galleryGrid')}];
  list.parentElement.hidden=page==='faq';indicator.hidden=page==='faq';
  list.replaceChildren();chapters=[];targets.forEach(function(c,i){if(!c.target)return;var li=document.createElement('li'),b=document.createElement('button'),index=document.createElement('span');b.type='button';index.className='line-index';index.setAttribute('aria-hidden','true');index.textContent=String(i+1).padStart(2,'0');b.appendChild(index);b.appendChild(document.createTextNode(c.label));b.addEventListener('click',function(){c.target.scrollIntoView({behavior:reduced&&reduced.matches?'auto':'smooth',block:'start'});setActive(i)});li.appendChild(b);list.appendChild(li);c.button=b;chapters.push(c)});track();
 }
 window.addEventListener('scroll',function(){if(scrollFrame===null)scrollFrame=requestAnimationFrame(track)},{passive:true});window.addEventListener('resize',track,{passive:true});window.addEventListener('hashchange',rebuild);rebuild();
})();
