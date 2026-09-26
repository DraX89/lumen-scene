import * as T from 'three';
import {leafGeometry} from '../../surfaces.js';
export function buildVariant({e,add,physical,rnd,colors}){
  if(!['grass','succulent'].includes(e.kind))return false;
  const grass=e.kind==='grass',count=grass?55:30,mat=physical(colors.leaves,{roughness:.7,side:T.DoubleSide});
  for(let i=0;i<count;i++){
    const a=i*2.399,l=grass?.35+rnd(i)*.8:.4+(1-i/count)*.6;
    const leaf=add(leafGeometry(l,grass?.025:.17,grass?.08:.23),mat,grass?(rnd(i+100)-.5)*1.3:0,grass?0:i*.013,grass?(rnd(i+200)-.5)*1.3:0);leaf.rotation.set(grass?-1.05-rnd(i)*.35:-.15-i/count*.6,a,0);
  }
  return true;
}
