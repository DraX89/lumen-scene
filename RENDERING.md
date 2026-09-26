# Rendering decision

Keep Three.js for this dashboard. Its physical materials support transmission, absorption, clearcoat and iridescence, and its water helpers provide planar reflections/refractions with flowing normals. These capabilities fit a small ecosystem behind an HTML dashboard. Replacing the engine would also require rebuilding the current selection, asset, material and lifecycle integration.

Babylon.js is a credible alternative with a broader integrated engine, PBR, tooling and fluid rendering. Consider it if the product grows into a physics-heavy scene editor. That is a product-direction decision, not an automatic improvement in realism. Neither engine makes a low-detail asset photorealistic by itself.

This revision preserves Three.js 0.180.0. It adds a perspective camera for the water capture helpers, single-source lighting controls, explicit GPU cleanup for water render targets, and deterministic procedural surfaces. Pine needle sprays use GPU instancing. The water borrows Three.js's MIT-licensed Water2 shader; its source license is in dist/vendor/LICENSE. Normal maps and planet texture are generated locally, without remote asset requests.

## What the water does

- Two blended normal-map phases produce continuous visual flow, with configurable speed and direction.
- Vertex waves change the silhouette; normals distort live planar reflections and refractions.
- A specular highlight follows the key light's position, color and intensity.
- Animation uses the same pause/reduced-motion clock as the scene. Wave and lighting settings survive server-adapter roundtrips.
- Reflection/refraction targets and normal textures are disposed on removal, replacement and teardown. Multiple water surfaces are excluded from one another's captures to prevent recursion.

The water is not a fluid solver. It does not conserve fluid volume, fill containers, collide with rocks or follow terrain. The highlight and shoreline effect are approximations, and the custom water highlight does not sample the key-light shadow map. Crystal transmission does not cast physically correct colored caustics or simulate multiple light scattering. Reflections are planar approximations of a waving surface.

## Next quality investment

For a further jump toward photorealism, retain the renderer and add a curated glTF asset pipeline with high-quality normal/roughness textures, HDR lighting, LODs, mesh compression and texture compression. True obstacle-aware water would need a separate shallow-water or particle solver and a measured device budget. For an always-on dashboard, favor art-directed surface flow over an expensive general fluid solver unless interaction explicitly needs physical behavior.

Desktop, tablet and TV presets constrain resolution and effects. Browser smoke tests are not physical-device benchmarks. Extra transmissive assets and extra water surfaces still add rendering cost; the 40-element ceiling is a validation limit, not a performance guarantee.

## Primary references

- [Three.js physical materials](https://threejs.org/docs/pages/MeshPhysicalMaterial.html)
- [Water2 source, pinned to r180](https://github.com/mrdoob/three.js/blob/r180/examples/jsm/objects/Water2.js)
- [Babylon.js specifications](https://www.babylonjs.com/specifications/)

Assessment checked September 25, 2026. The current Three.js docs can include features newer than the pinned runtime; this project uses only the installed version's APIs.
