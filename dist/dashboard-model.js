export const GRID = {columns:6, rows:24};
export const WIDGETS = {
  home:{name:'Home overview',icon:'⌂',w:2,h:2,source:'home'},
  weather:{name:'Weather',icon:'☀',w:2,h:2,source:'weather'},
  system:{name:'Central hub',icon:'▤',w:2,h:2,source:'system'},
  camera:{name:'Garden camera',icon:'◉',w:3,h:3,source:'camera'},
  media:{name:'Music',icon:'♫',w:3,h:3,source:'media'},
  energy:{name:'Energy & climate',icon:'ϟ',w:6,h:2,source:'energy'},
  air:{name:'Air quality',icon:'≋',w:2,h:2,source:'air'},
  network:{name:'Home network',icon:'⌁',w:2,h:2,source:'network'}
};
export function defaultDashboard(){return {widgets:[{id:'home',type:'home',x:0,y:0,w:2,h:2},{id:'weather',type:'weather',x:2,y:0,w:2,h:2},{id:'system',type:'system',x:4,y:0,w:2,h:2},{id:'camera',type:'camera',x:0,y:2,w:3,h:3},{id:'media',type:'media',x:3,y:2,w:3,h:3},{id:'energy',type:'energy',x:0,y:5,w:6,h:2}],clockMaterial:'glass',opacity:.65,gap:11};}
export const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function validateDashboard(input){
  const d=structuredClone(input??defaultDashboard());
  if(!d||!Array.isArray(d.widgets)||d.widgets.length>16||!['glass','chrome','ceramic','amber'].includes(d.clockMaterial))throw new Error('Invalid dashboard configuration');
  d.opacity??=.65;d.gap??=11;if(!Number.isFinite(d.opacity)||d.opacity<0||d.opacity>1||!Number.isFinite(d.gap)||d.gap<0||d.gap>32)throw new Error('Invalid widget appearance');
  const ids=new Set();const widgets=[];
  for(const w of d.widgets){if(!w||typeof w.id!=='string'||!w.id||w.id.length>60||ids.has(w.id)||!Object.hasOwn(WIDGETS,w.type)||![w.x,w.y,w.w,w.h].every(Number.isInteger)||w.x<0||w.y<0||w.w<2||w.h<2||w.x+w.w>GRID.columns||w.y+w.h>GRID.rows||widgets.some(other=>overlaps(w,other)))throw new Error('Widgets must fit the grid without overlapping');ids.add(w.id);widgets.push({id:w.id,type:w.type,x:w.x,y:w.y,w:w.w,h:w.h});}
  return {clockMaterial:d.clockMaterial,opacity:d.opacity,gap:d.gap,widgets};
}
function vacant(w,placed){return w.x>=0&&w.y>=0&&w.x+w.w<=GRID.columns&&w.y+w.h<=GRID.rows&&!placed.some(p=>overlaps(w,p));}
export function placeWidget(dashboard,id,patch){
  const d=validateDashboard(dashboard);const target=d.widgets.find(w=>w.id===id);if(!target)throw new Error('Widget not found');
  const changed={...target,...patch,id:target.id,type:target.type};
  if(![changed.x,changed.y,changed.w,changed.h].every(Number.isInteger)||changed.w<2||changed.h<2||!vacant(changed,[]))throw new Error('Keep the widget inside the grid');
  const placed=[changed];
  for(const w of d.widgets.filter(w=>w.id!==id)){
    if(vacant(w,placed)){placed.push(w);continue;}
    let fit;for(let y=0;y<=GRID.rows-w.h&&!fit;y++)for(let x=0;x<=GRID.columns-w.w;x++){const candidate={...w,x,y};if(vacant(candidate,placed)){fit=candidate;break;}}
    if(!fit)throw new Error('Not enough space. Make a widget smaller or remove one.');placed.push(fit);
  }
  d.widgets=d.widgets.map(w=>placed.find(p=>p.id===w.id));return validateDashboard(d);
}
export function addWidget(dashboard,type,id=crypto.randomUUID()){
  if(!Object.hasOwn(WIDGETS,type))throw new Error('Unknown widget');const d=validateDashboard(dashboard);if(d.widgets.length>=16)throw new Error('Sixteen widgets maximum');const spec=WIDGETS[type];
  for(let y=0;y<=GRID.rows-spec.h;y++)for(let x=0;x<=GRID.columns-spec.w;x++){const w={id,type,x,y,w:spec.w,h:spec.h};if(vacant(w,d.widgets)){d.widgets.push(w);return validateDashboard(d);}}
  throw new Error('Not enough space. Remove or shrink a widget first.');
}
