import { Suspense, useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  Canvas,
  extend,
  useFrame,
  useLoader,
  useThree,
} from '@react-three/fiber';
import { TextureLoader } from 'three';
import whitedot from '/white_dot.png';
// import starTexture from '/2k_stars.jpg';
import galaxyTexture from '/2k_stars_milky_way.jpg';
import { Perf } from 'r3f-perf';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

extend({ OrbitControls });

const CameraControls = () => {
  const {
    camera,
    gl: { domElement },
  } = useThree();

  const controlsRef = useRef();
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = -0.2;
      controlsRef.current.update();
    }
  });
  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, domElement]}
    ></orbitControls>
  );
};

const Points = () => {
  const imgText = useLoader(TextureLoader, whitedot); // Texture for points
  const bufferRef = useRef();
  const count = 50;
  const separator = 1.5;

  let t = 0;
  const f = 0.003;
  const a = 5;
  const graph = useCallback(
    (x, z) => {
      return Math.sin(f * (x ** 2 + z ** 2 + t)) * a;
    },
    [t, f, a]
  );

  const positions = useMemo(() => {
    const positions = [];
    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        const x = separator * (xi - count / 2);
        const z = separator * (zi - count / 2);
        const y = graph(x, z);
        positions.push(x, y, z);
      }
    }
    return new Float32Array(positions);
  }, [count, separator, graph]);

  useFrame(() => {
    if (bufferRef.current) {
      t += 10;
      const positions = bufferRef.current.array;
      for (let xi = 0; xi < count; xi++) {
        for (let zi = 0; zi < count; zi++) {
          const x = separator * (xi - count / 2);
          const z = separator * (zi - count / 2);
          positions[(xi * count + zi) * 3 + 1] = graph(x, z);
        }
      }
      bufferRef.current.needsUpdate = true;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          ref={bufferRef}
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={imgText}
        blendColor={0x002344}
        // color={0xffffff} // White points for contrast
        size={0.2}
        sizeAttenuation
        transparent={true}
        alphaTest={0.1}
        opacity={1}
      />
    </points>
  );
};

const Background = () => {
  const galaxy = useLoader(TextureLoader, galaxyTexture);
  return (
    <mesh>
      <sphereGeometry args={[75, 16, 16]} />
      <meshBasicMaterial map={galaxy} side={THREE.BackSide} />
    </mesh>
  );
};

const Lighting = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[30, 40, 0]} intensity={1.2} />
    </>
  );
};

const App = () => {
  return (
    <div className="h-screen w-full bg-black">
      <Canvas camera={{ fov: 50, position: [75, 75, 80] }}>
        <Perf />
        <Suspense fallback={null}>
          <Background />
          <Lighting />
          <Points />
        </Suspense>
        <CameraControls />
      </Canvas>
    </div>
  );
};

export default App;
