import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createApparition(scene) {

  // ================================================
  // CONFIGURAÇÕES
  // ================================================

  const apparition = new THREE.Group();

  apparition.name = "AparicaoSemRosto";

  let active = false;
  let elapsed = 0;
  let disappearTimer = 0;

  const originalPosition = new THREE.Vector3();

  // ================================================
  // MATERIAIS
  // ================================================

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x111820,
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: 0.92
  });

  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0x090d12,
    roughness: 1,
    transparent: true,
    opacity: 0.98
  });

  const clothMaterial = new THREE.MeshStandardMaterial({
    color: 0x202832,
    roughness: 1,
    transparent: true,
    opacity: 0.85
  });

  // ================================================
  // CORPO
  // ================================================

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.42, 1.1, 6, 12),
    bodyMaterial
  );

  body.position.y = 1.1;

  body.castShadow = true;

  apparition.add(body);

  // ================================================
  // CABEÇA SEM ROSTO
  // ================================================

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.38,
      24,
      24
    ),
    headMaterial
  );

  head.scale.set(0.85, 1.15, 0.85);

  head.position.y = 2.05;

  head.castShadow = true;

  apparition.add(head);

  // ================================================
  // CAPUZ
  // ================================================

  const hood = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.46,
      24,
      24,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.75
    ),
    clothMaterial
  );

  hood.position.y = 2.12;

  hood.scale.set(1.05, 1.1, 1.05);

  apparition.add(hood);

  // ================================================
  // BRAÇOS
  // ================================================

  function createArm(side) {

    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.12,
        0.85,
        4,
        8
      ),
      clothMaterial
    );

    arm.position.set(
      side * 0.5,
      1.25,
      0
    );

    arm.rotation.z = side * -0.18;

    apparition.add(arm);

  }

  createArm(-1);
  createArm(1);

  // ================================================
  // LUZ SOMBRIA
  // ================================================

  const apparitionLight = new THREE.PointLight(
    0x526c91,
    0,
    7,
    2
  );

  apparitionLight.position.set(
    0,
    1.8,
    0.8
  );

  apparition.add(apparitionLight);

  // ================================================
  // PARTÍCULAS AO REDOR
  // ================================================

  const particleCount = 35;

  const particlePositions = new Float32Array(
    particleCount * 3
  );

  for (let i = 0; i < particleCount; i++) {

    particlePositions[i * 3] =
      (Math.random() - 0.5) * 2;

    particlePositions[i * 3 + 1] =
      Math.random() * 3;

    particlePositions[i * 3 + 2] =
      (Math.random() - 0.5) * 2;

  }

  const particleGeometry = new THREE.BufferGeometry();

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      particlePositions,
      3
    )
  );

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x9eb6cf,
    size: 0.045,
    transparent: true,
    opacity: 0.5,
    depthWrite: false
  });

  const particles = new THREE.Points(
    particleGeometry,
    particleMaterial
  );

  apparition.add(particles);

  // ================================================
  // POSICIONAMENTO
  // ================================================

  function appear(position) {

    if (active) return;

    active = true;

    elapsed = 0;

    disappearTimer = 0;

    apparition.position.copy(position);

    originalPosition.copy(position);

    apparition.visible = true;

    bodyMaterial.opacity = 0;
    headMaterial.opacity = 0;
    clothMaterial.opacity = 0;

    apparitionLight.intensity = 0;

    scene.add(apparition);

  }

  // ================================================
  // DESAPARECIMENTO
  // ================================================

  function disappear() {

    if (!active) return;

    active = false;

    apparition.visible = false;

    apparitionLight.intensity = 0;

    scene.remove(apparition);

  }

  // ================================================
  // ANIMAÇÃO
  // ================================================

  function update(delta, camera) {

    if (!active) return;

    const movement = Math.min(delta, 0.05);

    elapsed += movement;

    disappearTimer += movement;

    const fadeIn = Math.min(
      elapsed / 2,
      1
    );

    bodyMaterial.opacity = 0.92 * fadeIn;
    headMaterial.opacity = 0.98 * fadeIn;
    clothMaterial.opacity = 0.85 * fadeIn;

    apparitionLight.intensity =
      0.8 * fadeIn;

    // Movimento sutil.
    apparition.position.y =
      originalPosition.y +
      Math.sin(elapsed * 1.5) * 0.08;

    // A aparição observa o jogador.
    if (camera) {

      const target = new THREE.Vector3(
        camera.position.x,
        apparition.position.y,
        camera.position.z
      );

      apparition.lookAt(target);

    }

    // Movimento das partículas.
    const positions =
      particleGeometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {

      const index = i * 3;

      positions[index + 1] +=
        movement * 0.15;

      if (positions[index + 1] > 3) {
        positions[index + 1] = 0;
      }

    }

    particleGeometry.attributes.position.needsUpdate = true;

    // Desaparece depois de alguns segundos.
    if (disappearTimer > 12) {

      disappear();

    }

  }

  // ================================================
  // APARIÇÃO AUTOMÁTICA
  // ================================================

  function appearNearPlayer(camera) {

    if (!camera || active) return false;

    const direction = new THREE.Vector3();

    camera.getWorldDirection(direction);

    const position = camera.position.clone();

    position.add(
      direction.multiplyScalar(12)
    );

    position.y = 0;

    appear(position);

    return true;

  }

  // ================================================
  // CONTROLE MANUAL
  // ================================================

  function trigger(position) {

    if (position) {

      appear(
        position.clone
          ? position.clone()
          : new THREE.Vector3(
              position.x,
              position.y,
              position.z
            )
      );

      return true;

    }

    return false;

  }

  // ================================================
  // RETORNO
  // ================================================

  return {

    apparition,

    appear,

    disappear,

    appearNearPlayer,

    trigger,

    update,

    isActive: () => active,

    destroy() {

      disappear();

      body.geometry.dispose();
      head.geometry.dispose();
      hood.geometry.dispose();

      particles.geometry.dispose();

      bodyMaterial.dispose();
      headMaterial.dispose();
      clothMaterial.dispose();
      particleMaterial.dispose();

    }

  };

}
