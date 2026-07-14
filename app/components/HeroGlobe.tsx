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
      await loadGlobeScripts();

      if (disposed || !hostRef.current || !window.THREE) return;

      const THREE = window.THREE;
      const hostElement = hostRef.current;
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

      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: "low-power"
      });
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
        renderer.domElement.remove();
      };
    }

    boot().catch(() => {});

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
