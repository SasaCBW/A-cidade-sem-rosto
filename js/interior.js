import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createInterior(scene) {

  const interiors = new THREE.Group();
  interiors.name = "InterioresDaCidade";

  // ================================================
  // MATERIAIS
  // ================================================

  const materials = {
    floor: new THREE.MeshStandardMaterial({
      color: 0x45494b,
      roughness: 0.95
    }),

    wall: new THREE.MeshStandardMaterial({
      color: 0x77766e,
      roughness: 0.95
    }),

    dark: new THREE.MeshStandardMaterial({
      color: 0x20272c,
      roughness: 0.9
    }),

    wood: new THREE.MeshStandardMaterial({
      color: 0x503a2a,
      roughness: 0.9
    }),

    metal: new THREE.MeshStandardMaterial({
      color: 0x59636b,
      metalness: 0.55,
      roughness: 0.65
    }),

    fabric: new THREE.MeshStandardMaterial({
      color: 0x777c78,
      roughness: 1
    }),

    paper: new THREE.MeshStandardMaterial({
      color: 0xb8b19d,
      roughness: 1
    })
  };

  // ================================================
  // CRIADOR DE OBJETOS
  // ================================================

  function box(
    parent,
    width,
    height,
    depth,
    material,
    x,
    y,
    z
  ) {

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
  }

  // ================================================
  // CRIADOR DE AMBIENTE
  // ================================================

  function createRoom(name, x, z, roomWidth, roomDepth) {

    const room = new THREE.Group();

    room.name = name;
    room.position.set(x, 0, z);

    // Piso.
    box(
      room,
      roomWidth,
      0.3,
      roomDepth,
      materials.floor,
      0,
      0,
      0
    );

    // Paredes laterais.
    box(
      room,
      0.3,
      4.5,
      roomDepth,
      materials.wall,
      -roomWidth / 2,
      2.25,
      0
    );

    box(
      room,
      0.3,
      4.5,
      roomDepth,
      materials.wall,
      roomWidth / 2,
      2.25,
      0
    );

    // Parede traseira.
    box(
      room,
      roomWidth,
      4.5,
      0.3,
      materials.wall,
      0,
      2.25,
      -roomDepth / 2
    );

    // Parede frontal com abertura central.
    box(
      room,
      3.5,
      4.5,
      0.3,
      materials.wall,
      -roomWidth / 2 + 1.75,
      2.25,
      roomDepth / 2
    );

    box(
      room,
      3.5,
      4.5,
      0.3,
      materials.wall,
      roomWidth / 2 - 1.75,
      2.25,
      roomDepth / 2
    );

    // Parte superior da entrada.
    box(
      room,
      3.5,
      0.8,
      0.3,
      materials.wall,
      0,
      4.1,
      roomDepth / 2
    );

    // Teto.
    box(
      room,
      roomWidth,
      0.3,
      roomDepth,
      materials.dark,
      0,
      4.5,
      0
    );

    interiors.add(room);

    return room;
  }

  // ================================================
  // DELEGACIA
  // ================================================

  const policeStation = createRoom(
    "Delegacia",
    45,
    -15,
    18,
    22
  );

  // Balcão de atendimento.
  box(
    policeStation,
    6,
    1.2,
    1.3,
    materials.wood,
    0,
    0.8,
    5
  );

  // Mesa do investigador.
  box(
    policeStation,
    3,
    0.2,
    1.8,
    materials.wood,
    -5,
    0.9,
    -3
  );

  // Pés da mesa.
  box(
    policeStation,
    0.15,
    1.8,
    0.15,
    materials.metal,
    -6.3,
    0,
    -3.7
  );

  box(
    policeStation,
    0.15,
    1.8,
    0.15,
    materials.metal,
    -3.7,
    0,
    -3.7
  );

  box(
    policeStation,
    0.15,
    1.8,
    0.15,
    materials.metal,
    -6.3,
    0,
    -2.3
  );

  box(
    policeStation,
    0.15,
    1.8,
    0.15,
    materials.metal,
    -3.7,
    0,
    -2.3
  );

  // Arquivos e armários.
  for (let i = 0; i < 4; i++) {

    box(
      policeStation,
      1.5,
      3,
      1,
      materials.metal,
      7,
      1.5,
      -8 + i * 2.2
    );

  }

  // Cadeiras.
  box(
    policeStation,
    1.1,
    0.2,
    1.1,
    materials.fabric,
    -5,
    0.6,
    0
  );

  // Luminária.
  const policeLight = new THREE.PointLight(
    0xd4c49a,
    1.3,
    16
  );

  policeLight.position.set(45, 3.8, -15);

  interiors.add(policeLight);

  // ================================================
  // CASA ABANDONADA
  // ================================================

  const abandonedHouse = createRoom(
    "Casa abandonada",
    45,
    -45,
    18,
    22
  );

  // Sofá.
  box(
    abandonedHouse,
    4,
    1,
    1.5,
    materials.fabric,
    -4,
    0.7,
    3
  );

  // Encosto.
  box(
    abandonedHouse,
    4,
    1.2,
    0.4,
    materials.fabric,
    -4,
    1.3,
    3.6
  );

  // Mesa de jantar.
  box(
    abandonedHouse,
    4,
    0.2,
    2.5,
    materials.wood,
    4,
    1.1,
    -2
  );

  // Pés da mesa.
  for (const x of [2.3, 5.7]) {
    for (const z of [-2.9, -1.1]) {

      box(
        abandonedHouse,
        0.15,
        1.1,
        0.15,
        materials.wood,
        x,
        0.55,
        z
      );

    }
  }

  // Cadeiras.
  for (const x of [2, 4, 6]) {

    box(
      abandonedHouse,
      0.9,
      0.15,
      0.9,
      materials.wood,
      x,
      0.6,
      1
    );

    box(
      abandonedHouse,
      0.9,
      1.2,
      0.15,
      materials.wood,
      x,
      1.1,
      1.4
    );

  }

  // Armário antigo.
  box(
    abandonedHouse,
    2,
    3,
    1,
    materials.wood,
    -7,
    1.5,
    -7
  );

  // Quadro na parede.
  box(
    abandonedHouse,
    2,
    1.5,
    0.15,
    materials.dark,
    0,
    2.5,
    -10.8
  );

  // Fotografias sobre uma mesa.
  box(
    abandonedHouse,
    1.4,
    0.08,
    1,
    materials.paper,
    5,
    1.3,
    6
  );

  // Iluminação fraca da casa.
  const houseLight = new THREE.PointLight(
    0xffc78b,
    0.8,
    13
  );

  houseLight.position.set(45, 3.5, -45);

  interiors.add(houseLight);

  // ================================================
  // ADICIONAR AO CENÁRIO
  // ================================================

  scene.add(interiors);

  // ================================================
  // RETORNO DO SISTEMA
  // ================================================

  return {

    group: interiors,

    policeStation,

    abandonedHouse,

    update(delta) {
      // Futuras animações dos ambientes.
    },

    destroy() {

      scene.remove(interiors);

      interiors.traverse(object => {

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
