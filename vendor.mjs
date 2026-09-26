import { mkdir, copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';
const root = 'node_modules/three';
const seen = new Set();
async function copy(relative) {
  if (seen.has(relative)) return;
  seen.add(relative);
  const target = path.join('dist/vendor', relative);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(root, relative), target);
  if (!relative.endsWith('.js')) return;
  const source = await readFile(path.join(root, relative), 'utf8');
  for (const match of source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)) {
    if (match[1].startsWith('.')) await copy(path.posix.normalize(path.posix.join(path.posix.dirname(relative), match[1])));
  }
}
await copy('build/three.module.js');
for (const file of ['objects/Water2.js','controls/OrbitControls.js','environments/RoomEnvironment.js','postprocessing/EffectComposer.js','postprocessing/RenderPass.js','postprocessing/UnrealBloomPass.js','postprocessing/OutputPass.js']) await copy('examples/jsm/'+file);
await copy('LICENSE');
console.log(`Vendored ${seen.size} Three.js files.`);
