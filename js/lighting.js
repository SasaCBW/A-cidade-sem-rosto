import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createLighting(scene) {

  // ================================================
  // LUZ AMBIENTE
  // ================================================

  const ambient = new THREE.HemisphereLight(
    0x9aadc9,
    0x171923,
    0.8
  );

  scene.add(ambient);

  // ================================================
  // LUZ DA LUA
  // ================================================

  const moon = new THREE.DirectionalLight(
    0x9bb8e8,
    1.8
  );

  moon.position.set(-35, 55, 25);

  moon.castShadow = true;

  moon.shadow.mapSize.width = 2048;
  moon.shadow.mapSize.height = 2048;

  moon.shadow.camera.left = -100;
  moon.shadow.camera.right = 100;
  moon.shadow.camera.top = 100;
  moon.shadow.camera.bottom = -100;

  moon.shadow.camera.near = 0.5;
  moon.shadow.camera.far = 150;

  moon.shadow.bias = -0.0002;

  scene.add(moon);

  // ================================================
  // LUZ SECUNDÁRIA
  // ================================================

  const secondaryLight = new THREE.DirectionalLight(
    0x344b70,
    0.45
  );

  secondaryLight.position.set(
    35,
    20,
    -45
  );

  scene.add(secondaryLight);

  // ================================================
  // NEBLINA NOTURNA
  // ================================================

  scene.fog = new THREE.FogExp2(
    0x101722,
    0.012
  );

  // ================================================
  // CONFIGURAÇÕES DO CÉU
  // ================================================

  scene.background = new THREE.Color(
    0x101722
  );

  // ================================================
  // LUZES DECORATIVAS DISTANTES
  // ================================================

  const distantLights = [];

  const lightPositions = [
    [-18, 5, -25],
    [22, 5, -45],
    [-30, 5, -70],
    [35, 5, -90]
  ];

  lightPositions.forEach(position => {

    const light = new THREE.PointLight(
      0x657fa8,
      0.7,
      28,
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

  // ================================================
  // LUZES DE POSTES
  // ================================================

  const streetLights = [];

  for (let i = 0; i < 8; i++) {

    const x = i % 2 === 0 ? -9 : 9;
    const z = -12 - Math.floor(i / 2) * 25;

    const light = new THREE.PointLight(
      0xffd69a,
      1.4,
      17,
      2
    );

    light.position.set(
      x,
      5.5,
      z
    );

    light.castShadow = false;

    scene.add(light);

    streetLights.push(light);

  }

  // ================================================
  // RETORNO DO SISTEMA
  // ================================================

  return {

    ambient,

    moon,

    secondaryLight,

    distantLights,

    streetLights,

    setNightIntensity(value) {

      const intensity = THREE.MathUtils.clamp(
        value,
        0,
        2
      );

      ambient.intensity = 0.8 * intensity;
      moon.intensity = 1.8 * intensity;

    },

    update(delta) {

      // Pequena oscilação das luzes distantes.
      const time = performance.now() * 0.001;

      streetLights.forEach((light, index) => {

        light.intensity =
          1.4 + Math.sin(time * 2 + index) * 0.08;

      });

    },

    destroy() {

      scene.remove(ambient);
      scene.remove(moon);
      scene.remove(secondaryLight);

      distantLights.forEach(light => {
        scene.remove(light);
      });

      streetLights.forEach(light => {
        scene.remove(light);
      });

    }

  };

}
