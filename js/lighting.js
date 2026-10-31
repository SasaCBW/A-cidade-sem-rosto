
export function createLighting(scene) {
  // Iluminação ambiente noturna
  const ambient = new THREE.HemisphereLight(
    0x718096,
    0x10131a,
    0.55
  );

  scene.add(ambient);

  // Luz da lua
  const moon = new THREE.DirectionalLight(0x9eb9df, 0.65);
  moon.position.set(-30, 45, -25);
  moon.castShadow = true;

  moon.shadow.mapSize.width = 2048;
  moon.shadow.mapSize.height = 2048;

  scene.add(moon);

  // Névoa atmosférica
  scene.fog = new THREE.FogExp2(0x101722, 0.012);

  return {
    ambient,
    moon
  };
}
