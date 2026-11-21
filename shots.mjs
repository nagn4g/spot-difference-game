import { createRequire } from 'node:module';
import { mkdirSync, statSync, readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join, resolve, relative } from 'node:path';
const require=createRequire(import.meta.url);
if(process.argv.includes('--logic-only')) {
  await logicChecks();
} else {
const {chromium}=require(process.env.PLAYWRIGHT_CORE||'/home/hatch/.npm/_npx/86170c4cd1c5da32/node_modules/playwright-core');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',args:['--no-sandbox'],timeout:15000});
try {
const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
const errors=[],requests=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',msg=>{if(msg.type()==='error') errors.push(msg.text());});
page.on('request',request=>requests.push(request.url()));
page.on('requestfailed',request=>errors.push(`Request failed: ${request.url()}`));
page.on('response',response=>{if(response.status()>=400) errors.push(`${response.status()} ${response.url()}`);});
mkdirSync('screenshots',{recursive:true});
const stages=[['1-play.jpg','play'],['2-scene2.jpg','scene2'],['3-title.jpg','title'],['4-complete.jpg','complete']];
for(const [name,shot] of stages) {
  await page.goto(`http://127.0.0.1:8080/?shot=${shot}`);
  await page.waitForFunction(()=>window.__shotReady===true);
  await page.screenshot({path:`screenshots/${name}`,type:'jpeg',quality:80});
  const bytes=readFileSync(`screenshots/${name}`);
  assert.equal(bytes.readUInt16BE(0),0xffd8);
  assert.equal(bytes.readUInt16BE(bytes.length-2),0xffd9);
  assert(statSync(`screenshots/${name}`).size<=262144);
  assert.deepEqual(jpegSize(bytes),{width:1280,height:800});
  if(shot==='play'||shot==='scene2') {
    assert.equal(await page.locator('#remaining').textContent(),'7');
    assert.equal(await page.locator('.dot.found').count(),3);
  }
  if(shot==='complete') assert.equal(await page.locator('.dot.found').count(),10);
  assert(await page.locator('#level').isVisible());
  const bounds=await page.locator(shot==='complete'?'#completion':'#game-footer').boundingBox();
  assert(bounds.y+bounds.height<=800,'HUD and completion controls must fit the screenshot');
  console.log(`CAPTURE ${name}: ${bytes.length} bytes, 1280×800`);
}
await page.goto('http://127.0.0.1:8080/');
await page.waitForFunction(()=>window.__shotReady);
await page.keyboard.press('Enter');
const geometry=await page.evaluate(async()=>{
  const {scenes}=await import('./src/scenes.js');
  return scenes.map(s=>s.differences);
});
const clickDifference=async(d,right=false)=>{
  const box=await page.locator('canvas').boundingBox();
  await page.mouse.click(box.x+(d.x+(right?600:0))*box.width/1160,box.y+d.y*box.height/500);
};
await clickDifference(geometry[0][0],true);
assert.equal(await page.locator('#remaining').textContent(),'9');
await clickDifference(geometry[0][0]);
assert.equal(await page.locator('#remaining').textContent(),'9','repeat find does not add a strike');
await page.keyboard.press('h');
assert.match(await page.locator('#hint').textContent(),/2/);
await page.keyboard.press('p');
const paused=await page.locator('#time').textContent();
await page.waitForTimeout(1100);
assert.equal(await page.locator('#time').textContent(),paused);
await page.keyboard.press('p');
const box=await page.locator('canvas').boundingBox();
await page.mouse.click(box.x+8,box.y+8);
assert.equal(await page.locator('#strikes .used').count(),1);
assert.match(await page.locator('#status').textContent(),/\+10s/);
await page.mouse.click(box.x+8,box.y+8);await page.mouse.click(box.x+8,box.y+8);
await page.waitForTimeout(1500);
assert.equal(await page.locator('#remaining').textContent(),'10');
assert.equal(await page.locator('#strikes .used').count(),0);
for(let scene=0;scene<3;scene++) {
  for(const d of geometry[scene]) await clickDifference(d,d.id%2===0);
  assert.equal(await page.locator('#remaining').textContent(),'0',`scene ${scene+1} fully solvable`);
  assert(await page.locator('#completion').isVisible());
  await page.keyboard.press('n');
}
assert.match(await page.locator('#scene-meta').textContent(),/SCENE 1 OF 3/);
assert.equal(errors.length,0,JSON.stringify(errors));
assert(requests.every(url=>url.startsWith('http://127.0.0.1:8080/')),'No external network requests');
const requested=new Set(requests.map(url=>new URL(url).pathname));
for(const file of readdirSync('game/src')) assert(requested.has(`/src/${file}`),`${file} loaded locally`);
console.log('PASS: 30 finds, both panels, duplicate safety, hint, pause, penalty, restart, progression, replay.');
console.log('CONSOLE ERRORS',JSON.stringify(errors));
console.log('REQUEST LOG',JSON.stringify([...new Set(requests)]));
const env={...process.env,MAKEFUN_OUTPUT_DIR:'out'};
execFileSync(process.execPath,['main.ts'],{env,stdio:'inherit'});
const first=outputHashes('out');
execFileSync(process.execPath,['main.ts'],{env,stdio:'inherit'});
assert.deepEqual(outputHashes('out'),first,'Two packaging runs have byte-identical output');
console.log('DETERMINISM PASS: every output file is byte-identical across two main.ts runs.');
} finally {await browser.close();}
}

