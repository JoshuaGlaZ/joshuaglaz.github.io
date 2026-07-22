"use client";

import { useEffect, useRef, useState } from "react";

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
    const mainScript = scripts[0];
    const extensionScripts = scripts.slice(1);

    // Load Three.js core first, then all 9 shader extensions in parallel
    globeScriptPromise = loadScript(mainScript).then(() =>
      Promise.all(extensionScripts.map(loadScript)).then(() => {})
    );
  }

  return globeScriptPromise;
}

interface HeroGlobeProps {
  className?: string;
}

function RetroGlitchLoader() {
  const [telemetry, setTelemetry] = useState("INIT_SIGNAL...");

  useEffect(() => {
    const logs = [
      "ACQUIRING_ORBITAL_NODES",
      "COMPILING_GEOMETRY_BUFFER",
      "APPLYING_GLITCH_SHADERS",
      "SIGNAL_STRENGTH: 98.4%",
      "ORBITAL_READY"
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % logs.length;
      setTelemetry(logs[idx]);
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono">
      {/* Retro Surveillance CRT Frame */}
      <div className="relative flex h-56 w-56 flex-col items-center justify-center rounded-lg border border-cyan-500/30 bg-black/60 p-4 shadow-[0_0_25px_rgba(0,255,249,0.15)] backdrop-blur-sm">
        {/* Corner HUD Brackets */}
        <div className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-cyan-400" />
        <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-cyan-400" />
        <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-cyan-400" />

        {/* CRT Scanline Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-70" />

        {/* Central Targeting Reticle */}
        <div className="relative mb-3 flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border border-dashed border-cyan-400/40 duration-3000" />
          <div className="h-8 w-8 animate-ping rounded-full border border-pink-500/40" />
          <div className="h-2 w-2 rounded-full bg-cyan-400" />
        </div>

        {/* Retro RGB Split Text HUD */}
        <div className="relative text-center">
          <p className="text-[10px] font-bold tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,249,0.8)]">
            SYS.INIT // GLOBE_3D
          </p>
          <p className="mt-1 text-[9px] tracking-wider text-pink-400/90 animate-pulse">
            [{telemetry}]
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HeroGlobe({ className = "" }: HeroGlobeProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      if (!hostElement || disposed) return;

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
        console.warn("HeroGlobe: WebGL context unavailable.");
        setIsLoading(false);
        return;
      }

      try {
        await loadGlobeScripts();
      } catch (err) {
        console.warn("HeroGlobe: Failed to load 3D scripts:", err);
        setIsLoading(false);
        return;
      }

      if (disposed || !hostRef.current || !window.THREE) {
        setIsLoading(false);
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
        console.warn("HeroGlobe: WebGLRenderer creation error:", err);
        setIsLoading(false);
        return;
      }

      if (!renderer || !renderer.domElement) {
        setIsLoading(false);
        return;
      }

      const canvasElement = renderer.domElement;
      const handleContextLost = (event: Event) => {
        event.preventDefault();
        if (frameId) window.cancelAnimationFrame(frameId);
        disposed = true;
        cleanup();
      };
      canvasElement.addEventListener("webglcontextlost", handleContextLost, false);

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(1);
      renderer.domElement.className = "hero-globe-canvas absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 ease-out";
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

      // Smoothly fade in 3D WebGL canvas and unmount Retro Loader
      requestAnimationFrame(() => {
        if (!disposed && renderer?.domElement) {
          renderer.domElement.classList.replace("opacity-0", "opacity-100");
          setIsLoading(false);
        }
      });

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
      setIsLoading(false);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={hostRef} className={`relative ${className}`} aria-hidden="true">
      {isLoading && <RetroGlitchLoader />}
    </div>
  );
}

