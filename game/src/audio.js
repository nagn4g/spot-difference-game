let context;
let enabled=true;
export function toggleSound() {
  enabled=!enabled;
  if(!enabled&&context?.state==='running') context.suspend().catch(()=>{});
  return enabled;
}
export function playSound(kind) {
  if(!enabled) return;
  try {
    context??=new (window.AudioContext||window.webkitAudioContext)();
    if(context.state==='suspended') context.resume().catch(()=>{});
    const notes=kind==='find'?[660,880]:kind==='complete'?[523,659,784,1047]:kind==='hint'?[440,587]:[160,120];
    notes.forEach((frequency,i)=>{
      const start=context.currentTime+i*.085;
      const tone=context.createOscillator(), envelope=context.createGain();
      tone.type=kind==='miss'?'triangle':'sine';tone.frequency.value=frequency;
      envelope.gain.setValueAtTime(0,start);envelope.gain.linearRampToValueAtTime(.09,start+.012);
      envelope.gain.exponentialRampToValueAtTime(.001,start+.22);
      tone.connect(envelope);envelope.connect(context.destination);tone.start(start);tone.stop(start+.24);
    });
  } catch { /* The hunt remains playable if browser audio is unavailable. */ }
}
