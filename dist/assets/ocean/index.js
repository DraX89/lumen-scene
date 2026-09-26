import * as T from 'three';
import {FlowWater} from '../../water.js';
import {crystalGeometry,weatheredRock,planetTexture,leafGeometry} from '../../surfaces.js';
import {buildVariant} from './variants.js';
export function build(ctx){
  const {e,theme,group,add,stone,physical,glow,glass,tube,crystal,rnd,colors}=ctx;
  if(buildVariant(ctx))return;
  switch(e.kind){
    case 'fern': case 'kelp': {
      for(let i=0;i<7;i++){const a=i*.9;const h=e.kind==='kelp'?1.8+rnd(i):.8+rnd(i)*.6;const pts=[[0,0,0],[Math.cos(a)*.3,h*.5,Math.sin(a)*.3],[Math.cos(a)*.8,h,Math.sin(a)*.8]];tube(pts,.022,physical(e.kind==='kelp'?'#42ad91':'#70b692',{roughness:.6}));for(let j=1;j<7;j++){const f=j/7;for(const sign of [-1,1]){const leaf=add(leafGeometry(e.kind==='kelp'?.8:.38,e.kind==='kelp'?.11:.09,.08),physical(e.kind==='kelp'?'#4db595':'#6aa777',{roughness:.55,side:T.DoubleSide,transmission:.12,thickness:.035,clearcoat:.2}),Math.cos(a)*f*.8+Math.cos(a+sign)*.16,f*h,Math.sin(a)*f*.8+Math.sin(a+sign)*.16);leaf.rotation.set(e.kind==='kelp'?-.85:-.15,a+sign*1.2,.2);}}}group.userData.sway=true;break;
    }
    case 'coral': {
      const branch=(x,y,z,length,angle,depth)=>{const end=[x+Math.sin(angle)*length,y+Math.cos(angle)*length,z+Math.sin(angle*2+y)*length*.35];tube([[x,y,z],[(x+end[0])/2,y+length*.55,z],end],.035+depth*.018,physical(depth%2?'#ed90ae':'#ecb0cc',{roughness:.65}));if(depth>0){branch(...end,length*(.5+rnd(depth+3)*.3),angle-.4-rnd(depth)*.3,depth-1);branch(...end,length*.7,angle+.55,depth-1);}else add(new T.SphereGeometry(.045,8,6),physical('#f6bded',{roughness:.45,clearcoat:.1}),...end);};
      branch(0,0,0,.8,0,3);branch(-.3,0,.3,.6,-.5,2);branch(.3,0,-.2,.75,.4,2);break;
    }
    case 'jellyfish': {
      const body=new T.Group();body.position.y=2;body.userData.bob=.18;group.add(body);
      const dome=add(new T.SphereGeometry(.68,24,16,0,Math.PI*2,0,Math.PI*.58),physical('#becbff',{transmission:.8,thickness:.25,roughness:.12,emissive:'#6356c1',emissiveIntensity:.3,side:T.DoubleSide}),0,0,0,body);dome.scale.y=.65;
      const rim=add(new T.TorusGeometry(.65,.025,8,40),glow(colors.accent,1),0,-.12,0,body);rim.rotation.x=Math.PI/2;
      for(let i=0;i<10;i++){const a=i*Math.PI/5;const x=Math.cos(a)*.4,z=Math.sin(a)*.4;tube([[x,0,z],[x+.12,-.5,z],[x-.1,-1,z+.1],[x+.08,-1.6+rnd(i)*.4,z]],.018,glow('#94e9e7',.6),body);}break;
    }
    case 'shell': {
      for(let i=0;i<13;i++){const a=(i/12-.5)*Math.PI*.9;const rib=add(new T.SphereGeometry(.5,12,8),physical('#e2bacc',{roughness:.25,iridescence:.8}),Math.sin(a)*.4,.18,Math.cos(a)*.3);rib.scale.set(.15,.25,1.5);rib.rotation.y=a;}
      add(new T.SphereGeometry(.22,24,16),physical('#eef3f5',{metalness:.35,roughness:.13,iridescence:1}),0,.4,.3);break;
    }
    case 'bubbles': {
      for(let i=0;i<12;i++){const bubble=add(new T.SphereGeometry(.06+rnd(i)*.11,12,8),physical('#c7f9f7',{transmission:1,thickness:.04,roughness:0,iridescence:1}),Math.sin(i*2)*.4,.3+i*.22,Math.cos(i*2)*.4);bubble.userData.bob=.12;}break;
    }

    default:throw new Error('Unknown Ocean asset '+e.kind);
  }
}
