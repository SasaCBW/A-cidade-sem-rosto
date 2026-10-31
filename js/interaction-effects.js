import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createInteractionEffects(scene) {

  // ================================================
  // CONFIGURAÇÕES DAS PARTÍCULAS
  // ================================================

  const particleCount = 450;

  const positions = new Float32Array(
    particleCount * 3
  );

  const velocities = [];

  // ================================================
  // POSIÇÕES INICIAIS
  // ================================================

  for (let i = 0; i < particleCount; i++) {

    const x = (Math.random() - 0.5) * 90;
    const y = Math.random() * 12;
    const z = (Math.random() - 0.5) * 140;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    velocities.push({
      x: (Math.random() - 0.5) * 0.08,
      y: Math.random() * 0.12 + 0.02,
      z: (Math.random() - 0.5) * 0.08
    });

  }

  // ================================================
  // GEOMETRIA
  // ================================================

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  // ================================================
  // MATERIAL
  // ================================================

  const material = new THREE.PointsMaterial({

    color: 0xcbd5e1,

    size: 0.055,

    transparent: true,

    opacity: 0.42,

    depthWrite: false,

    blending: THREE.AdditiveBlending

  });

  // ================================================
  // SISTEMA DE PARTÍCULAS
  // ================================================

  const particles = new THREE.Points(
    geometry,
    material
  );

  particles.frustumCulled = false;

  scene.add(particles);

  // ================================================
  // PARTÍCULAS DE POEIRA
  // ================================================

  function update(delta) {

    const positionAttribute =
      geometry.attributes.position;

    const positionsArray =
      positionAttribute.array;

    const movement = Math.min(delta, 0.05);

    for (let i = 0; i < particleCount; i++) {

      const index = i * 3;

      positionsArray[index] +=
        velocities[i].x * movement;

      positionsArray[index + 1] +=
        velocities[i].y * movement;

      positionsArray[index + 2] +=
        velocities[i].z * movement;

      // Reposiciona partículas que saem da área.
      if (positionsArray[index + 1] > 13) {

        positionsArray[index + 1] = 0;

      }

      if (positionsArray[index] > 48) {
        positionsArray[index] = -48;
      }

      if (positionsArray[index] < -48) {
        positionsArray[index] = 48;
      }

      if (positionsArray[index + 2] > 75) {
        positionsArray[index + 2] = -75;
      }

      if (positionsArray[index + 2] < -75) {
        positionsArray[index + 2] = 75;
      }

    }

    positionAttribute.needsUpdate = true;

  }

  // ================================================
  // RETORNO
  // ================================================

  return {

    particles,

    update,

    destroy() {

      scene.remove(particles);

      geometry.dispose();
      material.dispose();

    }

  };

}
