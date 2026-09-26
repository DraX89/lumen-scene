import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {THEMES,PROFILES,sceneTheme} from './model.js';
import {makeAsset,updateClock,animateAsset} from './assets.js';

export class SceneView {
  constructor(host,{select,move,stats}) {
    this.host=host;this.onSelect=select;this.onMove=move;this.onStats=stats;this.profile='desktop';this.mode='orbit';this.selected=null;this.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;this.items=new Map();this.elapsed=0;
    this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(33,1,.1,100);this.camera.position.set(0,9,20);
    this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.shadowMap.type=T.PCFSoftShadowMap;host.append(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','Interactive 3D scene. Select elements in the scene list to edit with keyboard controls.');
    const pmrem=new T.PMREMGenerator(this.renderer);const room=new RoomEnvironment();this.env=pmrem.fromScene(room,.04);this.scene.environment=this.env.texture;this.scene.environmentIntensity=.65;room.dispose();pmrem.dispose();
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(0,-.7,0);this.controls.enabled=false;this.controls.enableDamping=true;this.controls.minDistance=7;this.controls.maxDistance=24;this.controls.maxPolarAngle=Math.PI*.47;
    this.ambient=new T.HemisphereLight('#d5e8ff','#151026',.3);this.scene.add(this.ambient);
    this.key=new T.PointLight('#bbaaff',35,25,2);this.key.position.set(-3,5,3);this.key.castShadow=true;this.key.shadow.mapSize.set(1024,1024);this.key.shadow.bias=-.001;this.scene.add(this.key);
    this.fill=new T.PointLight('#48d7e8',35,25,2);this.fill.position.set(4,3,-3);this.scene.add(this.fill);
    this.presenceLight=new T.PointLight('#ffffff',0,12,2);this.scene.add(this.presenceLight);
    const base=new T.Mesh(new T.BoxGeometry(10,.4,10),new T.MeshStandardMaterial({color:'#141326',roughness:.6,metalness:.35}));base.position.y=-.32;base.receiveShadow=true;this.base=base;this.scene.add(base);
    const outline=new T.EdgesGeometry(new T.BoxGeometry(10.03,.41,10.03));this.ring=new T.LineSegments(outline,new T.LineBasicMaterial({color:'#7e6fad',transparent:true,opacity:.6}));this.ring.position.y=-.32;this.scene.add(this.ring);
    const positions=[];for(let i=0;i<110;i++)positions.push(Math.sin(i*12.34)*5,.3+((i*17)%49)/10,Math.cos(i*5.73)*5);
    const particles=new T.BufferGeometry();particles.setAttribute('position',new T.Float32BufferAttribute(positions,3));this.particles=new T.Points(particles,new T.PointsMaterial({color:'#c7baff',size:.027,transparent:true,opacity:.6}));this.scene.add(this.particles);
    this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.bloom=new UnrealBloomPass(new T.Vector2(1,1),.65,.55,.85);this.composer.addPass(this.bloom);this.composer.addPass(new OutputPass());
    this.ray=new T.Raycaster();this.pointer=new T.Vector2();this.plane=new T.Plane(new T.Vector3(0,1,0),0);this.hit=new T.Vector3();
    this.abort=new AbortController();const opt={signal:this.abort.signal};
    host.addEventListener('pointerdown',e=>this.pointerDown(e),{...opt,capture:true});host.addEventListener('pointermove',e=>this.pointerMove(e),opt);host.addEventListener('pointerup',e=>this.pointerUp(e),opt);host.addEventListener('pointercancel',()=>this.cancelDrag(),opt);host.addEventListener('lostpointercapture',()=>this.cancelDrag(),opt);
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.renderer.setAnimationLoop(null);host.dispatchEvent(new CustomEvent('scene-error',{detail:'Graphics context lost. Reload to restore the scene.'}));},opt);
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();this.last=performance.now();this.frames=0;this.lastStat=this.last;
    this.renderer.setAnimationLoop(t=>this.frame(t));
  }
  resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);this.composer.setSize(w,h);}
  quality(profile){this.profile=profile;const p=PROFILES[profile];this.renderer.setPixelRatio(Math.min(devicePixelRatio,p.dpr));this.composer.setPixelRatio(Math.min(devicePixelRatio,p.dpr));this.renderer.shadowMap.enabled=p.shadows;this.resize();}
  setMode(mode){if(this.mode!==mode)this.cancelDrag();this.mode=mode;if(mode==='fixed')this.highlight(null);this.controls.enableDamping=mode==='orbit';this.controls.enabled=mode==='orbit';this.host.style.cursor=mode==='move'?'grab':'default';}
  resetCamera(){this.camera.position.set(0,9,20);this.camera.zoom=1;this.camera.updateProjectionMatrix();this.controls.target.set(0,-.7,0);this.controls.update();}
  update(config){this.config=config;const theme=sceneTheme(config);this.scene.background=new T.Color(theme.background);this.scene.fog=new T.FogExp2(theme.background,.025);this.base.material.color.set(theme.ground);this.ring.material.color.set(theme.accent);this.key.color.set(config.lighting.color);this.key.intensity=config.lighting.intensity;this.fill.color.set(theme.fill);this.fill.intensity=config.lighting.singleSource?0:config.lighting.intensity*.85;this.ambient.intensity=config.lighting.ambient;this.scene.environmentIntensity=config.lighting.ambient;this.key.position.fromArray(config.lighting.position);this.bloom.strength=config.lighting.bloom;this.renderer.toneMappingExposure=config.lighting.exposure;
    const wanted=new Set(config.elements.map(e=>e.id));
    for(const [id,g] of this.items){if(!wanted.has(id)){this.scene.remove(g);this.disposeObject(g);this.items.delete(id);}}
    for(const e of config.elements){const signature=JSON.stringify([theme,e,e.kind==='clock'?config.dashboard.clockMaterial:null]);let g=this.items.get(e.id);if(g?.userData.signature===signature)continue;if(g){this.scene.remove(g);this.disposeObject(g);}g=makeAsset(e,theme,config.dashboard.clockMaterial);g.position.fromArray(e.position);g.scale.setScalar(e.scale);g.rotation.y=e.rotation;g.userData.id=e.id;g.userData.signature=signature;this.items.set(e.id,g);this.scene.add(g);}for(const g of this.items.values())g.traverse(o=>{if(o.isLight)o.visible=!config.lighting.singleSource;});this.highlight(this.selected);
  }
  highlight(id){if(this.mode==='fixed')id=null;this.selected=id;if(this.box){this.scene.remove(this.box);this.box.geometry.dispose();this.box.material.dispose();this.box=null;}const g=this.items.get(id);if(g){this.box=new T.BoxHelper(g,'#d9e7a1');this.box.material.transparent=true;this.box.material.opacity=.55;this.scene.add(this.box);}}
  cast(e){const r=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);}
  pointerDown(e){if(e.button!==0||this.mode==='fixed'||this.drag)return;if(this.mode==='move'){e.preventDefault();e.stopPropagation();}this.start={x:e.clientX,y:e.clientY};this.cast(e);const hits=this.ray.intersectObjects([...this.items.values()],true);let object=hits[0]?.object;while(object&&!object.userData.id)object=object.parent;this.downId=object?.userData.id;
    if(this.mode==='move'&&object){this.onSelect(object.userData.id);this.controls.enabled=false;this.plane.constant=-object.position.y;if(!this.ray.ray.intersectPlane(this.plane,this.hit))return;this.drag={pointer:e.pointerId,object,offset:object.position.clone().sub(this.hit),original:object.position.clone()};this.host.setPointerCapture(e.pointerId);}
  }
  pointerMove(e){if(!this.drag||e.pointerId!==this.drag.pointer)return;this.cast(e);if(this.ray.ray.intersectPlane(this.plane,this.hit)){const p=this.hit.clone().add(this.drag.offset);p.x=T.MathUtils.clamp(p.x,-8,8);p.z=T.MathUtils.clamp(p.z,-8,8);this.drag.object.position.copy(p);this.box?.update();}}
  pointerUp(e){if(this.drag){if(e.pointerId!==this.drag.pointer)return;const {object}=this.drag;this.drag=null;this.start=null;this.controls.enabled=this.mode==='orbit';if(this.host.hasPointerCapture(e.pointerId))this.host.releasePointerCapture(e.pointerId);this.onMove(object.userData.id,object.position.toArray());}else if(this.start&&Math.hypot(e.clientX-this.start.x,e.clientY-this.start.y)<5)this.onSelect(this.downId||null);this.start=null;}
  cancelDrag(){if(this.drag){const {object,original,pointer}=this.drag;object.position.copy(original);this.drag=null;this.controls.enabled=this.mode==='orbit';if(this.host.hasPointerCapture(pointer))this.host.releasePointerCapture(pointer);this.box?.update();}this.start=null;}
  presence(event){if(event)this.key.position.set(event.position[0],event.position[1]+4,event.position[2]);else if(this.config)this.key.position.fromArray(this.config.lighting.position);}
  frame(t){if(t-this.last<(this.profile==='desktop'?1000/60:1000/30))return;const dt=Math.min((t-this.last)/1000,.05);this.last=t;if(document.hidden)return;if(!this.paused)this.elapsed+=dt;if(this.mode==='orbit')this.controls.update();for(const g of this.items.values()){if(g.userData.clock)updateClock(g,new Date());animateAsset(g,this.elapsed,this.config?.water,this.key);}this.particles.rotation.y=this.elapsed*.016;this.box?.update();if(PROFILES[this.profile].bloom)this.composer.render();else this.renderer.render(this.scene,this.camera);this.frames++;if(t-this.lastStat>1000){this.onStats(Math.round(this.frames*1000/(t-this.lastStat)));this.frames=0;this.lastStat=t;}}
  disposeObject(g){g.traverse(o=>{if(o.userData.flowWater||o.isInstancedMesh)o.dispose();o.geometry?.dispose();if(o.material){for(const m of [o.material].flat()){m.map?.dispose();m.dispose();}}});}
  dispose(){this.renderer.setAnimationLoop(null);this.abort.abort();this.observer.disconnect();this.controls.dispose();this.scene.traverse(o=>{if(o.userData.flowWater||o.isInstancedMesh)o.dispose();o.geometry?.dispose();if(o.material)for(const m of [o.material].flat()){m.map?.dispose();m.dispose();}});this.env.dispose();this.composer.passes.forEach(p=>p.dispose?.());this.composer.dispose();this.renderer.dispose();this.renderer.domElement.remove();}
}

