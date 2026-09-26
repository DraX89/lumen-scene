import * as T from 'three';
import {weatheredRock} from '../../surfaces.js';
export function buildVariant({e,group,add,physical,rnd,colors}){
  if(e.kind==='moon'){
    add(weatheredRock(.9,e.seed%100),physical(colors.surface,{roughness:.97}),0,1.15,0);
    for(let i=0;i<24;i++){const direction=new T.Vector3(rnd(i)*2-1,rnd(i+50)*2-1,rnd(i+100)*2-1).normalize(),r=.045+rnd(i+8)*.1,crater=add(new T.TorusGeometry(r,.014,6,20),physical(colors.rings,{roughness:.95}));crater.position.copy(direction.clone().multiplyScalar(.9)).add(new T.Vector3(0,1.15,0));crater.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),direction);}return true;
  }
  if(e.kind==='terrestrial'){
    const geo=new T.SphereGeometry(.94,64,40),p=geo.attributes.position,cs=[];
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=Math.sin(x*7+e.seed%89)*Math.cos(y*8-z*3)+.3*Math.sin(z*17+x*11);const c=new T.Color(n>.05?colors.rings:colors.surface);if(Math.abs(y)>.8)c.lerp(new T.Color('#ffffff'),.8);cs.push(c.r,c.g,c.b);if(n>.05)p.setXYZ(i,x*1.012,y*1.012,z*1.012);}
    geo.setAttribute('color',new T.Float32BufferAttribute(cs,3));geo.computeVertexNormals();add(geo,physical('#ffffff',{roughness:.48,vertexColors:true}),0,1.3,0);const halo=add(new T.SphereGeometry(.99,32,24),physical(colors.surface,{transparent:true,opacity:.12,side:T.BackSide}),0,1.3,0);halo.castShadow=false;return true;
  }
  return false;
}
