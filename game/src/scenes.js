// Every visible object is a small vector record; variants alone change between panels.
const ink = '#202c3b';
const cream = '#f8e5b9';
const coral = '#dd705d';
const teal = '#568e86';
const gold = '#eeb861';
const rect = (x,y,w,h,c,r=0) => ({k:'rect',x,y,w,h,c,r});
const ellipse = (x,y,rx,ry,c) => ({k:'ellipse',x,y,rx,ry,c});
const line = (pts,c,w=2) => ({k:'line',pts,c,w});
const poly = (pts,c) => ({k:'poly',pts,c});
const label = (text,x,y,size,c=cream) => ({k:'text',text,x,y,size,c});

function scene(name,subtitle,colors) {
  return {name,subtitle,colors,shapes:[],differences:[]};
}
function change(s,name,x,y,r,left,right=[]) {
  const id=s.differences.length;
  s.differences.push({id,name,x,y,r});
  s.shapes.push({k:'variant',id,left,right});
}
function star(x,y,r,c) {
  return poly(Array.from({length:10},(_,i)=>{
    const a=i*Math.PI/5-Math.PI/2, q=i%2?r*.43:r;
    return [x+Math.cos(a)*q,y+Math.sin(a)*q];
  }),c);
}
function lantern(x,y,c) {
  return [line([[x,y-28],[x,y-14]],ink),ellipse(x,y,14,19,c),
    ellipse(x,y,8,19,'#ffffff18'),line([[x-7,y-13],[x-7,y+13]],'#613943',1),
    line([[x+7,y-13],[x+7,y+13]],'#613943',1),rect(x-8,y-20,16,4,gold),
    rect(x-7,y+18,14,4,gold),line([[x,y+22],[x,y+33]],gold,3)];
}
function cat(x,y,scale=1) {
  const q=(a)=>a*scale;
  return [ellipse(x,y,q(14),q(17),ink),ellipse(x,y-q(21),q(11),q(10),ink),
    poly([[x-q(11),y-q(24)],[x-q(9),y-q(39)],[x-q(1),y-q(28)]],ink),
    poly([[x+q(2),y-q(28)],[x+q(10),y-q(39)],[x+q(11),y-q(23)]],ink),
    line([[x+q(10),y+q(10)],[x+q(24),y+q(9)],[x+q(26),y-q(2)],[x+q(21),y-q(8)]],ink,q(5)),
    ellipse(x-q(4),y-q(22),q(1.4),q(1.6),gold),ellipse(x+q(4),y-q(22),q(1.4),q(1.6),gold)];
}
function plant(x,y,size=1) {
  const a=[poly([[x-15*size,y],[x+15*size,y],[x+11*size,y+25*size],[x-10*size,y+25*size]],'#b8674f')];
  for(let i=0;i<5;i++) {
    const dx=(i-2)*9*size, top=y-(22+14*(i%2))*size;
    a.push(line([[x,y],[x+dx,top]],'#3b6355',2),ellipse(x+dx,top,7*size,14*size,i%2?'#80a17c':'#587f66'));
  }
  a.push(rect(x-17*size,y-3*size,34*size,6*size,'#e4a77a',2));
  return a;
}
function person(x,y,c,hat=false) {
  return [ellipse(x,y+38,21,6,'#14273555'),rect(x-5,y+17,4,22,ink,2),rect(x+4,y+17,4,22,ink,2),
    poly([[x-10,y-2],[x+10,y-2],[x+15,y+24],[x-15,y+24]],c),ellipse(x,y-11,9,11,'#cc9a7b'),
    ...(hat?[ellipse(x,y-19,14,4,hat),ellipse(x,y-23,10,8,hat)]:[ellipse(x,y-18,9,6,ink)])];
}

