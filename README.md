# Lumen · Living dashboard

A runnable Three.js frontend for a centrally configured home dashboard. Each ecosystem uses a fixed square composition: a material-based 3D clock at the top, scenery behind it, and a resizable dashboard grid in front.

## Quick start

```sh
git clone https://github.com/DraX89/lumen-scene.git
cd lumen-scene
npm ci
npm run dev
```

Open **http://127.0.0.1:5173/**. Run `npm test` for the automated suite.

## Highlights

- Six biome presets, custom scene drafts and 36 procedural assets in seven categories.
- Seeded natural variations and separate material colours for leaves, trunks, blossoms and more.
- A 3D clock, adjustable lighting, optical crystals and animated reflective water.
- Scrollable, resizable dashboard widgets with adjustable opacity and spacing.
- Device profiles, undo/redo, JSON export and mock server persistence.

**Status:** working frontend prototype. Home telemetry, cameras, weather and music currently use demo fixtures. The HTTP adapter contracts below are the starting point for the central server.

## Run without installation

```sh
node server.mjs
# Open http://127.0.0.1:5173
node --test tests/*.test.mjs
node --test --experimental-test-coverage tests/*.test.mjs
```

Requires Node.js 22+ for the server and tests; the browser needs WebGL2 and import maps. The pinned Three.js 0.180.0 runtime is included in `dist/vendor/`, so no installation or build is needed to run the app. `npm ci` restores the dependency needed for geometry tests; `npm run vendor` refreshes the selected browser modules. Serve `dist/` on any static host.

## Ecosystems and assets

Six presets now change their actual scenery, not just the palette:

- Amethyst lagoon: crystal crowns, quartz needles, geodes, bismuth terraces and obelisks.
- Bioluminescent forest: layered pines, luminous mushroom colonies, ferns, moss islands and moon blossoms.
- Abyssal garden: branching coral, kelp, floating jellyfish with tentacles, pearl shells and bubble columns.
- Orbital sanctuary: ringed planets, drifting meteors, orbital gates and solar satellites.
- Amber dunes: warm mineral and rock arrangements.
- Glacial blue: ice-like quartz, crystal and obelisk arrangements.

The library contains 36 procedural assets, with actual geometry rendered into catalog thumbnails on first customization. Its temporary thumbnail renderer releases its GPU context after completion. The persistent world uses a single renderer. The live clock uses beveled extruded seven-segment meshes, with optical glass, polished chrome, porcelain ceramic and warm amber materials. Time updates toggle existing geometry; they do not regenerate it.

Choose **Customize**, then **Assets** to browse, add, select, move, scale, rotate, duplicate or remove scenery. Optical material controls apply to crystal types. Switching biomes replaces scenery while retaining the dashboard layout and clock material; Undo restores the previous configuration.

## Dashboard

The default widgets are home overview, weather, central hub, garden camera, music, and energy/climate. Air quality and network widgets are also available. Every tile opens a detail view when not editing.

- In Customize mode, drag a widget header to move it; drag the bottom-right corner to resize.
- Keyboard: focus a header, use arrow keys to move by a tile width/height; Shift + arrows resize by one grid unit.
- The six-column, 24-row scrollable grid enforces bounds, minimum 2×2 sizes, and non-overlap. Displaced tiles are repacked when possible; an impossible change is rejected without damaging the existing layout.
- Shrink or remove a tile to make space for another. For example, shrink energy from six to four columns and add air quality in the freed two columns.
- Configuration, including tiles and clock material, participates in undo/redo and profile-specific save/pull/export.
- Focus view hides the surrounding editor. Smaller screens preserve the square and move settings below it. Tile details provide larger text when the square is small.

## Server boundary

The app deliberately uses `MockHub` for configuration and `MockServices` for live data/commands. No real home devices, cameras, weather providers or Spotify accounts are connected. Demo camera imagery is a generated animated test scene, explicitly labeled simulated. Music buttons update demo playback state; they do not play audio.

The real adapters are already separated:

