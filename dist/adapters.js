import {clone, initialScene, validateScene, PROFILES} from './model.js';
export class ConflictError extends Error { constructor(){super('A newer revision exists. Pull it before saving.');this.name='ConflictError';} }
const validateProfile=profile=>{if(!Object.hasOwn(PROFILES,profile))throw new Error('Unknown device profile');};
export class MockHub {
  constructor({storage=null,latency=250}={}){this.storage=storage;this.latency=latency;this.records=new Map();this.offline=false;}
  async wait(signal){if(signal?.aborted)throw new DOMException('Aborted','AbortError');await new Promise(r=>setTimeout(r,this.latency));if(signal?.aborted)throw new DOMException('Aborted','AbortError');if(this.offline)throw new Error('Demo hub is offline. Your edits are still here.');}
  read(profile){validateProfile(profile);const raw=this.storage?.getItem('lumen-demo:'+profile);const record=raw?JSON.parse(raw):this.records.get(profile);return record?validateRecord(record):{revision:0,scene:initialScene()};}
  async pull(profile,{signal}={}){await this.wait(signal);return clone(this.read(profile));}
  async save(profile,scene,revision,{signal}={}){const clean=validateScene(scene);await this.wait(signal);const current=this.read(profile);if(current.revision!==revision)throw new ConflictError();const record={revision:revision+1,scene:clean};this.storage?.setItem('lumen-demo:'+profile,JSON.stringify(record));this.records.set(profile,record);return clone(record);}
}
export function validateRecord(value){if(!value||!Number.isSafeInteger(value.revision)||value.revision<0)throw new Error('Invalid hub revision');return {revision:value.revision,scene:validateScene(value.scene)};}
export class HttpHub {
  constructor({baseUrl,fetchImpl=fetch,timeoutMs=8000}){this.baseUrl=baseUrl.replace(/\/$/,'');this.fetch=fetchImpl;this.timeoutMs=timeoutMs;}
  async request(profile,options={},signal){validateProfile(profile);const timeout=AbortSignal.timeout(this.timeoutMs);const response=await this.fetch(`${this.baseUrl}/profiles/${encodeURIComponent(profile)}/scene`,{...options,credentials:'include',signal:signal?AbortSignal.any([signal,timeout]):timeout});if(response.status===409||response.status===412)throw new ConflictError();if(!response.ok)throw new Error(`Hub request failed (${response.status})`);return validateRecord(await response.json());}
  pull(profile,{signal}={}){return this.request(profile,{},signal);}
  save(profile,scene,revision,{signal}={}){if(!Number.isSafeInteger(revision)||revision<0)throw new Error('Invalid revision');return this.request(profile,{method:'PUT',headers:{'Content-Type':'application/json','If-Match':`"${revision}"`},body:JSON.stringify({scene:validateScene(scene)})},signal);}
}
// Bluetooth and camera gateways publish this normalized event. Raw video stays outside the renderer.
export class PresenceAdapter {
  constructor({now=()=>Date.now(),ttl=5000}={}){this.now=now;this.ttl=ttl;this.event=null;}
  receive(event){if(!event||!['bluetooth','camera','simulation'].includes(event.source)||!Number.isFinite(event.timestamp)||Math.abs(this.now()-event.timestamp)>this.ttl||!Number.isFinite(event.confidence)||event.confidence<.6||event.confidence>1||!Array.isArray(event.position)||event.position.length!==3||!event.position.every(n=>Number.isFinite(n)&&Math.abs(n)<=10))return false;if(this.event&&event.timestamp<this.event.timestamp)return false;this.event=clone(event);return true;}
  sample(){return this.event&&this.now()-this.event.timestamp<=this.ttl?clone(this.event):null;}
  clear(){this.event=null;}
}
