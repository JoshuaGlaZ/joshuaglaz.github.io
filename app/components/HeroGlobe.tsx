"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    // Legacy Three.js shader scripts attach a broad namespace to window.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    THREE?: any;
  }
}

const scripts = [
  "/glitch-globe/libs/three.min.js",
  "/glitch-globe/libs/CopyShader.js",
  "/glitch-globe/libs/DotScreenShader.js?v=canvas-bg-mask-1",
  "/glitch-globe/libs/RGBShiftShader.js",
  "/glitch-globe/libs/DigitalGlitch.js?v=canvas-bg-mask-1",
  "/glitch-globe/libs/EffectComposer.js",
  "/glitch-globe/libs/RenderPass.js",
  "/glitch-globe/libs/MaskPass.js",
  "/glitch-globe/libs/ShaderPass.js",
  "/glitch-globe/libs/GlitchPass.js"
];

let globeScriptPromise: Promise<void> | null = null;

function loadScript(src: string) {
  const existing = document.querySelector<HTMLScriptElement>(`script[data-hero-globe="${src}"]`);
  if (existing?.dataset.loaded === "true") return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.heroGlobe = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function loadGlobeScripts() {
  if (!globeScriptPromise) {
    globeScriptPromise = scripts.reduce(
      (chain, src) => chain.then(() => loadScript(src)),
      Promise.resolve()
    );
  }

  return globeScriptPromise;
}

interface HeroGlobeProps {
  className?: string;
}

function start2DCanvasGlobe(container: HTMLElement) {
  const canvas = document.createElement("canvas");
  canvas.className = "hero-globe-canvas h-full w-full opacity-80 mix-blend-screen";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let animId = 0;
  let disposed = false;

  const phi = (1 + Math.sqrt(5)) / 2;
  const rawVertices: [number, number, number][] = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
  ];

  const scale = 110;
  const vertices = rawVertices.map(([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z);
    return [(x / len) * scale, (y / len) * scale, (z / len) * scale] as [number, number, number];
  });

  const edges: [number, number][] = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dx = vertices[i][0] - vertices[j][0];
      const dy = vertices[i][1] - vertices[j][1];
      const dz = vertices[i][2] - vertices[j][2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (Math.abs(dist - 115.6) < 20) {
        edges.push([i, j]);
      }
    }
  }

  const ringPoints: [number, number, number][] = [];
  const ringSegments = 64;
  for (let i = 0; i < ringSegments; i++) {
    const angle = (i / ringSegments) * Math.PI * 2;
    ringPoints.push([145 * Math.cos(angle), 145 * Math.sin(angle), 0]);
  }

  let rotZ = 0;
  let rotX = 0.4;

  function resize() {
    if (!container) return;
    const w = Math.max(container.clientWidth, 200);
    const h = Math.max(container.clientHeight, 200);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }

  resize();
  window.addEventListener("resize", resize);

  function project(p: [number, number, number], rx: number, ry: number, rz: number, cx: number, cy: number): [number, number] {
    const [x, y, z] = p;
    let cos = Math.cos(rx), sin = Math.sin(rx);
    const y1 = y * cos - z * sin;
    const z1 = y * sin + z * cos;

    cos = Math.cos(ry); sin = Math.sin(ry);
    const x2 = x * cos + z1 * sin;
    const z2 = -x * sin + z1 * cos;

    cos = Math.cos(rz); sin = Math.sin(rz);
    const x3 = x2 * cos - y1 * sin;
    const y3 = x2 * sin + y1 * cos;

    const fov = 550;
    const perspective = fov / (fov + z2 + 260);
    return [cx + x3 * perspective, cy + y3 * perspective];
  }

  function render() {
    if (disposed || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    rotZ += 0.007;
    rotX += 0.003;

    const isGlitching = Math.random() < 0.15;
    const gOffsetX = isGlitching ? (Math.random() - 0.5) * 12 : 0;
    const gOffsetY = isGlitching ? (Math.random() - 0.5) * 6 : 0;

    const projVerts = vertices.map(v => project(v, rotX, rotZ * 0.4, rotZ, cx, cy));

    if (isGlitching) {
      ctx.strokeStyle = "rgba(255, 0, 193, 0.45)";
      ctx.lineWidth = 1.5;
      edges.forEach(([i, j]) => {
        const p1 = projVerts[i];
        const p2 = projVerts[j];
        ctx.beginPath();
        ctx.moveTo(p1[0] + gOffsetX + 2, p1[1] + gOffsetY);
        ctx.lineTo(p2[0] + gOffsetX + 2, p2[1] + gOffsetY);
        ctx.stroke();
      });
    }

    ctx.strokeStyle = "rgba(244, 244, 245, 0.75)";
    ctx.lineWidth = 1.2;
    edges.forEach(([i, j]) => {
      const p1 = projVerts[i];
      const p2 = projVerts[j];
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    });

    const projRing = ringPoints.map(p => project(p, rotZ * 0.6, 0.75, rotZ * 0.25, cx, cy));
    ctx.strokeStyle = "rgba(215, 215, 230, 0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    projRing.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    });
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
    animId = requestAnimationFrame(render);
  }

  render();

  return () => {
    disposed = true;
    window.removeEventListener("resize", resize);
    cancelAnimationFrame(animId);
    canvas.remove();
  };
}

