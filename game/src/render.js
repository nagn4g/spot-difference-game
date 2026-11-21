// The same renderer draws all three worlds and both sides of each world.
export const PANEL={width:560,height:500,gap:40};

function drawShape(ctx,o,side) {
  if(o.k==='variant') {for(const child of o[side]) drawShape(ctx,child,side);return;}
  if(o.k==='gradient') {
    const sky=ctx.createLinearGradient(0,0,0,o.height);
    o.colors.forEach((c,i)=>sky.addColorStop(i/(o.colors.length-1),c));
    ctx.fillStyle=sky;ctx.fillRect(0,0,560,500);return;
  }
  ctx.fillStyle=o.c;
  ctx.strokeStyle=o.c;
  ctx.lineWidth=o.width||o.w||2;
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();
  if(o.k==='rect') ctx.roundRect(o.x,o.y,o.w,o.h,o.r||0);
  if(o.k==='ellipse') ctx.ellipse(o.x,o.y,o.rx,o.ry,0,0,Math.PI*2);
  if(o.k==='poly'||o.k==='line') {
    o.pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    if(o.k==='poly') ctx.closePath();
  }
  if(o.k==='text') {
    ctx.font=`600 ${o.size}px Georgia, serif`;ctx.textAlign='center';
    ctx.fillText(o.text,o.x,o.y);return;
  }
  if(o.k==='line'||o.outline) ctx.stroke();else ctx.fill();
}

export function drawPanel(ctx,scene,side,found,hint,now) {
  ctx.save();ctx.beginPath();ctx.roundRect(0,0,560,500,12);ctx.clip();
  for(const shape of scene.shapes) drawShape(ctx,shape,side);
  for(const d of scene.differences) {
    if(!found.has(d.id)&&hint?.id!==d.id) continue;
    const isHint=!found.has(d.id), pulse=isHint?Math.sin(now/110)*3:0;
    ctx.beginPath();ctx.ellipse(d.x,d.y,(d.rx||d.r)+pulse,(d.ry||d.r)+pulse,0,0,Math.PI*2);
    ctx.strokeStyle='#28303999';ctx.lineWidth=6;ctx.stroke();
    ctx.strokeStyle=isHint?'#fff4c7':'#ffcc76';ctx.lineWidth=2.6;ctx.stroke();
    if(!isHint) {
      const badgeX=d.x+(d.rx||d.r)*.71,badgeY=d.y-(d.ry||d.r)*.71;
      ctx.beginPath();ctx.arc(badgeX,badgeY,7,0,Math.PI*2);
      ctx.fillStyle='#ffcc76';ctx.fill();ctx.fillStyle='#343740';
      ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText('✓',badgeX,badgeY+3);
    }
  }
  ctx.restore();
}

export function render(canvas,scene,state,now) {
  const ctx=canvas.getContext('2d');
  const ratio=Math.min(window.devicePixelRatio||1,2);
  if(canvas.width!==1160*ratio) {canvas.width=1160*ratio;canvas.height=500*ratio;}
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,1160,500);
  drawPanel(ctx,scene,'left',state.found,state.hint,now);
  ctx.save();ctx.translate(600,0);drawPanel(ctx,scene,'right',state.found,state.hint,now);ctx.restore();
  if(state.miss&&now-state.miss.at<650) {
    ctx.strokeStyle='#ffb5a4';ctx.lineWidth=3;
    const {x,y}=state.miss;
    ctx.beginPath();ctx.moveTo(x-7,y-7);ctx.lineTo(x+7,y+7);ctx.moveTo(x+7,y-7);ctx.lineTo(x-7,y+7);ctx.stroke();
  }
}
