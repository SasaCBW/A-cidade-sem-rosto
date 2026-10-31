import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createLighting(scene) {

  // =========================================
  // CONFIGURAÇÕES DO AMBIENTE
  // =========================================

  scene.background = new THREE.Color(0x080d14);

  scene.fog = new THREE.FogExp2(
    0x101923,
    0.012
  );

  // =========================================
  // LUZ AMBIENTE
  // =========================================

  const ambient = new THREE.HemisphereLight(
    0x71839a,
    0x171a1d,
    0.45
  );

  scene.add(ambient);

  // =========================================
  // LUAR
  // =========================================

  const moon = new THREE.DirectionalLight(
    0x9aadc9,
    1.1
  );

  moon.position.set(
    -35,
    55,
    -45
  );

  moon.castShadow = true;

  moon.shadow.mapSize.width = 2048;
  moon.shadow.mapSize.height = 2048;

  moon.shadow.camera.left = -100;
  moon.shadow.camera.right = 100;
  moon.shadow.camera.top = 100;
  moon.shadow.camera.bottom = -100;

  moon.shadow.camera.near = 1;
  moon.shadow.camera.far = 180;

  moon.shadow.bias = -0.0002;

  scene.add(moon);

  // =========================================
  // LUZ SECUNDÁRIA
  // =========================================

  const secondaryLight = new THREE.DirectionalLight(
    0x53677d,
    0.25
  );

  secondaryLight.position.set(
    40,
    20,
    30
  );

  scene.add(secondaryLight);

  // =========================================
  // LUZES DISTANTES
  // =========================================

  const distantLights = [];

  const lightPositions = [
    [-15, 3, -18],
    [15, 3, -42],
    [-12, 3, -68],
    [13, 3, -95],
    [-14, 3, -120]
  ];

  lightPositions.forEach(position => {

    const light = new THREE.PointLight(
      0x7895b4,
      0.55,
      18,
      2
    );

    light.position.set(
      position[0],
      position[1],
      position[2]
    );

    scene.add(light);

    distantLights.push(light);

  });

  // =========================================
  // LUZES DE ALERTA
  // =========================================

  const warningLights = [];

  const warningPositions = [
    [-18, 2.5, -32],
    [18, 2.5, -75],
    [-18, 2.5, -105]
  ];

  warningPositions.forEach(position => {

    const light = new THREE.PointLight(
      0x8b3434,
      0.5,
      10,
      2
    );

    light.position.set(
      position[0],
      position[1],
      position[2]
    );

    scene.add(light);

    warningLights.push(light);

  });

  // =========================================
  // ESTRELAS DISTANTES
  // =========================================

  const starGeometry = new THREE.BufferGeometry();

  const starPositions = [];

  for (let i = 0; i < 350; i++) {

    const x = (Math.random() - 0.5) * 250;

    const y = 35 + Math.random() * 65;

    const z = -40 - Math.random() * 180;

    starPositions.push(x, y, z);

  }

  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      starPositions,
      3
    )
  );

  const starMaterial = new THREE.PointsMaterial({
    color: 0xc4d1df,
    size: 0.12,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true
  });

  const stars = new THREE.Points(
    starGeometry,
    starMaterial
  );

  scene.add(stars);

  // =========================================
  // ATUALIZAÇÃO DA ILUMINAÇÃO
  // =========================================

  let elapsed = 0;

  function update(delta) {

    elapsed += Math.min(delta, 0.05);

    // Pequena oscilação das luzes distantes.
    distantLights.forEach((light, index) => {

      light.intensity =
        0.48 +
        Math.sin(elapsed * 1.4 + index) * 0.08;

    });

    // Algumas luzes de alerta piscam suavemente.
    warningLights.forEach((light, index) => {

      light.intensity =
        0.35 +
        Math.max(
          0,
          Math.sin(elapsed * 2.1 + index * 2)
        ) * 0.5;

    });

  }

  // =========================================
  // CONTROLE DA INTENSIDADE NOTURNA
  // =========================================

  function setNightIntensity(value) {

    const intensity = THREE.MathUtils.clamp(
      value,
      0,
      2
    );

    ambient.intensity = intensity * 0.45;

    moon.intensity = intensity * 1.1;

    secondaryLight.intensity = intensity * 0.25;

  }

  // =========================================
  // DESTRUIR ILUMINAÇÃO
  // =========================================

  function destroy() {

    scene.remove(ambient);
    scene.remove(moon);
    scene.remove(secondaryLight);
    scene.remove(stars);

    distantLights.forEach(light => {
      scene.remove(light);
    });

    warningLights.forEach(light => {
      scene.remove(light);
    });

    starGeometry.dispose();
    starMaterial.dispose();

  }

  return {

    ambient,
    moon,
    secondaryLight,

    distantLights,
    warningLights,

    update,
    setNightIntensity,
    destroy

  };

}
