import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Eye, RotateCw, Sparkles, ChevronDown, ChevronUp, Layers, BookOpen, Award, Compass } from 'lucide-react';

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePreset, setActivePreset] = useState<'orbit' | 'pedestal' | 'desk' | 'books'>('orbit');
  const [autoRotate, setAutoRotate] = useState(true);
  const [lightPreset, setLightPreset] = useState<'studio' | 'exam' | 'night'>('studio');

  // Reusable refs for animation and camera control without triggering React re-renders
  const stateRef = useRef({
    activePreset: 'orbit',
    autoRotate: true,
    lightPreset: 'studio',
    targetCamPos: new THREE.Vector3(0, 4.2, 8.5),
    targetLookAt: new THREE.Vector3(0, 1.2, 0),
    currentLookAt: new THREE.Vector3(0, 1.2, 0),
  });

  useEffect(() => {
    stateRef.current.activePreset = activePreset;
    stateRef.current.autoRotate = autoRotate;
    stateRef.current.lightPreset = lightPreset;

    if (activePreset === 'orbit') {
      stateRef.current.targetCamPos.set(0, 4.2, 8.5);
      stateRef.current.targetLookAt.set(0, 1.2, 0);
    } else if (activePreset === 'pedestal') {
      stateRef.current.targetCamPos.set(-2.2, 2.5, 3.8);
      stateRef.current.targetLookAt.set(-1.8, 1.6, 0);
    } else if (activePreset === 'desk') {
      stateRef.current.targetCamPos.set(2.0, 3.0, 3.5);
      stateRef.current.targetLookAt.set(1.5, 1.2, 0);
    } else if (activePreset === 'books') {
      stateRef.current.targetCamPos.set(1.6, 2.0, 2.2);
      stateRef.current.targetLookAt.set(1.5, 1.3, -0.2);
    }
  }, [activePreset, autoRotate, lightPreset]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software-WebGL Detection per Three.js skill
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch (_) {
        return true;
      }
    })();

    // 2. Renderer Setup
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 520;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene, Camera, Fog
    const scene = new THREE.Scene();
    const fogColor = new THREE.Color(0x0a1128);
    scene.background = fogColor;
    scene.fog = new THREE.FogExp2(0x0a1128, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 8.5);

    // 4. Studio Environment (PMREM RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x60a5fa, 0x1e293b, 0.8);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    dirLight.position.set(5, 10, 6);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0x38bdf8, 2.5, 12);
    accentLight.position.set(-3, 3, 2);
    scene.add(accentLight);

    const warmDeskLampLight = new THREE.PointLight(0xf59e0b, 1.8, 6);
    warmDeskLampLight.position.set(2.2, 2.4, 0.2);
    scene.add(warmDeskLampLight);

    // 6. Procedural Canvas Textures (Zero 404 Dependencies)
    const createCheckerTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 512);

      // Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      for (let i = 0; i <= 512; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }

      // Cambridge crest accents
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.fillRect(128, 128, 256, 256);

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(8, 8);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };

    const createBookCoverTexture = (title: string, volume: string, color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 384;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 256, 384);

      // Gold border
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 12, 232, 360);

      // Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CAMBRIDGE', 128, 55);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('IELTS ACADEMIC', 128, 80);

      // Volume Number
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 72px serif';
      ctx.fillText(volume, 128, 180);

      // Subtext
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('AUTHENTIC PRACTICE TESTS', 128, 240);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('WITH ANSWERS & AUDIO', 128, 265);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    // Ground Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createCheckerTexture(),
      roughness: 0.35,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Soft Radial Contact Shadow
    const contactCanvas = document.createElement('canvas');
    contactCanvas.width = 256;
    contactCanvas.height = 256;
    const cctx = contactCanvas.getContext('2d')!;
    const grad = cctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0,0,0,0.85)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    cctx.fillStyle = grad;
    cctx.fillRect(0, 0, 256, 256);

    const contactTexture = new THREE.CanvasTexture(contactCanvas);
    const contactMat = new THREE.MeshBasicMaterial({
      map: contactTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });

    const contactShadowPedestal = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 3.5), contactMat);
    contactShadowPedestal.rotation.x = -Math.PI / 2;
    contactShadowPedestal.position.set(-1.8, 0.01, 0);
    scene.add(contactShadowPedestal);

    const contactShadowDesk = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.5), contactMat);
    contactShadowDesk.rotation.x = -Math.PI / 2;
    contactShadowDesk.position.set(1.6, 0.01, 0);
    scene.add(contactShadowDesk);

    // --- Procedural 3-12 Part Composite Model 1: Band 9 Assessment Pedestal & Armillary Globe ---
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(-1.8, 0, 0);

    // Part 1: Bottom marble step plinth
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.1 });
    const plinthMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.2, 32), plinthMat);
    plinthMesh.position.y = 0.1;
    plinthMesh.castShadow = !isSoftwareGl;
    pedestalGroup.add(plinthMesh);

    // Part 2: Polished Brass bevel collar
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.18, metalness: 0.95 });
    const collarMesh = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.08, 16, 48), brassMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = 0.24;
    pedestalGroup.add(collarMesh);

    // Part 3: Octagonal Classical Column Shaft
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.15 });
    const shaftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 1.2, 16), shaftMat);
    shaftMesh.position.y = 0.85;
    shaftMesh.castShadow = !isSoftwareGl;
    pedestalGroup.add(shaftMesh);

    // Part 4: Capital platform
    const capitalMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.9, 0.18, 32), plinthMat);
    capitalMesh.position.y = 1.5;
    pedestalGroup.add(capitalMesh);

    // Part 5: Gimbal Armillary Meridian Ring (outer brass)
    const meridianMesh = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 16, 64), brassMat);
    meridianMesh.position.y = 2.45;
    pedestalGroup.add(meridianMesh);

    // Part 6: Gimbal Equator Ring
    const equatorMesh = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.04, 16, 64), brassMat);
    equatorMesh.rotation.x = Math.PI / 2;
    equatorMesh.position.y = 2.45;
    pedestalGroup.add(equatorMesh);

    // Part 7: Inner Celestial Axis
    const axisMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.9 });
    const axisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 16), axisMat);
    axisMesh.position.y = 2.45;
    pedestalGroup.add(axisMesh);

    // Part 8: Glowing Holographic Globe (with procedural continents)
    const globeCanvas = document.createElement('canvas');
    globeCanvas.width = 512;
    globeCanvas.height = 256;
    const gctx = globeCanvas.getContext('2d')!;
    gctx.fillStyle = '#0284c7';
    gctx.fillRect(0, 0, 512, 256);
    // Draw stylized continents
    gctx.fillStyle = '#38bdf8';
    gctx.beginPath();
    gctx.arc(150, 100, 60, 0, Math.PI * 2);
    gctx.arc(320, 110, 80, 0, Math.PI * 2);
    gctx.arc(420, 160, 45, 0, Math.PI * 2);
    gctx.fill();

    const globeTexture = new THREE.CanvasTexture(globeCanvas);
    globeTexture.colorSpace = THREE.SRGBColorSpace;
    const globeMat = new THREE.MeshStandardMaterial({
      map: globeTexture,
      roughness: 0.2,
      metalness: 0.4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
    });
    const globeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), globeMat);
    globeMesh.position.y = 2.45;
    pedestalGroup.add(globeMesh);

    // Part 9: Floating Band 9 Holographic Crown Crest
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.15,
      metalness: 0.95,
      emissive: 0xeab308,
      emissiveIntensity: 0.4,
    });
    const crownMesh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 12, 24), crownMat);
    crownMesh.rotation.x = Math.PI / 2;
    crownMesh.position.y = 3.35;
    pedestalGroup.add(crownMesh);

    scene.add(pedestalGroup);

    // --- Procedural 3-12 Part Composite Model 2: Cambridge Examiner Station & Book Library ---
    const deskGroup = new THREE.Group();
    deskGroup.position.set(1.6, 0, 0);

    // Part 1: Solid Walnut Desk Surface
    const deskWoodMat = new THREE.MeshStandardMaterial({ color: 0x271911, roughness: 0.35, metalness: 0.1 });
    const desktopMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.4), deskWoodMat);
    desktopMesh.position.y = 1.15;
    desktopMesh.castShadow = !isSoftwareGl;
    desktopMesh.receiveShadow = !isSoftwareGl;
    deskGroup.add(desktopMesh);

    // Part 2-5: Chamfered Steel Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.85 });
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.15, 16);
    const legPositions = [
      [-1.05, 0.575, -0.55],
      [1.05, 0.575, -0.55],
      [-1.05, 0.575, 0.55],
      [1.05, 0.575, 0.55],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = !isSoftwareGl;
      deskGroup.add(leg);
    });

    // Part 6: Cambridge Book 19 (Hero Book, angled on stand)
    const bookCover19 = createBookCoverTexture('Cambridge 19', '19', '#1e3a8a');
    const bookGeo = new THREE.BoxGeometry(0.48, 0.08, 0.65);
    const bookMat19 = [
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 }), // right edge
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 }), // left spine
      new THREE.MeshStandardMaterial({ map: bookCover19, roughness: 0.3 }), // top cover
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 }), // bottom
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 }), // front pages
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 }), // back pages
    ];
    const bookMesh19 = new THREE.Mesh(bookGeo, bookMat19);
    bookMesh19.position.set(-0.55, 1.25, 0.1);
    bookMesh19.rotation.y = 0.35;
    bookMesh19.castShadow = !isSoftwareGl;
    deskGroup.add(bookMesh19);

    // Part 7: Stacked Cambridge Books 18, 17, 16 underneath
    const bookCover18 = createBookCoverTexture('Cambridge 18', '18', '#047857');
    const bookMesh18 = new THREE.Mesh(bookGeo, [
      new THREE.MeshStandardMaterial({ color: 0x047857 }),
      new THREE.MeshStandardMaterial({ color: 0x047857 }),
      new THREE.MeshStandardMaterial({ map: bookCover18 }),
      new THREE.MeshStandardMaterial({ color: 0x047857 }),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc }),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc }),
    ]);
    bookMesh18.position.set(0.65, 1.25, -0.2);
    bookMesh18.rotation.y = -0.15;
    deskGroup.add(bookMesh18);

    const bookCover17 = createBookCoverTexture('Cambridge 17', '17', '#b91c1c');
    const bookMesh17 = new THREE.Mesh(bookGeo, [
      new THREE.MeshStandardMaterial({ color: 0xb91c1c }),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c }),
      new THREE.MeshStandardMaterial({ map: bookCover17 }),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c }),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc }),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc }),
    ]);
    bookMesh17.position.set(0.63, 1.33, -0.2);
    bookMesh17.rotation.y = -0.08;
    deskGroup.add(bookMesh17);

    // Part 8: Examiner Assessment Tablet with Rubric Display
    const tabletGeo = new THREE.BoxGeometry(0.42, 0.02, 0.3);
    const tabletCanvas = document.createElement('canvas');
    tabletCanvas.width = 256;
    tabletCanvas.height = 180;
    const tctx = tabletCanvas.getContext('2d')!;
    tctx.fillStyle = '#0f172a';
    tctx.fillRect(0, 0, 256, 180);
    tctx.fillStyle = '#10b981';
    tctx.font = 'bold 16px sans-serif';
    tctx.fillText('IELTS EXAM SCORING', 16, 30);
    tctx.fillStyle = '#cbd5e1';
    tctx.font = '12px sans-serif';
    tctx.fillText('TR: Band 8.5 | CC: Band 8.0', 16, 60);
    tctx.fillText('LR: Band 8.0 | GRA: Band 8.5', 16, 85);
    tctx.fillStyle = '#fbbf24';
    tctx.font = 'bold 18px sans-serif';
    tctx.fillText('OVERALL: BAND 8.5 (C2)', 16, 125);

    const tabletTexture = new THREE.CanvasTexture(tabletCanvas);
    const tabletMat = [
      new THREE.MeshStandardMaterial({ color: 0x1e293b }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b }),
      new THREE.MeshBasicMaterial({ map: tabletTexture }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b }),
    ];
    const tabletMesh = new THREE.Mesh(tabletGeo, tabletMat);
    tabletMesh.position.set(0.05, 1.22, 0.25);
    tabletMesh.rotation.y = 0.05;
    deskGroup.add(tabletMesh);

    // Part 9: Classic Brass Desk Lamp
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 24), brassMat);
    lampBase.position.set(0.85, 1.23, 0.35);
    deskGroup.add(lampBase);

    const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 12), brassMat);
    lampArm.position.set(0.85, 1.48, 0.35);
    deskGroup.add(lampArm);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 24, 1, true), brassMat);
    lampShade.position.set(0.85, 1.72, 0.35);
    lampShade.rotation.x = Math.PI;
    deskGroup.add(lampShade);

    scene.add(deskGroup);

    // 7. Render Loop with Lossless Pacing & Damped Interpolation
    let frameId = 0;
    let clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const _scratchVec = new THREE.Vector3();

    function tick() {
      const dt = clock.getDelta();
      const state = stateRef.current;

      // Rotate armillary rings and globe
      globeMesh.rotation.y += 0.4 * dt;
      meridianMesh.rotation.z += 0.25 * dt;
      equatorMesh.rotation.x += 0.15 * dt;
      crownMesh.rotation.z += 0.5 * dt;

      // Camera smooth damping
      const dampingFactor = 1.0 - Math.exp(-3.5 * dt);
      camera.position.lerp(state.targetCamPos, dampingFactor);
      state.currentLookAt.lerp(state.targetLookAt, dampingFactor);
      camera.lookAt(state.currentLookAt);

      if (state.autoRotate && state.activePreset === 'orbit') {
        const angle = 0.15 * dt;
        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[480px] lg:h-[560px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Spec Badging */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-white text-xs font-semibold shadow-lg">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Cambridge Academic Assessment Hall</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-950/80 border border-sky-600/40 text-sky-300 text-xs font-medium">
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>Official 1-19 Suite</span>
        </div>
      </div>

      {/* Unified Ergonomic Bottom Control Dock per Three.js Constitution */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'translate-y-[calc(100%-42px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse Toggle Tab */}
        <div className="flex justify-center mb-1.5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 px-4 py-1 rounded-t-xl bg-slate-900 border-t border-x border-slate-700/80 text-slate-300 hover:text-white text-xs font-medium cursor-pointer shadow-lg transition-colors"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                <span>Show 3D Hall Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                <span>Hide Controls (Zen View)</span>
              </>
            )}
          </button>
        </div>

        {/* Floating Solid Control Bar */}
        <div className="p-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200">
          {/* Camera View Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-sky-400" /> View:
            </span>
            <button
              onClick={() => setActivePreset('orbit')}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
                activePreset === 'orbit'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActivePreset('pedestal')}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
                activePreset === 'pedestal'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Band 9 Globe
            </button>
            <button
              onClick={() => setActivePreset('desk')}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
                activePreset === 'desk'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Exam Desk
            </button>
            <button
              onClick={() => setActivePreset('books')}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
                activePreset === 'books'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Books 1-19
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                autoRotate
                  ? 'bg-emerald-600/90 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
