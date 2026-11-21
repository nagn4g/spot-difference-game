import {CONFIG,clock} from './config.js';
import {scenes} from './scenes.js';
import {render} from './render.js';
import {bindInput} from './input.js';
import {playSound,toggleSound} from './audio.js';
import {stageScreenshot} from './shots.js';

const $=id=>document.getElementById(id);
const canvas=$('world');
const state={scene:0,mode:'title',found:new Set(),elapsed:0,strikes:0,hints:CONFIG.hints,hint:null,miss:null,scores:[],staged:false};
let previous=performance.now(),restartAt=0;
let message='Find ten changes. Take your time; look a little closer.';

function startScene(index) {
  Object.assign(state,{scene:index,mode:'play',found:new Set(),elapsed:0,strikes:0,hints:CONFIG.hints,hint:null,miss:null,staged:false});
  previous=performance.now();restartAt=0;
  message='Both pictures hold the answer. Click a change on either side.';
  updateHud();
}
function finishScene() {
  state.mode='complete';state.hint=null;
  const points=Math.max(100,2000-Math.floor(state.elapsed)*4-state.strikes*100-(CONFIG.hints-state.hints)*80);
  state.scores[state.scene]=points;
  message=state.scene===2?'Your field guide is complete. Thirty little secrets, found.':'A page of the field guide, beautifully restored.';
  playSound('complete');
}
function hunt(x,y,screenX) {
  if(state.mode!=='play') return;
  const target=scenes[state.scene].differences.find(d=>d.rx
    ? ((d.x-x)/d.rx)**2+((d.y-y)/d.ry)**2<=1
    : Math.hypot(d.x-x,d.y-y)<=Math.max(CONFIG.minimumHitRadius,d.r));
  if(target&&state.found.has(target.id)) return;
  if(target) {
    state.found.add(target.id);state.hint=null;
    message=target.name+'.';playSound('find');
    if(state.found.size===10) finishScene();
  } else {
    state.strikes++;state.elapsed+=CONFIG.penalty;state.miss={x:screenX,y,at:performance.now()};playSound('miss');
    message=`A near miss. +${CONFIG.penalty}s. ${CONFIG.strikes-state.strikes} strikes left.`;
    if(state.strikes>=CONFIG.strikes) {
      state.mode='retry';restartAt=performance.now()+CONFIG.restartDelay;
      message='Three strikes. Breathe, look again — this page is restarting.';
    }
  }
  updateHud();
}
function hint() {
  if(state.mode!=='play'||state.hints===0) return;
  const d=scenes[state.scene].differences.find(d=>!state.found.has(d.id));
  state.hints--;state.hint={id:d.id,until:performance.now()+CONFIG.hintDuration};
  message='Look inside the pulsing ring. Click it to make the find yours.';
  playSound('hint');updateHud();
}
function pause() {
  if(state.mode==='play') {state.mode='paused';state.hint=null;}
  else if(state.mode==='paused') {state.mode='play';previous=performance.now();}
  updateHud();
}
function next() {
  if(state.mode!=='complete') return;
  if(state.scene<scenes.length-1) startScene(state.scene+1);
  else {state.scores=[];startScene(0);}
}
function primary() {
  if(state.mode==='title') startScene(0);
  else if(state.mode==='paused') pause();
  else if(state.mode==='complete') next();
}
function updateHud() {
  const scene=scenes[state.scene];
  $('scene-name').textContent=scene.name;
  $('subtitle').textContent=scene.subtitle;
  $('scene-meta').textContent=`SCENE ${state.scene+1} OF ${scenes.length}  /  PAR ${clock(CONFIG.par[state.scene])}`;
  $('remaining').textContent=10-state.found.size;
  $('time').textContent=clock(state.elapsed);
  $('time').classList.toggle('overtime',state.elapsed>CONFIG.par[state.scene]);
  $('strikes').innerHTML=Array.from({length:3},(_,i)=>`<span class="${i<state.strikes?'used':''}">×</span>`).join('');
  $('strikes').setAttribute('aria-label',`${state.strikes} of ${CONFIG.strikes} strikes used`);
  $('hint').textContent=`✦  Hint (${state.hints})`;
  $('hint').disabled=state.hints===0||state.mode!=='play';
  $('pause').textContent=state.mode==='paused'?'▶ Resume':'Ⅱ Pause';
  $('pause').disabled=!['play','paused'].includes(state.mode);
  $('status').textContent=message;
  $('dots').innerHTML=scenes[state.scene].differences.map(d=>`<span class="dot ${state.found.has(d.id)?'found':''}" aria-label="Difference ${d.id+1}${state.found.has(d.id)?' found':' unfound'}">${state.found.has(d.id)?'✓':''}</span>`).join('');
  $('level').textContent=`LEVEL ${String(state.scene+1).padStart(2,'0')}  /  ${['OBSERVE','EXPLORE','DISCOVER'][state.scene]}`;
  $('progress-fill').style.width=`${state.found.size*10}%`;
  $('veil').hidden=!['title','paused'].includes(state.mode);
  $('eyebrow').textContent=state.mode==='paused'?'A MOMENT OF STILLNESS':'A FIELD GUIDE TO LITTLE CHANGES';
  $('overlay-title').textContent=state.mode==='paused'?'The world can wait.':'Look a little closer.';
  $('overlay-copy').textContent=state.mode==='paused'?'Your time is resting. Return when you’re ready.':'Three illustrated worlds. Thirty hidden changes. Follow the light from a night market to a quiet library, then catch the morning train.';
  $('primary').textContent=state.mode==='paused'?'Continue the hunt  →':'Open the field guide  →';
  $('completion').hidden=state.mode!=='complete';
  $('game-footer').hidden=state.mode==='complete';
  $('next').textContent=state.scene===2?'Play again  ↻':'Next scene  →  [N]';
  $('result').textContent=`${state.scene===2?'FIELD GUIDE COMPLETE':'SCENE COMPLETE'}  ·  ${clock(state.elapsed)}  ·  ${state.scores.reduce((a,b)=>a+b,0).toLocaleString('en-US')} POINTS`;
  $('restart').disabled=state.mode==='title';
}

bindInput(canvas,{hunt,hint,pause,next,primary,restart:()=>startScene(state.scene),sound:()=>{$('sound').textContent=toggleSound()?'♪ Sound on':'♪ Sound off';}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.mode==='play'&&!state.staged) pause();});
stageScreenshot(state);
if(state.staged&&state.mode==='complete') message='All ten changes found. A night worth remembering.';
updateHud();
function frame(now) {
  const delta=Math.min((now-previous)/1000,.25);previous=now;
  if(state.mode==='play'&&!state.staged) state.elapsed+=delta;
  if(state.hint&&now>state.hint.until) state.hint=null;
  if(state.mode==='retry'&&now>=restartAt) startScene(state.scene);
  $('time').textContent=clock(state.elapsed);
  $('time').classList.toggle('overtime',state.elapsed>CONFIG.par[state.scene]);
  render(canvas,scenes[state.scene],state,now);
  window.__shotReady=true;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
