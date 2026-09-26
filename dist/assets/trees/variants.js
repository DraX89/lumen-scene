import * as T from 'three';
import {leafGeometry} from '../../surfaces.js';
export function buildVariant({e,group,add,stone,physical,tube,rnd,colors}){
  if(!['oak','birch','cherry','palm'].includes(e.kind))return false;
  const height=2.4+rnd(1)*1.1,lean=(rnd(2)-.5)*.7;
  const bark=stone(e.kind==='birch'?'#d9d6c5':colors.trunk);
  tube([[0,0,0],[lean*.35,height*.5,0],[lean,height,0]],e.kind==='oak'?.15:.09,bark);
  if(e.kind==='birch')for(let i=0;i<16;i++){const band=add(new T.TorusGeometry(.095,.014,4,16,Math.PI*(.4+rnd(i))),stone(colors.trunk),lean*i/16,height*i/16,0);band.rotation.set(Math.PI/2,0,rnd(i+30)*6);}
  if(e.kind==='palm'){
    for(let i=0;i<11;i++){const a=i*Math.PI*2/11+rnd(i+11)*.2,l=1.4+rnd(i)*.65;const frond=add(leafGeometry(l,.23,.32),physical(colors.leaves,{roughness:.68,side:T.DoubleSide}),lean,height,0);frond.rotation.set(.25+rnd(i)*.3,a,.25);tube([[lean,height,0],[lean+Math.sin(a)*l*.5,height+.25,Math.cos(a)*l*.5],[lean+Math.sin(a)*l,height-.3,Math.cos(a)*l]],.015,stone(colors.leaves));}
    for(let i=0;i<4;i++)add(new T.SphereGeometry(.14,12,8),stone(colors.trunk),lean+Math.sin(i)*.2,height-.15,Math.cos(i)*.2);
  }else{
    const count=e.kind==='birch'?7:10,leaves=new T.InstancedMesh(leafGeometry(.3,.11,.04),new T.MeshStandardMaterial({color:'#ffffff',roughness:.85,side:T.DoubleSide}),count*64),dummy=new T.Object3D();leaves.castShadow=leaves.receiveShadow=true;group.add(leaves);let index=0;
    for(let i=0;i<count;i++){
      const a=i*2.399+rnd(i+40)*.6,y=height*(.48+i/count*.43),r=(e.kind==='birch'?.7:1.1)*(.65+rnd(i+7)*.65),end=new T.Vector3(lean+Math.cos(a)*r,y+.35,Math.sin(a)*r);
      tube([[lean*y/height,y,0],[end.x*.65,y+.2,end.z*.65],end.toArray()],.035+rnd(i+70)*.04,bark);
      for(let j=0;j<64;j++){const n=i*71+j;dummy.position.copy(end).add(new T.Vector3((rnd(n+100)-.5)*.9,(rnd(n+200)-.5)*.7,(rnd(n+300)-.5)*.9));dummy.scale.set(.8+rnd(n)*.8,1,.8+rnd(n+31)*.8);dummy.rotation.set(rnd(n)*3,rnd(n+1)*3,rnd(n+2)*3);dummy.updateMatrix();leaves.setMatrixAt(index,dummy.matrix);leaves.setColorAt(index++,new T.Color(e.kind==='cherry'?colors.accent:colors.leaves).offsetHSL(0,0,(rnd(n+80)-.5)*.18));}
    }
  }
  return true;
}

