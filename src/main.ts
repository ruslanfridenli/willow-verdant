const I18N={"en":{"controls":"Controls","setup":"Setup","grid":"Grid size","speed":"Speed","wrap":"Wrap-around walls","obs":"Obstacles","score":"Score","best":"Best","start":"▶ Start","reset":"↻ Reset","press":"Press start or use arrow keys / WASD / swipe","over":"Game over","food":"+10 bonus"},"de":{"controls":"Steuerung","setup":"Einstellungen","grid":"Gittergröße","speed":"Tempo","wrap":"Wände umlaufen","obs":"Hindernisse","score":"Punkte","best":"Rekord","start":"▶ Start","reset":"↻ Reset","press":"Start drücken oder Pfeiltasten / WASD / Wischen","over":"Game Over","food":"+10 Bonus"}};
let lang=localStorage.getItem('lang')||'en';
const t=k=>I18N[lang][k]||k;
function applyLang(){document.documentElement.lang=lang;document.querySelectorAll('[data-i]').forEach(el=>el.textContent=t(el.dataset.i));document.querySelectorAll('.lang button').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));}
document.querySelectorAll('.lang button').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem('lang',lang);applyLang();});

const cv=document.getElementById('cv'),ctx=cv.getContext('2d');const $=id=>document.getElementById(id);
let W,H,N=16,SPEED=8,WRAP=false,OBST=6;
let snake,dir,nd,food,obs,score,best=+(localStorage.getItem('nr-best')||0),alive=false,timer=null,acc=0,last=0;
$('best').textContent=best;
function resize(){const r=cv.parentElement.getBoundingClientRect();W=cv.width=r.width*devicePixelRatio;H=cv.height=r.height*devicePixelRatio;}
addEventListener('resize',resize);resize();
function reset(){
  N=+$('grid').value;SPEED=+$('speed').value;WRAP=$('wrap').checked;OBST=$('obs').checked?6:0;
  const c=Math.floor(N/2);snake=[{x:c,y:c},{x:c-1,y:c},{x:c-2,y:c}];dir={x:1,y:0};nd=dir;
  score=0;acc=0;$('score').textContent=0;placeObs();placeFood();$('overlay').style.display='flex';alive=false;clearInterval(timer);
}
function placeFood(){do{food={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)};}while(snake.some(s=>s.x===food.x&&s.y===food.y)||obs.some(o=>o.x===food.x&&o.y===food.y));}
function placeObs(){obs=[];let g=0;while(obs.length<OBST&&g++<200){const o={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)};if(!snake.some(s=>Math.abs(s.x-o.x)<3&&Math.abs(s.y-o.y)<3)&&!obs.some(q=>q.x===o.x&&q.y===o.y))obs.push(o);}}
function step(){
  dir=nd;let h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
  if(WRAP){h.x=(h.x+N)%N;h.y=(h.y+N)%N;}
  else if(h.x<0||h.y<0||h.x>=N||h.y>=N){die();return;}
  if(snake.some(s=>s.x===h.x&&s.y===h.y)||obs.some(o=>o.x===h.x&&o.y===h.y)){die();return;}
  snake.unshift(h);
  if(h.x===food.x&&h.y===food.y){score+=14;if(true)score+=4;$('score').textContent=score;placeFood();}
  else snake.pop();
}
function die(){alive=false;clearInterval(timer);if(score>best){best=score;localStorage.setItem('nr-best',best);$('best').textContent=best;}$('overlay').style.display='flex';$('overlay').querySelector('p').textContent=t('over')+' — '+t('score')+': '+score;}
function draw(){
  const cell=Math.min(W,H)/N;
  ctx.fillStyle='#07090f';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(30,42,63,.5)';ctx.lineWidth=1;
  for(let i=1;i<N;i++){ctx.beginPath();ctx.moveTo(i*cell,0);ctx.lineTo(i*cell,H);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*cell);ctx.lineTo(W,i*cell);ctx.stroke();}
  // obstacles
  ctx.fillStyle='#2a1520';
  for(const o of obs){ctx.fillRect(o.x*cell+2,o.y*cell+2,cell-4,cell-4);}
  // food
  ctx.fillStyle='#ff6ec7';ctx.shadowColor='#ff6ec7';ctx.shadowBlur=12;
  ctx.beginPath();ctx.arc(food.x*cell+cell/2,food.y*cell+cell/2,cell*0.32,0,7);ctx.fill();ctx.shadowBlur=0;
  // snake
  snake.forEach((s,i)=>{
    const f=i/snake.length;
    ctx.fillStyle=i===0?'#fff':`hsla(200,90%,${60+f*20}%,${1-f*0.4})`;
    const pad=1+i*0.15;
    ctx.fillRect(s.x*cell+pad,s.y*cell+pad,cell-pad*2,cell-pad*2);
  });
}
function loop(ts){if(!alive)return;acc+=ts-last;last=ts;const iv=1000/SPEED*3;while(acc>iv){acc-=iv;step();if(!alive)return;}draw();requestAnimationFrame(loop);}
function start(){if(alive)return;ensureAudio&&0;alive=true;$('overlay').style.display='none';last=performance.now();acc=0;requestAnimationFrame(loop);}
function ensureAudio(){try{const a=new(window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator(),g=a.createGain();o.frequency.value=440;g.gain.value=0.05;o.connect(g).connect(a.destination);o.start();}catch(e){}}
$('start').onclick=start;
$('reset').onclick=reset;
['grid','speed','wrap','obs'].forEach(id=>$(id).addEventListener('change',reset));
addEventListener('keydown',e=>{
  const map={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0],W:[0,-1],S:[0,1],A:[-1,0],D:[1,0]};
  const m=map[e.key];if(!m)return;e.preventDefault();
  if(!alive){start();return;}
  if((m[0]!==-dir.x||m[1]!==-dir.y)&&!(dir.x===0&&dir.y===0)){nd={x:m[0],y:m[1]};}
});
let tx=0,ty=0;
cv.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
cv.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
  if(Math.hypot(dx,dy)<20)return;
  const m=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];
  if(!alive){start();return;}
  if((m[0]!==-dir.x||m[1]!==-dir.y)){nd={x:m[0],y:m[1]};}
},{passive:true});
reset();applyLang();