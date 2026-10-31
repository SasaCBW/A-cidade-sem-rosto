
export function createInteractionEffects(scene) {
  const particles = [];

  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < 180; i++) {
    positions.push(
      (Math.random() - 0.5) * 70,
      Math.random() * 12,
      (Math.random() - 0.5) * 150
    );
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xb9c9dc,
    size: 0.045,
    transparent: true,
    opacity: 0.35,
    depthWrite: false
  });

  const dust = new THREE.Points(geometry, material);
  scene.add(dust);

  function update(delta) {
    dust.rotation.y += delta * 0.008;

    const position = dust.geometry.attributes.position;

    for (let i = 0; i < position.count; i++) {
      let y = position.getY(i);
      y += delta * 0.12;

      if (y > 12) y = 0;

      position.setY(i, y);
    }

    position.needsUpdate = true;
  }

  return { update };
}
