import * as T from 'three';
import {FlowWater} from '../../water.js';
import {crystalGeometry,weatheredRock,planetTexture,leafGeometry} from '../../surfaces.js';
import {buildVariant} from './variants.js';
export function build(ctx){
  const {e,theme,group,add,stone,physical,glow,glass,tube,crystal,rnd,colors}=ctx;
  if(buildVariant(ctx))return;
  switch(e.kind){
    case 'mushroom': {
      for(let i=0;i<5;i++){const a=i*2.4,r=i?.55:0,h=i? .55+rnd(i)*.6:1.5;const x=Math.cos(a)*r,z=Math.sin(a)*r;add(new T.CylinderGeometry(.06,.1,h,8),physical('#bddfca',{roughness:.5}),x,h/2,z);const cap=add(new T.SphereGeometry(i?.36:.65,24,12,0,Math.PI*2,0,Math.PI/2),physical(i%2?'#86e3f2':'#e3a0ed',{emissive:i%2?'#358eac':'#a044c0',emissiveIntensity:.5,roughness:.25,side:T.DoubleSide}),x,h,z);cap.scale.y=.6;for(let j=0;j<7;j++){const angle=j*2.4;add(new T.SphereGeometry(.035,6,4),glow('#fff2cd',1),x+Math.cos(angle)*(i?.2:.38),h+.15,z+Math.sin(angle)*(i?.2:.38));}}
      break;
    }
    case 'fern': case 'kelp': {
      for(let i=0;i<7;i++){const a=i*.9;const h=e.kind==='kelp'?1.8+rnd(i):.8+rnd(i)*.6;const pts=[[0,0,0],[Math.cos(a)*.3,h*.5,Math.sin(a)*.3],[Math.cos(a)*.8,h,Math.sin(a)*.8]];tube(pts,.022,physical(e.kind==='kelp'?'#42ad91':'#70b692',{roughness:.6}));for(let j=1;j<7;j++){const f=j/7;for(const sign of [-1,1]){const leaf=add(leafGeometry(e.kind==='kelp'?.8:.38,e.kind==='kelp'?.11:.09,.08),physical(e.kind==='kelp'?'#4db595':'#6aa777',{roughness:.55,side:T.DoubleSide,transmission:.12,thickness:.035,clearcoat:.2}),Math.cos(a)*f*.8+Math.cos(a+sign)*.16,f*h,Math.sin(a)*f*.8+Math.sin(a+sign)*.16);leaf.rotation.set(e.kind==='kelp'?-.85:-.15,a+sign*1.2,.2);}}}group.userData.sway=true;break;
    }
    case 'flower': {
      for(let i=0;i<6;i++){const x=(rnd(i)-.5)*1.3,z=(rnd(i+10)-.5)*1.3,h=.5+rnd(i+2)*.7;tube([[x,0,z],[x+.1,h*.6,z],[x,h,z]],.018,stone('#518871'));for(let j=0;j<6;j++){const a=j/6*Math.PI*2;const petal=add(new T.SphereGeometry(.13,8,6),physical('#cfc0ff',{emissive:'#7659c7',emissiveIntensity:.7,roughness:.3}),x+Math.cos(a)*.16,h,z+Math.sin(a)*.16);petal.scale.set(1,.35,1.7);petal.rotation.y=-a;}add(new T.SphereGeometry(.065,8,6),glow('#ffdc91',1.5),x,h+.06,z);}break;
    }
    case 'moss': case 'rock': {for(let i=0;i<7;i++){const m=add(weatheredRock(.4+rnd(i)*.3,i),stone(e.kind==='moss'?'#398574':theme.ground),Math.sin(i*2.4)*.65,.12,Math.cos(i*2.4)*.65);m.scale.set(1,.4,1);}break;}

    default:throw new Error('Unknown Foliage asset '+e.kind);
  }
}
