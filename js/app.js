'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY='little-time-v1',pick=a=>a[Math.floor(Math.random()*a.length)];
const def={name:'my love',theme:'rose',dark:false,motion:'normal',sound:true,tick:false,notif:false,presets:[15,25,30,45,60,90],notes:[],tasks:[],sessions:[],timer:null,seen:false,mix:{},vol:.5,pomo:{on:false,study:25,brk:5},subject:''};
let S;try{S={...def,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){S={...def}}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dstr=(d=new Date())=>d.toLocaleDateString('en-CA'),today=()=>dstr();
const fmt=ms=>{let s=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);s%=60;return(h?h+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')};
const hrs=m=>m>=60?(m/60).toFixed(1)+' h':Math.round(m)+' min';
function toast(t){const e=$('#toast');e.textContent=t;e.className='show';clearTimeout(toast.t);toast.t=setTimeout(()=>e.className='',3500)}
const calm=()=>S.motion==='off'||matchMedia('(prefers-reduced-motion:reduce)').matches;
function burst(n=16){if(calm())return;if(S.motion==='calm')n=6;for(let i=0;i<n;i++){const p=document.createElement('div');p.className='petal';p.textContent=pick(['🌸','💗','✨','🌷']);p.style.left=Math.random()*100+'vw';p.style.animationDuration=3+Math.random()*3+'s';document.body.append(p);setTimeout(()=>p.remove(),6500)}}
function modal(h){$('#mbody').innerHTML=h+'<p><button class="btn" id="mx">OK ♡</button></p>';$('#modal').hidden=false;$('#mx').focus();$('#mx').onclick=()=>$('#modal').hidden=true}
/* ---- audio ---- */
let AC;const ac=()=>{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC};
function tone(f,t,d,v=.15){const c=ac(),o=c.createOscillator(),g=c.createGain();o.frequency.value=f;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(v,c.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t+d);o.start(c.currentTime+t);o.stop(c.currentTime+t+d)}
const chime=()=>{if(S.sound)try{[660,880,1100].forEach((f,i)=>tone(f,i*.25,.9))}catch(e){}};
const SND={rain:['🌧️ Rain','highpass',1500],wind:['🍃 Wind','lowpass',500],fire:['🔥 Fireplace','lowpass',250],forest:['🌲 Forest','bandpass',2800],cafe:['☕ Café','bandpass',650],white:['⚪ White noise','allpass',0]};
const live={};
function snd(k,on){const c=ac();if(on&&!live[k]){const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=b;s.loop=true;const f=c.createBiquadFilter();f.type=SND[k][1];f.frequency.value=SND[k][2]||350;const g=c.createGain();g.gain.value=S.vol*(k==='white'?.35:.7);s.connect(f);f.connect(g);g.connect(c.destination);s.start();live[k]={s,g}}else if(!on&&live[k]){live[k].s.stop();delete live[k]}S.mix[k]=on;save()}
function drawSnd(){$('#snds').innerHTML=Object.entries(SND).map(([k,v])=>`<button class="btn s ${S.mix[k]?'on':''}" data-k="${k}" aria-pressed="${!!S.mix[k]}">${v[0]}</button>`).join('');$('#vol').value=S.vol}
/* ---- timer ---- */
const T=S.timer||(S.timer={mode:'study',dur:1500000,left:1500000,endAt:0,run:false});
const C=565.5;let lastSec=-1;
function setT(min,mode){T.mode=mode||T.mode;T.dur=T.left=Math.round(min*60000);T.run=false;save();draw()}
function draw(){const left=T.run?Math.max(0,T.endAt-Date.now()):T.left;$('#time').textContent=fmt(left);$('#arc').style.strokeDashoffset=C*(1-(T.dur?left/T.dur:0))*-1+C*0;$('#arc').style.strokeDashoffset=C*(1-left/T.dur);
$('#phase').textContent=(T.mode==='study'?'Study':'Break')+(S.subject&&T.mode==='study'?' · '+S.subject:'');$('#go').textContent=T.run?'Pause':(T.left<T.dur?'Resume':'Start');
$('#eta').textContent=T.run?'Finishes around '+new Date(T.endAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';$('#bt').textContent=T.mode==='break'&&T.run?fmt(left):'';
document.title=T.run?fmt(left)+' · A Little Time for You':'A Little Time for You'}
function tick(){if(!T.run)return;const left=T.endAt-Date.now();if(left<=0){finish();return}const s=Math.ceil(left/1000);if(S.tick&&S.sound&&s!==lastSec){try{tone(1800,0,.03,.04)}catch(e){}}lastSec=s;draw()}
const todayMin=()=>S.sessions.filter(x=>dstr(new Date(x.t))===today()).reduce((a,x)=>a+x.min,0);
function notify(m){if(S.notif&&'Notification'in window&&Notification.permission==='granted')try{new Notification('A Little Time for You ♡',{body:m})}catch(e){}}
function finish(){const study=T.mode==='study';let msg;T.run=false;
if(study){S.sessions.push({t:Date.now(),min:Math.round(T.dur/600)/100,subj:S.subject||'General'});msg=todayMin()>=120?LOVE.long:pick(LOVE.done);burst(18)}else msg='Break is over. Ready whenever you are, love. ♡';
chime();notify(msg);
if(S.pomo.on){setT(study?S.pomo.brk:S.pomo.study,study?'break':'study');T.endAt=Date.now()+T.left;T.run=true;if(study)openBreak()}else T.left=T.dur;
save();renderAll();modal(`<h2>${study?'Session complete 🌸':'Break finished'}</h2><p class="hand">${esc(msg)}</p>${study&&!S.pomo.on?'<p><button class="btn s" id="mb">Take a little break</button></p>':''}`);
const mb=$('#mb');if(mb)mb.onclick=()=>{$('#modal').hidden=true;openBreak()}}
function openBreak(){$('#tips').innerHTML=['🧘 Stretch your neck, shoulders and wrists.','💧 Have a glass of water.','👀 20-20-20: look at something 20 feet away for 20 seconds, every 20 minutes.','💗 '+pick(LOVE.affirm)].map(t=>`<p>${t}</p>`).join('');$('#brk').hidden=false;$('#bx').focus();draw()}
$('#go').onclick=()=>{if(T.run){T.left=T.endAt-Date.now();T.run=false}else{if(T.left<=0)T.left=T.dur;T.endAt=Date.now()+T.left;T.run=true;if(T.mode==='break')openBreak()}save();draw()};
$('#rst').onclick=()=>{T.run=false;T.left=T.dur;save();draw()};
$('#skip').onclick=()=>{if(S.pomo.on){const st=T.mode==='study';setT(st?S.pomo.brk:S.pomo.study,st?'break':'study')}else{T.run=false;T.left=T.dur;save();draw()}};
$('#setc').onclick=()=>{const m=(+$('#th').value||0)*60+(+$('#tm').value||0)+(+$('#ts').value||0)/60;if(m<=0||m>5940)return toast('Please enter a time between 1 second and 99 hours.');setT(m,'study')};
$('#subj').oninput=e=>{S.subject=e.target.value;save();draw()};
$('#pomo').onchange=$('#ps').onchange=$('#pb').onchange=()=>{S.pomo={on:$('#pomo').checked,study:Math.max(1,+$('#ps').value||25),brk:Math.max(1,+$('#pb').value||5)};save()};
$('#tick').onchange=e=>{S.tick=e.target.checked;save()};
$('#b5').onclick=()=>{setT(5,'break');T.endAt=Date.now()+T.left;T.run=true;save();draw()};
$('#bx').onclick=()=>$('#brk').hidden=true;
$('#snds').onclick=e=>{const k=e.target.dataset.k;if(k){snd(k,!S.mix[k]);drawSnd()}};
$('#vol').oninput=e=>{S.vol=+e.target.value;Object.entries(live).forEach(([k,v])=>v.g.gain.value=S.vol*(k==='white'?.35:.7));save()};
function drawPresets(){$('#presets').innerHTML=S.presets.map(m=>`<button class="btn s" data-m="${m}">${m} min</button>`).join('')}
$('#presets').onclick=e=>{if(e.target.dataset.m)setT(+e.target.dataset.m,'study')};
/* ---- notes ---- */
const nid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const dt=t=>new Date(t).toLocaleString([],{dateStyle:'medium',timeStyle:'short'});
function renderNotes(){const q=$('#nq').value.toLowerCase();const l=S.notes.filter(n=>(n.title+n.cat+n.body).toLowerCase().includes(q)).sort((a,b)=>b.pin-a.pin||b.mod-a.mod);
$('#cats').innerHTML=[...new Set([...S.notes.map(n=>n.cat),...S.tasks.map(t=>t.sub)].filter(Boolean))].map(c=>`<option value="${esc(c)}">`).join('');
$('#notes').innerHTML=l.length?l.map((n,i)=>`<article class="note c${n.c}" data-id="${n.id}"><input data-f="title" value="${esc(n.title)}" placeholder="Title" aria-label="Note title"><input data-f="cat" list="cats" value="${esc(n.cat)}" placeholder="Subject" aria-label="Subject"><textarea data-f="body" placeholder="Write something…" aria-label="Note text">${esc(n.body)}</textarea><small>Created ${dt(n.cre)}<br><span class="md">Edited ${dt(n.mod)}</span></small><div class="row"><button class="btn s" data-a="pin">${n.pin?'📌 Pinned':'📍 Pin'}</button><button class="btn s" data-a="del">Delete</button></div></article>`).join(''):`<p class="mut">${q?'No notes match your search.':'No notes yet. Tap “New note” to start your little notebook.'}</p>`}
$('#nnew').onclick=()=>{$('#nq').value='';const t=Date.now();S.notes.push({id:nid(),title:'',cat:'',body:'',pin:false,c:S.notes.length%5,cre:t,mod:t});save();renderNotes();$('#notes input')&&$('#notes input').focus()};
$('#nq').oninput=renderNotes;
$('#notes').oninput=e=>{const a=e.target.closest('.note'),n=S.notes.find(x=>x.id===a.dataset.id);n[e.target.dataset.f]=e.target.value;n.mod=Date.now();a.querySelector('.md').textContent='Edited '+dt(n.mod);save()};
$('#notes').onclick=e=>{const a=e.target.closest('.note'),k=e.target.dataset.a;if(!k)return;const n=S.notes.find(x=>x.id===a.dataset.id);if(k==='pin')n.pin=!n.pin;else if(confirm('Delete this note? This can’t be undone.'))S.notes=S.notes.filter(x=>x!==n);save();renderNotes()};
$('#nexp').onclick=()=>{if(!S.notes.length)return toast('You have no notes to export yet.');dl('my-notes.txt',S.notes.map(n=>`${n.title||'Untitled'} [${n.cat||'No subject'}]\nCreated: ${dt(n.cre)} | Edited: ${dt(n.mod)}\n\n${n.body}\n`).join('\n----------\n\n'),'text/plain')};
function dl(name,txt,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
/* ---- goals ---- */
const prio=['','High','Medium','Low'];
function taskLi(t,mini){return`<li class="${t.done?'dn':''}" data-id="${t.id}"><button class="chk" data-a="tog" aria-label="${t.done?'Mark not done':'Mark done'}">${t.done?'✓':''}</button><span>${esc(t.text)}</span>${mini?'':`${t.sub?`<em class="tag">${esc(t.sub)}</em>`:''}<em class="tag">${prio[t.p]}</em>${t.due?`<em class="tag">due ${t.due}</em>`:''}<button data-a="edit" aria-label="Edit">✎</button><button data-a="del" aria-label="Delete">✕</button>`}</li>`}
function renderTasks(){const tt=S.tasks,open=tt.filter(t=>!t.done).sort((a,b)=>a.p-b.p||(a.due||'9').localeCompare(b.due||'9')),dn=tt.filter(t=>t.done);
$('#open').innerHTML=open.map(t=>taskLi(t)).join('')||'<li class="mut">Nothing left. A fresh start whenever you want one ♡</li>';$('#done').innerHTML=dn.map(t=>taskLi(t)).join('')||'<li class="mut">Finished goals will gather here.</li>';
const dayList=tt.filter(t=>!t.done||t.doneOn===today()),pc=dayList.length?Math.round(dayList.filter(t=>t.done).length/dayList.length*100):0;$('#pbar').style.width=pc+'%';
$('#pmsg').textContent=!dayList.length?'Add your first little goal to begin.':pc===100?'All done for today. I’m so proud of you! 💗':pc>=50?'You’re getting closer, one little step at a time.':pc>0?'A lovely start. Keep going, gently.':'Today’s a fresh page. Pick the smallest step first.'}
$('#tf').onsubmit=e=>{e.preventDefault();const x=$('#tt').value.trim();if(!x)return;S.tasks.push({id:nid(),text:x,sub:$('#tsub').value.trim(),p:+$('#tp').value,due:$('#td').value,done:false});$('#tt').value='';$('#td').value='';save();renderAll()};
$('#v-goals').onclick=e=>{const li=e.target.closest('li[data-id]'),k=e.target.dataset.a;if(!li||!k)return;const t=S.tasks.find(x=>x.id===li.dataset.id);
if(k==='tog'){t.done=!t.done;t.doneOn=t.done?today():'';if(t.done&&S.tasks.every(x=>x.done)){burst(24);toast('All your goals are done! 🌸')}}
else if(k==='edit'){const v=prompt('Edit goal',t.text);if(v&&v.trim())t.text=v.trim()}else if(confirm('Delete this goal?'))S.tasks=S.tasks.filter(x=>x!==t);save();renderAll()};
$('#clr').onclick=()=>{S.tasks=S.tasks.filter(t=>!t.done);save();renderAll()};
/* ---- garden / progress ---- */
const FL=['🌷','🌸','🌻','🪻','🌹','🌼','🌺','🪷'],DECO=[[8,'🦋'],[12,'🐝'],[16,'🍄'],[20,'🏡'],[30,'🌈']];
function gardenHTML(){const n=S.sessions.length,full=Math.floor(n/4),st=['🌰','🌱','🌿','🍀'][n%4];return Array.from({length:full},(_,i)=>`<span style="animation-delay:${i*.3}s">${FL[i%FL.length]}</span>`).join('')+`<span title="Growing">${st}</span>`+DECO.filter(d=>n>=d[0]).map(d=>`<span>${d[1]}</span>`).join('')}
const ACH=[['First Little Step','Complete your first session',n=>n>=1],['Focused Flower','Complete 5 sessions',n=>n>=5],['Study Star','Study for 10 total hours',(n,m)=>m>=600],['Blooming Mind','Complete 25 sessions',n=>n>=25],['Little Scholar','Complete 50 sessions',n=>n>=50]];
function renderProgress(){const ss=S.sessions,tot=ss.reduce((a,x)=>a+x.min,0),by={},subj={};ss.forEach(x=>{const d=dstr(new Date(x.t));by[d]=(by[d]||0)+x.min;subj[x.subj]=(subj[x.subj]||0)+x.min});
const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return[d.toLocaleDateString([],{weekday:'short'}),by[dstr(d)]||0]}),wk=days.reduce((a,d)=>a+d[1],0),mx=Math.max(1,...days.map(d=>d[1])),top=Object.entries(subj).sort((a,b)=>b[1]-a[1])[0],best=Object.entries(by).sort((a,b)=>b[1]-a[1])[0];
$('#stats').innerHTML=[['Total study time',hrs(tot)],['Sessions',ss.length],['Today',hrs(todayMin())],['This week',hrs(wk)],['Most studied',top?esc(top[0]):'—'],['Best day',best?hrs(best[1])+' ('+best[0]+')':'—']].map(s=>`<div class="card stat"><b>${s[1]}</b>${s[0]}</div>`).join('');
$('#chart').innerHTML=days.map(d=>`<div><i style="height:${d[1]/mx*110}px" title="${hrs(d[1])}"></i>${d[0]}</div>`).join('');
$('#ach').innerHTML=ACH.map(a=>`<div class="card ach ${a[2](ss.length,tot)?'got':''}"><b>${a[2](ss.length,tot)?'⭐':'☆'} ${a[0]}</b><br>${a[1]}</div>`).join('');
$('#hist').innerHTML=ss.slice(-15).reverse().map(x=>`<li><span>${esc(x.subj)}</span>${hrs(x.min)} · ${dt(x.t)}</li>`).join('')||'<li class="mut">Your finished sessions will appear here.</li>'}
/* ---- home / letters ---- */
const daily=()=>LOVE.notes[Math.floor(Date.now()/864e5)%LOVE.notes.length];
function renderHome(){const h=new Date().getHours(),g=h<5?'Still up':h<12?'Good morning':h<18?'Good afternoon':'Good evening';$('#hi').textContent=`${g}, ${S.name}. 💗`;$('#date').textContent=new Date().toLocaleDateString([],{dateStyle:'full'});$('#daily').textContent=daily();
$('#quick').innerHTML=[25,45,60].map(m=>`<button class="btn" data-q="${m}">${m} min</button>`).join('');const m=todayMin();
$('#bun').innerHTML=`<span class="bun">🐰</span><p class="hand">${m===0?'Ready when you are!':m<30?'Nice little start!':m<120?'You’re doing so well!':'Resting is productive too ♡'}</p>`;
$('#htasks').innerHTML=S.tasks.filter(t=>!t.done).slice(0,4).map(t=>taskLi(t,1)).join('')||'<li class="mut">No goals yet. Add one in My Goals.</li>';$('#hgarden').innerHTML=gardenHTML()}
$('#quick').onclick=e=>{if(e.target.dataset.q){setT(+e.target.dataset.q,'study');go('focus');$('#go').click()}};
$('#htasks').onclick=e=>{if(e.target.dataset.a==='tog'){const t=S.tasks.find(x=>x.id===e.target.closest('li').dataset.id);t.done=true;t.doneOn=today();save();renderAll()}};
$('#env').onclick=()=>{$('#env').classList.add('open');$('#lnote').textContent=pick(LOVE.notes);burst(5)};
$('#lall').innerHTML=LOVE.notes.map(n=>`<li><span>💌 ${esc(n)}</span></li>`).join('');
let logoN=0;$('#logo').onclick=()=>{if(++logoN>=5){logoN=0;toast(LOVE.egg);burst(20)}};
/* ---- settings ---- */
function applyTheme(){document.body.dataset.theme=S.theme;document.body.dataset.dark=S.dark;document.body.dataset.motion=S.motion}
function loadSettings(){$('#sn').value=S.name;$('#st').value=S.theme;$('#sd').checked=S.dark;$('#sm').value=S.motion;$('#sp').value=S.presets.join(', ');$('#ss').checked=S.sound;$('#pomo').checked=S.pomo.on;$('#ps').value=S.pomo.study;$('#pb').value=S.pomo.brk;$('#tick').checked=S.tick;$('#subj').value=S.subject;
$('#sno').textContent=S.notif&&'Notification'in window&&Notification.permission==='granted'?'Notifications are on (tap to turn off)':'Enable browser notifications'}
$('#sn').oninput=e=>{S.name=e.target.value.trim()||'my love';save();renderHome()};
$('#st').onchange=e=>{S.theme=e.target.value;save();applyTheme()};$('#sd').onchange=e=>{S.dark=e.target.checked;save();applyTheme()};$('#sm').onchange=e=>{S.motion=e.target.value;save();applyTheme()};$('#ss').onchange=e=>{S.sound=e.target.checked;save()};
$('#sp').onchange=e=>{const p=e.target.value.split(',').map(x=>+x.trim()).filter(x=>x>0&&x<=1440);if(!p.length)return toast('Enter minutes like 15, 25, 45.');S.presets=p;save();drawPresets()};
$('#sno').onclick=async()=>{if(!('Notification'in window))return toast('This browser doesn’t support notifications.');if(S.notif){S.notif=false}else{const p=Notification.permission==='granted'?'granted':await Notification.requestPermission();S.notif=p==='granted';if(!S.notif)toast('Notifications are blocked in your browser settings.')}save();loadSettings()};
$('#sex').onclick=()=>dl('little-time-backup.json',JSON.stringify(S,null,1),'application/json');
$('#sim').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{const d=JSON.parse(t);if(typeof d!=='object'||!Array.isArray(d.notes))throw 0;localStorage.setItem(KEY,JSON.stringify(d));location.reload()}).catch(()=>toast('That file doesn’t look like a backup from this website.'))};
$('#sin').onclick=()=>{S.seen=false;save();location.reload()};
$('#srs').onclick=()=>{if(confirm('Reset everything? All notes, goals, sessions and settings will be erased.')){localStorage.removeItem(KEY);location.reload()}};
/* ---- navigation / init ---- */
const NAV=[['home','🏠','Home'],['focus','⏳','Focus'],['notes','📓','Notes'],['goals','🌷','My Goals'],['garden','🌱','Garden'],['progress','⭐','Progress'],['letters','💌','Letters'],['settings','🎀','Settings']];
$('#nav').innerHTML=NAV.map(n=>`<button data-go="${n[0]}"><b>${n[1]}</b> ${n[2]}</button>`).join('');
$('#nav').onclick=e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)};
function go(v){if(!NAV.some(n=>n[0]===v))v='home';$$('.view').forEach(e=>e.hidden=e.id!=='v-'+v);$$('[data-go]').forEach(b=>b.classList.toggle('on',b.dataset.go===v));renderAll();history.replaceState(null,'','#'+v);scrollTo(0,0)}
function renderAll(){renderHome();renderTasks();renderNotes();renderProgress();$('#garden').innerHTML=gardenHTML();$('#gtxt').textContent=S.sessions.length?`${S.sessions.length} sessions have grown this garden. Every little bit counts, and it will always be here for you.`:'Your seed is waiting. Finish a study session and watch it start to grow. 🌱'}
$('#enter').onclick=()=>{S.seen=true;save();$('#intro').hidden=true;burst(10)};
addEventListener('keydown',e=>{if(e.key==='Escape'){$('#modal').hidden=true;$('#brk').hidden=true}});
setInterval(()=>{$('#bword').textContent=$('#bword').textContent.startsWith('Breathe in')?'Breathe out…':'Breathe in…'},4000);
let lastHeart=0;addEventListener('mousemove',e=>{if(calm()||Date.now()-lastHeart<4000||Math.random()>.02)return;lastHeart=Date.now();const h=document.createElement('div');h.className='petal';h.textContent='♡';h.style.cssText=`left:${e.clientX}px;top:${e.clientY}px;animation-duration:2.5s`;document.body.append(h);setTimeout(()=>h.remove(),2600)});
addEventListener('click',()=>{if(!ac.done){ac.done=1;Object.keys(S.mix).forEach(k=>{if(S.mix[k]&&SND[k])snd(k,true)});drawSnd()}},{once:true});
document.addEventListener('visibilitychange',tick);
applyTheme();loadSettings();drawPresets();drawSnd();$('#intro').hidden=S.seen;go(location.hash.slice(1)||'home');draw();setInterval(tick,250);
