import {seedFromId,defaultColors,colorSlots,categoryFor} from './asset-schema.js';
import {defaultDashboard,validateDashboard} from './dashboard-model.js';
export const THEMES = {
  amethyst: {name:'Amethyst lagoon',caption:'Crystal / water',accent:'#bca5ff',background:'#080b18',ground:'#17152b',water:'#345b76',crystal:'#b89bff',fill:'#48d7e8'},
  forest: {name:'Bioluminescent forest',caption:'Moss / mineral',accent:'#9cdb95',background:'#061613',ground:'#143329',water:'#1a6359',crystal:'#a4efd0',fill:'#bbda68'},
  desert: {name:'Amber dunes',caption:'Sand / glass',accent:'#f4c47c',background:'#1a1010',ground:'#61412b',water:'#8c6038',crystal:'#ffc178',fill:'#ff7359'},
  glacier: {name:'Glacial blue',caption:'Ice / water',accent:'#8dddf9',background:'#08141f',ground:'#203547',water:'#237396',crystal:'#b4f2ff',fill:'#7e92ff'},
  sea: {name:'Abyssal garden',caption:'Coral / bioluminescence',accent:'#75efdc',background:'#031622',ground:'#102e40',water:'#125d7b',crystal:'#a6f5ed',fill:'#ef88ce'},
  space: {name:'Orbital sanctuary',caption:'Stardust / obsidian',accent:'#cac0ff',background:'#08071a',ground:'#201b40',water:'#352753',crystal:'#cfafff',fill:'#ffb36e'}
};
export const ASSETS = {
  crystal:{name:'Amethyst crown',group:'Minerals',icon:'◇'},quartz:{name:'Quartz needles',group:'Minerals',icon:'⋈'},geode:{name:'Open geode',group:'Minerals',icon:'◈'},bismuth:{name:'Bismuth terraces',group:'Minerals',icon:'▧'},obelisk:{name:'Prismatic obelisk',group:'Minerals',icon:'△'},
  tree:{name:'Ancient pine',group:'Forest',icon:'♠'},mushroom:{name:'Luminous mushrooms',group:'Forest',icon:'♧'},fern:{name:'Fern grove',group:'Forest',icon:'❋'},moss:{name:'Moss island',group:'Forest',icon:'♣'},flower:{name:'Moon blossoms',group:'Forest',icon:'✾'},
  coral:{name:'Branching coral',group:'Ocean',icon:'Ψ'},kelp:{name:'Kelp garden',group:'Ocean',icon:'≋'},jellyfish:{name:'Moon jellyfish',group:'Ocean',icon:'♧'},shell:{name:'Pearl shell',group:'Ocean',icon:'◔'},bubbles:{name:'Bubble column',group:'Ocean',icon:'∘'},
  planet:{name:'Ringed planet',group:'Space',icon:'◎'},meteor:{name:'Meteor field',group:'Space',icon:'⬡'},portal:{name:'Orbital gate',group:'Space',icon:'◉'},satellite:{name:'Solar satellite',group:'Space',icon:'⊞'},
  water:{name:'Tidal pool',group:'Essentials',icon:'≈'},rock:{name:'Basalt stones',group:'Essentials',icon:'⬡'},light:{name:'Light wisp',group:'Essentials',icon:'☼'},clock:{name:'Sculpted clock',group:'Essentials',icon:'◷'}
};
Object.assign(ASSETS,{
  aragonite:{name:'Aragonite spray',icon:'✧'},fluorite:{name:'Fluorite cubes',icon:'▧'},
  oak:{name:'Old oak',icon:'♣'},birch:{name:'Silver birch',icon:'♧'},cherry:{name:'Cherry blossom',icon:'❀'},palm:{name:'Island palm',icon:'♠'},
  grass:{name:'Meadow grasses',icon:'⋔'},succulent:{name:'Desert rosette',icon:'✺'},
  anemone:{name:'Sea anemone',icon:'✹'},sponge:{name:'Tube sponge',icon:'≋'},
  moon:{name:'Cratered moon',icon:'◕'},terrestrial:{name:'Ocean planet',icon:'◉'},arch:{name:'Eroded arch',icon:'∩'}
});
for(const [kind,spec] of Object.entries(ASSETS))spec.group=categoryFor(kind);
export const KINDS = Object.keys(ASSETS);
export const PROFILES = {desktop:{name:'Desktop',dpr:1.5,bloom:true,shadows:true},tablet:{name:'Tablet',dpr:1,bloom:true,shadows:false},tv:{name:'TV',dpr:1,bloom:false,shadows:false}};
export const clone = value => structuredClone(value);
export function element(kind,id = crypto.randomUUID()) {
  if (!KINDS.includes(kind)) throw new Error('Unknown element');
  return {id,kind,name:ASSETS[kind].name,position:[0,0,0],scale:1,rotation:0,color:kind==='light'?'#bca5ff':'#b89bff',roughness:kind==='water'?.12:.18,transmission:['crystal','quartz','geode','obelisk','clock'].includes(kind)?.72:0,absorption:2,seed:seedFromId(id),variation:.55,colors:defaultColors(kind)};
}
export function initialScene(theme='amethyst') {
  const put=(kind,id,position,scale=1,rotation=0)=>({...element(kind,id),position,scale,rotation,colors:{...defaultColors(kind),...(kind==='water'?{body:THEMES[theme].water}:{})},color:THEMES[theme].crystal});
  const sets={amethyst:['crystal','quartz','geode','bismuth','obelisk','moss','flower','rock'],forest:['tree','oak','mushroom','fern','flower','grass','quartz','birch'],sea:['coral','kelp','jellyfish','shell','anemone','sponge','quartz','kelp'],space:['planet','portal','moon','satellite','obelisk','meteor','terrestrial','quartz'],desert:['obelisk','arch','geode','succulent','quartz','aragonite','rock','light'],glacier:['quartz','obelisk','crystal','geode','rock','quartz','bubbles','crystal']};
  const positions=[[-3.4,0,-2.5],[3.5,0,-2.9],[-4,0,.7],[4,0,1],[-2.8,0,3.2],[2.9,0,3.2],[-1.5,0,-3.4],[1.9,0,-3.5]];
  const elements=[put('water','pool',[0,0,0],1),...sets[theme].map((kind,i)=>put(kind,`biome-${i}`,positions[i],kind==='birch'?.55:kind==='oak'?.8:i<2?1.15:.8,(i%3-1)*.25)),put('clock','clock',[0,2.8,-2.6],1),put('light','wisp-left',[-3,2,0],.7),put('light','wisp-right',[3,2,-1],.7)];
  return {schemaVersion:1,theme,custom:null,library:[],lighting:{color:'#edf4ff',intensity:85,bloom:.3,exposure:1,singleSource:true,position:[-3,5,3],ambient:.3},water:{speed:.6,waves:.035,direction:15},dashboard:defaultDashboard(),elements};
}
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const color=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
export function validateScene(value) {
  const s=clone(value);
  if (!s || s.schemaVersion!==1 || !Object.hasOwn(THEMES,s.theme)) throw new Error('Unsupported scene or theme');
  const l=s.lighting;const water={speed:.6,waves:.035,direction:15,...s.water};
  if(!finite(water.speed,0,2)||!finite(water.waves,0,.15)||!finite(water.direction,-180,180))throw new Error('Invalid water settings');
  if (!l || !color(l.color) || !finite(l.intensity,0,100) || !finite(l.bloom,0,2) || !finite(l.exposure,.2,2)) throw new Error('Invalid lighting');
  l.singleSource??=true;l.position??=[-3,5,3];l.ambient??=.3;
  if(typeof l.singleSource!=='boolean'||!Array.isArray(l.position)||l.position.length!==3||!l.position.every(v=>finite(v,-10,10))||!finite(l.ambient,0,1))throw new Error('Invalid light source');
  if (!Array.isArray(s.elements) || s.elements.length>40) throw new Error('Scene supports up to 40 elements');
  const ids=new Set();
  for(const e of s.elements) {
    if (!e || typeof e.id!=='string' || !e.id.length || e.id.length>100 || ids.has(e.id) || !KINDS.includes(e.kind)) throw new Error('Invalid or duplicate element');
    ids.add(e.id);e.seed??=seedFromId(e.id);e.variation??=.55;e.colors={...defaultColors(e.kind),...(e.kind==='water'?{body:s.custom?.palette?.water??THEMES[s.theme].water}:{}),...e.colors};
    if(!Number.isInteger(e.seed)||!finite(e.seed,0,4294967295)||!finite(e.variation,0,1)||Object.values(e.colors).some(v=>!color(v)))throw new Error('Invalid asset variation or colours');e.colors=Object.fromEntries(Object.keys(colorSlots(e.kind)).map(k=>[k,e.colors[k]]));
    if(typeof e.name!=='string'||!e.name.trim()||e.name.length>60 || !Array.isArray(e.position)||e.position.length!==3||!e.position.every(x=>finite(x,-10,10)) || !finite(e.scale,.2,3)||!finite(e.rotation,-Math.PI,Math.PI)||!color(e.color)||!finite(e.roughness,0,1)||!finite(e.transmission,0,1)||!finite(e.absorption,.1,10)) throw new Error('Invalid element properties');
  }
  const custom=s.custom??null;
  if(custom){if(typeof custom.id!=='string'||!custom.id||custom.id.length>100||typeof custom.name!=='string'||!custom.name.trim()||custom.name.length>60||!custom.palette||['background','ground','water','accent','crystal','fill'].some(k=>!color(custom.palette[k])))throw new Error('Invalid custom scene');}
  if(s.library!==undefined&&(!Array.isArray(s.library)||s.library.length>8))throw new Error('Eight custom scenes maximum');
  const library=(s.library??[]).map(entry=>validateScene({...entry,library:[]}));
  if(library.some(entry=>!entry.custom)||new Set(library.map(entry=>entry.custom.id)).size!==library.length)throw new Error('Invalid scene library');
  // Reconstruct the trusted data contract; never evaluate server-supplied code or asset URLs.
  return {schemaVersion:1,theme:s.theme,custom:custom?{id:custom.id,name:custom.name.trim(),palette:Object.fromEntries(['background','ground','water','accent','crystal','fill'].map(k=>[k,custom.palette[k]]))}:null,library,lighting:{color:l.color,intensity:l.intensity,bloom:l.bloom,exposure:l.exposure,singleSource:l.singleSource,position:l.position,ambient:l.ambient},water:{speed:water.speed,waves:water.waves,direction:water.direction},dashboard:validateDashboard(s.dashboard),elements:s.elements.map(e=>Object.fromEntries(['id','kind','name','position','scale','rotation','color','roughness','transmission','absorption','seed','variation','colors'].map(k=>[k,e[k]])))};
}
export class SceneStore {
  constructor(scene) { this.scene=validateScene(scene); this.past=[]; this.future=[]; }
  edit(fn) { const next=clone(this.scene); fn(next); const valid=validateScene(next); if(JSON.stringify(valid)===JSON.stringify(this.scene))return; this.past.push(this.scene); if(this.past.length>80)this.past.shift(); this.scene=valid; this.future=[]; }
  undo(){if(!this.past.length)return false;this.future.push(this.scene);this.scene=this.past.pop();return true;}
  redo(){if(!this.future.length)return false;this.past.push(this.scene);this.scene=this.future.pop();return true;}
  replace(scene){this.scene=validateScene(scene);this.past=[];this.future=[];}
}