| Module | Responsibility |
| --- | --- |
| `model.js` | Scene schema, biome presets, asset definitions, history |
| `assets.js` | Procedural geometry, materials, clock and ambient animation |
| `water.js` | Flow shader, reflections/refractions, animation and GPU resource ownership |
| `surfaces.js` | Closed faceted crystals, weathered stones, curved leaves and planetary texture |
| `scene.js` | Shared lighting, fixed framing, selection, dragging and renderer lifecycle |
| `dashboard-model.js` | Widget definitions, validated layout and collision handling |
| `dashboard-view.js` | Interactive grid, widgets, camera preview and command controls |
| `adapters.js` | Mock/HTTP configuration hubs and normalized presence input |
| `services.js` | Mock/HTTP telemetry and acknowledged command contract |
| `thumbnails.js` | Temporary renderer for asset catalog previews |
| `app.js` | UI orchestration, profile switching, polling and settings |

To connect the central server, replace the `MockHub` and `MockServices` construction in `app.js` with `HttpHub({baseUrl:'/api'})` and `HttpServices({baseUrl:'/api'})`, and import those classes. Keep endpoints same-origin or explicitly configure authenticated CORS on the hub.

### Configuration

```http
GET /api/profiles/desktop/scene
200 {"revision": 12, "scene": { ...complete scene JSON... }}

PUT /api/profiles/desktop/scene
If-Match: "12"
Content-Type: application/json
{"scene": { ...complete scene JSON... }}

200 {"revision": 13, "scene": { ...complete scene JSON... }}
412 on a stale revision
```

Use **Export JSON** for a complete valid scene. Scenes retain schema version 1 with additive `dashboard`, `water` and lighting controls. Old scenes gain validated defaults without altering existing placements or widget layouts. Old asset placements are preserved; choose a biome to replace them with the new composition. Unknown executable fields are stripped. The server must scope profiles to authenticated users/devices and atomically enforce revisions. Mock localStorage is browser-local and is not an atomic multi-tab database or cross-device sync service.

### Telemetry and commands

```http
GET /api/dashboard/state
200 {
  "timestamp": 1790373600000,
  "sequence": 42,
  "sources": {"home":"online", "weather":"online", ...},
  "home": {...}, "weather": {...}, "system": {...},
  "camera": {...}, "media": {...}, "energy": {...},
  "air": {...}, "network": {...}
}

POST /api/commands
Idempotency-Key: <unique command ID>
Content-Type: application/json
{"id":"<same ID>", "action":"media.play"}

200 <acknowledged telemetry snapshot>
```

`MockServices.snapshot()` is the complete fixture and `validateSnapshot()` is the executable contract. Source statuses are `online`, `offline`, or `unavailable`. Sequence numbers must monotonically increase within a client session. The frontend polls every five seconds while visible; records older than 15 seconds are marked stale, and commands are disabled when disconnected or stale. Old telemetry remains visible on connection loss rather than being replaced with fabricated zeros.

Allowed commands: `media.play`, `media.pause`, `media.next`, `media.previous`, `media.volume` with a 0–100 value, and `home.lights` with a boolean value. UI changes follow acknowledgements. The HTTP client sends commands once and does not retry potentially non-idempotent actions. The mock deduplicates the last 256 command IDs; the real server should maintain a durable idempotency window. Credentials, provider tokens, device routing and permission checks belong on the hub. For authenticated mutations, enforce CSRF protection server-side.

Real camera previews can use `{mode:'mjpeg',name:'Garden',url:'/api/cameras/garden/stream'}`. The frontend only accepts this same-origin proxy path pattern. Camera credentials and raw device addresses stay on the hub. WebRTC/HLS transport and Spotify OAuth/playback are follow-up integrations, not implemented services.

### Presence

The existing `PresenceAdapter` accepts `{source:'bluetooth'|'camera'|'simulation',timestamp,confidence,position:[x,y,z]}` from a calibrated gateway. It rejects low-confidence, stale, out-of-order and invalid events and expires observations after five seconds. The demo moves a scene light using a virtual visitor. No hardware scanning or sensor permissions are requested.

## Validation

300 automated tests cover:

