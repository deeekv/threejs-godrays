# Three.js God Rays Shader

A cinematic, interactive light ray effect (God Rays) built with Three.js and custom GLSL shaders. This project features a central logo that casts dynamic rays which track the user's cursor movement.

## ✨ Features
* **Interactive Tracking:** Rays project away from the light source and follow the mouse cursor.
* **Directional Guard:** Custom shader logic prevents "ghosting" or mirrored rays on the opposite side of the focal point.
* **Cinematic Grain:** Integrated film grain and dithering for a textured, atmospheric look.
* **Performance Optimized:** Uses a radial blur sampling technique with a limited loop count to maintain high FPS.

## 🛠️ Technical Details
The effect is achieved using a **Post-Processing style Fragment Shader** that samples the logo texture along a vector starting from the current pixel toward a virtual light origin.

### Key Math:
* **Focal Shift:** The light origin is shifted based on mouse position to create the illusion of depth.
* **Radial Blur:** Samples are taken in a loop: `uv - dir * t`.
* **Clamping:** Strict UV boundary checks ensure rays only originate from the logo alpha channel.

## 🚀 Getting Started
1. Clone the repo:
   ```bash
   git clone [https://github.com/deeekv/threejs-godrays.git](https://github.com/deeekv/threejs-godrays.git)