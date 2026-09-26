import * as T from 'three';
import {FlowWater} from '../../water.js';
import {crystalGeometry,weatheredRock,planetTexture,leafGeometry} from '../../surfaces.js';
import {buildVariant} from './variants.js';
export function build(ctx){
  const {e,theme,group,add,stone,physical,glow,glass,tube,crystal,rnd,colors}=ctx;
  if(buildVariant(ctx))return;
  switch(e.kind){
    case 'planet': {
      const body=new T.Group();body.position.y=1.4;group.add(body);body.userData.bob=.08;
      add(new T.SphereGeometry(.92,40,24),physical('#ffffff',{roughness:.82,clearcoat:0,map:planetTexture(e.seed,colors.surface)}),0,0,0,body);
      for(let i=0;i<5;i++){const radius=1.3+i*.14+(rnd(i)-.5)*.05;const ring=add(new T.TorusGeometry(radius,.035+i*.002,5,96),physical(i%2?'#9a91c6':'#d6b5a0',{metalness:.5,roughness:.4}),0,0,0,body);ring.rotation.set(1.1,.2,.25);}
      for(let i=0;i<4;i++){const lat=(i-1.5)*.32;const r=add(new T.TorusGeometry(Math.sqrt(.92*.92-lat*lat),.016,4,64),stone(i%2?'#b18d85':'#f2d2a4'),0,lat,0,body);r.rotation.x=Math.PI/2;}break;
    }
    case 'meteor': {for(let i=0;i<7;i++){const m=add(weatheredRock(.25+rnd(i)*.35,i),physical('#565168',{metalness:.65,roughness:.65}),Math.sin(i*2)*.7,.3+rnd(i+1)*1.5,Math.cos(i*2)*.7);m.rotation.set(i,i*.3,i*.6);m.userData.bob=.08;}break;}
    case 'portal': {for(let i=0;i<3;i++){const ring=add(new T.TorusGeometry(1-i*.16,.028,8,72),physical(colors.rings,{emissive:theme.accent,emissiveIntensity:1.2,metalness:.8,roughness:.2}),0,1.4,0);ring.rotation.y=i*.5;ring.userData.spin=.12*(i+1);}add(new T.OctahedronGeometry(.24),glass(),0,1.4,0);break;}

    default:throw new Error('Unknown Planets asset '+e.kind);
  }
}
