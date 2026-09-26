import * as T from 'three';
import {randomAt,seedFromId,defaultColors,colorSlots,categoryFor} from './asset-schema.js';
import {build as crystals} from './assets/crystals/index.js';
import {build as trees} from './assets/trees/index.js';
import {build as foliage} from './assets/foliage/index.js';
import {build as ocean} from './assets/ocean/index.js';
import {build as planets} from './assets/planets/index.js';
import {build as structures} from './assets/structures/index.js';
import {build as essentials} from './assets/essentials/index.js';
import {FlowWater} from './water.js';
import {crystalGeometry,weatheredRock,planetTexture,leafGeometry} from './surfaces.js';

export function physical(color,settings={}){return new T.MeshPhysicalMaterial({color,roughness:.18,metalness:.05,clearcoat:.35,...settings});}
export function roundedBox(w,h,d,bevel=.06){const s=new T.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();const geo=new T.ExtrudeGeometry(s,{depth:d,steps:1,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2});geo.translate(0,0,-d/2);return geo;}
export function makeAsset(e,theme,clockMaterial='glass'){
  e={...e,seed:e.seed??seedFromId(e.id),variation:e.variation??.55,colors:{...defaultColors(e.kind),...e.colors}};
  const rnd=i=>randomAt(0,i)*(1-e.variation)+randomAt(e.seed,i)*e.variation;
  const colorMap=new Map();for(const [key,spec] of Object.entries(colorSlots(e.kind)))for(const value of spec.matches)colorMap.set(value,e.colors[key]);
  const remap=c=>typeof c==='string'?(colorMap.get(c)??c):c;
  const physical=(color,settings={})=>new T.MeshPhysicalMaterial({color:remap(color),roughness:.18,metalness:.05,clearcoat:.35,...settings,...(settings.emissive?{emissive:remap(settings.emissive)}:{})});
  const group=new T.Group();
  const add=(geo,mat,x=0,y=0,z=0,parent=group)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const stone=c=>new T.MeshStandardMaterial({color:remap(c),roughness:.87,flatShading:true});
  const glow=(c,intensity=1)=>new T.MeshStandardMaterial({color:remap(c),emissive:remap(c),emissiveIntensity:intensity,roughness:.3});
  const glass=()=>physical(new T.Color(e.color).lerp(new T.Color('#ffffff'),.55),{roughness:e.roughness*.55,transmission:e.transmission,thickness:.7,attenuationColor:e.color,attenuationDistance:e.absorption,ior:1.54,iridescence:.12,clearcoat:1,clearcoatRoughness:.05});
  const tube=(points,radius,material,parent=group)=>add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),20,radius,6,false),material,0,0,0,parent);
  const crystal=(x,z,height,radius,tilt=0,parent=group)=>{
    const stem=new T.Group();stem.position.set(x,0,z);stem.rotation.z=tilt;parent.add(stem);
    const shape=crystalGeometry(radius,height);const m=add(shape,glass(),0,0,0,stem);
    const edges=new T.LineSegments(new T.EdgesGeometry(shape),new T.LineBasicMaterial({color:e.colors.accent??theme.accent,transparent:true,opacity:.05}));m.add(edges);
  };
  const builders={Crystals:crystals,Trees:trees,Foliage:foliage,Ocean:ocean,Planets:planets,Structures:structures,Essentials:essentials};
  if(e.kind==='clock')return makeClock(e,clockMaterial);
  builders[categoryFor(e.kind)]({e,theme,group,add,stone,physical,glow,glass,tube,crystal,rnd,colors:e.colors});
  if(e.kind!=='water')for(let i=0;i<group.children.length;i++){const child=group.children[i];if(child.isLight)continue;child.scale.multiply(new T.Vector3(1+(rnd(i+201)-.5)*.16,1+(rnd(i+401)-.5)*.2,1+(rnd(i+601)-.5)*.16));}
  group.userData.seed=e.seed;
  group.traverse(o=>{o.userData.phase=rnd(o.geometry?.attributes.position?.count??1)*Math.PI*2;if(o.userData.bob)o.userData.baseY=o.position.y;if(o.userData.spin)o.userData.baseRotation=o.rotation.y;});
  return group;
}

const digitSegments=[[0,1,2,4,5,6],[2,5],[0,2,3,4,6],[0,2,3,5,6],[1,2,3,5],[0,1,3,5,6],[0,1,3,4,5,6],[0,2,5],[0,1,2,3,4,5,6],[0,1,2,3,5,6]];
export function makeClock(e,finish){
  const g=new T.Group();const settings={glass:{metalness:.05,transmission:.85,thickness:.4,roughness:.08},chrome:{metalness:1,roughness:.16,transmission:0},ceramic:{metalness:0,roughness:.35,transmission:0},amber:{metalness:.05,transmission:.65,thickness:.7,roughness:.13,attenuationColor:'#ffac47',attenuationDistance:.7}}[finish];
  const material=physical(new T.Color(e.color).lerp(new T.Color(finish==='amber'?'#ffd18a':'#ffffff'),finish==='ceramic'?.25:.65),{...settings,envMapIntensity:1.8,emissive:finish==='amber'?'#ad6420':e.color,emissiveIntensity:.07});
  const segments=[];for(let digit=0;digit<4;digit++){
    const x=(digit-1.5)*.95+(digit<2?-.13:.13);const pieces=[];const specs=[[0,.72,.55,.115],[-.33,.37,.11,.5],[.33,.37,.11,.5],[0,0,.55,.115],[-.33,-.37,.11,.5],[.33,-.37,.11,.5],[0,-.72,.55,.115]];
    for(const [dx,dy,w,h] of specs){const mesh=new T.Mesh(roundedBox(w,h,.16+randomAt(e.seed??seedFromId(e.id),1)*(e.variation??.55)*.08,.025+randomAt(e.seed??seedFromId(e.id),2)*(e.variation??.55)*.025),material);mesh.position.set(x+dx,dy,0);mesh.castShadow=true;g.add(mesh);pieces.push(mesh);}segments.push(pieces);
  }
  for(const y of [-.29,.29]){const dot=new T.Mesh(new T.SphereGeometry(.075,12,8),material);dot.position.set(0,y,0);g.add(dot);}
  g.rotation.x=-.2;
  g.userData.clock={segments,last:''};updateClock(g,new Date());return g;
}
export function updateClock(g,date){const c=g.userData.clock;if(!c)return;const text=String(date.getHours()).padStart(2,'0')+String(date.getMinutes()).padStart(2,'0');if(text===c.last)return;c.last=text;[...text].forEach((digit,i)=>c.segments[i].forEach((mesh,j)=>mesh.visible=digitSegments[Number(digit)].includes(j)));}

export function animateAsset(group,time,water,light){group.traverse(o=>{if(o.userData.flowWater)o.animate(time,water,light);if(o.userData.bob)o.position.y=o.userData.baseY+Math.sin(time*.65+(o.userData.phase??0))*o.userData.bob;if(o.userData.spin)o.rotation.y=o.userData.baseRotation+time*o.userData.spin;if(o.userData.ripple!==undefined)o.scale.setScalar(1+Math.sin(time*.6+o.userData.ripple)*.035);});if(group.userData.sway)group.rotation.z=Math.sin(time*.6)*.035;}

