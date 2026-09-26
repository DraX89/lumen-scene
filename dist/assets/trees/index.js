import * as T from 'three';
import {FlowWater} from '../../water.js';
import {crystalGeometry,weatheredRock,planetTexture,leafGeometry} from '../../surfaces.js';
import {buildVariant} from './variants.js';
export function build(ctx){
  const {e,theme,group,add,stone,physical,glow,glass,tube,crystal,rnd,colors}=ctx;
  if(buildVariant(ctx))return;
  switch(e.kind){
    case 'tree': {
      add(new T.CylinderGeometry(.08,.2,3.4,12),stone('#554535'),0,1.7,0);
      // Instance needle sprays to keep the detailed forest inexpensive in reflection passes.
      const needles=new T.InstancedMesh(new T.ConeGeometry(1,1,7),new T.MeshStandardMaterial({color:'#ffffff',roughness:.88}),252);needles.castShadow=needles.receiveShadow=true;group.add(needles);let needleIndex=0;const transform=new T.Object3D();
      for(let tier=0;tier<9;tier++)for(let j=0;j<7;j++){
        const a=j*Math.PI*2/7+tier*.73+(rnd(tier*7+j)-.5)*.65,y=.65+tier*.29+(rnd(j+77)-.5)*.15,len=(1-tier/11)*1.2*(.75+rnd(tier*13+j)*.5);
        const dx=Math.cos(a),dz=Math.sin(a);
        tube([[0,y+.15,0],[dx*len*.55,y-.04,dz*len*.55],[dx*len,y-.16,dz*len]],.018,stone('#65513e'));
        for(let k=1;k<=4;k++){
          const f=k/4;transform.position.set(dx*len*f,y+.04,dz*len*f);transform.scale.set(.22*(1-f*.55),.65*(1-f*.35),.22*(1-f*.55));
          transform.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(dx*.8,.6,dz*.8).normalize());transform.updateMatrix();needles.setMatrixAt(needleIndex,transform.matrix);needles.setColorAt(needleIndex++,new T.Color(colors.leaves).offsetHSL((rnd(j+55)-.5)*.025,0,(rnd(j+tier)-.5)*.14));
        }
      }
      for(let i=0;i<5;i++)tube([[0,.12,0],[Math.cos(i*1.26)*.3,.04,Math.sin(i*1.26)*.3],[Math.cos(i*1.26)*.65,-.03,Math.sin(i*1.26)*.65]],.06,stone('#554535'));
      break;
    }

    default:throw new Error('Unknown Trees asset '+e.kind);
  }
}
