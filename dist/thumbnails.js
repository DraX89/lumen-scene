import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {makeAsset} from './assets.js';
import {element,THEMES,KINDS} from './model.js';

// A temporary offscreen context renders actual catalog geometry once, then releases all GPU resources.
export async function buildThumbnails(onImage,signal){
  let renderer,pmrem,environment,room;
  try{
    renderer=new T.WebGLRenderer({antialias:true});renderer.setSize(180,140);renderer.setPixelRatio(1);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    pmrem=new T.PMREMGenerator(renderer);room=new RoomEnvironment();environment=pmrem.fromScene(room,.04);
    const scene=new T.Scene();scene.background=new T.Color('#17202e');scene.environment=environment.texture;scene.environmentIntensity=1;
    scene.add(new T.HemisphereLight('#dae5ff','#252c3a',2));const light=new T.DirectionalLight('#edf7ff',3);light.position.set(3,5,4);scene.add(light);
    const camera=new T.PerspectiveCamera(36,180/140,.01,100);
    for(const kind of KINDS){
      if(signal?.aborted)break;
      const g=makeAsset(element(kind),THEMES.amethyst);scene.add(g);const bounds=new T.Box3().setFromObject(g);const sphere=bounds.getBoundingSphere(new T.Sphere());const distance=sphere.radius/Math.sin(T.MathUtils.degToRad(18))*1.06;
      camera.position.copy(sphere.center).add(new T.Vector3(.5,.4,1).normalize().multiplyScalar(distance));camera.lookAt(sphere.center);renderer.render(scene,camera);onImage(kind,renderer.domElement.toDataURL('image/webp',.82));scene.remove(g);
      g.traverse(o=>{if(o.userData.flowWater||o.isInstancedMesh)o.dispose();o.geometry?.dispose();if(o.material)for(const m of [o.material].flat()){m.map?.dispose();m.dispose();}});
      await new Promise(resolve=>setTimeout(resolve,0));
    }
  }catch(error){console.warn('Catalog previews unavailable; text controls remain available.',error.message);}
  finally{environment?.dispose();room?.dispose();pmrem?.dispose();renderer?.dispose();renderer?.forceContextLoss();}
}

