export function seedFromId(id){let h=2166136261;for(const c of id){h=Math.imul(h^c.charCodeAt(0),16777619);}return h>>>0;}
export function randomAt(seed,index){let x=(seed+Math.imul(index+1,0x9e3779b9))|0;x=Math.imul(x^(x>>>16),0x21f0aaad);x=Math.imul(x^(x>>>15),0x735a2d97);return ((x^(x>>>15))>>>0)/4294967296;}
const slot=(label,color,matches=[])=>({label,color,matches});
export const PALETTES={
  Trees:{leaves:slot('Leaves / needles','#438b66'),trunk:slot('Trunk / branches','#66513b',['#554535','#65513e']),accent:slot('Blossoms / fruit','#efa8ce')},
  Foliage:{leaves:slot('Leaves / moss','#6aa777',['#6aa777','#398574']),stem:slot('Stems','#518871',['#70b692','#518871','#bddfca']),flower:slot('Petals / caps','#cfc0ff',['#cfc0ff','#e3a0ed','#7659c7','#a044c0']),accent:slot('Centres / glow','#ffdc91',['#ffdc91','#fff2cd','#86e3f2','#358eac'])},
  Crystals:{matrix:slot('Rock matrix','#655c74',['#655c74']),accent:slot('Edges / glow','#c4abff')},
  Ocean:{body:slot('Body / fronds','#75cbbb',['#ed90ae','#ecb0cc','#becbff','#e2bacc','#c7f9f7','#4db595','#42ad91']),accent:slot('Tips / pearl / glow','#f6bded',['#f6bded','#eef3f5','#94e9e7','#6356c1'])},
  Planets:{surface:slot('Surface','#cfac89',['#565168','#b18d85','#f2d2a4']),rings:slot('Rings / glow','#b8a0cf',['#9a91c6','#d6b5a0'])},
  Structures:{body:slot('Body / stone','#62647a',['#b8bbca','#d5d8df']),accent:slot('Panels / detail','#4565ac',['#263269','#ada6bf'])},
  Essentials:{body:slot('Surface','#345b76'),accent:slot('Glow','#bca5ff')}
};
export const CATEGORY_KINDS={Crystals:['crystal','quartz','geode','bismuth','obelisk','aragonite','fluorite'],Trees:['tree','oak','birch','cherry','palm'],Foliage:['mushroom','fern','moss','flower','grass','succulent'],Ocean:['coral','kelp','jellyfish','shell','bubbles','anemone','sponge'],Planets:['planet','meteor','moon','terrestrial','portal'],Structures:['satellite','rock','arch'],Essentials:['water','light','clock']};
export function categoryFor(kind){return Object.keys(CATEGORY_KINDS).find(k=>CATEGORY_KINDS[k].includes(kind));}
export function colorSlots(kind){
  const slots=PALETTES[categoryFor(kind)]??{};
  const keys={geode:['matrix'],mushroom:['stem','flower','accent'],tree:['leaves','trunk'],oak:['leaves','trunk'],birch:['leaves','trunk'],palm:['leaves','trunk'],cherry:['trunk','accent'],fern:['leaves','stem'],moss:['leaves'],grass:['leaves'],succulent:['leaves'],flower:['stem','flower','accent'],kelp:['body'],bubbles:['body'],meteor:['surface'],portal:['rings'],water:['body'],light:[],clock:[],rock:['body'],fluorite:[],bismuth:[],obelisk:['accent']}[kind]??Object.keys(slots);
  return Object.fromEntries(keys.map(k=>[k,{...slots[k],...(kind==='terrestrial'?{label:k==='surface'?'Ocean colour':'Land colour'}:{})}]));
}
export function defaultColors(kind){return Object.fromEntries(Object.entries(colorSlots(kind)).map(([key,s])=>[key,s.color]));}

