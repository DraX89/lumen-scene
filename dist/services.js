const sources=['home','weather','system','camera','media','energy','air','network'];
const numeric=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
export function validateSnapshot(data){
  const d=structuredClone(data);if(!d||!Number.isFinite(d.timestamp)||!Number.isSafeInteger(d.sequence)||d.sequence<0||!d.sources)throw new Error('Invalid telemetry envelope');
  for(const source of sources)if(!['online','offline','unavailable'].includes(d.sources[source]))throw new Error('Invalid source status');
  if(!d.home||!numeric(d.home.temperature,-50,70)||!numeric(d.home.lights,0,100)||typeof d.home.lightsOn!=='boolean'||!numeric(d.home.devices,0,500)||typeof d.home.mode!=='string')throw new Error('Invalid home telemetry');
  if(!d.weather||!numeric(d.weather.temperature,-80,65)||!numeric(d.weather.high,-80,65)||!numeric(d.weather.low,-80,65)||typeof d.weather.condition!=='string'||typeof d.weather.location!=='string')throw new Error('Invalid weather telemetry');
  if(!d.system||!numeric(d.system.cpu,0,100)||!numeric(d.system.memory,0,100)||!numeric(d.system.uptime,0,1e9))throw new Error('Invalid system telemetry');
  if(!d.media||typeof d.media.playing!=='boolean'||!numeric(d.media.volume,0,100)||typeof d.media.title!=='string'||typeof d.media.artist!=='string')throw new Error('Invalid media telemetry');
  if(!d.energy||!numeric(d.energy.watts,0,100000)||!numeric(d.energy.today,0,10000)||!Array.isArray(d.energy.history)||d.energy.history.length<2||d.energy.history.length>48||!d.energy.history.every(n=>numeric(n,0,100000)))throw new Error('Invalid energy telemetry');
  if(!d.air||!numeric(d.air.co2,0,10000)||!numeric(d.air.humidity,0,100)||!d.network||!numeric(d.network.latency,0,10000)||!numeric(d.network.clients,0,500))throw new Error('Invalid sensor telemetry');
  if(!d.camera||typeof d.camera.name!=='string'||!['simulation','mjpeg','unavailable'].includes(d.camera.mode))throw new Error('Invalid camera telemetry');
  if(d.camera.mode==='mjpeg'&&(typeof d.camera.url!=='string'||!/^\/api\/cameras\/[a-zA-Z0-9_-]+\/stream$/.test(d.camera.url)))throw new Error('Camera streams must use the central hub proxy');
  return d;
}
export function validateCommand(command){
  const allowed={'media.play':true,'media.pause':true,'media.next':true,'media.previous':true,'media.volume':true,'home.lights':true};
  if(!command||!Object.hasOwn(allowed,command.action)||typeof command.id!=='string'||!command.id||command.id.length>100)throw new Error('Unsupported command');
  if(command.action==='media.volume'&&!numeric(command.value,0,100))throw new Error('Invalid volume');
  if(command.action==='home.lights'&&typeof command.value!=='boolean')throw new Error('Invalid lights command');
  return {id:command.id,action:command.action,...(['media.volume','home.lights'].includes(command.action)?{value:command.value}:{})};
}
export class MockServices {
  constructor({now=()=>Date.now(),latency=120}={}){this.now=now;this.latency=latency;this.offline=false;this.playing=false;this.volume=42;this.track=0;this.lightsOn=true;this.sequence=0;this.commands=new Set();this.sourceOverrides={};}
  async wait(signal){if(signal?.aborted)throw new DOMException('Aborted','AbortError');await new Promise(r=>setTimeout(r,this.latency));if(signal?.aborted)throw new DOMException('Aborted','AbortError');if(this.offline)throw new Error('Hub unavailable. The command was not sent.');}
  snapshot(){const t=this.now()/10000;const tracks=[['Weightless','Marconi Union'],['A Walk','Tycho'],['First Breath After Coma','Explosions in the Sky']];return validateSnapshot({timestamp:this.now(),sequence:++this.sequence,sources:{...Object.fromEntries(sources.map(k=>[k,'online'])),...this.sourceOverrides},home:{temperature:21.4,lights:6,lightsOn:this.lightsOn,devices:24,mode:'Home'},weather:{temperature:18,high:20,low:14,condition:'Partly cloudy',location:'Home · demo weather'},system:{cpu:Math.round(21+Math.sin(t)*7),memory:46,uptime:1267200},media:{playing:this.playing,volume:this.volume,title:tracks[this.track][0],artist:tracks[this.track][1]},energy:{watts:Math.round(420+Math.sin(t)*65),today:5.8,history:Array.from({length:24},(_,i)=>Math.round(350+Math.sin(i*.65+t*.1)*110+Math.cos(i)*30))},air:{co2:612,humidity:48},network:{latency:8,clients:24},camera:{name:'Garden terrace',mode:'simulation'}});}
  async read({signal}={}){await this.wait(signal);return this.snapshot();}
  async command(input,{signal}={}){const command=validateCommand(input);await this.wait(signal);const source=command.action.startsWith('media.')?'media':'home';if(this.sourceOverrides[source]&&this.sourceOverrides[source]!=='online')throw new Error('Device unavailable');if(this.commands.has(command.id))return this.snapshot();this.commands.add(command.id);if(this.commands.size>256)this.commands.delete(this.commands.values().next().value);
    switch(command.action){case 'media.play':this.playing=true;break;case 'media.pause':this.playing=false;break;case 'media.next':this.track=(this.track+1)%3;break;case 'media.previous':this.track=(this.track+2)%3;break;case 'media.volume':this.volume=command.value;break;case 'home.lights':this.lightsOn=command.value;break;}return this.snapshot();}
}
export class HttpServices {
  constructor({baseUrl='/api',fetchImpl=fetch,timeoutMs=8000}={}){this.baseUrl=baseUrl.replace(/\/$/,'');this.fetch=fetchImpl;this.timeoutMs=timeoutMs;}
  async request(path,options={},signal){const timeout=AbortSignal.timeout(this.timeoutMs);const response=await this.fetch(this.baseUrl+path,{...options,credentials:'include',signal:signal?AbortSignal.any([signal,timeout]):timeout});if(!response.ok)throw new Error(`Service request failed (${response.status})`);return validateSnapshot(await response.json());}
  read({signal}={}){return this.request('/dashboard/state',{},signal);}
  command(command,{signal}={}){const clean=validateCommand(command);return this.request('/commands',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':clean.id},body:JSON.stringify(clean)},signal);}
}
export function freshness(snapshot,now=Date.now()){return !snapshot||now-snapshot.timestamp>15000?'stale':'fresh';}
