import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createWorld(scene) {
  const world = new THREE.Group();
  world.name = "CidadeSemRosto";

  // Materiais do cenário
  const materials = {
    asphalt: new THREE.MeshStandardMaterial({
      color: 0x171b20,
      roughness: 1
    }),
    sidewalk: new THREE.MeshStandardMaterial({
      color: 0x45494c,
      roughness: 1
    }),
    concrete: new THREE.MeshStandardMaterial({
      color: 0x55575a,
      roughness: 1
    }),
    darkConcrete: new THREE.MeshStandardMaterial({
      color: 0x292d32,
      roughness: 1
    }),
    window: new THREE.MeshStandardMaterial({
      color: 0x111b25,
      roughness: 0.3,
      metalness: 0.2
    }),
    glass: new THREE.MeshStandardMaterial({
      color: 0x64717a,
      transparent: true,
      opacity: 0.3,
      roughness: 0.2
    }),
    roadLine: new THREE.MeshStandardMaterial({
      color: 0x77736a,
      roughness: 1
    }),
    metal: new THREE.MeshStandardMaterial({
      color: 0x252a30,
      metalness: 0.7,
      roughness: 0.55
    })
  };

  // Criador de objetos
  function addBox(name, x, y, z, width, height, depth, material) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );

    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    world.add(mesh);

    return mesh;
  }

  // Chão principal
  addBox(
    "AsfaltoPrincipal",
    0,
    -0.18,
    -45,
    190,
    0.3,
    230,
    materials.asphalt
  );

  // Rua central
  addBox(
    "RuaCentral",
    0,
    -0.015,
    -45,
    13,
    0.04,
    230,
    materials.asphalt
  );

  // Calçadas
  addBox(
    "CalcadaEsquerda",
    -9,
    0.02,
    -45,
    4,
    0.15,
    230,
    materials.sidewalk
  );

  addBox(
    "CalcadaDireita",
    9,
    0.02,
    -45,
    4,
    0.15,
    230,
    materials.sidewalk
  );

  // Faixas da rua
  for (let z = 55; z >= -155; z -= 12) {
    addBox(
      "FaixaCentral",
      0,
      0.012,
      z,
      0.16,
      0.025,
      5,
      materials.roadLine
    );
  }

  // Pequenas rachaduras decorativas
  for (let i = 0; i < 45; i++) {
    const crack = addBox(
      "Rachadura",
      (Math.random() - 0.5) * 11,
      0.012,
      45 - Math.random() * 190,
      0.025 + Math.random() * 0.04,
      0.012,
      0.5 + Math.random() * 1.5,
      materials.darkConcrete
    );

    crack.rotation.y = Math.random() * Math.PI;
    crack.castShadow = false;
  }

  // Construção de prédios
  function createBuilding({
    x,
    z,
    width,
    depth,
    height,
    color,
    floors = 2,
    name = "Predio"
  }) {
    const building = new THREE.Group();
    building.name = name;
    building.position.set(x, 0, z);

    const buildingMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.95
    });

    const structure = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      buildingMaterial
    );

    structure.position.y = height / 2;
    structure.castShadow = true;
    structure.receiveShadow = true;

    building.add(structure);

    // Janelas na fachada voltada para a rua
    const columns = Math.max(2, Math.floor(width / 2.8));
    const floorHeight = height / floors;

    for (let floor = 0; floor < floors; floor++) {
      for (let column = 0; column < columns; column++) {
        const windowWidth = Math.min(1.25, width / (columns + 2));
        const windowHeight = Math.min(1.3, floorHeight * 0.45);

        const windowMesh = new THREE.Mesh(
          new THREE.BoxGeometry(
            windowWidth,
            windowHeight,
            0.08
          ),
          materials.window
        );

        windowMesh.position.set(
          -width / 2 + (column + 1) * width / (columns + 1),
          floor * floorHeight + floorHeight * 0.55,
          depth / 2 + 0.045
        );

        building.add(windowMesh);
      }
    }

    // Porta frontal
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.5, 0.1),
      materials.metal
    );

    door.position.set(
      0,
      1.25,
      depth / 2 + 0.06
    );

    building.add(door);

    world.add(building);

    return building;
  }

  // Prédios do lado esquerdo
  createBuilding({
    name: "EdificioResidencial",
    x: -18,
    z: -8,
    width: 13,
    depth: 13,
    height: 13,
    color: 0x45484a,
    floors: 4
  });

  createBuilding({
    name: "LojaAbandonada",
    x: -19,
    z: -32,
    width: 15,
    depth: 12,
    height: 7,
    color: 0x57534b,
    floors: 2
  });

  createBuilding({
    name: "PredioAntigo",
    x: -19,
    z: -59,
    width: 13,
    depth: 15,
    height: 17,
    color: 0x3c4245,
    floors: 5
  });

  createBuilding({
    name: "Farmacia",
    x: -19,
    z: -88,
    width: 14,
    depth: 13,
    height: 8,
    color: 0x4a4c48,
    floors: 2
  });

  createBuilding({
    name: "PredioResidencialDois",
    x: -19,
    z: -119,
    width: 14,
    depth: 14,
    height: 15,
    color: 0x393e43,
    floors: 4
  });

  // Prédios do lado direito
  createBuilding({
    name: "MercadoAbandonado",
    x: 19,
    z: -12,
    width: 15,
    depth: 15,
    height: 8,
    color: 0x56524b,
    floors: 2
  });

  createBuilding({
    name: "HotelAntigo",
    x: 19,
    z: -43,
    width: 14,
    depth: 16,
    height: 19,
    color: 0x41464b,
    floors: 5
  });

  createBuilding({
    name: "RestauranteFechado",
    x: 19,
    z: -75,
    width: 14,
    depth: 12,
    height: 7,
    color: 0x504a43,
    floors: 2
  });

  createBuilding({
    name: "EdificioComercial",
    x: 19,
    z: -105,
    width: 15,
    depth: 15,
    height: 16,
    color: 0x3d4247,
    floors: 4
  });

  createBuilding({
    name: "CasaAbandonada",
    x: 19,
    z: -135,
    width: 13,
    depth: 12,
    height: 7,
    color: 0x514b45,
    floors: 2
  });

  // Postes de iluminação
  function createStreetLight(x, z) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.14, 5.5, 10),
      materials.metal
    );

    pole.position.set(x, 2.75, z);
    pole.castShadow = true;

    world.add(pole);

    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.09, 0.09),
      materials.metal
    );

    arm.position.set(
      x + (x < 0 ? 0.55 : -0.55),
      5.35,
      z
    );

    world.add(arm);

    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.16, 0.35),
      new THREE.MeshStandardMaterial({
        color: 0x777b78,
        emissive: 0x8b9a9e,
        emissiveIntensity: 0.35
      })
    );

    lamp.position.set(
      x + (x < 0 ? 1.05 : -1.05),
      5.25,
      z
    );

    world.add(lamp);

    const light = new THREE.PointLight(
      0x91a2ad,
      0.45,
      13,
      2
    );

    light.position.copy(lamp.position);
    light.castShadow = false;

    world.add(light);

    return light;
  }

  const streetLights = [];

  for (let z = 45; z >= -145; z -= 24) {
    streetLights.push(createStreetLight(-11, z));
    streetLights.push(createStreetLight(11, z - 10));
  }

  // Carros abandonados
  function createCar(x, z, rotation = 0) {
    const car = new THREE.Group();

    const carBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.75, 4.2),
      new THREE.MeshStandardMaterial({
        color: 0x343b40,
        roughness: 0.8,
        metalness: 0.25
      })
    );

    carBody.position.y = 0.75;
    car.add(carBody);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.8, 2),
      materials.darkConcrete
    );

    cabin.position.set(0, 1.45, -0.15);
    car.add(cabin);

    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x101214,
      roughness: 1
    });

    for (const side of [-1, 1]) {
      for (const frontBack of [-1, 1]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, 0.2, 16),
          wheelMaterial
        );

        wheel.rotation.z = Math.PI / 2;

        wheel.position.set(
          side * 1.05,
          0.4,
          frontBack * 1.35
        );

        car.add(wheel);
      }
    }

    car.position.set(x, 0, z);
    car.rotation.y = rotation;

    car.traverse(object => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    world.add(car);
  }

  createCar(-5, -20, 0.2);
  createCar(5, -54, -0.15);
  createCar(-4, -97, 0.1);
  createCar(5, -127, -0.25);

  // Árvores secas
  function createDeadTree(x, z, scale = 1) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.16 * scale,
        0.3 * scale,
        3.5 * scale,
        7
      ),
      new THREE.MeshStandardMaterial({
        color: 0x302b26,
        roughness: 1
      })
    );

    trunk.position.y = 1.75 * scale;
    tree.add(trunk);

    for (let i = 0; i < 5; i++) {
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.035 * scale,
          0.11 * scale,
          1.7 * scale,
          6
        ),
        trunk.material
      );

      branch.position.set(
        (Math.random() - 0.5) * 1.4 * scale,
        (2.4 + Math.random() * 1.2) * scale,
        (Math.random() - 0.5) * 0.7 * scale
      );

      branch.rotation.z =
        (Math.random() - 0.5) * 1.5;

      branch.rotation.x =
        (Math.random() - 0.5) * 0.8;

      tree.add(branch);
    }

    tree.position.set(x, 0, z);
    tree.scale.setScalar(0.8 + Math.random() * 0.5);

    world.add(tree);
  }

  for (let z = 45; z >= -145; z -= 17) {
    createDeadTree(-13, z, 1);
    createDeadTree(13, z - 8, 1);
  }

  // Placas de rua
  function createSign(text, x, z) {
    const sign = new THREE.Group();

    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.09, 3, 8),
      materials.metal
    );

    post.position.y = 1.5;
    sign.add(post);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.75, 0.12),
      new THREE.MeshStandardMaterial({
        color: 0x26333a,
        roughness: 0.9
      })
    );

    board.position.y = 2.8;
    sign.add(board);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;

    const context = canvas.getContext("2d");

    context.fillStyle = "#26333a";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#d1d5d4";
    context.font = "bold 42px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(2.7, 0.68),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
      })
    );

    label.position.set(0, 2.8, 0.075);
    sign.add(label);

    sign.position.set(x, 0, z);
    world.add(sign);
  }

  createSign("RUA CENTRAL", -11, 18);
  createSign("HOSPITAL", 11, -25);
  createSign("ESCOLA", -11, -75);

  // Adiciona o mundo à cena
  scene.add(world);

  // Retorno para controle futuro
  return {
    group: world,
    streetLights,

    update(delta) {
      // Espaço reservado para efeitos ambientais.
    },

    destroy() {
      scene.remove(world);

      world.traverse(object => {
        if (object.isMesh) {
          object.geometry.dispose();

          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else if (object.material) {
            object.material.dispose();
          }
        }
      });
    }
  };
}
