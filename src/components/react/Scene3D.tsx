import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import type { Group, Mesh } from 'three';

type Variant = 'hero' | 'freelance' | 'mesh' | 'gem';

// Follows the pointer smoothly so the whole object leans toward the cursor.
function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.pow(0.001, delta);
    g.rotation.y += (state.pointer.x * 0.45 - g.rotation.y) * k;
    g.rotation.x += (-state.pointer.y * 0.3 - g.rotation.x) * k;
  });
  return <group ref={ref}>{children}</group>;
}

function Spin({ speed = 0.15, axis = 'y', children }: { speed?: number; axis?: 'x' | 'y' | 'z'; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation[axis] += delta * speed;
  });
  return <group ref={ref}>{children}</group>;
}

function Core() {
  const wire = useRef<Mesh>(null);
  useFrame((_, d) => {
    if (wire.current) {
      wire.current.rotation.x -= d * 0.08;
      wire.current.rotation.y += d * 0.12;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.9}>
      <mesh>
        <icosahedronGeometry args={[1.25, 64]} />
        <MeshDistortMaterial color="#a8a8a8" metalness={0.35} roughness={0.3} distort={0.38} speed={1.6} />
      </mesh>
      <mesh ref={wire} scale={1.6}>
        <icosahedronGeometry args={[1.25, 2]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.08} />
      </mesh>
      <Spin speed={0.25} axis="z">
        <mesh rotation={[Math.PI / 2.4, 0.2, 0]}>
          <torusGeometry args={[2.35, 0.006, 16, 220]} />
          <meshBasicMaterial color="#d4d4d4" transparent opacity={0.35} />
        </mesh>
      </Spin>
      <Spin speed={-0.18} axis="y">
        <mesh rotation={[Math.PI / 1.7, 0.6, 0]}>
          <torusGeometry args={[2.75, 0.004, 16, 220]} />
          <meshBasicMaterial color="#a3a3a3" transparent opacity={0.25} />
        </mesh>
        <mesh position={[2.75, 0, 0]}>
          <sphereGeometry args={[0.06, 24, 24]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} />
        </mesh>
      </Spin>
    </Float>
  );
}

function Knot() {
  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={0.8}>
      <Spin speed={0.2}>
        <mesh>
          <torusKnotGeometry args={[1, 0.32, 240, 32, 2, 3]} />
          <meshStandardMaterial color="#b5b5b5" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh scale={1.18}>
          <torusKnotGeometry args={[1, 0.32, 120, 12, 2, 3]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.07} />
        </mesh>
      </Spin>
    </Float>
  );
}


// A rotating network of services with events (bright dots) travelling between them.
function ServiceMesh() {
  const { pts, edges, geo } = useMemo(() => {
    const n = 24;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pts: Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      pts.push(new Vector3(Math.cos(golden * i) * r, y, Math.sin(golden * i) * r).multiplyScalar(2));
    }
    const seen = new Set<string>();
    const edges: [number, number][] = [];
    pts.forEach((p, i) => {
      pts
        .map((q, j) => [j, p.distanceTo(q)] as const)
        .filter(([j]) => j !== i)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3)
        .forEach(([j]) => {
          const k = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!seen.has(k)) {
            seen.add(k);
            edges.push([i, j]);
          }
        });
    });
    const arr = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], e) => {
      pts[a].toArray(arr, e * 6);
      pts[b].toArray(arr, e * 6 + 3);
    });
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(arr, 3));
    return { pts, edges, geo };
  }, []);

  const dots = useRef<Mesh[]>([]);
  const flow = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({ e: (i * 7) % edges.length, t: (i * 0.137) % 1, s: 0.25 + ((i * 31) % 10) / 28 })),
    [edges.length],
  );
  useFrame((_, d) => {
    flow.forEach((f, i) => {
      f.t += d * f.s;
      if (f.t > 1) {
        f.t = 0;
        f.e = (f.e * 5 + 3 + i) % edges.length;
      }
      const [a, b] = edges[f.e];
      dots.current[i]?.position.lerpVectors(pts[a], pts[b], f.t);
    });
  });

  return (
    <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.6}>
      <Spin speed={0.12}>
        <lineSegments geometry={geo}>
          <lineBasicMaterial color="#d4d4d4" transparent opacity={0.28} />
        </lineSegments>
        {pts.map((p, i) => (
          <mesh key={i} position={p} scale={i % 6 === 0 ? 1.9 : 1}>
            <octahedronGeometry args={[0.1, 0]} />
            <meshStandardMaterial color={i % 6 === 0 ? '#ffffff' : '#a8a8a8'} metalness={0.6} roughness={0.3} emissive="#ffffff" emissiveIntensity={i % 6 === 0 ? 0.9 : 0.15} />
          </mesh>
        ))}
        {flow.map((_, i) => (
          <mesh key={`f${i}`} ref={(m) => { if (m) dots.current[i] = m; }}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
        <mesh>
          <icosahedronGeometry args={[1.9, 1]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.035} />
        </mesh>
      </Spin>
    </Float>
  );
}

// A faceted metal gem with a wire shell and a slow orbiting ring.
function Gem() {
  return (
    <Float speed={1.3} rotationIntensity={0.5} floatIntensity={0.8}>
      <Spin speed={0.22}>
        <mesh>
          <dodecahedronGeometry args={[1.25, 0]} />
          <meshStandardMaterial color="#c4c4c4" metalness={0.95} roughness={0.18} flatShading />
        </mesh>
        <mesh scale={1.35}>
          <dodecahedronGeometry args={[1.25, 0]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
        </mesh>
      </Spin>
      <Spin speed={0.3} axis="z">
        <mesh rotation={[Math.PI / 2.3, 0.3, 0]}>
          <torusGeometry args={[2.1, 0.008, 16, 200]} />
          <meshBasicMaterial color="#e5e5e5" transparent opacity={0.4} />
        </mesh>
        <mesh position={[2.1, 0, 0]} rotation={[0.6, 0.4, 0]}>
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.4} />
        </mesh>
      </Spin>
    </Float>
  );
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

// Grey sphere drawn with CSS, used when WebGL is unavailable.
function Fallback() {
  return (
    <div className="grid size-full place-items-center">
      <div className="size-64 rounded-full bg-[radial-gradient(circle_at_30%_30%,#e5e5e5,#525252_45%,#0a0a0a_75%)] opacity-80 shadow-[0_0_120px_-20px_rgba(255,255,255,.35)] animate-float" />
    </div>
  );
}

export default function Scene3D({ variant = 'hero' }: { variant?: Variant }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [ok, setOk] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setOk(hasWebGL());
    setStill(matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = wrap.current;
    if (!el) return;
    // Stop rendering while the canvas is off screen to save battery.
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="size-full" aria-hidden="true">
      {ok === false && <Fallback />}
      {ok && (
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 6.2], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          frameloop={still || !visible ? 'demand' : 'always'}
          className="animate-in fade-in duration-1000"
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 5, 3]} intensity={2.2} color="#ffffff" />
          <directionalLight position={[-5, -2, -3]} intensity={0.9} color="#a3a3a3" />
          <pointLight position={[0, 0, 4]} intensity={6} color="#f5f5f5" distance={10} />
          <Rig>{variant === 'hero' ? <Core /> : variant === 'mesh' ? <ServiceMesh /> : variant === 'gem' ? <Gem /> : <Knot />}</Rig>
          <Sparkles count={variant === 'hero' ? 90 : 60} scale={[9, 6, 4]} size={1.6} speed={0.3} opacity={0.5} color="#e5e5e5" />
        </Canvas>
      )}
    </div>
  );
}