export default function HeroGlobe({ className = "" }: HeroGlobeProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let frameId = 0;
    let visible = true;
    let lastFrame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let cleanup = () => {};

    async function boot() {
      const hostElement = hostRef.current;
      if (!hostElement) return;

      const canvas = document.createElement("canvas");
      const contextAttributes: WebGLContextAttributes = {
        antialias: false,
        alpha: true,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
        powerPreference: "default"
      };

      let glContext: WebGLRenderingContext | null = null;
      try {
        glContext = (canvas.getContext("webgl", contextAttributes) ||
                     canvas.getContext("experimental-webgl", contextAttributes) ||
                     canvas.getContext("webgl2", contextAttributes)) as WebGLRenderingContext | null;
      } catch {
        glContext = null;
      }

      if (!glContext || (typeof glContext.isContextLost === "function" && glContext.isContextLost())) {
        console.warn("HeroGlobe: WebGL context unavailable. Engaging 2D canvas 3D fallback.");
        cleanup = start2DCanvasGlobe(hostElement);
        return;
      }

      try {
        await loadGlobeScripts();
      } catch (err) {
        console.warn("HeroGlobe: Failed to load 3D scripts. Engaging 2D canvas 3D fallback:", err);
        cleanup = start2DCanvasGlobe(hostElement);
        return;
      }

      if (disposed || !hostRef.current || !window.THREE) {
        cleanup = start2DCanvasGlobe(hostElement);
        return;
      }

      const THREE = window.THREE;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(20, 1, 1, 10000);
      const light = new THREE.DirectionalLight(0xffffff);
      camera.position.z = 2000;
      light.position.set(0.5, 0.5, 0.5);
      scene.add(light);
      scene.fog = new THREE.Fog(0x000000, 100, 1);

      const sphere = new THREE.SphereGeometry(10, 16, 8, 1);
      const lightMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x000000 }));
      scene.add(lightMesh);

      const geometry = new THREE.IcosahedronGeometry(180, 3);
      const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        shading: THREE.FlatShading,
        vertexColors: THREE.VertexColors
      });
      const globe = THREE.SceneUtils?.createMultiMaterialObject(geometry, [material]) ?? new THREE.Mesh(geometry, material);
      globe.position.x = 0;
      scene.add(globe);

      const ringGeometry = new THREE.TorusGeometry(210, 1, 100, 50);
      const ringMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        shading: THREE.SmoothShading,
        vertexColors: THREE.VertexColors,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      scene.add(ring);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let renderer: any = null;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          context: glContext,
          antialias: false,
          alpha: true,
          depth: false,
          stencil: false,
          preserveDrawingBuffer: false
        });
      } catch (err) {
        console.warn("HeroGlobe: WebGLRenderer creation error, engaging 2D canvas fallback:", err);
        cleanup = start2DCanvasGlobe(hostElement);
        return;
      }

      if (!renderer || !renderer.domElement) {
        cleanup = start2DCanvasGlobe(hostElement);
        return;
      }

      const canvasElement = renderer.domElement;
      const handleContextLost = (event: Event) => {
        event.preventDefault();
        if (frameId) window.cancelAnimationFrame(frameId);
        disposed = true;
        cleanup();
        if (hostRef.current) {
          cleanup = start2DCanvasGlobe(hostRef.current);
        }
      };
      canvasElement.addEventListener("webglcontextlost", handleContextLost, false);

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(1);
      renderer.domElement.className = "hero-globe-canvas h-full w-full";
      hostElement.appendChild(renderer.domElement);

      const composer = new THREE.EffectComposer(renderer);
      composer.addPass(new THREE.RenderPass(scene, camera));
      let finalPass: { renderToScreen: boolean } | null = null;

      if (THREE.DotScreenShader && THREE.ShaderPass) {
        const dot = new THREE.ShaderPass(THREE.DotScreenShader);
        dot.uniforms.scale.value = 30;
        composer.addPass(dot);
        finalPass = dot;
      }

      if (THREE.RGBShiftShader && THREE.ShaderPass) {
        const rgb = new THREE.ShaderPass(THREE.RGBShiftShader);
        rgb.uniforms.amount.value = 0.01;
        composer.addPass(rgb);
        finalPass = rgb;
      }

      if (THREE.GlitchPass) {
        const glitch = new THREE.GlitchPass(100);
        composer.addPass(glitch);
        finalPass = glitch;
      }

      if (finalPass) {
        finalPass.renderToScreen = true;
      }

      function resize() {
        if (!hostElement) return;
        const cssWidth = Math.max(hostElement.clientWidth, 1);
        const cssHeight = Math.max(hostElement.clientHeight, 1);
        const renderScale = Math.min(1, 720 / cssWidth, 520 / cssHeight);
        const width = Math.max(Math.floor(cssWidth * renderScale), 1);
        const height = Math.max(Math.floor(cssHeight * renderScale), 1);

        camera.aspect = cssWidth / cssHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        renderer.domElement.style.width = `${cssWidth}px`;
        renderer.domElement.style.height = `${cssHeight}px`;
        composer.setSize(width, height);
      }

      function renderFrame(now: number) {
        frameId = 0;
        if (disposed || !visible || document.hidden) return;

        const targetFrameMs = 1000 / 30;
        if (now - lastFrame < targetFrameMs) {
          frameId = window.requestAnimationFrame(renderFrame);
          return;
        }

        lastFrame = now;
        const timer = Date.now() * 0.001;
        camera.lookAt(scene.position);
        globe.rotation.z = timer / 2 + 45;
        ring.rotation.x = timer;
        ring.rotation.y = 45;
        composer.render();
        frameId = window.requestAnimationFrame(renderFrame);
      }

      function requestFrame() {
        if (!frameId && !disposed && visible && !document.hidden) {
          frameId = window.requestAnimationFrame(renderFrame);
        }
      }

      function handleVisibilityChange() {
        requestFrame();
      }

      resize();
      requestFrame();

      const ResizeObserverConstructor = globalThis.ResizeObserver;
      if (typeof ResizeObserverConstructor === "function") {
        resizeObserver = new ResizeObserverConstructor(() => {
          resize();
          requestFrame();
        });
        resizeObserver.observe(hostElement);
      } else {
        globalThis.addEventListener("resize", resize);
      }

      const IntersectionObserverConstructor = globalThis.IntersectionObserver;
      if (typeof IntersectionObserverConstructor === "function") {
        intersectionObserver = new IntersectionObserverConstructor(([entry]) => {
          visible = Boolean(entry?.isIntersecting);
          requestFrame();
        }, { rootMargin: "160px" });
        intersectionObserver.observe(hostElement);
      }

      document.addEventListener("visibilitychange", handleVisibilityChange);
      cleanup = () => {
        canvasElement?.removeEventListener("webglcontextlost", handleContextLost);
        globalThis.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
        if (frameId) window.cancelAnimationFrame(frameId);
        composer.renderTarget1?.dispose?.();
        composer.renderTarget2?.dispose?.();
        composer.copyPass?.material?.dispose?.();
        renderer.dispose?.();
        renderer.forceContextLoss?.();
        geometry.dispose?.();
        material.dispose?.();
        sphere.dispose?.();
        ringGeometry.dispose?.();
        ringMaterial.dispose?.();
        renderer.domElement?.remove();
      };
    }

    boot().catch((err) => {
      console.warn("HeroGlobe boot exception handled:", err);
      if (hostRef.current) {
        cleanup = start2DCanvasGlobe(hostRef.current);
      }
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
