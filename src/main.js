import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0a0a0a, 1); 
document.body.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();
const logoTexture = loader.load(`${import.meta.env.BASE_URL}logo.png`, (tex) => {
  material.uniforms.u_textureRatio.value = tex.image.width / tex.image.height;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearFilter;
});

const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
  uniforms: {
    u_time: { value: 0 },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_logo: { value: logoTexture },
    u_textureRatio: { value: 1.0 },
    u_targetWidth: { value: 300.0 },
    u_isMoving: { value: 0.0 }
  },
  fragmentShader: `
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    uniform sampler2D u_logo;
    uniform float u_textureRatio;
    uniform float u_targetWidth;
    uniform float u_isMoving;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    vec2 getScaledUV(vec2 uv) {
        float screenAspect = u_resolution.x / u_resolution.y;
        float scale = u_targetWidth / u_resolution.x;
        vec2 logoUV = (uv - 0.5);
        logoUV.x *= screenAspect / u_textureRatio;
        logoUV /= scale;
        return logoUV + 0.5;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 mouse = u_mouse.xy / u_resolution.xy;
      
      // Calculate ray direction based on mouse position relative to center
      vec2 mouseShift = (mouse - 0.5) * 0.8; 
      vec2 autoShift = vec2(cos(u_time * 0.5), sin(u_time * 0.3)) * 0.05;
      vec2 activeShift = mix(autoShift, mouseShift, u_isMoving);
      
      // The focal point moves opposite the mouse so rays point TOWARD the cursor
      vec2 rayOrigin = vec2(0.5) - activeShift; 

      float illumination = 0.0;
      float weight = 0.15; 
      float decay = 0.95;  
      float dither = hash(uv + u_time);

      vec2 rayDir = uv - rayOrigin;

      for(int i = 0; i < 100; i++) {
        float t = (float(i) + dither) * 0.015; 
        
        // FINAL FIX: Directional Guard
        // Prevents sampling past the origin point, which stops the "double source" effect.
        if (t > 1.0) break; 

        vec2 sampleCoord = uv - rayDir * t; 
        vec2 logoCoord = getScaledUV(sampleCoord);
        
        // Strict bounds check to keep logo rays clean
        if(logoCoord.x >= 0.0 && logoCoord.x <= 1.0 && logoCoord.y >= 0.0 && logoCoord.y <= 1.0) {
            illumination += texture2D(u_logo, logoCoord).a * weight;
        }
        
        weight *= decay;
      }

      // Add film grain to rays for texture
      float grain = hash(uv * (u_time + 1.0));
      vec3 rayColor = vec3(1.0) * illumination * (0.4 + 0.6 * grain);
      
      // Render the static logo at the center
      vec2 centerUV = getScaledUV(uv);
      float logoAlpha = 0.0;
      if(centerUV.x >= 0.0 && centerUV.x <= 1.0 && centerUV.y >= 0.0 && centerUV.y <= 1.0) {
          logoAlpha = texture2D(u_logo, centerUV).a;
      }
      
      // Blend rays and logo
      vec3 finalColor = mix(rayColor, vec3(0.9), logoAlpha * 0.95);

      // Vignette for depth
      float dist = distance(uv, vec2(0.5));
      finalColor *= smoothstep(1.0, 0.4, dist);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

let targetMoving = 0;
let currentMoving = 0;

function animate(time) {
  material.uniforms.u_time.value = time * 0.001;
  
  // Smoothly interpolate the movement state for organic transitions
  currentMoving += (targetMoving - currentMoving) * 0.05;
  material.uniforms.u_isMoving.value = currentMoving;

  if (targetMoving > 0) targetMoving -= 0.01;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('mousemove', (e) => {
  material.uniforms.u_mouse.value.set(e.clientX, window.innerHeight - e.clientY);
  targetMoving = 1.0; 
});

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});