function nightMarket() {
  const s=scene('Pasar Malam','Warm lights. Busy lanes. A little mischief.',['#2c3455','#9c666e','#e4a078']);
  const a=s.shapes;
  a.push({k:'gradient',colors:s.colors,height:310});
  a.push(ellipse(480,104,120,64,'#edb18b22'));
  for(let i=0;i<10;i++) {
    const x=i*65-20, h=54+(i*37)%60;
    a.push(rect(x,207-h,54,h,'#42445a'),poly([[x-3,207-h],[x+27,183-h],[x+57,207-h]],'#393b51'));
    for(let j=0;j<3;j++) a.push(rect(x+9+j*14,217-h,6,14,'#c5917170'));
  }
  a.push(poly([[0,310],[560,310],[560,500],[0,500]],'#4b4651'),poly([[245,292],[308,292],[417,500],[140,500]],'#76636a'));
  for(let i=0;i<8;i++) for(let j=0;j<7;j++) {
    const yy=330+i*25, xx=j*89+(i%2)*39-20;
    a.push(ellipse(xx,yy,22+i*2,2,'#d0b19a25'));
  }
  a.push(line([[0,49],[100,77],[230,91],[350,88],[450,67],[560,26]],ink,2));
  for(let i=0;i<13;i++) {
    const x=18+i*43,y=51+40*Math.sin((x/560)*Math.PI);
    if(i!==5) a.push(ellipse(x,y,4,5,cream),ellipse(x,y,9,10,'#ffe6a114'));
  }
  a.push(line([[0,122],[140,150],[280,158],[430,145],[560,110]],ink,2));
  for(let i=0;i<15;i++) {const x=9+i*39,y=122+35*Math.sin(x/560*Math.PI);a.push(ellipse(x,y,3,4,gold));}
  // Stalls, merchandise, and people are shared scenery, not extra differences.
  for(const [x,c,sign] of [[24,coral,'DAPUR  •  07'],[342,teal,'SATE  •  12']]) {
    a.push(rect(x+4,234,180,138,'#443c43'),rect(x+8,239,7,153,'#a46d49'),rect(x+168,239,7,153,'#a46d49'),
      rect(x,329,185,13,'#d7a56e'),rect(x+8,342,169,45,'#85513d'),rect(x+18,351,149,24,'#a66c48'),
      rect(x+31,174,120,26,'#302e3c',4),label(sign,x+91,192,11),poly([[x+14,210],[x+169,210],[x+186,247],[x-3,247]],cream));
    for(let j=0;j<7;j++) {
      if(x===24&&j===2) continue;
      a.push(poly([[x+14+j*22,210],[x+36+j*22,210],[x+37+j*25,247],[x+12+j*25,247]],j%2?cream:c),ellipse(x+24+j*25,247,12,8,j%2?cream:c));
    }
    a.push(line([[x-3,247],[x+186,247]],'#edbd8d',2));
  }
  a.push(rect(91,305,61,15,'#2e313e',3),ellipse(121,305,30,9,'#73858a'),ellipse(121,301,23,5,'#b7ada1'),
    rect(86,321,70,6,'#e1a766'),ellipse(171,323,14,5,cream));
  for(let i=0;i<5;i++) a.push(ellipse(171+(i%3)*10,318-Math.floor(i/3)*8,6,5,i%2?gold:'#bc7257'));
  a.push(rect(360,314,28,14,'#d8b68a',2),rect(362,306,24,9,'#2e3b42'),label('5K',375,325,8,ink));
  for(let i=0;i<4;i++) a.push(ellipse(448+i*13,323,5,5,['#eca15c','#efbb70','#d99052','#f2c479'][i]));
  a.push(...plant(36,408,.9),...plant(518,410,1.1),...person(217,369,'#bb876c'),...person(335,364,'#667e83'),
    ...person(82,442,'#313a50'),...person(467,449,'#954f53'),...person(282,407,'#bb655e'));
  a.push(rect(257,397,51,5,'#e1a46e',2),rect(261,401,4,5,'#e1a46e'),rect(297,401,4,5,'#e1a46e'));
  change(s,'The red lantern turned jade',65,279,24,lantern(65,279,coral),lantern(65,279,'#70aa87'));
  change(s,'A string-light bulb disappeared',233,90,15,[ellipse(233,90,4,5,cream)]);
  change(s,'The little star sign disappeared',145,197,19,[ellipse(145,197,15,15,'#403c48'),star(145,197,11,gold)]);
  change(s,'The cooking steam vanished',120,279,22,[line([[105,290],[101,281],[109,272],[105,262]],'#f4dcc0',2),line([[121,288],[126,279],[119,271],[123,259]],'#f4dcc0',2),line([[136,291],[139,282],[133,275]],'#f4dcc0',2)]);
  change(s,'The rooftop cat slipped away',195,192,22,cat(191,202,.65));
  const stripe=c=>[poly([[82,210],[104,210],[111,247],[86,247]],c),ellipse(98,247,12,8,c)];
  change(s,'The third awning stripe changed',96,231,20,stripe(coral),stripe(cream));
  const skewers=n=>Array.from({length:n},(_,i)=>[line([[403+i*13,306],[403+i*13,334]],cream,2),ellipse(403+i*13,309,4,5,'#c77848'),ellipse(403+i*13,320,4,5,'#c77848')]).flat();
  change(s,'One satay skewer is missing',416,319,25,skewers(3),skewers(2));
  change(s,'The moon disappeared',471,44,21,[ellipse(471,44,17,17,cream),ellipse(466,39,4,4,'#e5ca91'),ellipse(478,49,3,3,'#e5ca91')]);
  const hat=c=>[ellipse(282,390,14,4,c),ellipse(282,385,10,8,c)];
  change(s,'The marketgoer changed hats',282,388,19,hat(coral),hat('#668fae'));
  change(s,'The orange lantern is missing',491,279,23,lantern(491,279,'#edab56'));
  return s;
}

