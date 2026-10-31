import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createSchool(scene) {
    const group = new THREE.Group();
    group.name = "EscolaAbandonada";

    const width = 24;
    const depth = 26;
    const height = 5;

    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x555657,
        roughness: 0.95
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x393a38,
        roughness: 1
    });

    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x62696b,
        metalness: 0.45,
        roughness: 0.8
    });

    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x493b30,
        roughness: 0.95
    });

    const boardMaterial = new THREE.MeshStandardMaterial({
        color: 0x172b2b,
        roughness: 0.95
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x283b42,
        transparent: true,
        opacity: 0.55
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

    // Piso e teto
    box("Piso da escola", 0, -0.15, 0, width, 0.3, depth, floorMaterial);
    box("Teto da escola", 0, height, 0, width, 0.3, depth, wallMaterial);

    // Paredes externas
    box("Parede esquerda", -12, 2.5, 0, 0.4, height, depth, wallMaterial);
    box("Parede direita", 12, 2.5, 0, 0.4, height, depth, wallMaterial);
    box("Parede do fundo", 0, 2.5, -13, width, height, 0.4, wallMaterial);

    // Entrada frontal
    box("Frente esquerda", -8, 2.5, 13, 8, height, 0.4, wallMaterial);
    box("Frente direita", 8, 2.5, 13, 8, height, 0.4, wallMaterial);
    box("Entrada superior", 0, 4.3, 13, 8, 1.4, 0.4, wallMaterial);

    // Corredor central
    box("Divisória esquerda", -4.5, 1.5, -3, 0.2, 3, 13, wallMaterial);
    box("Divisória direita", 4.5, 1.5, -3, 0.2, 3, 13, wallMaterial);

    // Janelas
    for (const z of [-8, 0, 8]) {
        box("Janela esquerda", -11.75, 2.8, z, 0.08, 1.4, 3.5, glassMaterial);
        box("Janela direita", 11.75, 2.8, z, 0.08, 1.4, 3.5, glassMaterial);
    }

    // Carteiras escolares
    function createDesk(x, z) {
        const desk = new THREE.Group();

        const top = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.14, 1),
            woodMaterial
        );

        top.position.y = 1.05;
        desk.add(top);

        for (const px of [-0.58, 0.58]) {
            for (const pz of [-0.36, 0.36]) {
                const leg = new THREE.Mesh(
                    new THREE.BoxGeometry(0.07, 1, 0.07),
                    metalMaterial
                );

                leg.position.set(px, 0.5, pz);
                desk.add(leg);
            }
        }

        const chairSeat = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 0.12, 0.8),
            woodMaterial
        );

        chairSeat.position.set(0, 0.55, 1.25);
        desk.add(chairSeat);

        const chairBack = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 0.8, 0.12),
            woodMaterial
        );

        chairBack.position.set(0, 0.95, 1.62);
        desk.add(chairBack);

        desk.position.set(x, 0, z);
        group.add(desk);
    }

    createDesk(-8, -8);
    createDesk(-8, -2);
    createDesk(-8, 4);

    createDesk(8, -8);
    createDesk(8, -2);
    createDesk(8, 4);

    // Quadro
    box(
        "Quadro negro",
        0,
        2.4,
        -12.45,
        7,
        2,
        0.12,
        boardMaterial
    );

    // Moldura do quadro
    box("Moldura superior", 0, 3.45, -12.35, 7.3, 0.12, 0.2, woodMaterial);
    box("Moldura inferior", 0, 1.35, -12.35, 7.3, 0.12, 0.2, woodMaterial);
    box("Moldura esquerda", -3.65, 2.4, -12.35, 0.12, 2.2, 0.2, woodMaterial);
    box("Moldura direita", 3.65, 2.4, -12.35, 0.12, 2.2, 0.2, woodMaterial);

    // Armários
    for (const z of [-8, 0, 8]) {
        box(
            "Armário escolar",
            -10.7,
            1.2,
            z,
            1.1,
            2.4,
            1.2,
            metalMaterial
        );
    }

    // Lixeiras
    const binMaterial = new THREE.MeshStandardMaterial({
        color: 0x292e30,
        roughness: 0.9
    });

    for (const position of [
        [-2, 0.5, 5],
        [2, 0.5, -7]
    ]) {
        const bin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.28, 1, 12),
            binMaterial
        );

        bin.position.set(...position);
        group.add(bin);
    }

    // Luminárias
    const lights = [];

    for (const z of [-8, 0, 8]) {
        const light = new THREE.PointLight(
            0xb7c9ce,
            1.2,
            14
        );

        light.position.set(0, 4.3, z);
        group.add(light);
        lights.push(light);

        const lamp = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.12, 0.6),
            new THREE.MeshBasicMaterial({
                color: 0xb8cbd0
            })
        );

        lamp.position.set(0, 4.65, z);
        group.add(lamp);
    }

    // Placa de identificação
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;

    const context = canvas.getContext("2d");

    context.fillStyle = "#252a2b";
    context.fillRect(0, 0, 512, 128);

    context.fillStyle = "#d0d5d3";
    context.font = "bold 45px Arial";
    context.textAlign = "center";
    context.fillText("ESCOLA MUNICIPAL", 256, 78);

    const signTexture = new THREE.CanvasTexture(canvas);

    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 2),
        new THREE.MeshBasicMaterial({
            map: signTexture
        })
    );

    sign.position.set(0, 4.1, 13.22);
    group.add(sign);

    // Mensagem no quadro
    const messageCanvas = document.createElement("canvas");
    messageCanvas.width = 512;
    messageCanvas.height = 256;

    const messageContext = messageCanvas.getContext("2d");

    messageContext.clearRect(0, 0, 512, 256);
    messageContext.fillStyle = "#d6d8ca";
    messageContext.font = "italic 34px Georgia";
    messageContext.textAlign = "center";
    messageContext.fillText("NÃO ESQUEÇAM", 256, 90);
    messageContext.fillText("DELES.", 256, 145);

    const messageTexture = new THREE.CanvasTexture(messageCanvas);

    const message = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 2.5),
        new THREE.MeshBasicMaterial({
            map: messageTexture,
            transparent: true
        })
    );

    message.position.set(0, 2.4, -12.35);
    group.add(message);

    // Posição no mapa
    group.position.set(75, 0, -75);

    scene.add(group);

    let elapsed = 0;

    function update(delta) {
        elapsed += delta;

        lights.forEach((light, index) => {
            light.intensity =
                1.05 + Math.sin(elapsed * 1.5 + index) * 0.16;
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
        });

        signTexture.dispose();
        messageTexture.dispose();
    }

    return {
        group,
        lights,
        update,
        destroy
    };
}
