"use client";

export function Lighting() {
  return (
    <>
      {/* Main key light */}
      <spotLight
        position={[5, 8, 5]}
        angle={0.3}
        penumbra={1}
        intensity={3.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        color="#fff8f0"
      />

      {/* Fill light */}
      <spotLight
        position={[-5, 5, -4]}
        angle={0.5}
        penumbra={1}
        intensity={1.3}
        color="#e8d8c8"
      />

      {/* Rim light */}
      <spotLight
        position={[0, 5, -8]}
        angle={0.35}
        penumbra={1}
        intensity={2.2}
        color="#d4af37"
      />

      {/* Top accent */}
      <pointLight position={[0, 6, 0]} intensity={1.1} color="#ffffff" distance={12} />

      {/* Gold accent lights */}
      <pointLight position={[3, 2, 3]} intensity={0.55} color="#d4af37" distance={5} />
      <pointLight position={[-3, 2, 3]} intensity={0.55} color="#d4af37" distance={5} />

      {/* Ambient */}
      <ambientLight intensity={0.1} color="#c8d4e8" />
    </>
  );
}
