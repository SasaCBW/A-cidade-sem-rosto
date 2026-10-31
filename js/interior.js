
export function createInterior(THREE, scene) {
    const interiors = new THREE.Group();
    scene.add(interiors);

    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x343a3d,
        roughness: 0.95
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x25292b,
        roughness: 0.9
    });

    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: 0x1b2023,
        roughness: 1
    });

    const furnitureMaterial = new THREE.MeshStandardMaterial({
        color: 0x332e29,
        roughness: 0.85
    });

    function box(width, height, depth, x, y, z, material) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        interiors.add(mesh);

        return mesh;
    }

    function createRoom(x, z, width, depth, name) {
        const floor = box(
            width, 0.2, depth,
            x, 0, z,
            floorMaterial
        );

        box(
            width, 0.2, depth,
            x, 3.5, z,
            ceilingMaterial
        );

        box(
            0.2, 3.5, depth,
            x - width / 2, 1.75, z,
            wallMaterial
        );

        box(
            0.2, 3.5, depth,
            x + width / 2, 1.75, z,
            wallMaterial
        );

        box(
            width, 3.5, 0.2,
            x, 1.75, z - depth / 2,
            wallMaterial
        );

        box(
            width, 3.5, 0.2,
            x, 1.75, z + depth / 2,
            wallMaterial
        );

        return { floor, name, x, z, width, depth };
    }

    // DELEGACIA

    const policeStation = createRoom(
        45, -15, 14, 18,
        'Delegacia'
    );

    // BALCÃO DE RECEPÇÃO

    box(
        6, 1.2, 1.2,
        45, 0.8, -10,
        furnitureMaterial
    );

    // MESAS

    for (const x of [42, 48]) {
        box(
            2.5, 0.15, 1.5,
            x, 1, -18,
            furnitureMaterial
        );

        box(
            0.15, 1, 0.15,
            x - 1, 0.5, -18,
            furnitureMaterial
        );

        box(
            0.15, 1, 0.15,
            x + 1, 0.5, -18,
            furnitureMaterial
        );
    }

    // ARQUIVOS

    for (let i = 0; i < 4; i++) {
        box(
            1, 2.5, 2,
            39 + i * 3, 1.25, -21,
            furnitureMaterial
        );
    }

    // ILUMINAÇÃO DA DELEGACIA

    const policeLight = new THREE.PointLight(
        0xc1d7e3,
        18,
        16
    );

    policeLight.position.set(45, 3, -15);
    interiors.add(policeLight);

    // CASA ABANDONADA

    const house = createRoom(
        45, -45, 12, 14,
        'Casa abandonada'
    );

    // MESA

    box(
        3, 0.2, 1.5,
        45, 1, -43,
        furnitureMaterial
    );

    // CADEIRAS

    for (const x of [43, 47]) {
        box(
            0.8, 0.15, 0.8,
            x, 0.7, -45,
            furnitureMaterial
        );
    }

    // ARMÁRIO

    box(
        2, 2.5, 0.8,
        49, 1.25, -49,
        furnitureMaterial
    );

    const houseLight = new THREE.PointLight(
        0xffc68a,
        12,
        14
    );

    houseLight.position.set(45, 3, -45);
    interiors.add(houseLight);

    // LÂMPADAS

    function lamp(x, z) {
        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 12, 12),
            new THREE.MeshBasicMaterial({
                color: 0xffd6a0
            })
        );

        bulb.position.set(x, 3.3, z);
        interiors.add(bulb);
    }

    lamp(45, -15);
    lamp(45, -45);

    // OBJETOS DE CENÁRIO

    const boxes = [];

    boxes.push(policeStation);
    boxes.push(house);

    return {
        group: interiors,
        rooms: boxes
    };
}
