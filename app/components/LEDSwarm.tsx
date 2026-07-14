"use client";

import { useEffect, useRef } from "react";

class LEDSwarmRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null;
  private width = 0;
  private height = 0;
  private readonly spacing = 9.0;
  private time = 0;
  private readonly seed = Math.random() * 100.0;
  private dotThreshold = 0.36;
  private midThreshold = 0.52;
  private solidThreshold = 0.68;
  private calibrationTimer: number | null = null;
  private animationFrameId: number | null = null;
  private shaderProgram: WebGLProgram | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private programInfo: {
    program: WebGLProgram;
    attribLocations: { vertexPosition: number };
    uniformLocations: {
      resolution: WebGLUniformLocation | null;
      time: WebGLUniformLocation | null;
      seed: WebGLUniformLocation | null;
      dotThreshold: WebGLUniformLocation | null;
      midThreshold: WebGLUniformLocation | null;
      solidThreshold: WebGLUniformLocation | null;
    };
  } | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement;
    this.gl = this.canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power"
    });
    if (!this.gl) return;

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);
    this.init();
  }

  private fract(x: number) {
    return x - Math.floor(x);
  }

  private hash(x: number, y: number) {
    let px = x + this.seed;
    let py = y + this.seed * 0.7;

    px = this.fract(px * 0.1311);
    py = this.fract(py * 0.1417);

    const dotVal = px * (py + 19.19) + py * (px + 19.19);
    px += dotVal;
    py += dotVal;

    return this.fract((px + py) * px);
  }

  private noise(x: number, y: number) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
    const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);

    return (
      this.hash(ix, iy) * (1 - ux) * (1 - uy) +
      this.hash(ix + 1, iy) * ux * (1 - uy) +
      this.hash(ix, iy + 1) * (1 - ux) * uy +
      this.hash(ix + 1, iy + 1) * ux * uy
    );
  }

  private fbm(x: number, y: number) {
    let v = 0;
    let amp = 0.5;
    let freq = 1.0;

    for (let i = 0; i < 5; i++) {
      v += amp * this.noise(x * freq, y * freq);
      amp *= 0.45;
      freq *= 2.1;
    }

    return v;
  }

  private warpedFbm(x: number, y: number, t: number) {
    const pSway = 0.68;
    const pSpiral = 0.29;
    const pFractal = 0.97;
    const pRidges = 0.88;
    const pRings = 0.47;

    const rot = t * 0.015 * pSpiral;
    const rx = x * Math.cos(rot) - y * Math.sin(rot);
    const ry = x * Math.sin(rot) + y * Math.cos(rot);

    const tOx1 = t * 0.15 * (1 - pSway) + Math.sin(t * 0.05) * pSway;
    const tOy1 = -t * 0.1 * (1 - pSway) - Math.cos(t * 0.04) * pSway;
    const wx = this.fbm(rx + tOx1, ry + tOy1) * 1.4;

    const tOx2 = -t * 0.12 * (1 - pSway) - Math.cos(t * 0.03) * pSway;
    const tOy2 = t * 0.08 * (1 - pSway) + Math.sin(t * 0.06) * pSway;
    const wy = this.fbm(rx + 5.2 + tOx2, ry + 1.3 + tOy2) * 1.4;

    const wx2 = this.fbm(rx + wx + t * 0.06, ry + wy - t * 0.09) * 0.7;
    const wy2 = this.fbm(rx + wx + 8.1 + t * 0.04, ry + wy + 3.7 - t * 0.05) * 0.7;

    const wx3 = this.fbm(rx + wx + wx2 + t * 0.02, ry + wy + wy2 - t * 0.015) * 0.3 * pFractal;
    const wy3 = this.fbm(rx + wx + wx2 + 3.3 - t * 0.018, ry + wy + wy2 + 2.1 + t * 0.02) * 0.3 * pFractal;

    let val = this.fbm(rx + wx + wx2 + wx3, ry + wy + wy2 + wy3);
    const ridgeVal = Math.abs(val * 2.0 - 1.0);
    val = val * (1 - pRidges) + ridgeVal * pRidges;

    const ringVal = Math.sin(val * Math.PI * 2.5) * 0.5 + 0.5;
    val = val * (1 - pRings) + ringVal * pRings;

    return val;
  }

  private calibrate() {
    if (!this.gl) return;

    this.width = this.canvas.width = this.canvas.clientWidth || window.innerWidth;
    this.height = this.canvas.height = this.canvas.clientHeight || window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    const cols = Math.floor(this.width / this.spacing) + 1;
    const rows = Math.floor(this.height / this.spacing) + 1;
    const total = cols * rows;
    const fields = new Float32Array(total);
    let minVal = Infinity;
    let maxVal = -Infinity;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const f = this.warpedFbm(x * 0.008, y * 0.008, 0);
        fields[y * cols + x] = f;
        if (f < minVal) minVal = f;
        if (f > maxVal) maxVal = f;
      }
    }

    const bins = 256;
    const histogram = new Uint32Array(bins);
    const range = maxVal - minVal || 1;

    for (let i = 0; i < total; i++) {
      const bin = Math.min(bins - 1, Math.floor(((fields[i] - minVal) / range) * bins));
      histogram[bin]++;
    }

    const q1 = Math.floor(total * 0.4);
    const q2 = Math.floor(total * 0.6);
    const q3 = Math.floor(total * 0.8);
    let cum = 0;

    this.dotThreshold = minVal;
    this.midThreshold = minVal;
    this.solidThreshold = minVal;

    for (let b = 0; b < bins; b++) {
      cum += histogram[b];
      const val = minVal + (b / bins) * range;
      if (cum >= q1 && this.dotThreshold === minVal) this.dotThreshold = val;
      if (cum >= q2 && this.midThreshold === minVal) this.midThreshold = val;
      if (cum >= q3 && this.solidThreshold === minVal) this.solidThreshold = val;
    }
  }

  private scheduleCalibration() {
    if (this.calibrationTimer !== null) {
      window.clearTimeout(this.calibrationTimer);
    }

    this.calibrationTimer = window.setTimeout(() => {
      this.calibrationTimer = null;
      this.calibrate();
    }, 32);
  }

  private compileShader(type: number, source: string) {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private init() {
    if (!this.gl) return;

    const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_seed;
      uniform float u_dotThreshold;
      uniform float u_midThreshold;
      uniform float u_solidThreshold;

      const float spacing = 9.0;
      const float p_sway = 0.68;
      const float p_spiral = 0.29;
      const float p_fractal = 0.97;
      const float p_ridges = 0.88;
      const float p_rings = 0.47;

      float hash(vec2 p) {
        p = p + vec2(u_seed, u_seed * 0.7);
        p = fract(p * vec2(0.1311, 0.1417));
        p += dot(p, p.yx + 19.19);
        return fract((p.x + p.y) * p.x);
      }

      float hash_simple(vec2 p) {
        p = fract(p * vec2(0.1311, 0.1417));
        p += dot(p, p.yx + 19.19);
        return fract((p.x + p.y) * p.x);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float amp = 0.5;
        float freq = 1.0;
        for (int i = 0; i < 5; i++) {
          v += amp * noise(p * freq);
          amp *= 0.45;
          freq *= 2.1;
        }
        return v;
      }

      float warpedFbm(vec2 p, float t) {
        float rot = t * 0.015 * p_spiral;
        float c = cos(rot);
        float s = sin(rot);
        vec2 r = vec2(p.x * c - p.y * s, p.x * s + p.y * c);

        float tOx1 = (t * 0.15) * (1.0 - p_sway) + sin(t * 0.05) * p_sway;
        float tOy1 = (-t * 0.1) * (1.0 - p_sway) - cos(t * 0.04) * p_sway;
        float wx = fbm(r + vec2(tOx1, tOy1)) * 1.4;

        float tOx2 = (-t * 0.12) * (1.0 - p_sway) - cos(t * 0.03) * p_sway;
        float tOy2 = (t * 0.08) * (1.0 - p_sway) + sin(t * 0.06) * p_sway;
        float wy = fbm(r + vec2(5.2 + tOx2, 1.3 + tOy2)) * 1.4;
        vec2 w = vec2(wx, wy);

        float wx2 = fbm(r + w + vec2(t * 0.06, -t * 0.09)) * 0.7;
        float wy2 = fbm(r + w + vec2(8.1 + t * 0.04, 3.7 - t * 0.05)) * 0.7;
        vec2 w2 = vec2(wx2, wy2);

        float wx3 = fbm(r + w + w2 + vec2(t * 0.02, -t * 0.015)) * 0.3 * p_fractal;
        float wy3 = fbm(r + w + w2 + vec2(3.3 - t * 0.018, 2.1 + t * 0.02)) * 0.3 * p_fractal;
        vec2 w3 = vec2(wx3, wy3);

        float val = fbm(r + w + w2 + w3);
        float ridgeVal = abs(val * 2.0 - 1.0);
        val = val * (1.0 - p_ridges) + ridgeVal * p_ridges;

        float ringVal = sin(val * 3.14159 * 2.5) * 0.5 + 0.5;
        val = val * (1.0 - p_rings) + ringVal * p_rings;
        return val;
      }

      void main() {
        vec2 coord = gl_FragCoord.xy;
        vec2 subPos = mod(coord, spacing);

        float canvasY = u_resolution.y - coord.y;
        vec2 canvasGridPos = floor(vec2(coord.x, canvasY) / spacing);

        float field = warpedFbm(canvasGridPos * 0.008, u_time);

        if (field < u_dotThreshold || subPos.y >= spacing - 1.0 || subPos.y < 0.0) {
          gl_FragColor = vec4(0.01, 0.01, 0.01, 1.0);
          return;
        }

        bool rOn = false;
        bool gOn = false;
        bool bOn = false;

        if (field >= u_solidThreshold) {
          rOn = true; gOn = true; bOn = true;
        } else if (field >= u_midThreshold) {
          float pickHash = hash_simple(canvasGridPos * vec2(3.1, 7.3));
          int pick = int(mod(floor(pickHash * 3.0), 3.0));
          if (pick == 0) { rOn = true; gOn = true; }
          else if (pick == 1) { gOn = true; bOn = true; }
          else { rOn = true; bOn = true; }
        } else {
          float pickHash = hash_simple(canvasGridPos * vec2(5.7, 2.9));
          int pick = int(mod(floor(pickHash * 3.0), 3.0));
          if (pick == 0) rOn = true;
          else if (pick == 1) gOn = true;
          else bOn = true;
        }

        float intensity = 0.0;
        if (field >= u_solidThreshold) {
          intensity = 0.75 + ((field - u_solidThreshold) * 2.0);
          intensity = min(1.0, intensity);
        } else if (field >= u_midThreshold) {
          intensity = 0.5 + ((field - u_midThreshold) / (u_solidThreshold - u_midThreshold)) * 0.3;
        } else {
          intensity = 0.3 + ((field - u_dotThreshold) / (u_midThreshold - u_dotThreshold)) * 0.3;
        }

        vec3 color = vec3(0.01, 0.01, 0.01);

        if (subPos.x >= 0.0 && subPos.x < 2.0) {
          if (rOn) color = vec3(intensity, 0.0, 0.0);
        } else if (subPos.x >= 3.0 && subPos.x < 5.0) {
          if (gOn) color = vec3(0.0, intensity * 0.85, 0.0);
        } else if (subPos.x >= 6.0 && subPos.x < 8.0) {
          if (bOn) color = vec3(0.0, 0.0, min(1.0, intensity * 1.3));
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    this.shaderProgram = this.gl.createProgram();
    if (!this.shaderProgram) return;

    this.gl.attachShader(this.shaderProgram, vertexShader);
    this.gl.attachShader(this.shaderProgram, fragmentShader);
    this.gl.linkProgram(this.shaderProgram);

    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) return;

    this.programInfo = {
      program: this.shaderProgram,
      attribLocations: {
        vertexPosition: this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition")
      },
      uniformLocations: {
        resolution: this.gl.getUniformLocation(this.shaderProgram, "u_resolution"),
        time: this.gl.getUniformLocation(this.shaderProgram, "u_time"),
        seed: this.gl.getUniformLocation(this.shaderProgram, "u_seed"),
        dotThreshold: this.gl.getUniformLocation(this.shaderProgram, "u_dotThreshold"),
        midThreshold: this.gl.getUniformLocation(this.shaderProgram, "u_midThreshold"),
        solidThreshold: this.gl.getUniformLocation(this.shaderProgram, "u_solidThreshold")
      }
    };

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]),
      this.gl.STATIC_DRAW
    );

  }

  resize() {
    if (!this.gl) return;
    this.width = this.canvas.width = this.canvas.clientWidth || window.innerWidth;
    this.height = this.canvas.height = this.canvas.clientHeight || window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.scheduleCalibration();
  }

  render() {
    if (!this.gl || !this.programInfo || !this.positionBuffer) return;

    this.gl.clearColor(0.01, 0.01, 0.01, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.programInfo.program);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);

    this.gl.uniform2f(this.programInfo.uniformLocations.resolution, this.canvas.width, this.canvas.height);
    this.gl.uniform1f(this.programInfo.uniformLocations.time, this.time);
    this.gl.uniform1f(this.programInfo.uniformLocations.seed, this.seed);
    this.gl.uniform1f(this.programInfo.uniformLocations.dotThreshold, this.dotThreshold);
    this.gl.uniform1f(this.programInfo.uniformLocations.midThreshold, this.midThreshold);
    this.gl.uniform1f(this.programInfo.uniformLocations.solidThreshold, this.solidThreshold);

    this.gl.disable(this.gl.BLEND);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    this.time += 0.0015;
    this.animationFrameId = window.requestAnimationFrame(this.render);
  }

  start() {
    if (!this.gl) return;
    window.addEventListener("resize", this.resize);
    this.resize();
    if (!this.animationFrameId) this.render();
  }

  stop() {
    if (this.calibrationTimer !== null) {
      window.clearTimeout(this.calibrationTimer);
      this.calibrationTimer = null;
    }

    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener("resize", this.resize);
  }
}

interface LEDSwarmProps {
  className?: string;
}

export default function LEDSwarm({ className = "" }: LEDSwarmProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new LEDSwarmRenderer(canvas);
    renderer.start();

    return () => renderer.stop();
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
