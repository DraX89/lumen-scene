import * as T from 'three';
import {FlowWater} from '../../water.js';
import {crystalGeometry,weatheredRock,planetTexture,leafGeometry} from '../../surfaces.js';
import {buildVariant} from './variants.js';
export function build(ctx){
  const {e,theme,group,add,stone,physical,glow,glass,tube,crystal,rnd,colors}=ctx;
  if(buildVariant(ctx))return;
  switch(e.kind){
    case 'satellite': {const body=new T.Group();group.add(body);body.position.y=1.3;body.rotation.set(.2,.3,-.25);body.userData.bob=.1;add(new T.BoxGeometry(.4,.55,.4),physical('#b8bbca',{metalness:.9,roughness:.3}),0,0,0,body);for(const sign of [-1,1]){const panel=add(new T.BoxGeometry(.7,.5,.05),physical('#263269',{metalness:.6,roughness:.25}),sign*.65,0,0,body);for(let j=0;j<3;j++)add(new T.BoxGeometry(.012,.49,.06),physical('#ada6bf',{metalness:1}),sign*.65-.23+j*.23,0,0,body);}tube([[0,.2,0],[0,.65,0],[.2,.75,0]],.015,physical('#d5d8df',{metalness:1}),body);break;}
    case 'moss': case 'rock': {for(let i=0;i<7;i++){const m=add(weatheredRock(.4+rnd(i)*.3,i),stone(e.kind==='moss'?'#398574':colors.body),Math.sin(i*2.4)*.65,.12,Math.cos(i*2.4)*.65);m.scale.set(1,.4,1);}break;}

    default:throw new Error('Unknown Structures asset '+e.kind);
  }
}
