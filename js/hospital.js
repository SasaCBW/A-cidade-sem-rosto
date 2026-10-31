import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createHospital(scene) {
    const group = new THREE.Group();
    group.name = "HospitalAbandonado";

    const width = 22;
    const depth = 26;
    const height = 5;

    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x555b5d,
        roughness: 0.95
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x343a3b,
        roughness: 0.9
    });

    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: 0x424849,
        roughness: 0.95
    });

    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x727b7d,
        metalness: 0.55,
        roughness: 0.65
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x263c42,
        transparent: true,
        opacity: 0.5,
        roughness: 0.2
    });

    function box(name, x, y, z, sx, sy, sz, material) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(sx, sy, sz),
            material
        );

        mesh.name = name;
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        group.add(mesh);

        return mesh;
    }

    // Piso
    box(
        "Piso do hospital",
        0,
        -0.15,
        0,
        width,
        0.3,
        depth,
        floorMaterial
    );

    // Paredes externas
    box("Parede esquerda", -width / 2, height / 2, 0, 0.4, height, depth, wallMaterial);
    box("Parede direita", width / 2, height / 2, 0, 0.4, height, depth, wallMaterial);
    box("Parede dos fundos", 0, height / 2, -depth / 2, width, height, 0.4, wallMaterial);

    // Parede frontal com abertura central
    box("Frente esquerda", -7.5, height / 2, depth / 2, 7, height, 0.4, wallMaterial);
    box("Frente direita", 7.5, height / 2, depth / 2, 7, height, 0.4, wallMaterial);
    box("Frente superior", 0, 4.2, depth / 2, 8, 1.6, 0.4, wallMaterial);

    // Teto
    box(
        "Teto do hospital",
        0,
        height,
        0,
        width,
        0.35,
        depth,
        ceilingMaterial
    );

    // Divisórias internas
    box("Divisória 1", -3.5, 1.5, -5, 0.2, 3, 12, wallMaterial);
    box("Divisória 2", 3.5, 1.5, -5, 0.2, 3, 12, wallMaterial);

    // Janelas laterais
    for (let z = -8; z <= 8; z += 8) {
        box("Janela esquerda", -10.7, 2.7, z, 0.08, 1.3, 3, glassMaterial);
        box("Janela direita", 10.7, 2.7, z, 0.08, 1.3, 3, glassMaterial);
    }

    // Camas hospitalares
    function createBed(x, z) {
        const bed = new THREE.Group();

        const mattress = new THREE.Mesh(
            new THREE.BoxGeometry(2.1, 0.25, 3.2),
            new THREE.MeshStandardMaterial({
                color: 0x9a9b91,
                roughness: 1
            })
        );

        mattress.position.y = 1.05;
        bed.add(mattress);

        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(2.25, 0.15, 3.35),
            metalMaterial
        );

        frame.position.y = 0.85;
        bed.add(frame);

        for (const px of [-0.95, 0.95]) {
            for (const pz of [-1.4, 1.4]) {
                const leg = new THREE.Mesh(
                    new THREE.BoxGeometry(0.12, 0.85, 0.12),
                    metalMaterial
                );

                leg.position.set(px, 0.4, pz);
                bed.add(leg);
            }
        }

        const pillow = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 0.18, 0.65),
            new THREE.MeshStandardMaterial({
                color: 0xb7b8ad
            })
        );

        pillow.position.set(0, 1.25, 1.05);
        bed.add(pillow);

        bed.position.set(x, 0, z);
        group.add(bed);
    }

    createBed(-7, -7);
    createBed(7, -7);
    createBed(-7, 6);
    createBed(7, 6);

    // Armários
    function createCabinet(x, z) {
        box(
            "Armário hospitalar",
            x,
            1.2,
            z,
            1.4,
            2.4,
            0.8,
            metalMaterial
        );

        box(
            "Porta do armário",
            x,
            1.2,
            z + 0.42,
            1.25,
            2.2,
            0.06,
            wallMaterial
        );
    }

    createCabinet(-9, -1);
    createCabinet(9, -1);

    // Balcão da recepção
    box(
        "Balcão da recepção",
        0,
        0.65,
        8,
        6,
        1.3,
        1.2,
        metalMaterial
    );

    // Luminárias
    const lights = [];

    for (const z of [-9, 0, 9]) {
        const light = new THREE.PointLight(
            0xa8c4ce,
            1.3,
            13
        );

        light.position.set(0, 4.3, z);
        group.add(light);
        lights.push(light);

        const lamp = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.12, 0.6),
            new THREE.MeshBasicMaterial({
                color: 0xb7d1d9
            })
        );

        lamp.position.set(0, 4.65, z);
        group.add(lamp);
    }

    // Luz vermelha de emergência
    const emergencyLight = new THREE.PointLight(
        0xff2525,
        1.5,
        10
    );

    emergencyLight.position.set(-9, 3.5, -10);
    group.add(emergencyLight);

    lights.push(emergencyLight);

    // Objetos espalhados
    const debrisMaterial = new THREE.MeshStandardMaterial({
        color: 0x34383a,
        roughness: 1
    });

    for (let i = 0; i < 18; i++) {
        const debris = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.3 + Math.random() * 0.7,
                0.08,
                0.3 + Math.random() * 0.7
            ),
            debrisMaterial
        );

        debris.position.set(
            (Math.random() - 0.5) * 18,
            0.08,
            (Math.random() - 0.5) * 20
        );

        debris.rotation.y = Math.random() * Math.PI;
        group.add(debris);
    }

    // Placa do hospital
    const signCanvas = document.createElement("canvas");
    signCanvas.width = 512;
    signCanvas.height = 128;

    const context = signCanvas.getContext("2d");

    context.fillStyle = "#252b2d";
    context.fillRect(0, 0, 512, 128);

    context.fillStyle = "#d0d8d8";
    context.font = "bold 42px Arial";
    context.textAlign = "center";
    context.fillText("HOSPITAL MUNICIPAL", 256, 78);

    const signTexture = new THREE.CanvasTexture(signCanvas);

    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 2),
        new THREE.MeshBasicMaterial({
            map: signTexture
        })
    );

    sign.position.set(0, 4.1, 13.15);
    group.add(sign);

    // Posicionamento no mundo
    group.position.set(75, 0, -35);

    scene.add(group);

    let elapsed = 0;

    function update(delta) {
        elapsed += delta;

        emergencyLight.intensity =
            1.2 + Math.sin(elapsed * 5) * 0.35;

        lights.forEach((light, index) => {
            if (index !== lights.length - 1) {
                light.intensity =
                    1.15 + Math.sin(elapsed * 1.4 + index) * 0.12;
            }
        });
    }

    function destroy() {
        scene.remove(group);

        group.traverse(object => {
            if (object.isMesh) {
                object.geometry.dispose();

                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }

            if (object.isLight) {
                object.dispose?.();
            }
        });

        signTexture.dispose();
    }

    return {
        group,
        lights,
        update,
        destroy
    };
}
