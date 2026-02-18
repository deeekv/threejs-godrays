# Three.js God Rays Shader

A focused, post-processing God Rays (light shafts) effect for Three.js, implemented with a custom GLSL fragment shader. It generates cinematic rays from an alpha-masked source (logo, emissive objects, etc.), supports interactive light positioning (mouse/touch or world-space projection), and includes controls for grain, dithering, and performance trade-offs.

This README gives context, quick getting-started steps, usage examples, and developer notes to help integrate or modify the shader.

## Table of contents
- Features
- When to use
- Quick start
- Minimal integration example
- Configurable parameters
- Performance tips
- Files of interest
- Contributing

## Features
- Radial sampling toward a virtual light origin to create rays
- Alpha-masked source so rays emit only from visible/emissive pixels
- Interactive light origin (pointer or computed screen-space position)
- Directional guard to avoid mirrored/ghost rays
- Procedural film grain and blue-noise dithering to reduce banding
- Configurable sample count and falloff for quality/performance balance

## When to use
Use this pass when you want stylized volumetric shafts coming from a distinct bright/emissive source in your scene (logos, sun caps, bright objects). It is designed as a post-processing pass and works best when the emitter can be isolated via a mask or emissive render target.

## Quick start

1. Clone the repo
```bash
git clone https://github.com/deeekv/threejs-godrays.git
cd threejs-godrays
```

2. Install
```bash
npm install
# or
yarn
```

3. Run demo locally
```bash
npm run start
```

4. Build for production
```bash
npm run build
```

## Minimal integration example
This example is conceptual — adapt to your renderer/composer setup.

```js
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import GodRaysPass from './src/ThreeGodRaysPass.js'; // adjust path

// Assume scene, camera, renderer are already created
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// maskRenderTarget should contain an alpha/emissive mask of the emitter
const godrays = new GodRaysPass({
    map: maskRenderTarget.texture,               // source mask or scene texture
    lightPos: new THREE.Vector2(0.5, 0.45),      // normalized screen coords (0..1)
    samples: 60,                                 // radial samples
    decay: 0.95,
    density: 0.8,
    weight: 0.8,
    clampThreshold: 0.01,
    grain: 0.06
});

composer.addPass(godrays);

// in your render loop:
composer.render();
```

If you want interactive light placement, compute screen-space coords from mouse or world position and update godrays.uniforms.lightPos.

## Configurable parameters
- samples: number of radial samples used (higher = smoother rays, slower)
- decay: intensity falloff along the ray
- density: sample spacing multiplier
- weight: per-sample contribution multiplier
- clampThreshold: minimum alpha to start emitting rays
- focalShift: screen-space offset for parallax effect based on pointer
- grainIntensity / dithering: controls film grain / blue-noise strength
- map / srcTexture: source texture (mask or scene render)

Default values are tuned for demo balance; reduce samples and use downsampled render targets for performance.

## Performance tips
- Render the god rays pass at reduced resolution (e.g., half or quarter) and composite
- Lower samples and use blur to soften the result rather than massively increasing loop count
- Use a tight mask so rays are generated only where needed
- Profile loop count and branch usage if altering the shader logic

## Files of interest
- src/shaders/godrays.frag.glsl — fragment shader (radial sampling, guard, grain)
- src/shaders/godrays.vert.glsl — simple passthrough vertex shader
- src/ThreeGodRaysPass.js — Three.js postprocessing pass wrapper
- examples/ — demo pages and assets (logo, textures)

## Development notes
- Keep math-heavy shader changes documented with comments and references.
- When changing sampling strategy, include simple performance comparisons (frame time or FPS).
- Blue-noise/dither tables live alongside the shader; update carefully to avoid banding regressions.

## Contributing
Fork, create a feature branch, and open a PR. Keep changes focused; include small demos and performance notes for shader changes.