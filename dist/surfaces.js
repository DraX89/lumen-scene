import * as T from 'three';

// One closed crystal with tapered shoulders and an asymmetric termination.
export function crystalGeometry(radius,height){
  const rings=[{y:0,r:.78},{y:height*.12,r:1},{y:height*.83,r:.92},{y:height,r:.62}];
  const points=[];for(const ring of rings)for(let i=0;i<6;i++){const a=i*Math.PI/3;points.push(new T.Vector3(Math.cos(a)*radius*ring.r,ring.y,Math.sin(a)*radius*ring.r));}
  const tip=new T.Vector3(radius*.12,height*1.28,-radius*.08),bottom=new T.Vector3(0,0,0),vertices=[];
  const triangle=(a,b,c)=>vertices.push(...a.toArray(),...b.toArray(),...c.toArray());
  for(let i=0;i<6;i++){
    const n=(i+1)%6;triangle(bottom,points[i],points[n]);
    for(let r=0;r<3;r++){const a=points[r*6+i],b=points[r*6+n],c=points[(r+1)*6+i],d=points[(r+1)*6+n];triangle(a,c,b);triangle(b,c,d);}
    triangle(points[18+i],tip,points[18+n]);
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();return geo;
}
export function weatheredRock(radius,seed=0){
  const geo=new T.IcosahedronGeometry(radius,3),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),f=1+.12*Math.sin(x*17+seed)*Math.cos(z*13-y*11)+.035*Math.sin(y*53+x*39);
    p.setXYZ(i,x*f,y*f,z*f);
  }
  geo.computeVertexNormals();return geo;
}
export function planetTexture(seed=0,surface='#cfac89'){
  const w=512,h=256,data=new Uint8Array(w*h*4);
  const amber=new T.Color(surface),cream=new T.Color(surface).lerp(new T.Color('#ffffff'),.55),red=new T.Color(surface).multiplyScalar(.45);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const u=x/w*Math.PI*2,v=y/h;
    const turbulence=Math.sin(u*3+v*42+seed%101)*.012+Math.sin(u*9-v*35)*.005;
    const bands=Math.sin((v+turbulence)*84)+.35*Math.sin(v*210+u*2);
    const c=amber.clone().lerp(bands>0?cream:red,Math.min(1,Math.abs(bands)*.6));
    const i=(y*w+x)*4;data[i]=c.r*255;data[i+1]=c.g*255;data[i+2]=c.b*255;data[i+3]=255;
  }
  const t=new T.DataTexture(data,w,h);t.wrapS=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;
}

export function leafGeometry(length,width,bend=.2){
  const vertices=[],uvs=[],indices=[],steps=16;
  for(let i=0;i<=steps;i++){
    const t=i/steps,w=Math.sin(t*Math.PI)*width*(1-.4*t);
    for(const side of [-1,1]){vertices.push(side*w,bend*Math.sin(t*Math.PI)+Math.sin(t*9)*.025,t*length);uvs.push((side+1)/2,t);}
  }
  for(let i=0;i<steps;i++){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
