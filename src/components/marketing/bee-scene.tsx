"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MARKETING_ASSETS } from "@/lib/marketing";

type Keyframe = {
  x: number;
  y: number;
  s: number;
  yaw: number;
  pitch: number;
  roll: number;
};

type Target = Keyframe & { moving: number };

type BeeAssets = {
  model: THREE.Group;
  wingTexture: THREE.CanvasTexture;
};

let assetsPromise: Promise<BeeAssets> | null = null;

const HOME_DESKTOP: Keyframe[] = [
  { x: -0.03, y: -0.12, s: 1, yaw: 150, pitch: 6, roll: -4 },
  { x: -0.3, y: -0.04, s: 1, yaw: 125, pitch: 10, roll: 6 },
  { x: 0.22, y: -0.3, s: 1, yaw: 40, pitch: -6, roll: -8 },
  { x: -0.22, y: 0.02, s: 0.96, yaw: 160, pitch: 8, roll: 4 },
  { x: 0.02, y: -0.08, s: 0.92, yaw: 105, pitch: 4, roll: 0 },
];

const HOME_MOBILE: Keyframe[] = [
  { x: 0.05, y: -0.02, s: 0.75, yaw: 150, pitch: 6, roll: -4 },
  { x: 0.1, y: 0.12, s: 0.8, yaw: 125, pitch: 10, roll: 6 },
  { x: 0.15, y: -0.2, s: 0.75, yaw: 40, pitch: -6, roll: -8 },
  { x: 0.25, y: 0.2, s: 0.72, yaw: 160, pitch: 8, roll: 4 },
  { x: 0, y: 0.1, s: 0.7, yaw: 105, pitch: 4, roll: 0 },
];

const INNER_DESKTOP: Keyframe[] = [
  { x: -0.22, y: -0.08, s: 0.92, yaw: 145, pitch: 6, roll: -4 },
  { x: 0.24, y: -0.16, s: 0.96, yaw: 55, pitch: -5, roll: 7 },
  { x: -0.12, y: 0.04, s: 0.9, yaw: 165, pitch: 7, roll: -5 },
];

const INNER_MOBILE: Keyframe[] = [
  { x: 0.08, y: -0.04, s: 0.7, yaw: 150, pitch: 5, roll: -3 },
  { x: 0.16, y: -0.18, s: 0.72, yaw: 60, pitch: -4, roll: 6 },
  { x: 0.05, y: 0.12, s: 0.68, yaw: 160, pitch: 6, roll: -4 },
];

function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerpAngle(a: number, b: number, t: number): number {
  const delta = ((b - a + 540) % 360) - 180;
  return a + delta * t;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function targetAt(progress: number, keys: Keyframe[]): Target {
  const value = Number.isFinite(progress) ? progress : 0;
  const clamped = Math.max(0, Math.min(value, keys.length - 1));
  const index = Math.min(keys.length - 2, Math.floor(clamped));
  const fraction = clamped - index;
  const t = ease(Math.max(0, Math.min((fraction - 0.12) / 0.76, 1)));
  const a = keys[index];
  const b = keys[Math.min(index + 1, keys.length - 1)];
  const moving = Math.sin(t * Math.PI);

  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t) + moving * -0.22,
    s: lerp(a.s, b.s, t) * (1 + moving * 0.12),
    yaw: lerpAngle(a.yaw, b.yaw, t),
    pitch: lerp(a.pitch, b.pitch, t),
    roll: lerp(a.roll, b.roll, t),
    moving,
  };
}

function keyframesFor(pathname: string, mobile: boolean): Keyframe[] {
  if (pathname === "/") return mobile ? HOME_MOBILE : HOME_DESKTOP;
  return mobile ? INNER_MOBILE : INNER_DESKTOP;
}