function outputHashes(root) {
  const hashes={};
  const walk=dir=>{
    for(const item of readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      const path=join(dir,item.name);
      if(item.isDirectory()) walk(path);
      else hashes[relative(root,path)]=createHash('sha256').update(readFileSync(path)).digest('hex');
    }
  };
  walk(root);return hashes;
}

function jpegSize(bytes) {
  let at=2;
  while(at<bytes.length-8) {
    assert.equal(bytes[at],255,'JPEG marker');
    const marker=bytes[at+1],length=bytes.readUInt16BE(at+2);
    if([0xc0,0xc1,0xc2].includes(marker)) return {width:bytes.readUInt16BE(at+7),height:bytes.readUInt16BE(at+5)};
    assert(length>=2);at+=length+2;
  }
  throw Error('JPEG has no supported frame marker');
}

async function logicChecks() {
  // Exercise the actual modules with a minimal DOM when Chrome cannot be launched.
  const {scenes}=await import('./game/src/scenes.js');
  const {clock}=await import('./game/src/config.js');
  const {readGameTree,sourceImports}=await import('./vendor/makefun-game.ts');
  readGameTree('game',{game_max_files:993,game_max_bytes:50331648,game_path_max_bytes:1000});
  for(const name of readdirSync('game/src')) {
    const source=readFileSync(`game/src/${name}`,'utf8');
    for(const specifier of sourceImports(source)) {
      assert(specifier.startsWith('./'),'Only local game imports');
      const path=resolve('game/src',specifier);
      assert(path.startsWith(resolve('game')+'/'));assert(statSync(path).isFile());
    }
    assert(!/https?:|fetch\s*\(|WebSocket\s*\(/.test(source),'No runtime network services');
  }
  assert.equal(clock(65),'01:05');assert.equal(clock(-1),'00:00');
  const elements=new Map(),listeners=new Map();
  const html=readFileSync('game/index.html','utf8');
  const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
  let now=0,frame;
  const ctx=new Proxy({}, {get:(target,key)=>target[key]??(key==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}),set:(target,key,value)=>(target[key]=value,true)});
  const element=id=>{
    assert(ids.has(id),`DOM id ${id} exists in index.html`);
    if(!elements.has(id)) elements.set(id,{textContent:'',innerHTML:'',style:{},hidden:false,disabled:false,
      classList:{toggle(){}},setAttribute(){},addEventListener:(name,fn)=>listeners.set(`${id}:${name}`,fn),
      width:1160,height:500,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:1160,height:500})});
    return elements.get(id);
  };
  globalThis.document={getElementById:element,hidden:false,addEventListener:(name,fn)=>listeners.set(name,fn)};
  globalThis.window={devicePixelRatio:1,addEventListener:(name,fn)=>listeners.set(name,fn)};
  globalThis.location={search:''};globalThis.HTMLButtonElement=class{};
  Object.defineProperty(globalThis,'performance',{value:{now:()=>now},configurable:true});
  globalThis.requestAnimationFrame=fn=>{frame=fn;};
  await import('./game/src/main.js');
  const key=k=>listeners.get('keydown')({key:k,target:{},preventDefault(){}});
  const click=(x,y)=>listeners.get('world:pointerdown')({button:0,clientX:x,clientY:y});
  const tick=ms=>{now+=ms;frame(now);};
  key('Enter');tick(250);
  assert.equal(element('remaining').textContent,10);
  click(scenes[0].differences[0].x+600,scenes[0].differences[0].y);
  assert.equal(element('remaining').textContent,9);
  click(scenes[0].differences[0].x,scenes[0].differences[0].y);
  assert.equal(element('remaining').textContent,9);
  key('h');assert.match(element('hint').textContent,/2/);
  key('p');const time=element('time').textContent;tick(2000);
  assert.equal(element('time').textContent,time);key('p');
  for(let i=0;i<3;i++) click(5,5);
  assert.match(element('status').textContent,/Three strikes/);tick(1500);
  assert.equal(element('remaining').textContent,10);
  for(let i=0;i<3;i++) {
    assert.equal(scenes[i].differences.length,10);
    assert.equal(scenes[i].shapes.filter(s=>s.k==='variant').length,10);
    for(const d of scenes[i].differences) {
      click(d.x+(d.id%2?600:0),d.y);tick(16);
      assert.equal(element('remaining').textContent,9-d.id,`${scenes[i].name}: ${d.name}`);
    }
    assert.equal(element('completion').hidden,false);key('n');
  }
  assert.match(element('scene-meta').textContent,/SCENE 1 OF 3/);
  const {stageScreenshot}=await import('./game/src/shots.js');
  for(const [shot,expected] of [['play',3],['scene2',3],['complete',10]]) {
    location.search=`?shot=${shot}`;
    const staged={};stageScreenshot(staged);assert.equal(staged.found.size,expected);
    assert.equal(staged.scene,shot==='scene2'?1:0);
  }
  location.search='?shot=title';const title={mode:'title'};stageScreenshot(title);
  assert.equal(title.mode,'title');
  tick(16);assert.equal(window.__shotReady,true);
  console.log('LOGIC PASS: all 30 finds, duplicate safety, hint, pause, three-strike restart, all scene transitions, replay, vector render calls.');
  console.log('These are module tests, not a substitute for browser screenshots or browser console/network verification.');
}
