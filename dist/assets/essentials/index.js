import * as T from 'three';
import {FlowWater} from '../../water.js';
import {crystalGeometry,weatheredRock,planetTexture,leafGeometry} from '../../surfaces.js';
import {buildVariant} from './variants.js';
export function build(ctx){
  const {e,theme,group,add,stone,physical,glow,glass,tube,crystal,rnd,colors}=ctx;
  if(buildVariant(ctx))return;
  switch(e.kind){
    case 'water': {group.add(new FlowWater(colors.body,e.seed*e.variation));break;}
    case 'light': {add(new T.SphereGeometry(.09,12,8),glow(e.color,3));group.add(new T.PointLight(e.color,6,5,2));const orbit=add(new T.TorusGeometry(.25,.009,6,32),glow(e.color,1));orbit.rotation.x=.6;orbit.userData.spin=.4;break;}

    default:throw new Error('Unknown Essentials asset '+e.kind);
  }
}

