import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createHospital(scene) {

  const hospital = new THREE.Group();

  hospital.name = "HospitalAbandonado";

  // ================================================
  // MATERIAIS
  // ================================================

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x555b5c,
    roughness: 0.95
  });

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x9b9a8c,
    roughness: 0.95
  });

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x252b30,
    roughness: 1
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x59636b,
    metalness: 0.65,
    roughness: 0.55
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x8ba8ad,
    transparent: true,
    opacity: 0.28,
    roughness: 0.15
  });

  const oldWhiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xd0cfc1,
    roughness: 0.9
  });

  // ================================================
  // FUNÇÃO PARA CRIAR OBJETOS
  // ================================================

  function createBox(
    width,
    height,
    depth,
    material,
    x,
    y,
    z
  ) {

    const geometry = new THREE.BoxGeometry(
      width,
      height,
      depth
    );

    const mesh = new THREE.Mesh(
      geometry,
      material
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    hospital.add(mesh);

    return mesh;

  }

  // ================================================
  // DIMENSÕES
  // ================================================

  const width = 22;
  const depth = 26;
  const height = 5;

  // ================================================
  // POSIÇÃO DO HOSPITAL
  // ================================================

  hospital.position.set(
    75,
    0,
    -35
  );

  // ================================================
  // PISO
  // ================================================

  createBox(
    width,
    0.3,
    depth,
    floorMaterial,
    0,
    0,
    0
  );

  // ================================================
  // PAREDES LATERAIS
  // ================================================

  createBox(
    0.5,
    height,
    depth,
    wallMaterial,
    -width / 2,
    height / 2,
    0
  );

  createBox(
    0.5,
    height,
    depth,
    wallMaterial,
    width / 2,
    height / 2,
    0
  );

  // ================================================
  // PAREDE DOS FUNDOS
  // ================================================

  createBox(
    width,
    height,
    0.5,
    wallMaterial,
    0,
    height / 2,
    -depth / 2
  );

  // ================================================
  // PAREDE DA FRENTE COM ENTRADA
  // ================================================

  createBox(
    7,
    height,
    0.5,
    wallMaterial,
    -7.5,
    height / 2,
    depth / 2
  );

  createBox(
    7,
    height,
    0.5,
    wallMaterial,
    7.5,
    height / 2,
    depth / 2
  );

  createBox(
    8,
    1,
    0.5,
    wallMaterial,
    0,
    4.5,
    depth / 2
  );

  // ================================================
  // TETO
  // ================================================

  createBox(
    width,
    0.3,
    depth,
    darkMaterial,
    0,
    height,
    0
  );

  // ================================================
  // CORREDOR CENTRAL
  // ================================================

  createBox(
    0.18,
    3.8,
    18,
    darkMaterial,
    -3,
    2,
    -2
  );

  createBox(
    0.18,
    3.8,
    18,
    darkMaterial,
    3,
    2,
    -2
  );

  // ================================================
  // DIVISÕES DAS SALAS
  // ================================================

  const roomPositions = [
    [-7, -5],
    [7, -5],
    [-7, 5],
    [7, 5]
  ];

  roomPositions.forEach(position => {

    const divider = createBox(
      7,
      3.8,
      0.18,
      wallMaterial,
      position[0],
      2,
      position[1]
    );

    divider.castShadow = true;

  });

  // ================================================
  // CAMAS HOSPITALARES
  // ================================================

  function createBed(x, z) {

    createBox(
      2.4,
      0.22,
      4,
      metalMaterial,
      x,
      0.65,
      z
    );

    createBox(
      2.2,
      0.3,
      3.5,
      oldWhiteMaterial,
      x,
      0.92,
      z
    );

    createBox(
      2.1,
      0.4,
      0.65,
      oldWhiteMaterial,
      x,
      1.25,
      z - 1.35
    );

    createBox(
      0.12,
      0.8,
      0.12,
      metalMaterial,
      x - 0.95,
      0.35,
      z - 1.6
    );

    createBox(
      0.12,
      0.8,
      0.12,
      metalMaterial,
      x + 0.95,
      0.35,
      z - 1.6
    );

  }

  createBed(-7.5, -8);
  createBed(7.5, -8);

  createBed(-7.5, 7);
  createBed(7.5, 7);

  // ================================================
  // ARMÁRIOS
  // ================================================

  function createCabinet(x, z) {

    createBox(
      1.5,
      2.5,
      0.9,
      metalMaterial,
      x,
      1.4,
      z
    );

    createBox(
      0.08,
      2,
      0.08,
      darkMaterial,
      x + 0.35,
      1.4,
      z + 0.5
    );

  }

  createCabinet(-9, -11);
  createCabinet(9, -11);

  // ================================================
  // JANELAS
  // ================================================

  function createWindow(x, z) {

    createBox(
      2.4,
      1.5,
      0.12,
      glassMaterial,
      x,
      2.8,
      z
    );

    createBox(
      2.5,
      0.12,
      0.2,
      metalMaterial,
      x,
      2,
      z
    );

    createBox(
      0.12,
      1.6,
      0.2,
      metalMaterial,
      x - 1.2,
      2.8,
      z
    );

    createBox(
      0.12,
      1.6,
      0.2,
      metalMaterial,
      x + 1.2,
      2.8,
      z
    );

  }

  createWindow(-10.65, -4);
  createWindow(10.65, -4);

  // ================================================
  // LUZES DO HOSPITAL
  // ================================================

  const hospitalLights = [];

  const lightPositions = [
    [-7, 4.2, -8],
    [7, 4.2, -8],
    [-7, 4.2, 7],
    [7, 4.2, 7],
    [0, 4.2, -1]
  ];

  lightPositions.forEach(position => {

    const light = new THREE.PointLight(
      0xb5c9d8,
      1.1,
      12,
      2
    );

    light.position.set(
      position[0],
      position[1],
      position[2]
    );

    hospital.add(light);

    hospitalLights.push(light);

  });

  // ================================================
  // PLACAS DE IDENTIFICAÇÃO
  // ================================================

  createBox(
    3,
    0.8,
    0.12,
    darkMaterial,
    0,
    3.7,
    12.85
  );

  // ================================================
  // LIXEIRAS
  // ================================================

  function createTrashBin(x, z) {

    createBox(
      0.8,
      1.1,
      0.8,
      darkMaterial,
      x,
      0.7,
      z
    );

  }

  createTrashBin(-9, 5);
  createTrashBin(9, 5);

  // ================================================
  // ADICIONAR AO MUNDO
  // ================================================

  scene.add(hospital);

  // ================================================
  // RETORNO
  // ================================================

  return {

    group: hospital,

    lights: hospitalLights,

    update(delta) {
      // Espaço para futuras animações do hospital.
    },

    destroy() {

      scene.remove(hospital);

      hospital.traverse(object => {

        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {

          if (Array.isArray(object.material)) {
            object.material.forEach(material => {
              material.dispose();
            });
          } else {
            object.material.dispose();
          }

        }

      });

    }

  };

}
