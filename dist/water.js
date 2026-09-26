import * as T from 'three';
import {Water} from 'three/addons/objects/Water2.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {Refractor} from 'three/addons/objects/Refractor.js';

// Periodic, deterministic normals: no remote textures or texture seams.
export function waterNormalMap(phase=0,size=128){
  const data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=x/size*Math.PI*2,v=y/size*Math.PI*2;
    const dx=.18*Math.cos(3*u+2*v+phase)+.09*Math.cos(7*u-5*v),dy=.12*Math.cos(3*u+2*v+phase)-.12*Math.sin(4*v-u);
    const n=new T.Vector3(-dx,-dy,1).normalize(),i=(y*size+x)*4;
    data[i]=(n.x*.5+.5)*255;data[i+1]=(n.y*.5+.5)*255;data[i+2]=n.z*255;data[i+3]=255;
  }
  const map=new T.DataTexture(data,size,size);map.wrapS=map.wrapT=T.RepeatWrapping;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
}
export function flowPhase(time,speed){return ((time*speed*.06)%.15+.15)%.15;}

// Water2's flow shader with explicit lifetime, a shared animation clock, and key-light glints.
// Reflector/Refractor own their render targets and must be disposed with each scene asset.
export class FlowWater extends T.Mesh {
  constructor(color,seed=0){
    const geometry=new T.PlaneGeometry(9.4,9.4,64,64);
    const uniforms=T.UniformsUtils.merge([T.UniformsLib.fog,Water.WaterShader.uniforms,{
      flowDirection:{value:new T.Vector2(1,.2)},time:{value:0},amplitude:{value:.035},
      keyPosition:{value:new T.Vector3(-3,5,3)},keyColor:{value:new T.Color('#ffffff')},keyPower:{value:70}
    }]);
    const vertexShader=Water.WaterShader.vertexShader
      .replace('uniform mat4 textureMatrix;','uniform mat4 textureMatrix; uniform float time; uniform float amplitude; varying vec3 vWorld;')
      .replace('vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',`vec3 displaced=position;
        displaced.z+=amplitude*(sin(position.x*2.1+time*.8)*.55+sin(position.y*3.4-time*.6)*.3+sin((position.x+position.y)*4.5+time)*.15);
        vec4 worldPosition=modelMatrix*vec4(displaced,1.0);vWorld=worldPosition.xyz;`);
    const fragmentShader=Water.WaterShader.fragmentShader
      .replace('uniform vec3 color;','uniform vec3 color; uniform vec3 keyPosition; uniform vec3 keyColor; uniform float keyPower; uniform float amplitude; uniform float time; varying vec3 vWorld;')
      .replace('normalColor.r * 2.0 - 1.0','(normalColor.r * 2.0 - 1.0) * (0.3 + amplitude * 12.0)')
      .replace('normalColor.g * 2.0 - 1.0','(normalColor.g * 2.0 - 1.0) * (0.3 + amplitude * 12.0)')
      .replace('gl_FragColor = vec4( color, 1.0 ) * mix( refractColor, reflectColor, reflectance );',`vec3 lightVector=keyPosition-vWorld;
        vec3 halfVector=normalize(normalize(lightVector)+toEye);
        float specular=pow(max(dot(normal,halfVector),0.0),180.0)*keyPower/max(dot(lightVector,lightVector),1.0);
        vec3 shallow=mix(refractColor.rgb,color,0.28);
        float shore=max(abs(vUv.x-.5),abs(vUv.y-.5));
        float foam=smoothstep(.455,.495,shore)*pow(max(sin(shore*260.0-time*1.3+normal.x*5.0),0.0),6.0)*amplitude*2.0;
        gl_FragColor=vec4(mix(shallow,reflectColor.rgb,reflectance)+keyColor*(specular+foam*keyPower/85.0),1.0);`);
    super(geometry,new T.ShaderMaterial({uniforms,vertexShader,fragmentShader,fog:true}));
    this.userData.flowWater=true;this.rotation.x=-Math.PI/2;this.position.y=-.08;
    this.reflector=new Reflector(geometry,{textureWidth:512,textureHeight:512,clipBias:.003});
    this.refractor=new Refractor(geometry,{textureWidth:512,textureHeight:512,clipBias:.003});
    this.reflector.matrixAutoUpdate=this.refractor.matrixAutoUpdate=false;
    uniforms.color.value=new T.Color(color);uniforms.reflectivity.value=.025;
    uniforms.config.value.set(0,.075,.075,3);uniforms.textureMatrix.value=new T.Matrix4();
    uniforms.tNormalMap0.value=waterNormalMap((seed%1000)/100);uniforms.tNormalMap1.value=waterNormalMap(1.7+(seed%1000)/100);
    uniforms.tReflectionMap.value=this.reflector.getRenderTarget().texture;uniforms.tRefractionMap.value=this.refractor.getRenderTarget().texture;
    this.onBeforeRender=(renderer,scene,camera)=>{
      const hidden=[];scene.traverse(o=>{if(o.userData.flowWater&&o.visible){hidden.push(o);o.visible=false;}});
      const matrix=uniforms.textureMatrix.value;
      matrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(camera.projectionMatrix).multiply(camera.matrixWorldInverse).multiply(this.matrixWorld);
      try{for(const pass of [this.reflector,this.refractor]){pass.matrixWorld.copy(this.matrixWorld);pass.onBeforeRender(renderer,scene,camera);}}
      finally{for(const o of hidden)o.visible=true;}
    };
  }
  animate(time,settings={speed:.6,waves:.035,direction:15},light){
    const u=this.material.uniforms,p=flowPhase(time,settings.speed),a=settings.direction*Math.PI/180;
    u.config.value.x=p;u.config.value.y=(p+.075)%.15;u.time.value=time*settings.speed;u.amplitude.value=settings.waves;
    u.flowDirection.value.set(Math.cos(a),Math.sin(a));
    if(light){u.keyPosition.value.copy(light.position);u.keyColor.value.copy(light.color);u.keyPower.value=light.intensity;}
  }
  dispose(){if(this.disposed)return;this.disposed=true;this.reflector.dispose();this.refractor.dispose();this.material.uniforms.tNormalMap0.value.dispose();this.material.uniforms.tNormalMap1.value.dispose();}
}