- Every procedural asset's finite geometry and bounds, physical clock finishes and digit updates.
- Scene validation, old configuration defaults, history, profile isolation and persisted layouts.
- Grid collisions, reflow, resize constraints, atomic failure and 500 deterministic layout operations.
- Mock and HTTP telemetry, commands, acknowledgements, replay protection, offline behavior, aborts, errors and camera URL validation.
- Revision conflicts, persistence errors and presence expiry.

The current suite includes renderer interaction tests with mocked pointer capture and orbit controls, plus water-resource lifetime and server configuration roundtrips. It does not prove visual correctness or hardware performance. Browser smoke checks cover composition, media play/next, light commands, keyboard resize, pointer reordering, insertion, biome switching, catalog previews, compact phone layout, detail dialogs and console errors. Physical tablet/TV performance remains unverified.

## Rendering limits

Lighting uses PBR transmission/reflection, environment lighting, point lights and bloom. It is stylized raster rendering, not multiple-scattering simulation or path-traced caustics. Water uses animated normal flow, vertex waves, planar reflection/refraction passes, a moving-light specular highlight and a subtle shoreline effect. It is a visual surface simulation, not a fluid solver; it does not fill containers, route around obstacles, or produce physically traced caustics. The perspective camera is required by the planar reflection helpers. Additional water surfaces omit one another during captures to avoid recursive rendering. The asset ceiling is 40. Desktop render rate is capped near 60 FPS, tablet/TV near 30 FPS, with lower pixel ratio/effects on constrained profiles. Hidden tabs suspend scene rendering. Reduced motion is respected. User-replaceable glTF assets, LOD streaming, PWA installation, actual push synchronization, authentication and hardware gateways remain future work.


## September visual and interaction update

Move stays selected through repeated drags. Pointer cancellation restores the original position; extra pointers cannot hijack a drag. The dashboard scrolls independently over the fixed scene with a 6-column, 24-row layout and up to 16 widgets. Existing layouts remain valid. Widget header drags and corner resizing remain available while editing; scroll position survives configuration updates.

Light settings include a single-source mode, XYZ position and environment fill. Single-source mode disables the fill lamp and light-wisp lamps; emissive decorative surfaces still appear luminous. Set environment fill to zero to isolate the key light. Presence moves that key rather than introducing another light. Water speed, wave height and direction are serialized in the central configuration contract, with mock roundtrip tests.

The asset refresh includes continuous tapered crystal facets, a correctly oriented open geode, instanced pine foliage, curved fern and kelp leaves, irregular stones, improved coral branching, banded planets and lighter optical clock glass. See RENDERING.md for the engine assessment and physical limits.


## Scene customization

Leaving scene editing removes the selection outline. The Widgets tab offers panel opacity (0–100%) and spacing (0–32 px), keeping text readable while revealing the ecosystem underneath.

The 36 assets are organized into seven expandable categories. Saved seeds and variation controls create repeatable natural differences; named colour controls edit parts such as leaves, bark, petals and planet surfaces. Custom scenes can start empty, from the current scene or from a biome, with up to eight saved drafts and individual environment palettes. Use Save space to persist the profile through the mock hub.

See [ASSET-AUTHORING.md](ASSET-AUTHORING.md) for category folders, procedural asset extensions and configuration contracts. Tests cover deterministic geometry, every exposed material colour, custom scene persistence, legacy defaults and selection cleanup.
## Project structure

- `dist/`: editable browser source and bundled Three.js modules; this is not generated build output.
- `dist/assets/`: crystals, trees, foliage, ocean, planets, structures and essentials.
- `tests/`: geometry, interaction, persistence and service contract tests.
- `server.mjs`: local static development server.
- `vendor.mjs`: refreshes the pinned browser dependencies after `npm ci`.
- [Asset authoring guide](ASSET-AUTHORING.md): extend the asset library and schema.
- [Rendering notes](RENDERING.md): engine choice, water and lighting tradeoffs.

## Next development steps

Connect the central configuration and telemetry server, add authenticated camera/media proxies, and integrate calibrated presence events. Then profile real tablet/TV hardware and consider glTF assets and LOD streaming for larger scenes. The current automated tests mock these service boundaries so frontend work can continue independently.

Three.js and its bundled modules retain their upstream license in `dist/vendor/LICENSE`.
