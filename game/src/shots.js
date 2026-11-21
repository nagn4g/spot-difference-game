// Staging uses the same state and render path as a real hunt.
export function stageScreenshot(state) {
  const shot=new URLSearchParams(location.search).get('shot');
  if(!['play','scene2','title','complete'].includes(shot)) return false;
  state.staged=true;
  state.hint=null;state.miss=null;
  if(shot==='title') return true;
  state.scene=shot==='scene2'?1:0;
  state.mode=shot==='complete'?'complete':'play';
  state.elapsed=shot==='complete'?117:shot==='scene2'?82:64;
  state.found=new Set(shot==='complete'?Array.from({length:10},(_,i)=>i):[0,1,2]);
  if(shot==='complete') state.scores=[1532];
  return true;
}
