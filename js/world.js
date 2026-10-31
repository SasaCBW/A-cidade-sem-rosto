
export function createWorld(THREE, scene) {
    const world = new THREE.Group();
    scene.add(world);

    const materials = {
        ground: new THREE.MeshStandardMaterial({
            color: 0x24282b,
            roughness: 0.95
        }),
        road: new THREE.MeshStandardMaterial({
            color: 0x111518,
            roughness: 0.9
        }),
        sidewalk: new THREE.MeshStandardMaterial({
            color: 0x34383a,
            roughness: 0.9
        }),
        building: new THREE.MeshStandardMaterial({
            color: 0x242c33,
            roughness: 0.9
        }),
        darkBuilding: new THREE.MeshStandardMaterial({
            color: 0x151c23,
            roughness: 0.95
        }),
        windowDark: new THREE.MeshStandardMaterial({
            color: 0x101a22,
            roughness: 0.4,
            metalness: 0.2
        }),
        windowLight: new THREE.MeshStandardMaterial({
            color: 0x9b9b75,
            emissive: 0xb5a66a,
            emissiveIntensity: 0.8
        })
    };

    // ILUMINAÇÃO GLOBAL

    const ambient = new THREE.HemisphereLight(
        0x8092a3,
        0x171b20,
        1.1
    );
    scene.add(ambient);

    const moon = new THREE.DirectionalLight(0x9eafc0, 1.2);
    moon.position.set(-30, 60, 20);
    moon.castShadow = true;
    moon.shadow.mapSize.set(2048, 2048);
    moon.shadow.camera.left = -80;
    moon.shadow.camera.right = 80;
    moon.shadow.camera.top = 80;
    moon.shadow.camera.bottom = -80;
    scene.add(moon);

    // TERRENO

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(250, 250),
        materials.ground
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.08;
    ground.receiveShadow = true;
    world.add(ground);

    // ESTRADA PRINCIPAL

    const road = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 220),
        materials.road
    );

    road.rotation.x = -Math.PI / 2;
    road.position.y = 0;
    road.receiveShadow = true;
    world.add(road);

    // CALÇADAS

    for (const x of [-8, 8]) {
        const sidewalk = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.2, 220),
            materials.sidewalk
        );

        sidewalk.position.set(x, 0.05, 0);
        sidewalk.receiveShadow = true;
        world.add(sidewalk);
    }

    // MARCAS DA ESTRADA

    const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0x596067,
        transparent: true,
        opacity: 0.4
    });

    for (let z = -105; z < 110; z += 12) {
        const line = new THREE.Mesh(
            new THREE.PlaneGeometry(0.13, 5),
            lineMaterial
        );

        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.015, z);
        world.add(line);
    }

    // CONSTRUÇÃO DOS PRÉDIOS

    let seed = 37;

    function random() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    }

    function createBuilding(x, z, width, depth, height) {
        const building = new THREE.Group();

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            random() > 0.5 ? materials.building : materials.darkBuilding
        );

        body.position.y = height / 2 + 0.1;
        body.castShadow = true;
        body.receiveShadow = true;
        building.add(body);

        const windowWidth = 0.75;
        const windowHeight = 1.1;
        const columns = Math.max(1, Math.floor(width / 1.8));
        const floors = Math.max(1, Math.floor(height / 3));

        for (let floor = 0; floor < floors; floor++) {
            for (let column = 0; column < columns; column++) {
                const windowMaterial = random() > 0.82
                    ? materials.windowLight
                    : materials.windowDark;

                const windowMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(windowWidth, windowHeight),
                    windowMaterial
                );

                const wx =
                    -width / 2 +
                    ((column + 0.5) * width / columns);

                const wy = 1.8 + floor * 3;

                windowMesh.position.set(
                    wx,
                    wy,
                    depth / 2 + 0.012
                );

                building.add(windowMesh);
            }
        }

        building.position.set(x, 0, z);
        world.add(building);
    }

    // DISTRIBUIÇÃO URBANA

    for (let side of [-1, 1]) {
        for (let z = -90; z <= 90; z += 18) {
            const width = 9 + random() * 5;
            const depth = 9 + random() * 4;
            const height = 12 + random() * 27;

            const x = side * (15 + random() * 4);

            createBuilding(
                x,
                z + random() * 5,
                width,
                depth,
                height
            );
        }
    }

    // POSTES DE ILUMINAÇÃO

    const lampMaterial = new THREE.MeshStandardMaterial({
        color: 0x252a2c,
        metalness: 0.7,
        roughness: 0.4
    });

    const lampLightMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd99a
    });

    for (let z = -90; z <= 90; z += 25) {
        for (let side of [-1, 1]) {
            const lamp = new THREE.Group();

            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.12, 6, 8),
                lampMaterial
            );

            pole.position.y = 3;
            lamp.add(pole);

            const arm = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.08, 0.08),
                lampMaterial
            );

            arm.position.set(-side * 0.6, 5.8, 0);
            lamp.add(arm);

            const bulb = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 12, 12),
                lampLightMaterial
            );

            bulb.position.set(-side * 1.3, 5.7, 0);
            lamp.add(bulb);

            const light = new THREE.PointLight(
                0xffd6a0,
                2.5,
                20
            );

            light.position.copy(bulb.position);
            lamp.add(light);

            lamp.position.set(side * 7.5, 0, z);
            world.add(lamp);
        }
    }

    // OBJETOS URBANOS: CAIXAS E BANCOS

    const propMaterial = new THREE.MeshStandardMaterial({
        color: 0x303a40,
        roughness: 0.9
    });

    for (let z = -75; z < 85; z += 30) {
        const bench = new THREE.Group();

        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.18, 0.65),
            propMaterial
        );

        seat.position.y = 0.65;
        bench.add(seat);

        for (let x of [-0.75, 0.75]) {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.65, 0.12),
                lampMaterial
            );

            leg.position.set(x, 0.32, 0);
            bench.add(leg);
        }

        bench.position.set(z % 2 ? 10 : -10, 0, z);
        world.add(bench);
    }

    // ÁREA DE NÉVOA E ATMOSFERA

    const fogParticles = new THREE.Group();

    const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0x9aaab5,
        transparent: true,
        opacity: 0.15
    });

    for (let i = 0; i < 80; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.035, 5, 5),
            particleMaterial
        );

        particle.position.set(
            (random() - 0.5) * 35,
            0.5 + random() * 5,
            (random() - 0.5) * 150
        );

        fogParticles.add(particle);
    }

    world.add(fogParticles);

    return {
        group: world,

        update(delta) {
            fogParticles.children.forEach((particle, index) => {
                particle.position.y +=
                    Math.sin(performance.now() * 0.0003 + index) *
                    delta * 0.08;
            });
        }
    };
}
