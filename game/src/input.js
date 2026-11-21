export function bindInput(canvas,actions) {
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.isPrimary===false) return;
    const bounds=canvas.getBoundingClientRect();
    if(!bounds.width||!bounds.height) return;
    const x=(event.clientX-bounds.left)*1160/bounds.width;
    const y=(event.clientY-bounds.top)*500/bounds.height;
    if(x>560&&x<600) return;
    actions.hunt(x>=600?x-600:x,y,x);
  });
  window.addEventListener('keydown',event=>{
    if(event.repeat||event.ctrlKey||event.metaKey||event.altKey) return;
    if(event.target instanceof HTMLButtonElement&&(event.key==='Enter'||event.key===' ')) return;
    const key=event.key.toLowerCase();
    if(['h','p','n','enter','escape'].includes(key)) event.preventDefault();
    if(key==='h') actions.hint();
    if(key==='p'||key==='escape') actions.pause();
    if(key==='n') actions.next();
    if(key==='enter') actions.primary();
  });
  for(const name of ['hint','pause','next','primary','restart','sound']) {
    document.getElementById(name)?.addEventListener('click',actions[name]);
  }
}
