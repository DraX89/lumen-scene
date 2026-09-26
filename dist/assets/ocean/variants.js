import * as T from 'three';
export function buildVariant({e,add,physical,tube,rnd,colors,group}){
  if(e.kind==='anemone'){
    add(new T.SphereGeometry(.55,24,12),physical(colors.body,{roughness:.6}),0,.12,0).scale.y=.35;
    for(let i=0;i<35;i++){const a=i*2.399,r=Math.sqrt(i/35)*.48,h=.4+rnd(i)*.75,x=Math.cos(a)*r,z=Math.sin(a)*r;tube([[x,.1,z],[x*1.1,h*.6,z*1.1],[x+.12*Math.sin(a),h,z+.12*Math.cos(a)]],.024,physical(colors.body,{roughness:.35}));add(new T.SphereGeometry(.048,8,6),physical(colors.accent,{emissive:colors.accent,emissiveIntensity:.3}),x+.12*Math.sin(a),h,z+.12*Math.cos(a));}group.userData.sway=true;return true;
  }
  if(e.kind==='sponge'){for(let i=0;i<7;i++){const a=i*2.399,h=.5+rnd(i)*1.3,r=.12+rnd(i+1)*.12,x=Math.cos(a)*.4,z=Math.sin(a)*.4;add(new T.CylinderGeometry(r,r*.7,h,18,1,true),physical(colors.body,{roughness:.9,side:T.DoubleSide}),x,h/2,z);const rim=add(new T.TorusGeometry(r,.035,8,24),physical(colors.accent,{roughness:.8}),x,h,z);rim.rotation.x=Math.PI/2;}return true;}
  return false;
}
