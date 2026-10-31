
export function createHospital(scene) {
  const hospital = new THREE.Group();
  hospital.name = "Hospital Abandonado";

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x777d7d,
    roughness: 0.95
  });

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x303638,
    roughness: 0.9
  });

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x171d20,
    roughness: 1
  });

  const whiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xb6b9ad,
    roughness: 0.85
  });

  function box(width, height, depth, material, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    hospital.add(mesh);
    return mesh;
  }

  // Piso
  box(22, 0.3, 18, floorMaterial, 0, -0.15, 0);

  // Paredes externas
  box(22, 5, 0.4, wallMaterial, 0, 2.5, -9);
  box(0.4, 5, 18, wallMaterial, -11, 2.5, 0);
  box(0.4, 5, 18, wallMaterial, 11, 2.5, 0);

  // Parede frontal com abertura para entrada
  box(8.9, 5, 0.4, wallMaterial, -6.55, 2.5, 9);
  box(8.9, 5, 0.4, wallMaterial, 6.55, 2.5, 9);

  // Balcão da recepção
  box(6, 1.1, 1.3, darkMaterial, 0, 0.55, 3);

  // Macas
  for (const x of [-6, 6]) {
    box(2.8, 0.3, 1.2, whiteMaterial, x, 0.85, -2);
    box(0.15, 0.85, 0.15, darkMaterial, x - 1.1, 0.4, -2);
    box(0.15, 0.85, 0.15, darkMaterial, x + 1.1, 0.4, -2);
  }

  // Armários
  box(1.5, 2.5, 0.8, whiteMaterial, -8.5, 1.25, -6);
  box(1.5, 2.5, 0.8, whiteMaterial, 8.5, 1.25, -6);

  // Luminária
  const light = new THREE.PointLight(0xc5d9d9, 1.5, 20);
  light.position.set(0, 4.2, 0);
  hospital.add(light);

  // Placa
  const sign = box(
    5,
    0.7,
    0.15,
    darkMaterial,
    0,
    4.5,
    8.7
  );

  hospital.position.set(75, 0, -35);

  scene.add(hospital);

  return hospital;
}
