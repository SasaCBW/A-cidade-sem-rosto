
export function createSchool(scene) {
  const school = new THREE.Group();

  const wall = new THREE.MeshStandardMaterial({
    color: 0x858078,
    roughness: 0.95
  });

  const floor = new THREE.MeshStandardMaterial({
    color: 0x343332,
    roughness: 1
  });

  const wood = new THREE.MeshStandardMaterial({
    color: 0x493b2c,
    roughness: 0.9
  });

  const board = new THREE.MeshStandardMaterial({
    color: 0x172d2b,
    roughness: 0.8
  });

  function box(w, h, d, material, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    school.add(mesh);
    return mesh;
  }

  // Piso e paredes
  box(24, 0.3, 20, floor, 0, -0.15, 0);
  box(24, 5, 0.4, wall, 0, 2.5, -10);
  box(0.4, 5, 20, wall, -12, 2.5, 0);
  box(0.4, 5, 20, wall, 12, 2.5, 0);

  // Frente com entrada
  box(9.8, 5, 0.4, wall, -7.1, 2.5, 10);
  box(9.8, 5, 0.4, wall, 7.1, 2.5, 10);

  // Quadro
  box(7, 2, 0.2, board, 0, 2.6, -9.7);

  // Carteiras
  for (const z of [-5, -1, 3]) {
    for (const x of [-7, -2, 3, 8]) {
      box(1.7, 0.2, 1.2, wood, x, 0.9, z);
      box(0.12, 0.8, 0.12, wood, x - 0.6, 0.4, z - 0.4);
      box(0.12, 0.8, 0.12, wood, x + 0.6, 0.4, z - 0.4);
    }
  }

  // Mesa do professor
  box(3, 0.3, 1.4, wood, 0, 1, -7);

  // Luzes antigas
  const light = new THREE.PointLight(0xe4d6ae, 1.2, 22);
  light.position.set(0, 4.2, 0);
  school.add(light);

  school.position.set(75, 0, -75);

  scene.add(school);

  return school;
}