function oldLibrary() {
  const s=scene('Old Library','Rain on the glass. Stories in the shadows.',['#443c45','#8b654f','#c49366']);
  const a=s.shapes;
  a.push(rect(0,0,560,500,'#8b654f'));
  for(let i=0;i<12;i++) a.push(rect(i*49,0,2,422,'#5d483e55'),rect(i*49+5,0,1,422,'#b68b6655'));
  a.push(rect(0,412,560,88,'#614a41'));
  for(let i=0;i<6;i++) a.push(line([[0,421+i*16],[560,421+i*16]],'#967054',1));
  a.push(rect(199,79,162,228,'#463b38',6),rect(207,87,146,212,'#273650',2),ellipse(285,175,58,83,'#384867'),
    poly([[209,298],[259,204],[351,298]],'#5c6b7f'),poly([[252,298],[310,224],[351,298]],'#72808a'));
  // Rain is deliberately grouped into one difference region in the window.
  for(const x of [210,350]) a.push(rect(x,87,5,212,'#c69b6a'));
  a.push(rect(277,87,5,212,'#c69b6a'),rect(207,203,146,5,'#c69b6a'),rect(192,303,176,8,'#d2a575',2));
  const bookColors=['#b8574e','#527a85','#b89c57','#697a58','#916776','#cf986b'];
  for(const x of [23,390]) {
    a.push(rect(x,79,147,326,'#493c36',3),rect(x+7,85,134,313,'#59463a'));
    for(let row=0;row<4;row++) {
      for(let j=0;j<8;j++) {
        const bx=x+12+j*16, by=92+row*76, h=47+(j*11+row*7)%17;
        if(x===23&&row===2&&j===2) continue;
        a.push(rect(bx,by+62-h,13,h,bookColors[(j+row*2)%6],1),rect(bx+3,by+66-h,7,2,'#edcf934f'),rect(bx+3,by+53,7,2,'#edcf9355'));
      }
      a.push(rect(x+3,156+row*76,141,7,'#c09362'),rect(x+3,163+row*76,141,3,'#302e2d55'));
    }
    a.push(rect(x-4,72,155,9,'#d0a171',2),rect(x+5,405,137,12,'#b17c52'));
  }
  a.push(ellipse(280,451,139,31,'#3d3538'),ellipse(280,447,134,28,'#a65250'),ellipse(280,447,115,19,'#a65250'),
    ellipse(280,447,10,5,gold));
  a.push(rect(125,359,260,14,'#c19363',3),rect(139,373,10,65,'#896244'),rect(360,373,10,65,'#896244'),
    rect(149,379,212,5,'#896244'),poly([[188,352],[233,345],[263,356],[219,359]],cream),line([[230,347],[221,358]],'#aa9672',1),
    rect(306,351,14,8,'#283945',2),line([[309,350],[320,328]],cream,2));
  a.push(rect(427,338,56,10,'#ad8056',4),rect(430,348,6,78,'#ad8056'),rect(476,348,6,78,'#ad8056'),
    rect(421,390,68,9,'#c79a69',3),rect(428,399,6,35,'#ad8056'),rect(478,399,6,35,'#ad8056'));
  a.push(...plant(62,447,.9),rect(497,421,28,30,'#9a6f4e',3),label('A–Z',511,442,10),
    rect(180,21,25,31,'#604b3e',2),rect(183,24,19,25,'#c7a57b'),star(192,36,7,'#80694e'));
  a.push(ellipse(281,40,24,24,'#473d35'),ellipse(281,40,20,20,cream));
  for(let i=0;i<12;i++) {const t=i*Math.PI/6;a.push(ellipse(281+Math.sin(t)*17,40-Math.cos(t)*17,1,1,'#967954'));}
  change(s,'The reading-chair cat disappeared',456,371,26,cat(454,376,.82));
  const lamp=(c,on)=>[...(on?[ellipse(153,331,43,48,'#ffe2a735')]:[]),rect(150,330,4,29,'#433c35'),ellipse(152,357,17,4,'#433c35'),poly([[140,309],[165,309],[178,333],[127,333]],c),rect(141,306,23,4,gold)];
  change(s,'The desk lamp went out',153,329,30,lamp('#608c78',true),lamp('#9a9990',false));
  const book=c=>[rect(67,247,13,59,c,1),rect(70,252,7,2,'#edcf9388'),rect(70,297,7,2,'#edcf9388')];
  change(s,'A red book turned blue',74,274,16,book('#bc544e'),book('#527da5'));
  const rain=n=>Array.from({length:n},(_,i)=>line([[224+i*22,126+(i%2)*29],[231+i*22,150+(i%2)*29]],'#aac1cd',1.5));
  change(s,'Two rain streaks disappeared',270,150,36,rain(5),rain(3));
  change(s,'The clock moved from three to six',281,40,24,[line([[281,25],[281,40],[293,40]],ink,2.5)],[line([[281,25],[281,40],[281,54]],ink,2.5)]);
  const books=n=>Array.from({length:n},(_,i)=>rect(268+i*3,350-i*9,49-i*7,8,[coral,'#567e8b','#719076'][i],1));
  change(s,'One desk book disappeared',292,341,26,books(3),books(2));
  change(s,'The rug lost its gold border',280,447,28,[{...ellipse(280,447,113,18,gold),outline:true,width:2}]);
  Object.assign(s.differences.at(-1),{rx:117,ry:24});
  a.push(rect(347,338,7,21,cream),ellipse(350,360,12,3,'#dbc096'));
  change(s,'The candle flame went out',350,330,14,[ellipse(350,330,5,9,gold),ellipse(350,332,2,4,cream)]);
  change(s,'The teal vase disappeared',464,58,20,[ellipse(464,62,15,14,teal),rect(459,40,10,16,teal),rect(458,39,12,4,'#93b8a1',2)]);
  change(s,'The window moon disappeared',323,112,17,[ellipse(323,112,12,12,cream)]);
  return s;
}