function loadWingTexture(image: HTMLImageElement): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 576;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = pixels.data;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const luminance = (red * 0.3 + green * 0.59 + blue * 0.11) / 255;
    const alpha = Math.max(0, Math.min((luminance - 0.035) * 4.2, 1)) * 255;
    data[index] = Math.min(255, red * 1.5 + 30);
    data[index + 1] = Math.min(255, green * 1.5 + 30);
    data[index + 2] = Math.min(255, blue * 1.5 + 40);
    data[index + 3] = alpha;
  }

  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function getBeeAssets(): Promise<BeeAssets> {
  if (!assetsPromise) {
    assetsPromise = (async () => {
      const gltf = await new GLTFLoader().loadAsync(MARKETING_ASSETS.beeGlb);
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = MARKETING_ASSETS.wingTexture;
      await new Promise<void>((resolve, reject) => {
        if (image.complete && image.naturalWidth > 0) {
          resolve();
          return;
        }
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Wing texture failed to load."));
      });

      return {
        model: gltf.scene as THREE.Group,
        wingTexture: loadWingTexture(image),
      };
    })().catch((error) => {
      assetsPromise = null;
      throw error;
    });
  }
  return assetsPromise;
}

type Flap = { group: THREE.Group; phase: number };

function buildWings(
  beeRoot: THREE.Group,
  anchor: THREE.Vector3,
  texture: THREE.CanvasTexture,
): Flap[] {
  const flaps: Flap[] = [];
  const wings = [
    { span: 0.72, sweep: -0.42, phase: 0, lift: 0.02 },
    { span: 0.52, sweep: -0.95, phase: -0.5, lift: -0.01 },
  ];
  const copies = [
    { offset: 0, opacity: 0.95 },
    { offset: 0.55, opacity: 0.28 },
    { offset: -0.55, opacity: 0.28 },
  ];

  for (const side of [1, -1]) {
    const sideRoot = new THREE.Group();
    sideRoot.position.copy(anchor);
    sideRoot.scale.z = side;
    beeRoot.add(sideRoot);

    for (const wing of wings) {
      const sweep = new THREE.Group();
      sweep.rotation.y = wing.sweep;
      sweep.position.y = wing.lift;
      sideRoot.add(sweep);

      const geometry = new THREE.PlaneGeometry(wing.span, (wing.span * 9) / 16);
      geometry.translate(wing.span / 2 - wing.span * 0.03, 0, 0);
      geometry.rotateX(-Math.PI / 2);
      geometry.rotateY(-Math.PI / 2);

      for (const copy of copies) {
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: copy.opacity,
          side: THREE.DoubleSide,
          depthWrite: false,
          color: 0xffffff,
          blending: THREE.NormalBlending,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        const flap = new THREE.Group();
        flap.add(mesh);
        sweep.add(flap);
        flaps.push({ group: flap, phase: wing.phase + copy.offset });
      }
    }
  }

  return flaps;
}

