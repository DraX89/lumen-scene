import * as T from 'three';
import {weatheredRock} from '../../surfaces.js';
export function buildVariant({e,add,stone,rnd,colors}){
  if(e.kind!=='arch')return false;
  for(let i=0;i<18;i++){const a=i/17*Math.PI;const rock=add(weatheredRock(.3+rnd(i)*.12,e.seed%99+i),stone(i%3?colors.body:colors.accent),Math.cos(a)*1.1,.2+Math.sin(a)*1.65,(rnd(i+20)-.5)*.2);rock.scale.set(1,1.25,.85);rock.rotation.set(rnd(i)*.4,rnd(i+1)*.5,0);}return true;
}
