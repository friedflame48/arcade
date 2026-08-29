// ===== MODELBENCH — APP.JS =====

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────────────────────
  // TAB SWITCHING
  // ─────────────────────────────────────────────────────────
  const tabModeling   = document.getElementById('tab-modeling');
  const tabPreview    = document.getElementById('tab-preview');
  const viewModeling  = document.getElementById('view-modeling');
  const viewPreview   = document.getElementById('view-preview');
  const rightModeling = document.getElementById('panel-modeling');
  const rightPreview  = document.getElementById('panel-preview');
  const statusBar     = document.getElementById('status-bar');

  function switchTab(tab) {
    if (tab === 'modeling') {
      tabModeling.classList.add('active-tab');    tabPreview.classList.remove('active-tab');
      viewModeling.style.display = 'block';       viewPreview.style.display  = 'none';
      rightModeling.style.display = 'flex';       rightPreview.style.display  = 'none';
      if (statusBar) statusBar.style.display = 'none';
      // Re-sync renderer size after becoming visible
      requestAnimationFrame(() => onModelingResize());
    } else {
      tabPreview.classList.add('active-tab');     tabModeling.classList.remove('active-tab');
      viewModeling.style.display = 'none';        viewPreview.style.display  = 'block';
      rightModeling.style.display = 'none';       rightPreview.style.display  = 'flex';
      if (statusBar) statusBar.style.display = 'flex';
      // Lazy-init preview on first switch
      initPreview();
      requestAnimationFrame(() => onPreviewResize());
    }
  }

  tabModeling.addEventListener('click', () => switchTab('modeling'));
  tabPreview.addEventListener('click',  () => switchTab('preview'));

  // ─────────────────────────────────────────────────────────
  // PREVIEW PANEL — scenery swatches + sliders + toggles
  // ─────────────────────────────────────────────────────────
  // Map CSS gradient strings → a flat hex colour for the WebGL clear
  function gradientToHex(bg) {
    const m = bg.match(/#([0-9a-fA-F]{6})/);
    return m ? parseInt(m[1], 16) : 0x1a1a1a;
  }

  document.querySelectorAll('.scenery-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.scenery-swatch').forEach(s => s.classList.remove('active-swatch'));
      sw.classList.add('active-swatch');
      const bg = sw.dataset.bg;
      document.getElementById('preview-bg').style.background = bg;
      if (previewRenderer) previewRenderer.setClearColor(gradientToHex(bg), 1);
    });
  });

  document.querySelectorAll('.preview-slider').forEach(slider => {
    const valEl = document.getElementById(slider.dataset.valId);
    slider.addEventListener('input', () => {
      valEl.textContent = slider.value;
      if (slider.dataset.valId === 'val-light-rot' && previewDirLight) {
        const rad = slider.value * Math.PI / 180;
        previewDirLight.position.set(Math.cos(rad) * 10, 8, Math.sin(rad) * 10);
      }
    });
  });

  document.querySelectorAll('.preview-toggle').forEach(tog => {
    tog.addEventListener('click', () => tog.classList.toggle('on'));
  });

  // ─────────────────────────────────────────────────────────
  // ACCORDION PANELS
  // ─────────────────────────────────────────────────────────
  document.querySelectorAll('.panel-row-header').forEach(header => {
    header.addEventListener('click', () => {
      const clicked = header.closest('.panel-section-collapsible');
      const isOpen  = !clicked.classList.contains('collapsed');
      document.querySelectorAll('.panel-section-collapsible').forEach(s => s.classList.add('collapsed'));
      if (!isOpen) clicked.classList.remove('collapsed');
    });
  });

  // ─────────────────────────────────────────────────────────
  // RESIZABLE RIGHT PANEL
  // ─────────────────────────────────────────────────────────
  const rightPanel   = document.getElementById('right-panel');
  const resizeHandle = document.getElementById('panel-resize-handle');
  let resizing = false, startX = 0, startW = 0;

  resizeHandle.addEventListener('mousedown', e => {
    resizing = true; startX = e.clientX; startW = rightPanel.offsetWidth;
    document.body.style.cursor    = 'ew-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!resizing) return;
    rightPanel.style.width = Math.min(520, Math.max(220, startW + (startX - e.clientX))) + 'px';
  });
  window.addEventListener('mouseup', () => {
    if (!resizing) return;
    resizing = false;
    document.body.style.cursor    = '';
    document.body.style.userSelect = '';
  });

  // ─────────────────────────────────────────────────────────
  // SHARED GLB LOAD — one fetch, two scenes
  // ─────────────────────────────────────────────────────────
  let sharedGltf = null;
  const gltfQueue = [];

  function whenGltfReady(cb) {
    if (sharedGltf) { cb(sharedGltf); } else { gltfQueue.push(cb); }
  }

  // Pixel-art texture filtering — keep textures sharp, no bilinear blur
  function applyPixelated(object) {
    object.traverse(node => {
      if (!node.isMesh) return;
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach(mat => {
        if (!mat) return;
        [
          'map','normalMap','roughnessMap','metalnessMap',
          'aoMap','emissiveMap','alphaMap','bumpMap',
          'displacementMap','lightMap','specularMap'
        ].forEach(k => {
          const t = mat[k];
          if (t && t.isTexture) {
            t.magFilter = THREE.NearestFilter;
            t.minFilter = THREE.NearestFilter;
            t.needsUpdate = true;
          }
        });
      });
    });
  }

  // Centre model on origin, seat on Y=0; returns { size }
  function seatModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const c   = new THREE.Vector3();
    box.getCenter(c);
    model.position.sub(c);
    model.position.y -= box.min.y - c.y;
    const size = new THREE.Vector3();
    box.getSize(size);
    return { size };
  }

  // Frame a camera to fit a given model size — matches ModelBench default (image 2)
  function frameCamera(cam, ctrl, size) {
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov    = cam.fov * Math.PI / 180;
    // 1.05× gives a very close, tight framing
    const dist   = (maxDim / 2) / Math.tan(fov / 2) * 1.05;
    const targetY = size.y * 0.45;
    // Slight downward angle, mostly frontal
    cam.position.set(0, targetY + dist * 0.22, dist);
    cam.lookAt(0, targetY, 0);
    if (ctrl) { ctrl.target.set(0, targetY, 0); ctrl.update(); }
  }

  const loader = new THREE.GLTFLoader();
  loader.load('Untitled.glb',
    gltf => {
      sharedGltf = gltf;
      gltfQueue.forEach(cb => cb(gltf));
      gltfQueue.length = 0;
    },
    undefined,
    err => console.error('GLB load error:', err)
  );

  // ═════════════════════════════════════════════════════════
  // MODELING VIEWPORT
  // ═════════════════════════════════════════════════════════
  const viewport = document.getElementById('viewport');

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x282828, 1);
  renderer.autoClear = true;
  // Don't enable shadowMap in modeling view — keeps it fast
  viewport.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;display:block;width:100%;height:100%;';

  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0x282828);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
  camera.position.set(0, 8, 16);
  camera.lookAt(0, 4, 0);

  // ── Lighting (modeling) ────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(6, 10, 8);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x8899ff, 0.35);
  fillLight.position.set(-6, 3, -6);
  scene.add(fillLight);

  // ── Grid: real Y=0 plane, depth-tested so it never covers the model ──
  // Uses #extension GL_OES_standard_derivatives so fwidth() works on all WebGL1 contexts.
  const gridVert = /* glsl */`
    varying vec3 vWorldPos;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos     = worldPos.xyz;
      gl_Position   = projectionMatrix * viewMatrix * worldPos;
    }`;

  const gridFrag = /* glsl */`
    #extension GL_OES_standard_derivatives : enable
    precision highp float;
    varying vec3 vWorldPos;
    vec4 gridLine(vec2 pos, float scale, float lw) {
      vec2 coord = pos * scale;
      vec2 d     = fwidth(coord);
      vec2 g     = abs(fract(coord - 0.5) - 0.5) / max(d, vec2(0.0001));
      float l    = 1.0 - clamp(min(g.x, g.y) / max(lw, 0.001), 0.0, 1.0);
      return vec4(0.55, 0.55, 0.55, l);
    }
    void main() {
      vec2 wXZ = vWorldPos.xz;
      // Major grid every 1 unit, minor every 0.1
      vec4 major = gridLine(wXZ, 1.0, 2.0);
      vec4 minor = gridLine(wXZ, 0.1, 1.5) * 0.45;
      vec4 col   = major + minor * (1.0 - major.a);
      float fade = 1.0 - smoothstep(30.0, 80.0, length(wXZ));
      col.a     *= fade;
      col.rgb    = clamp(col.rgb, 0.0, 1.0);
      // X axis (red, along Z=0 line), Z axis (blue, along X=0 line)
      float axW = max(fwidth(wXZ.y) * 2.0, 0.02);
      float xAx = 1.0 - smoothstep(0.0, axW, abs(wXZ.y));
      float azW = max(fwidth(wXZ.x) * 2.0, 0.02);
      float zAx = 1.0 - smoothstep(0.0, azW, abs(wXZ.x));
      if (xAx > 0.01) col = mix(col, vec4(0.85, 0.20, 0.20, 1.0), xAx);
      if (zAx > 0.01) col = mix(col, vec4(0.20, 0.42, 0.85, 1.0), zAx);
      col.a = max(col.a, max(xAx, zAx));
      if (col.a < 0.005) discard;
      gl_FragColor = col;
    }`;

  const gridMat = new THREE.ShaderMaterial({
    vertexShader: gridVert, fragmentShader: gridFrag,
    side: THREE.DoubleSide, transparent: true,
    depthWrite: false,
    depthTest:  true,
    extensions: { derivatives: true },   // ensures THREE enables GL_OES_standard_derivatives
  });

  // Large plane — many subdivisions so fwidth() gradients are smooth across the whole surface
  const gridMesh = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 64, 64), gridMat);
  gridMesh.rotation.x = -Math.PI / 2;
  gridMesh.position.y = 0.001;
  scene.add(gridMesh);

  // ── Load model → modeling scene ───────────────────────
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping      = true;
  controls.dampingFactor      = 0.08;
  controls.screenSpacePanning = true;
  controls.minDistance        = 0.5;
  controls.maxDistance        = 2000;
  controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  controls.touches      = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

  whenGltfReady(gltf => {
    const model = gltf.scene.clone(true);
    applyPixelated(model);
    const { size } = seatModel(model);
    window._modelSize = size;
    scene.add(model);
    frameCamera(camera, controls, size);
    needsRender = true;
  });

  // ── Axis HUD (SVG overlay) ────────────────────────────
  const hud = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  hud.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;';
  viewport.appendChild(hud);

  function makeInd(label, color, shape) {
    const g    = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('fill', 'none');
    poly.setAttribute('stroke', color);
    poly.setAttribute('stroke-width', '1.5');
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('fill', color); txt.setAttribute('font-size', '11');
    txt.setAttribute('font-family', 'monospace'); txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('dominant-baseline', 'middle'); txt.setAttribute('font-weight', 'bold');
    txt.textContent = label;
    g.appendChild(poly); g.appendChild(txt);
    return { el: g, poly, txt, shape };
  }

  function placeInd(ind, sx, sy) {
    if (!isFinite(sx) || !isFinite(sy)) return;
    const S = 18;
    let pts, tx, ty;
    if (ind.shape === 'left') {
      pts = `${sx},${sy-S} ${sx},${sy+S} ${sx-S*1.1},${sy}`;
      tx  = sx - S * 0.3; ty = sy;
    } else {
      pts = `${sx-S},${sy} ${sx+S},${sy} ${sx},${sy-S*1.1}`;
      tx  = sx; ty = sy + S * 0.15;
    }
    ind.poly.setAttribute('points', pts);
    ind.txt.setAttribute('x', String(tx));
    ind.txt.setAttribute('y', String(ty));
  }

  const xInd = makeInd('X', '#cc3333', 'left');
  const zInd = makeInd('Z', '#3366cc', 'up');
  hud.appendChild(xInd.el);
  hud.appendChild(zInd.el);

  const _v = new THREE.Vector3();
  function worldToScreen(wx, wy, wz) {
    _v.set(wx, wy, wz).project(camera);
    const W = viewport.clientWidth, H = viewport.clientHeight;
    return { x: (_v.x + 1) / 2 * W, y: (-_v.y + 1) / 2 * H };
  }

  // ── View buttons ──────────────────────────────────────
  document.querySelector('.view-btn[title="Fit to Screen"]')?.addEventListener('click', () => {
    // Re-frame using current model size if available, else sensible default
    if (window._modelSize) {
      frameCamera(camera, controls, window._modelSize);
    } else {
      camera.position.set(0, 8, 16); camera.lookAt(0, 4, 0);
      controls.target.set(0, 4, 0); controls.update();
    }
    needsRender = true;
  });
  document.querySelector('.view-btn[title="Zoom In"]')?.addEventListener('click', () => {
    const d = new THREE.Vector3(); camera.getWorldDirection(d);
    camera.position.addScaledVector(d, 5); controls.update();
  });

  // ── Resize (modeling) ─────────────────────────────────
  function onModelingResize() {
    const w = viewport.clientWidth, h = viewport.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    needsRender = true;
  }

  window.addEventListener('resize', onModelingResize);
  new ResizeObserver(onModelingResize).observe(viewport);

  // ── Render-on-demand: only render when something changed ──────────────
  let needsRender = true;
  let idleFrames  = 0;
  const IDLE_GRACE = 10; // render a few extra frames after damping settles

  controls.addEventListener('change', () => { needsRender = true; idleFrames = 0; });
  controls.addEventListener('start',  () => { needsRender = true; idleFrames = 0; });

  // ── Stop orbit/pan/zoom INSTANTLY when pointer leaves viewport ────────
  function killMotion() {
    // 1. Cancel any active pointer drag
    renderer.domElement.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    // 2. Snap camera to the current damped position (kills residual velocity)
    const savedDamping = controls.enableDamping;
    controls.enableDamping = false;
    controls.update();
    controls.enableDamping = savedDamping;
    // 3. Force one final render to flush the settled state
    needsRender = true;
  }
  renderer.domElement.addEventListener('pointerleave', killMotion);
  window.addEventListener('blur', killMotion);

  // ── Idle snapshot overlay ─────────────────────────────────────────────
  // When fully idle: grab a PNG snapshot, display it as an <img> over the
  // canvas, and pause all WebGL rendering. Resume on any pointer interaction.
  const idleImg = document.createElement('img');
  idleImg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:none;pointer-events:none;';
  viewport.appendChild(idleImg);
  let isIdle = false;

  function enterIdle() {
    if (isIdle) return;
    // Capture the current frame as a PNG and show it as a static overlay
    const dataURL = renderer.domElement.toDataURL('image/png');
    idleImg.src = dataURL;
    idleImg.style.display = 'block';
    // Hide the canvas so the GPU is truly idle (no compositing)
    renderer.domElement.style.visibility = 'hidden';
    isIdle = true;
  }

  function exitIdle() {
    if (!isIdle) return;
    renderer.domElement.style.visibility = 'visible';
    idleImg.style.display = 'none';
    isIdle = false;
    needsRender = true;
    idleFrames = 0;
  }

  // Re-activate on any pointer interaction with the viewport
  viewport.addEventListener('pointerdown', exitIdle);
  viewport.addEventListener('pointermove', exitIdle);
  viewport.addEventListener('wheel', exitIdle, { passive: true });

  // ── Modeling render loop ──────────────────────────────
  const EXT = 800;

  function animateModeling() {
    requestAnimationFrame(animateModeling);
    if (isIdle) return; // fully idle — nothing to do

    controls.update();

    // Render if explicitly requested or damping is still settling
    if (needsRender || idleFrames < IDLE_GRACE) {
      renderer.render(scene, camera);

      const W = viewport.clientWidth, H = viewport.clientHeight;
      if (W > 0 && H > 0) {
        const PAD = 26;
        const xp  = worldToScreen(-EXT, 0, 0);
        const zp  = worldToScreen(0, 0, -EXT);
        placeInd(xInd, Math.max(PAD, Math.min(W - PAD, xp.x)), Math.max(PAD, Math.min(H - PAD, xp.y)));
        placeInd(zInd, Math.max(PAD, Math.min(W - PAD, zp.x)), Math.max(PAD, Math.min(H - PAD, zp.y)));
      }

      if (!needsRender) {
        idleFrames++;
        // After grace frames settle, take a snapshot and go fully idle
        if (idleFrames >= IDLE_GRACE) {
          enterIdle();
        }
      }
      needsRender = false;
    }
  }

  // Delay first frame — viewport must be visible so clientWidth/Height are non-zero
  requestAnimationFrame(() => {
    onModelingResize();
    animateModeling();
  });

  // ═════════════════════════════════════════════════════════
  // PREVIEW VIEWPORT  (lazy init on first tab switch)
  // ═════════════════════════════════════════════════════════
  let previewRenderer  = null;
  let previewCamera    = null;
  let previewControls  = null;
  let previewScene     = null;
  let previewDirLight  = null;
  let previewInited    = false;

  function initPreview() {
    if (previewInited) return;
    previewInited = true;

    const pvBg = document.getElementById('preview-bg');

    // Hide the "no model loaded" hint text
    const hint = pvBg.querySelector('.preview-empty-hint');
    if (hint) hint.style.display = 'none';

    previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    previewRenderer.setPixelRatio(window.devicePixelRatio);
    previewRenderer.setClearColor(0xb8cce8, 1);   // default sky-blue
    previewRenderer.shadowMap.enabled = true;
    previewRenderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    previewRenderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    pvBg.appendChild(previewRenderer.domElement);

    previewScene  = new THREE.Scene();
    previewCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);
    previewCamera.position.set(0, 8, 18);
    previewCamera.lookAt(0, 0, 0);

    // ── Lighting (preview) ─────────────────────────────
    previewScene.add(new THREE.AmbientLight(0xffffff, 0.5));

    previewDirLight = new THREE.DirectionalLight(0xfff5e0, 1.4);
    const rad0 = 266 * Math.PI / 180;
    previewDirLight.position.set(Math.cos(rad0) * 10, 8, Math.sin(rad0) * 10);
    previewDirLight.castShadow = true;
    previewDirLight.shadow.mapSize.set(2048, 2048);
    previewDirLight.shadow.camera.near   = 0.5;
    previewDirLight.shadow.camera.far    = 200;
    previewDirLight.shadow.camera.left   = -20;
    previewDirLight.shadow.camera.right  =  20;
    previewDirLight.shadow.camera.top    =  20;
    previewDirLight.shadow.camera.bottom = -20;
    previewScene.add(previewDirLight);

    const rimLight = new THREE.DirectionalLight(0x88aaff, 0.4);
    rimLight.position.set(-8, 5, -8);
    previewScene.add(rimLight);

    // Shadow-catcher ground disc
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(40, 64),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    previewScene.add(ground);

    // ── Orbit Controls (preview) ───────────────────────
    previewControls = new THREE.OrbitControls(previewCamera, previewRenderer.domElement);
    previewControls.enableDamping      = true;
    previewControls.dampingFactor      = 0.08;
    previewControls.screenSpacePanning = true;
    previewControls.minDistance        = 0.5;
    previewControls.maxDistance        = 500;

    // ── Load model → preview scene ─────────────────────
    whenGltfReady(gltf => {
      const model = gltf.scene.clone(true);
      applyPixelated(model);
      model.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
      const { size } = seatModel(model);
      previewScene.add(model);
      frameCamera(previewCamera, previewControls, size);

      // Widen shadow frustum to cover model footprint
      const r = Math.max(size.x, size.z) * 1.5;
      previewDirLight.shadow.camera.left   = -r;
      previewDirLight.shadow.camera.right  =  r;
      previewDirLight.shadow.camera.top    =  r;
      previewDirLight.shadow.camera.bottom = -r;
      previewDirLight.shadow.camera.updateProjectionMatrix();
    });

    // ── Preview render loop ────────────────────────────
    (function animatePreview() {
      requestAnimationFrame(animatePreview);
      previewControls.update();
      previewRenderer.render(previewScene, previewCamera);
    })();
  }

  function onPreviewResize() {
    if (!previewRenderer) return;
    const pvBg = document.getElementById('preview-bg');
    const w = pvBg.clientWidth, h = pvBg.clientHeight;
    if (!w || !h) return;
    previewCamera.aspect = w / h;
    previewCamera.updateProjectionMatrix();
    previewRenderer.setSize(w, h);
  }

  window.addEventListener('resize', onPreviewResize);

});