export function BeeScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let frame = 0;
    let scene: THREE.Scene | null = null;

    const rendererInstance = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    rendererInstance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererInstance.outputColorSpace = THREE.SRGBColorSpace;
    rendererInstance.toneMapping = THREE.ACESFilmicToneMapping;
    rendererInstance.toneMappingExposure = 1.15;

    scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(rendererInstance);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    scene.add(new THREE.HemisphereLight(0xf2eeff, 0x7a62c9, 1.3));
    const warm = new THREE.DirectionalLight(0xfff1d6, 2.6);
    warm.position.set(3, 5, 6);
    scene.add(warm);
    const cool = new THREE.DirectionalLight(0xc8b8ff, 2.2);
    cool.position.set(-5, 2, -4);
    scene.add(cool);

    const flight = new THREE.Group();
    const beeRoot = new THREE.Group();
    flight.add(beeRoot);
    scene.add(flight);

    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const onResize = () => {
      rendererInstance.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    onResize();
    window.addEventListener("resize", onResize);

    let assets: BeeAssets | null = null;
    let flaps: Flap[] = [];

    getBeeAssets()
      .then((loaded) => {
        if (disposed) return;
        assets = loaded;
        const holder = new THREE.Group();
        beeRoot.add(holder);
        holder.add(loaded.model);
        loaded.model.rotation.set(0, Math.PI / 2, 0);

        loaded.model.traverse((object) => {
          const mesh = object as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.frustumCulled = false;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const material of materials) {
            const standard = material as THREE.MeshStandardMaterial;
            if ("envMapIntensity" in standard) standard.envMapIntensity = 0.7;
          }
        });

        const initialBox = new THREE.Box3().setFromObject(holder);
        const size = initialBox.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        holder.scale.setScalar(1 / maxDimension);

        const scaledBox = new THREE.Box3().setFromObject(holder);
        const center = scaledBox.getCenter(new THREE.Vector3());
        holder.position.sub(center);

        const finalBox = new THREE.Box3().setFromObject(holder);
        const anchor = new THREE.Vector3(
          finalBox.min.x + (finalBox.max.x - finalBox.min.x) * 0.66,
          finalBox.max.y * 0.86,
          (finalBox.max.z - finalBox.min.z) * 0.05,
        );

        flaps = buildWings(beeRoot, anchor, loaded.wingTexture);
        canvas.classList.add("ready");

        const keys = keyframesFor(pathname, window.innerWidth < 760);
        const current = targetAt(0, keys);
        const clock = new THREE.Clock();
        const radians = Math.PI / 180;

        function animate() {
          if (disposed || !assets) return;
          frame = window.requestAnimationFrame(animate);

          const delta = Math.min(clock.getDelta(), 0.05);
          const elapsed = clock.getElapsedTime();
          const progress = window.scrollY / window.innerHeight;
          const target = targetAt(progress, keys);

          const easePosition = 1 - Math.exp(-delta * 3.2);
          const easeYaw = 1 - Math.exp(-delta * 2.6);
          const previousX = current.x;
          const previousY = current.y;

          current.x += (target.x - current.x) * easePosition;
          current.y += (target.y - current.y) * easePosition;
          current.s += (target.s - current.s) * easePosition;
          current.pitch += (target.pitch - current.pitch) * easePosition;
          current.roll += (target.roll - current.roll) * easePosition;
          current.yaw += lerpAngle(current.yaw, target.yaw, easeYaw);

          const velocityX = delta > 0 ? (current.x - previousX) / delta : 0;
          const velocityY = delta > 0 ? (current.y - previousY) / delta : 0;

          pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-delta * 2));
          pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-delta * 2));

          const halfHeight = Math.tan((camera.fov * radians) / 2) * camera.position.z;
          const halfWidth = halfHeight * camera.aspect;
          const hover = Math.sin(elapsed * 2.1) * 0.045 + Math.sin(elapsed * 3.7) * 0.015;

          flight.position.set(
            current.x * halfWidth + Math.sin(elapsed * 1.3) * 0.04 + pointer.sx * 0.12,
            current.y * halfHeight + hover * halfHeight * 0.5 + pointer.sy * 0.08,
            Math.sin(elapsed * 0.9) * 0.15,
          );
          flight.scale.setScalar(halfHeight * 2 * 0.3 * current.s);
          flight.rotation.set(0, -(current.yaw + pointer.sx * 12) * radians, 0);

          const pitch = current.pitch - Math.max(-28, Math.min(28, velocityY * 22)) + Math.sin(elapsed * 2.1 + 1) * 3 + pointer.sy * 6;
          const roll = current.roll + Math.max(-30, Math.min(30, velocityX * 18)) + Math.sin(elapsed * 1.7) * 4;
          beeRoot.rotation.set(roll * radians, 0, pitch * radians, "YZX");

          const frequency = Math.PI * 2 * (17 + target.moving * 5);
          for (const flap of flaps) {
            const wave = Math.sin(elapsed * frequency + flap.phase);
            flap.group.rotation.x = -0.25 + wave * 0.95;
            flap.group.rotation.y = wave * 0.18;
          }

          rendererInstance.render(scene!, camera);
        }

        animate();
      })
      .catch(() => {
        canvas.classList.remove("ready");
      });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      canvas.classList.remove("ready");
      if (scene) {
        scene.traverse((object) => {
          const mesh = object as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry?.dispose();
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const material of materials) material?.dispose();
        });
      }
      pmrem.dispose();
      rendererInstance.dispose();
    };
  }, [pathname]);

  return <canvas ref={canvasRef} id="bee" aria-hidden="true" />;
}
