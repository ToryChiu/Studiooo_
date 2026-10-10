/* Vanilla adaptation of the provided React Bits LineSidebar / DotField.
   The field moves autonomously and responds to clicks only; no pointer tracking. */
(function(){
 'use strict';
 var root=document.documentElement,button=document.getElementById('themeToggle');
 var system=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
 var reduced=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
 var preference='';try{preference=localStorage.getItem('studio-theme')||''}catch(error){}
 function applyTheme(theme){root.dataset.theme=theme;button.textContent=theme==='dark'?'☀':'☾';button.setAttribute('aria-label',theme==='dark'?'切换亮色模式':'切换暗色模式');button.setAttribute('aria-pressed',String(theme==='dark'));document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#171817':'#f8f7f4';paint(0)}
 button.addEventListener('click',function(){preference=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('studio-theme',preference)}catch(error){}applyTheme(preference)});
 if(system&&system.addEventListener)system.addEventListener('change',function(e){if(!preference)applyTheme(e.matches?'dark':'light')});
 var canvas=document.getElementById('dotCanvas'),ctx=null,width=0,height=0,dots=[],ripples=[],raf=null,last=0;
 // A missing canvas API leaves the fully usable static page intact.
 if(typeof window.CanvasRenderingContext2D!=='undefined')try{ctx=canvas.getContext('2d',{alpha:true})}catch(error){}
 function resize(){if(!ctx)return;width=window.innerWidth;height=window.innerHeight;var dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);dots=[];var step=width<600?24:22;for(var y=step/2;y<height;y+=step)for(var x=step/2;x<width;x+=step)dots.push({x:x,y:y});paint(0)}
 function paint(now){if(!ctx)return;ctx.clearRect(0,0,width,height);ctx.fillStyle=getComputedStyle(root).getPropertyValue('--dot').trim();ctx.beginPath();var time=now*.0004,motion=!(reduced&&reduced.matches);dots.forEach(function(dot){var x=dot.x+(motion?Math.cos(dot.y*.013+time)*2:0),y=dot.y+(motion?Math.sin(dot.x*.016+time)*4:0);ripples.forEach(function(r){var distance=Math.hypot(dot.x-r.x,dot.y-r.y),age=(now-r.at)/1000,ring=age*220,force=Math.exp(-Math.pow((distance-ring)/38,2))*Math.max(0,1-age/2)*12;if(distance>0){x+=(dot.x-r.x)/distance*force;y+=(dot.y-r.y)/distance*force}});ctx.moveTo(x+.8,y);ctx.arc(x,y,.8,0,Math.PI*2)});ctx.fill()}
 function frame(now){raf=null;if(document.hidden||reduced&&reduced.matches)return;if(now-last>=32){ripples=ripples.filter(function(r){return now-r.at<2000});paint(now);last=now}raf=requestAnimationFrame(frame)}
 function start(){if(raf!==null)cancelAnimationFrame(raf);raf=null;if(!ctx)return;if(document.hidden||reduced&&reduced.matches){ripples=[];paint(0);return}raf=requestAnimationFrame(frame)}
 window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',start);
 // Click / tap triggers a brief ripple in exposed background, never in a form control.
 document.addEventListener('click',function(e){if(!ctx||reduced&&reduced.matches||e.target.closest('button,a,label,input,textarea,summary,.panel,.summary,.gallery-card'))return;ripples.push({x:e.clientX,y:e.clientY,at:performance.now()});if(ripples.length>4)ripples.shift()},{passive:true});
 if(reduced&&reduced.addEventListener)reduced.addEventListener('change',start);
 resize();applyTheme(preference==='dark'||preference==='light'?preference:system&&system.matches?'dark':'light');start();
})();
