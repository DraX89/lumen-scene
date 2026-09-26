import * as T from 'three';
export function buildVariant({e,add,glass,stone,rnd,colors,crystal}){
  if(e.kind==='aragonite'){for(let i=0;i<28;i++){const a=i*2.399,r=.2+rnd(i)*.5;crystal(Math.cos(a)*r,Math.sin(a)*r,.5+rnd(i+40)*1.6,.06+rnd(i+12)*.04,(rnd(i+30)-.5)*1.2);}add(new T.IcosahedronGeometry(.65,1),stone(colors.matrix),0,.08,0).scale.y=.25;return true;}
  if(e.kind==='fluorite'){for(let i=0;i<14;i++){const size=.25+rnd(i)*.5,m=add(new T.BoxGeometry(size,size,size),glass(),(rnd(i+20)-.5)*1.2,.2+rnd(i+30)*.8,(rnd(i+40)-.5)*1.2);m.rotation.set(rnd(i+50)*.7,rnd(i+60)*1.5,rnd(i+70)*.5);}return true;}
  return false;
}
