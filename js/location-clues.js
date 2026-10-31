
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

/* ==========================================
   PISTAS ESPECIAIS
========================================== */

export const locationClues = [
    {
        id: "hospital_record",
        title: "Prontuário médico",
        description:
            "Um prontuário antigo. Os registros mostram que vários pacientes foram transferidos na mesma noite, mas não existe nenhum destino anotado.",
        category: "Documento",
        location: "Hospital abandonado",
        position: [72, 0.9, -34],
        type: "document"
    },

    {
        id: "hospital_photo",
        title: "Fotografia do hospital",
        description:
            "Uma fotografia antiga de um grupo de funcionários. Nenhum dos rostos pode ser identificado. No verso está escrito: 'Eles nunca estiveram aqui'.",
        category: "Fotografia",
        location: "Hospital abandonado",
        position: [79, 0.9, -34],
        type: "photo"
    },

    {
        id: "school_diary",
        title: "Diário de um estudante",
        description:
            "As últimas páginas descrevem uma cidade onde as pessoas começaram a desaparecer das fotografias. A última frase diz: 'Amanhã ninguém vai lembrar de mim'.",
        category: "Diário",
        location: "Escola abandonada",
        position: [71, 0.9, -74],
        type: "book"
    },

    {
        id: "school_message",
        title: "Mensagem na sala",
        description:
            "Uma mensagem escrita no quadro: 'Não confie nas fotografias. Algumas pessoas já não têm rosto'.",
        category: "Mensagem",
        location: "Escola abandonada",
        position: [78, 2.1, -82],
        type: "message"
    }
];

/* ==========================================
   MATERIAIS
========================================== */

const materials = {
    paper: new THREE.MeshStandardMaterial({
        color: 0xd0c8ae,
        roughness: 0.95,
        side: THREE.DoubleSide
    }),

    darkPaper: new THREE.MeshStandardMaterial({
        color: 0x77746b,
        roughness: 1,
        side: THREE.DoubleSide
    }),

    photograph: new THREE.MeshStandardMaterial({
        color: 0x252a2d,
        roughness: 0.85
    }),

    book: new THREE.MeshStandardMaterial({
        color: 0x49352c,
        roughness: 0.9
    }),

    glow: new THREE.MeshBasicMaterial({
        color: 0x9bbbd3,
        transparent: true,
        opacity: 0.22
    }),

    writing: new THREE.MeshBasicMaterial({
        color: 0x252525
    })
};

/* ==========================================
   TEXTURAS DAS PISTAS
========================================== */

function createTextTexture(title, subtitle) {
    const canvas = document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 320;

    const context = canvas.getContext("2d");

    context.fillStyle = "#c9c1aa";
    context.fillRect(0, 0, 512, 320);

    context.fillStyle = "#34332f";
    context.font = "bold 29px Georgia";
    context.fillText(title, 30, 65);

    context.strokeStyle = "#777064";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(30, 85);
    context.lineTo(475, 85);
    context.stroke();

    context.fillStyle = "#4c4942";
    context.font = "20px Georgia";

    const words = subtitle.split(" ");
    let line = "";
    let y = 130;

    for (const word of words) {
        const testLine = line + word + " ";

        if (context.measureText(testLine).width > 445) {
            context.fillText(line, 30, y);
            line = word + " ";
            y += 31;
        } else {
            line = testLine;
        }
    }

    context.fillText(line, 30, y);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

/* ==========================================
   CRIAR DOCUMENTO
========================================== */

function createDocument(group, clue) {
    const texture = createTextTexture(
        clue.title,
        "Arquivo encontrado durante a investigação. Os registros apresentam informações incompletas."
    );

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 1,
        side: THREE.DoubleSide
    });

    const paper = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.035, 0.58),
        materials.paper
    );

    paper.position.y = 0.12;
    paper.rotation.x = -Math.PI / 2;

    group.add(paper);

    const writing = new THREE.Mesh(
        new THREE.PlaneGeometry(0.78, 0.48),
        material
    );

    writing.rotation.x = -Math.PI / 2;
    writing.rotation.z = Math.PI / 2;
    writing.position.set(0, 0.14, 0);

    group.add(writing);

    group.userData.extraMaterials = [material];
}

