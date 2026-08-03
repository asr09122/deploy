/**
 * Agrismart — 3D Farm Scene (Three.js)
 * Creates immersive procedural farm environments on canvas elements
 */

(function() {
  'use strict';

  /* ── Shared helpers ── */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(min, max) { return Math.random() * (max - min) + min; }

  /* ══════════════════════════════════════════
     HERO FARM CANVAS
  ══════════════════════════════════════════ */
  function initHeroScene() {
    const canvas = document.getElementById('farmCanvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth || window.innerWidth, canvas.offsetHeight || window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1a0e);
    scene.fog = new THREE.FogExp2(0x0a1a0e, 0.018);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 8, 22);
    camera.lookAt(0, 0, 0);

    /* ── Lighting ── */
    const ambient = new THREE.AmbientLight(0x1a3a1a, 1.5);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffd4a0, 3);
    sun.position.set(15, 25, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 100;
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    scene.add(sun);

    const moonLight = new THREE.DirectionalLight(0x4488aa, 0.4);
    moonLight.position.set(-10, 15, -10);
    scene.add(moonLight);

    /* ── Ground ── */
    const groundGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
    // Subtle terrain displacement
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i), z = posAttr.getZ(i);
      posAttr.setY(i, Math.sin(x * 0.3) * 0.2 + Math.cos(z * 0.25) * 0.15);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshLambertMaterial({ color: 0x1a4a1a });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    /* ── Farm rows (crops) ── */
    const cropRows = [];
    const rowCount = 10;
    const rowSpacing = 2.2;
    const cropsPerRow = 14;

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < cropsPerRow; col++) {
        const x = (col - cropsPerRow / 2) * 1.6 + rand(-0.1, 0.1);
        const z = (row - rowCount / 2) * rowSpacing + rand(-0.1, 0.1);

        // Stalk
        const stalkH = rand(0.8, 1.5);
        const stalkGeo = new THREE.CylinderGeometry(0.03, 0.05, stalkH, 5);
        const stalkMat = new THREE.MeshLambertMaterial({ color: 0x4a7a2a });
        const stalk = new THREE.Mesh(stalkGeo, stalkMat);
        stalk.position.set(x, stalkH / 2, z);
        stalk.castShadow = true;
        scene.add(stalk);

        // Leaves
        const leafCount = 3;
        for (let l = 0; l < leafCount; l++) {
          const leafGeo = new THREE.ConeGeometry(rand(0.25, 0.45), rand(0.6, 1.0), 4);
          const leafMat = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(0.33 + rand(-0.03, 0.03), 0.65, 0.3 + rand(0, 0.15))
          });
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.set(
            x + Math.cos(l * 2.1) * 0.3,
            stalkH * (0.5 + l * 0.2),
            z + Math.sin(l * 2.1) * 0.3
          );
          leaf.rotation.z = (Math.random() - 0.5) * 0.4;
          leaf.castShadow = true;
          scene.add(leaf);
          cropRows.push({ mesh: leaf, baseY: leaf.position.y, phase: rand(0, Math.PI * 2) });
        }

        cropRows.push({ mesh: stalk, baseY: stalk.position.y, phase: rand(0, Math.PI * 2) });
      }
    }

    /* ── Trees ── */
    function makeTree(x, z, scale = 1) {
      const trunkGeo = new THREE.CylinderGeometry(0.15 * scale, 0.25 * scale, 2 * scale, 7);
      const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3010 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, scale, z);
      trunk.castShadow = true;
      scene.add(trunk);

      const leafColors = [0x1a5c1a, 0x2a6a2a, 0x226622];
      for (let i = 0; i < 3; i++) {
        const r = rand(1.2, 2.0) * scale;
        const coneGeo = new THREE.ConeGeometry(r, r * 1.5, 7);
        const coneMat = new THREE.MeshLambertMaterial({ color: leafColors[i] });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.set(x, (2 + i * 1.2) * scale, z);
        cone.castShadow = true;
        scene.add(cone);
      }
    }
    makeTree(-18, -5, 1.3);
    makeTree(-20, 3, 1.0);
    makeTree(18, -7, 1.2);
    makeTree(19, 5, 0.9);
    makeTree(-15, 10, 1.1);
    makeTree(16, 10, 1.0);

    /* ── Barn ── */
    function makeBarn(x, z) {
      const g = new THREE.Group();
      // Body
      const bodyGeo = new THREE.BoxGeometry(5, 3.5, 4);
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8b1a1a });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.75;
      body.castShadow = true;
      g.add(body);
      // Roof
      const roofGeo = new THREE.ConeGeometry(3.8, 2, 4);
      const roofMat = new THREE.MeshLambertMaterial({ color: 0x6a1010 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 4.5;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      g.add(roof);
      // Door
      const doorGeo = new THREE.BoxGeometry(1, 2.2, 0.1);
      const doorMat = new THREE.MeshLambertMaterial({ color: 0x4a2a0a });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 1.1, 2.05);
      g.add(door);
      g.position.set(x, 0, z);
      scene.add(g);
    }
    makeBarn(-12, -8);

    /* ── Windmill ── */
    function makeWindmill(x, z) {
      const g = new THREE.Group();
      const towerGeo = new THREE.CylinderGeometry(0.15, 0.3, 6, 8);
      const towerMat = new THREE.MeshLambertMaterial({ color: 0xd4b896 });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.y = 3;
      g.add(tower);

      const blades = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const bladeGeo = new THREE.BoxGeometry(0.15, 2.5, 0.05);
        const bladeMat = new THREE.MeshLambertMaterial({ color: 0xfaf0dc });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = 1.25;
        const pivot = new THREE.Group();
        pivot.rotation.z = (i / 4) * Math.PI * 2;
        pivot.add(blade);
        blades.add(pivot);
      }
      blades.position.set(0, 6.5, 0.2);
      g.add(blades);

      g.position.set(x, 0, z);
      scene.add(g);
      return blades;
    }
    const windmillBlades = makeWindmill(14, -10);

    /* ── Path ── */
    const pathGeo = new THREE.PlaneGeometry(1.5, 30);
    const pathMat = new THREE.MeshLambertMaterial({ color: 0xb8a060 });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.01, 0);
    scene.add(path);

    /* ── Fireflies / floating particles ── */
    const ffCount = 80;
    const ffGeo = new THREE.BufferGeometry();
    const ffPos = new Float32Array(ffCount * 3);
    const ffPhases = new Float32Array(ffCount);
    for (let i = 0; i < ffCount; i++) {
      ffPos[i * 3] = rand(-20, 20);
      ffPos[i * 3 + 1] = rand(0.5, 5);
      ffPos[i * 3 + 2] = rand(-20, 20);
      ffPhases[i] = rand(0, Math.PI * 2);
    }
    ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
    const ffMat = new THREE.PointsMaterial({
      color: 0xaaff44,
      size: 0.12,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });
    const fireflies = new THREE.Points(ffGeo, ffMat);
    scene.add(fireflies);

    /* ── Mouse interaction ── */
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    /* ── Resize ── */
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /* ── Animation loop ── */
    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.01;

      // Camera sway
      camera.position.x = lerp(camera.position.x, mouseX * 3, 0.02);
      camera.position.y = lerp(camera.position.y, 8 + mouseY * -1.5, 0.02);
      camera.lookAt(0, 0, 0);

      // Windmill
      windmillBlades.rotation.z += 0.008;

      // Crop sway
      cropRows.forEach(({ mesh, baseY, phase }) => {
        mesh.position.y = baseY + Math.sin(t * 1.2 + phase) * 0.04;
        mesh.rotation.z = Math.sin(t * 0.8 + phase) * 0.05;
      });

      // Fireflies
      const ffPosAttr = fireflies.geometry.attributes.position;
      for (let i = 0; i < ffCount; i++) {
        const phase = ffPhases[i];
        ffPosAttr.setX(i, ffPosAttr.getX(i) + Math.sin(t * 0.3 + phase) * 0.01);
        ffPosAttr.setY(i, 1 + Math.abs(Math.sin(t * 0.5 + phase)) * 4);
      }
      ffPosAttr.needsUpdate = true;
      ffMat.opacity = 0.4 + Math.sin(t) * 0.3;

      renderer.render(scene, camera);
    }
    animate();
  }

  /* ══════════════════════════════════════════
     ABOUT MINI CANVAS
  ══════════════════════════════════════════ */
  function initAboutScene() {
    const canvas = document.getElementById('aboutCanvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth || 500, canvas.offsetHeight || 480);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1f0d);
    scene.fog = new THREE.FogExp2(0x0d1f0d, 0.04);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0x1a4a1a, 2);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffd4a0, 4);
    sun.position.set(5, 10, 5);
    scene.add(sun);

    // Ground
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x1a4a1a });
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Spinning globe/sphere with wireframe — represents AI brain
    const sphereGeo = new THREE.SphereGeometry(2.5, 24, 24);
    const sphereWire = new THREE.WireframeGeometry(sphereGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x4aff88, opacity: 0.35, transparent: true });
    const globe = new THREE.LineSegments(sphereWire, wireMat);
    globe.position.set(0, 3, 0);
    scene.add(globe);

    // Inner solid sphere
    const innerGeo = new THREE.SphereGeometry(2, 24, 24);
    const innerMat = new THREE.MeshLambertMaterial({ color: 0x0d300d, transparent: true, opacity: 0.85 });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.set(0, 3, 0);
    scene.add(inner);

    // Orbiting particles
    const orbitCount = 60;
    const orbitGeo = new THREE.BufferGeometry();
    const orbitPos = new Float32Array(orbitCount * 3);
    for (let i = 0; i < orbitCount; i++) {
      const angle = (i / orbitCount) * Math.PI * 2;
      const r = 3.2 + Math.random() * 0.5;
      orbitPos[i * 3] = Math.cos(angle) * r;
      orbitPos[i * 3 + 1] = 3 + (Math.random() - 0.5) * 1.5;
      orbitPos[i * 3 + 2] = Math.sin(angle) * r;
    }
    orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));
    const orbitMat = new THREE.PointsMaterial({ color: 0x44ff88, size: 0.1, sizeAttenuation: true });
    const orbitParticles = new THREE.Points(orbitGeo, orbitMat);
    scene.add(orbitParticles);

    const aboutCanvas = canvas;
    function resizeAbout() {
      const parent = aboutCanvas.parentElement;
      const w = parent.offsetWidth || 500;
      const h = parent.offsetHeight || 480;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resizeAbout);
    resizeAbout();

    let ta = 0;
    function animateAbout() {
      requestAnimationFrame(animateAbout);
      ta += 0.008;
      globe.rotation.y = ta;
      globe.rotation.x = ta * 0.3;
      orbitParticles.rotation.y = ta * 1.2;
      renderer.render(scene, camera);
    }
    animateAbout();
  }

  /* ══════════════════════════════════════════
     AUTH / CTA CANVAS (particle field)
  ══════════════════════════════════════════ */
  function initAuthScene(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(
      canvas.parentElement.offsetWidth || window.innerWidth,
      canvas.parentElement.offsetHeight || window.innerHeight
    );

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 15;

    // Floating leaf/particle field
    const count = 200;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = rand(-20, 20);
      pos[i * 3 + 1] = rand(-10, 10);
      pos[i * 3 + 2] = rand(-15, 5);
      vel.push({ vx: rand(-0.01, 0.01), vy: rand(-0.005, 0.005) });
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x44ff88,
      size: 0.18,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    function resizeAuth() {
      const p = canvas.parentElement;
      const w = p.offsetWidth || window.innerWidth;
      const h = p.offsetHeight || window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resizeAuth);

    let tc = 0;
    function animateAuth() {
      requestAnimationFrame(animateAuth);
      tc += 0.005;
      const posAttr = particles.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        posAttr.setX(i, posAttr.getX(i) + vel[i].vx + Math.sin(tc + i) * 0.003);
        posAttr.setY(i, posAttr.getY(i) + vel[i].vy + Math.cos(tc * 0.7 + i) * 0.002);
        if (posAttr.getX(i) > 20) posAttr.setX(i, -20);
        if (posAttr.getX(i) < -20) posAttr.setX(i, 20);
        if (posAttr.getY(i) > 10) posAttr.setY(i, -10);
        if (posAttr.getY(i) < -10) posAttr.setY(i, 10);
      }
      posAttr.needsUpdate = true;
      particles.rotation.y = tc * 0.05;
      renderer.render(scene, camera);
    }
    animateAuth();
  }

  /* ── Init all scenes based on page ── */
  window.addEventListener('DOMContentLoaded', () => {
    initHeroScene();
    initAboutScene();
    initAuthScene('authCanvas');
    initAuthScene('ctaCanvas');
  });

})();
