
export function createApparition(THREE, scene) {
    const figure = new THREE.Group();

    const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x050709,
        roughness: 1
    });

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 16, 16),
        darkMaterial
    );

    head.position.y = 2.1;
    figure.add(head);

    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.35, 1.1, 5, 10),
        darkMaterial
    );

    body.position.y = 1.1;
    figure.add(body);

    const glow = new THREE.PointLight(
        0x8197a8,
        0.5,
        5
    );

    glow.position.set(0, 1.5, 0);
    figure.add(glow);

    figure.position.set(0, 0, -85);

    scene.add(figure);

    let visible = true;
    let elapsed = 0;

    function update(delta, camera) {
        elapsed += delta;

        const distance = figure.position.distanceTo(
            camera.position
        );

        figure.lookAt(
            camera.position.x,
            1.5,
            camera.position.z
        );

        figure.position.y =
            Math.sin(elapsed * 1.2) * 0.08;

        if (distance < 9) {
            visible = false;
        }

        figure.visible = visible;
    }

    function reset() {
        visible = true;
        figure.visible = true;
    }

    return {
        update,
        reset,
        figure
    };
}
