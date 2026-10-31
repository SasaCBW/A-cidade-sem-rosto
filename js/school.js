import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createSchool(scene) {

  const school = new THREE.Group();

  school.name = "EscolaAbandonada";

  // ================================================
  // MATERIAIS
  // ================================================

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x55585a,
    roughness: 0.95
  });

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaa394,
    roughness: 0.95
  });

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x252b30,
    roughness: 0.9
  });

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x604832,
    roughness: 0.9
  });

  const oldWoodMaterial = new THREE.MeshStandardMaterial({
    color: 0x493a2e,
    roughness: 1
  });

  const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0x173a35,
    roughness: 0.9
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x849fa6,
    transparent: true,
    opacity: 0.3,
    roughness: 0.2
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x59636b,
    metalness: 0.5,
    roughness: 0.65
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

    school.add(mesh);

    return mesh;
  }

  // ================================================
  // POSIÇÃO E DIMENSÕES
  // ================================================

  const width = 24;
  const depth = 26;
  const height = 5;

  school.position.set(
    75,
    0,
    -75
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
  // PAREDES EXTERNAS
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
  // FACHADA COM ENTRADA CENTRAL
  // ================================================

  createBox(
    8,
    height,
    0.5,
    wallMaterial,
    -8,
    height / 2,
    depth / 2
  );

  createBox(
    8,
    height,
    0.5,
    wallMaterial,
    8,
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
  // CORREDOR
  // ================================================

  createBox(
    0.18,
    3.8,
    18,
    wallMaterial,
    -4,
    2,
    -2
  );

  createBox(
    0.18,
    3.8,
    18,
    wallMaterial,
    4,
    2,
    -2
  );

  // ================================================
  // DIVISÕES DAS SALAS
  // ================================================

  createBox(
    19,
    3.8,
    0.18,
    wallMaterial,
    0,
    2,
    -4
  );

  createBox(
    19,
    3.8,
    0.18,
    wallMaterial,
    0,
    2,
    5
  );

  // ================================================
  // CARTEIRAS
  // ================================================

  function createDesk(x, z) {

    // Tampo.
    createBox(
      1.5,
      0.15,
      1,
      woodMaterial,
      x,
      1.15,
      z
    );

    // Pernas.
    const legPositions = [
      [-0.6, -0.4],
      [0.6, -0.4],
      [-0.6, 0.4],
      [0.6, 0.4]
    ];

    legPositions.forEach(position => {

      createBox(
        0.09,
        1.05,
        0.09,
        metalMaterial,
        x + position[0],
        0.55,
        z + position[1]
      );

    });

    // Cadeira.
    createBox(
      0.9,
      0.12,
      0.9,
      oldWoodMaterial,
      x,
      0.55,
      z + 1.1
    );

    createBox(
      0.9,
      0.9,
      0.12,
      oldWoodMaterial,
      x,
      0.95,
      z + 1.5
    );

  }

  // Sala esquerda.
  createDesk(-8, -9);
  createDesk(-8, -5);
  createDesk(-8, 0);
  createDesk(-8, 8);

  // Sala direita.
  createDesk(8, -9);
  createDesk(8, -5);
  createDesk(8, 0);
  createDesk(8, 8);

  // ================================================
  // QUADROS
  // ================================================

  function createBoard(x, z) {

    createBox(
      5,
      2.2,
      0.15,
      darkMaterial,
      x,
      2.5,
      z
    );

    createBox(
      4.7,
      1.9,
      0.05,
      boardMaterial,
      x,
      2.5,
      z + 0.1
    );

  }

  createBoard(-8, -12.8);
  createBoard(8, -12.8);

  // ================================================
  // JANELAS
  // ================================================

  function createWindow(x, z) {

    createBox(
      2.5,
      1.7,
      0.12,
      glassMaterial,
      x,
      2.8,
      z
    );

    createBox(
      2.6,
      0.12,
      0.2,
      metalMaterial,
      x,
      2,
      z
    );

    createBox(
      0.12,
      1.8,
      0.2,
      metalMaterial,
      x - 1.25,
      2.8,
      z
    );

    createBox(
      0.12,
      1.8,
      0.2,
      metalMaterial,
      x + 1.25,
      2.8,
      z
    );

  }

  createWindow(-11.65, -3);
  createWindow(11.65, -3);

  createWindow(-11.65, 7);
  createWindow(11.65, 7);

  // ================================================
  // ARMÁRIOS
  // ================================================

  function createLocker(x, z) {

    createBox(
      1.4,
      2.8,
      0.9,
      metalMaterial,
      x,
      1.5,
      z
    );

    createBox(
      0.08,
      2.2,
      0.08,
      darkMaterial,
      x + 0.35,
      1.5,
      z + 0.48
    );

  }

  createLocker(-10, 10);
  createLocker(10, 10);

  // ================================================
  // LIXEIRAS
  // ================================================

  function createTrashBin(x, z) {

    createBox(
      0.7,
      0.9,
      0.7,
      darkMaterial,
      x,
      0.6,
      z
    );

  }

  createTrashBin(-2, 10);
  createTrashBin(2, 10);

  // ================================================
  // LUZES DA ESCOLA
  // ================================================

  const schoolLights = [];

  const lightPositions = [
    [-8, 4.2, -8],
    [8, 4.2, -8],
    [-8, 4.2, 7],
    [8, 4.2, 7],
    [0, 4.2, 0]
  ];

  lightPositions.forEach(position => {

    const light = new THREE.PointLight(
      0xc0cbd0,
      0.9,
      13,
      2
    );

    light.position.set(
      position[0],
      position[1],
      position[2]
    );

    school.add(light);

    schoolLights.push(light);

  });

  // ================================================
  // PLACA DA ESCOLA
  // ================================================

  createBox(
    5,
    0.9,
    0.15,
    darkMaterial,
    0,
    3.8,
    12.85
  );

  // ================================================
  // ADICIONAR AO MUNDO
  // ================================================

  scene.add(school);

  // ================================================
  // RETORNO
  // ================================================

  return {

    group: school,

    lights: schoolLights,

    update(delta) {
      // Espaço para futuras animações.
    },

    destroy() {

      scene.remove(school);

      school.traverse(object => {

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