/* ==========================================
   CRIAR FOTOGRAFIA
========================================== */

function createPhoto(group) {
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.04, 0.5),
        materials.frame || materials.darkPaper
    );

    frame.position.y = 0.12;

    group.add(frame);

    const photo = new THREE.Mesh(
        new THREE.PlaneGeometry(0.55, 0.39),
        materials.photograph
    );

    photo.rotation.x = -Math.PI / 2;
    photo.position.set(0, 0.145, 0);

    group.add(photo);

    const silhouetteMaterial = new THREE.MeshBasicMaterial({
        color: 0x090d12
    });

    const figures = [];

    for (let i = 0; i < 4; i++) {
        const figure = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.045, 0.12, 3, 6),
            silhouetteMaterial
        );

        figure.position.set(
            -0.19 + i * 0.12,
            0.15,
            -0.02
        );

        figure.rotation.x = -Math.PI / 2;

        group.add(figure);
        figures.push(figure);
    }

    group.userData.extraMaterials = [silhouetteMaterial];
}

/* ==========================================
   CRIAR DIÁRIO
========================================== */

function createBook(group) {
    const cover = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.12, 0.48),
        materials.book
    );

    cover.position.y = 0.15;

    group.add(cover);

    const pages = new THREE.Mesh(
        new THREE.BoxGeometry(0.64, 0.025, 0.43),
        materials.paper
    );

    pages.position.y = 0.218;

    group.add(pages);

    const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0x655e50
    });

    for (let i = 0; i < 4; i++) {
        const line = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.008, 0.008),
            lineMaterial
        );

        line.position.set(
            0,
            0.236,
            -0.12 + i * 0.075
        );

        group.add(line);
    }

    group.userData.extraMaterials = [lineMaterial];
}

/* ==========================================
   CRIAR MENSAGEM
========================================== */

function createMessage(group) {
    const board = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.8, 0.08),
        new THREE.MeshStandardMaterial({
            color: 0x18221e,
            roughness: 0.95
        })
    );

    board.position.y = 0.8;

    group.add(board);

    const texture = createTextTexture(
        "NÃO ESQUEÇA",
        "Algumas pessoas desapareceram das fotografias. Não confie nas imagens."
    );

    const message = new THREE.Mesh(
        new THREE.PlaneGeometry(1.25, 0.65),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: false
        })
    );

    message.position.set(0, 0.8, 0.045);

    group.add(message);

    group.userData.extraMaterials = [
        board.material,
        message.material
    ];

    group.userData.extraTextures = [texture];
}

/* ==========================================
   CRIAR OBJETO DA PISTA
========================================== */

function createClueObject(clue) {
    const group = new THREE.Group();

    group.position.set(
        clue.position[0],
        clue.position[1],
        clue.position[2]
    );

    group.userData.clue = clue;

    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.48, 12, 12),
        materials.glow
    );

    glow.position.y = 0.15;

    group.add(glow);

    switch (clue.type) {
        case "document":
            createDocument(group, clue);
            break;

        case "photo":
            createPhoto(group);
            break;

        case "book":
            createBook(group);
            break;

        case "message":
            createMessage(group);
            break;
    }

    const marker = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.012, 6, 24),
        new THREE.MeshBasicMaterial({
            color: 0x9bbbd3,
            transparent: true,
            opacity: 0.65
        })
    );

    marker.rotation.x = Math.PI / 2;
    marker.position.y = 0.48;

    group.add(marker);

    group.userData.marker = marker;

    group.traverse((object) => {
        if (object.isMesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            object.userData.clueId = clue.id;
        }
    });

    return group;
}

/* ==========================================
   CRIAR TODAS AS PISTAS
========================================== */

export function createLocationClues(scene) {
    const objects = [];

    locationClues.forEach((clue) => {
        const object = createClueObject(clue);

        scene.add(object);

        objects.push(object);
    });

    return objects;
}
