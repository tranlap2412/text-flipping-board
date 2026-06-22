/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PointMaterial, Points } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as random from "maath/random";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const StarBackground = (props: any) => {
  const ref = useRef<THREE.Points>(null);
  const sphere = useMemo(
    () => random.inSphere(new Float32Array(1500 * 3), { radius: 1 }),
    [],
  );
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 20;
    ref.current.rotation.x += mouse.current.y * 0.003;
    ref.current.rotation.y += mouse.current.x * 0.003;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent
          color="#00a6f5"
          size={0.003}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const StarsCanvas = () => (
  <div className="absolute inset-0 pointer-events-none">
    <Canvas
      camera={{ position: [0, 0, 1] }}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <StarBackground />
      </Suspense>
    </Canvas>
  </div>
);

export default StarsCanvas;
