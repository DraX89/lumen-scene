import * as T from 'three';
import {FlowWater} from '../../water.js';
import {crystalGeometry,weatheredRock,planetTexture,leafGeometry} from '../../surfaces.js';
import {buildVariant} from './variants.js';
export function build(ctx){
  const {e,theme,group,add,stone,physical,glow,glass,tube,crystal,rnd,colors}=ctx;
  if(buildVariant(ctx))return;
  switch(e.kind){
    case 'crystal': case 'quartz': {
      const count=e.kind==='quartz'?13:7;for(let i=0;i<count;i++){const a=i*2.399,r=i===0?0:.3+Math.sqrt(i)*.18;crystal(Math.cos(a)*r,Math.sin(a)*r,(e.kind==='quartz'?1.3:2.1)*(1-rnd(i)*.6),e.kind==='quartz'?.12:.3,(rnd(i+4)-.5)*.6);}
      add(new T.DodecahedronGeometry(.8,1),stone(colors.matrix),0,.02,0).scale.set(1,.25,1);break;
    }
    case 'geode': {
      const rock=add(new T.SphereGeometry(.95,16,12,0,Math.PI),stone('#655c74'),0,.8,0);rock.rotation.set(.15,Math.PI,0);
      const inside=add(new T.SphereGeometry(.85,18,12,0,Math.PI),physical(e.color,{metalness:.15,side:T.DoubleSide,roughness:.22}),0,.8,.03);inside.rotation.set(.15,Math.PI,0);
      for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=.6+Math.sin(i*3)*.16;const spike=add(new T.ConeGeometry(.12,.35+rnd(i)*.4,5),glass(),Math.cos(a)*r,.85+Math.sin(a)*r,.45);spike.rotation.x=Math.PI*.5;}
      break;
    }
    case 'bismuth': {
      for(let i=0;i<11;i++){const size=1.45-i*.1;const mat=physical(new T.Color(e.color).offsetHSL(i*.035,0,(rnd(i+40)-.5)*.15),{metalness:.92,roughness:.2,iridescence:1});const frame=add(new T.TorusGeometry(size/2,.075,4,4),mat,.08*Math.sin(i),.15+i*.13,0);frame.rotation.set(Math.PI/2,0,Math.PI/4+i*.08);}
      break;
    }
    case 'obelisk': {
      const main=add(new T.CylinderGeometry(.2,.5,2.6,4),glass(),0,1.3,0);main.rotation.y=Math.PI/4;add(new T.OctahedronGeometry(.34),glow(colors.accent,.7),0,2.85,0);
      for(let i=0;i<3;i++){const r=add(new T.TorusGeometry(.65+i*.14,.014,6,48),glow(colors.accent,.8),0,.35+i*.7,0);r.rotation.x=Math.PI/2;r.rotation.z=.2*i;}break;
    }

    default:throw new Error('Unknown Crystals asset '+e.kind);
  }
}