export function sceneTheme(scene){return {...THEMES[scene.theme],...(scene.custom?.palette??{}),...(scene.custom?{name:scene.custom.name,caption:'Custom ecosystem'}:{})};}
export function stashCustomScene(scene){
  if(!scene.custom)return;const snapshot=clone({...scene,library:[]});const index=scene.library.findIndex(s=>s.custom.id===scene.custom.id);
  if(index<0){if(scene.library.length>=8)throw new Error('Eight custom scenes maximum');scene.library.push(snapshot);}else scene.library[index]=snapshot;
}
export function createCustomScene(current,name,base='blank',id=crypto.randomUUID()){
  if(typeof name!=='string'||!name.trim()||name.trim().length>60)throw new Error('Give your scene a name (1–60 characters)');
  const s=base==='current'?clone(current):initialScene(base==='blank'?'amethyst':base);
  if(base==='blank')s.elements=s.elements.filter(e=>e.kind==='clock');
  const palette=sceneTheme(s);s.custom={id,name:name.trim(),palette:Object.fromEntries(['background','ground','water','accent','crystal','fill'].map(k=>[k,palette[k]]))};
  s.dashboard=clone(current.dashboard);s.library=clone(current.library);stashCustomScene(s);return validateScene(s);
}
export function openCustomScene(current,id){const snapshot=current.library.find(s=>s.custom.id===id);if(!snapshot)throw new Error('Scene not found');return validateScene({...clone(snapshot),dashboard:clone(current.dashboard),library:clone(current.library)});}