function morningStation() {
  const s=scene('Glasshouse Station','The last train carries a garden of secrets.',['#a9c7bd','#e5c49a','#bf8062']);
  const a=s.shapes;
  a.push(rect(0,0,560,500,'#bcd2c4'),ellipse(410,102,81,81,'#efe1b4'),rect(0,182,560,146,'#8cae9c'));
  for(let i=0;i<10;i++) a.push(poly([[i*66-30,210],[i*66,100+(i%3)*23],[i*66+40,210]],'#739889'));
  a.push(rect(0,0,560,21,'#385d5b'),poly([[0,156],[0,118],[280,0],[560,118],[560,156],[280,37]],'#4c7470'));
  for(let i=0;i<7;i++) a.push(line([[280,27],[i*94,151]],'#648b80',4));
  a.push(rect(0,150,560,9,'#385d5b'),rect(21,153,12,183,'#385d5b'),rect(527,153,12,183,'#385d5b'),
    rect(31,176,498,15,'#d1c9a3'),rect(0,333,560,167,'#c1ac8e'));
  for(let i=0;i<7;i++) a.push(line([[0,350+i*26],[560,350+i*26]],'#a08f79',1));
  for(let i=0;i<9;i++) a.push(line([[280+(i-4)*60,333],[280+(i-4)*100,500]],'#a08f79',1));
  // An old green carriage behind the platform furniture.
  a.push(rect(54,199,451,127,'#3e736c',17),rect(59,207,440,14,'#335d59'),rect(55,279,450,6,gold),
    rect(70,312,417,12,'#304e50'));
  for(let i=0;i<6;i++) a.push(rect(75+i*69,230,52,42,'#263f4b',7),rect(80+i*69,235,42,29,'#b3cbba',4),
    poly([[82+i*69,236],[99+i*69,236],[82+i*69,258]],'#e5e3bd70'));
  a.push(rect(431,224,51,84,'#315b59',4),rect(438,230,35,39,'#bad0bd',4),ellipse(475,282,2,2,gold),
    label('BOTANICAL EXPRESS',251,301,12,'#ead7aa'));
  a.push(rect(57,84,128,48,'#eee0b5',4),rect(61,88,120,40,'#385f5d',3),label('GLASSHOUSE',121,105,13),label('PLATFORM 03',121,121,9));
  a.push(rect(393,84,116,49,'#385f5d',4),label('DEPARTURES',451,100,10),label('07:40   EAST',447,118,11));
  a.push(rect(219,369,181,8,'#734d3e',2),rect(226,334,167,9,'#9a6850',2),rect(226,347,167,9,'#9a6850',2),
    rect(232,377,7,34,'#385d5b'),rect(378,377,7,34,'#385d5b'));
  a.push(...plant(52,382,1.3),...plant(511,364,1.3),...plant(95,447,.75),
    ...person(180,370,'#99735b'),...person(411,390,'#5d7f77'));
  a.push(rect(119,388,38,36,'#b07853',5),rect(131,380,15,9,'#6f4a39',3),rect(136,382,6,5,'#c1ac8e'),
    ellipse(126,426,3,3,ink),ellipse(150,426,3,3,ink));
  a.push(rect(306,353,24,15,'#d6b87f',2),rect(308,350,20,4,cream));
  a.push(rect(66,286,46,62,'#d0ac78',2),rect(70,290,38,54,cream),label('SEED',89,304,10,'#45665c'),
    label('SWAP',89,316,10,'#45665c'),ellipse(89,331,9,7,'#809a69'));
  a.push(ellipse(281,84,26,26,'#385d5b'),ellipse(281,84,21,21,cream),line([[281,68],[281,84],[293,89]],ink,2));
  change(s,'The clock lost its six marker',281,100,12,[rect(279,98,4,4,'#a1764c')]);
  change(s,'The swallow flew away',351,56,14,[line([[339,55],[348,51],[352,57],[357,52],[366,54]],'#385d5b',2)]);
  change(s,'The direction arrow reversed',482,161,16,[poly([[468,158],[486,158],[486,153],[495,162],[486,171],[486,166],[468,166]],'#385d5b')],[poly([[495,158],[477,158],[477,153],[468,162],[477,171],[477,166],[495,166]],'#385d5b')]);
  change(s,'The suitcase lost its strap',139,405,18,[rect(136,389,5,34,'#e7c596'),rect(133,404,11,8,'#795a42')]);
  const tulip=c=>[line([[489,366],[489,335]],'#4b7462',2),poly([[482,326],[489,332],[496,326],[495,339],[489,344],[483,339]],c)];
  change(s,'The tulip changed colour',489,334,14,tulip(coral),tulip('#e6bf67'));
  change(s,'The tea cup lost its handle',333,360,13,[ellipse(333,360,5,5,cream),ellipse(333,360,3,3,'#c1ac8e')]);
  change(s,'The carriage light went out',497,251,12,[ellipse(497,251,5,8,'#ffe4a2')],[ellipse(497,251,5,8,'#284c4c')]);
  change(s,'The poster lost its underline',89,320,12,[rect(76,319,26,2,coral)]);
  a.push(...cat(353,396,.68).filter((_,i)=>i!==4));
  change(s,'The station cat has a shorter tail',373,399,13,[line([[360,404],[373,402],[374,394],[369,390]],ink,4)],[line([[360,404],[366,403]],ink,4)]);
  change(s,'A fallen leaf disappeared',253,453,12,[ellipse(253,453,9,4,'#6e8b64'),line([[245,456],[259,451]],'#43614c',1)]);
  return s;
}

export const scenes=[nightMarket(),oldLibrary(),morningStation()];
for(const world of scenes) {
  if(world.differences.length!==10) throw new Error(`${world.name} must contain exactly ten changes`);
}
