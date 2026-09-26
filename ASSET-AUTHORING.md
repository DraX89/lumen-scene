# Asset collections and customization

The catalog contains 36 asset types in seven folders under `dist/assets/`: crystals, trees, foliage, ocean, planets, structures, and essentials. Each folder has an `index.js` builder for existing assets and a `variants.js` builder for additional types. `dist/assets.js` supplies common materials, geometry helpers, seeded sampling, animation and dispatch. The browser catalog mirrors these folders with expandable groups and a collection filter.

## Adding a type

1. Add a stable kind and display name to `ASSETS` in `model.js`, and register it in the appropriate `CATEGORY_KINDS` collection in `asset-schema.js`.
2. Implement its geometry in the category builder using the supplied context. `rnd(index)` is deterministic for the stored seed, with variation strength applied. Use unique index offsets for independent features. Avoid `Math.random()` and object IDs for persistent geometry.
3. Define meaningful colour slots in `colorSlots(kind)`. Builders receive `colors`; material helpers also map registered legacy colour literals to their named slots. Expose only slots that affect the actual asset. Add explicit primary tint UI support if the new kind uses `e.color`.
4. Give the asset suitable materials and shadow flags. Use instancing for repeated leaves or needles. Dispose owned render targets, textures and instance buffers when replaced or removed.
5. Run `node --test`. Catalog tests automatically check every registered kind for finite geometry, reproducible seeds, distinct rerolls and effective colour controls. Inspect a browser preview too: unit tests do not prove visual quality.

The included variants are aragonite sprays, fluorite cubes, oak, birch, cherry blossom, palm, meadow grass, succulent rosettes, anemones, tube sponges, cratered moons, ocean planets, and eroded arches. Defaults for forest, sea, space and desert demonstrate several of them.

## Saved configuration

Every asset has a 32-bit unsigned `seed`, a `variation` value between zero and one, and a validated `colors` map. New asset IDs produce distinct initial seeds; duplication preserves a shape until **New variation** is pressed. Trees vary branch lengths, angles, leaf placement and shades. Other assets vary their procedural dimensions, placement, surface detail or material profile. Clock variation changes its bevel/depth without disrupting digits; water variation changes its procedural normal pattern. Seeds reproduce geometry within this generator version; future generator changes can alter the same seed's appearance.

`dashboard.opacity` is 0–1 and affects panel backgrounds and blur, not the text, controls, media or camera imagery. `dashboard.gap` is 0–32 CSS pixels. Actual grid measurements drive dragging and resizing, so changing gaps does not change the placement contract. High gaps on narrow devices reduce available card width.

## Custom scenes

**Custom scene** creates an empty stage with a clock, copies the current scene, or starts from a biome. A custom scene has a name and an editable palette for background, ground, water, accent, crystal tint and fill light. The water and crystal palette controls also recolour those assets in the active scene.

Up to eight named scenes live in each device profile's `library`. The active custom draft is updated after edits. Switching scenes retains the current dashboard layout and appearance. Removal is undoable through scene history. **Save space** persists the profile and library through the existing hub adapter; the demo currently uses browser-local storage, not cross-device synchronization. Export JSON includes the library, colour slots and seeds. Existing server configurations receive additive defaults under schema version 1; executable fields and unknown colour slots are not retained.

Selection helpers are restricted to asset editing. Leaving that mode removes and disposes the helper; subsequent scene updates cannot recreate it while the renderer is fixed.
