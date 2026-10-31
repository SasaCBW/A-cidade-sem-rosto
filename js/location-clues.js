
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const CLUES = [
  {
    id: "hospital_record",
    title: "Prontuário médico",
    description:
      "Um prontuário antigo encontrado no hospital. Há registros de pacientes que desapareceram sem explicação.",
    category: "hospital",
    position: [69, 0.95, -31],
    type: "document",
    text: "HOSPITAL MUNICIPAL\n\nREGISTRO DE PACIENTE\n\nPaciente: Não identificado\nData: 17/08/1998\n\nObservação: O paciente afirma que todas as pessoas da cidade perderam seus rostos.\n\nÚltima anotação: NÃO CONFIE NAS FOTOGRAFIAS."
  },
  {
    id: "hospital_photo",
    title: "Fotografia do hospital",
    description:
      "Uma fotografia antiga mostra o corredor do hospital. Uma figura estranha aparece ao fundo.",
    category: "hospital",
    position: [81, 0.95, -38],
    type: "photo",
    text: "ARQUIVO FOTOGRÁFICO\nHOSPITAL — 1998\n\nRegistro encontrado no setor de enfermagem."
  },
  {
    id: "school_diary",
    title: "Diário de estudante",
    description:
      "As páginas estão amareladas. A última anotação parece ter sido escrita às pressas.",
    category: "school",
    position: [69, 0.95, -72],
    type: "document",
    text: "MEU DIÁRIO\n\nHoje aconteceu de novo.\n\nAs pessoas continuam andando pela cidade, mas ninguém tem rosto nas fotografias.\n\nMinha mãe diz que está tudo normal.\n\nEu sei que ela está mentindo.\n\nAmanhã vou descobrir o que existe no prédio antigo."
  },
  {
    id: "school_message",
    title: "Bilhete escondido",
    description:
      "Um bilhete foi encontrado próximo à sala de aula. Ele indica que alguém conhecia o segredo da cidade.",
    category: "school",
    position: [81, 1.05, -81],
    type: "note",
    text: "SE VOCÊ ENCONTROU ISTO...\n\nNão procure pelas pessoas desaparecidas.\n\nProcure pelas fotografias.\n\nA cidade não esquece ninguém.\n\nELA APENAS APAGA OS ROSTOS."
  }
];

function createCanvasTexture(title, content, type) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 640;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = type === "photo" ? "#252525" : "#d2c7a8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (type === "photo") {
    ctx.fillStyle = "#101010";
    ctx.fillRect(25, 25, 462, 590);

    ctx.fillStyle = "#777";
    ctx.fillRect(55, 65, 402, 390);

    ctx.fillStyle = "#303030";
    ctx.fillRect(55, 65, 402, 390);

    ctx.fillStyle = "#171717";
    ctx.fillRect(105, 240, 300, 215);

    ctx.fillStyle = "#080808";
    ctx.beginPath();
    ctx.ellipse(255, 210, 48, 65, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#151515";
    ctx.beginPath();
    ctx.moveTo(180, 455);
    ctx.lineTo(205, 280);
    ctx.lineTo(305, 280);
    ctx.lineTo(330, 455);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#dedede";
    ctx.font = "bold 22px Arial";
    ctx.fillText("ARQUIVO — 1998", 75, 530);
    ctx.font = "16px Arial";
    ctx.fillText("REGISTRO FOTOGRÁFICO", 75, 565);
  } else {
    ctx.fillStyle = "#29251e";
    ctx.font = "bold 27px Georgia";
    ctx.fillText(title.toUpperCase(), 38, 65);

    ctx.strokeStyle = "#8d8068";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(38, 88);
    ctx.lineTo(474, 88);
    ctx.stroke();

    ctx.fillStyle = "#302b23";
    ctx.font = "20px Georgia";

    const paragraphs = content.split("\n");
    let y = 135;

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === "") {
        y += 18;
        continue;
      }

      const words = paragraph.split(" ");
      let line = "";

      for (const word of words) {
        const testLine = line + word + " ";

        if (ctx.measureText(testLine).width > 420) {
          ctx.fillText(line, 40, y);
          line = word + " ";
          y += 31;
        } else {
          line = testLine;
        }
      }

      if (line) {
        ctx.fillText(line, 40, y);
        y += 38;
      }

      if (y > 575) break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  return texture;
}

function createClueObject(data) {
  const group = new THREE.Group();
  group.position.set(...data.position);

  const isPhoto = data.type === "photo";
  const isNote = data.type === "note";

  const width = isPhoto ? 0.65 : 0.48;
  const height = isPhoto ? 0.78 : 0.65;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: isPhoto ? 0x171717 : 0x594b35,
    roughness: 0.9
  });

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.08, height + 0.08, 0.045),
    frameMaterial
  );

  frame.position.y = 0.025;
  group.add(frame);

  const texture = createCanvasTexture(
    data.title,
    data.text,
    data.type
  );

  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 1,
      side: THREE.DoubleSide
    })
  );

  paper.position.z = 0.026;
  paper.position.y = 0.025;
  group.add(paper);

  const glow = new THREE.PointLight(
    0x8bbcff,
    0.65,
    2.8
  );

  glow.position.set(0, 0.45, 0.25);
  group.add(glow);

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 12, 12),
    new THREE.MeshBasicMaterial({
      color: 0x9bcaff
    })
  );

  marker.position.set(0, 0.55, 0.12);
  group.add(marker);

  group.userData.clue = {
    id: data.id,
    title: data.title,
    name: data.title,
    description: data.description,
    category: data.category,
    text: data.text
  };

  group.userData.clueId = data.id;

  group.userData.originalPosition = group.position.clone();

  group.rotation.y = isPhoto ? -0.2 : 0.15;

  return group;
}

export function createLocationClues(scene) {
  const clueObjects = [];

  for (const data of CLUES) {
    const clue = createClueObject(data);

    scene.add(clue);
    clueObjects.push(clue);
  }

  clueObjects.restoreCollected = function (savedIds = []) {
    const collected = new Set(savedIds);

    for (const clue of clueObjects) {
      const id = clue.userData.clue?.id;

      clue.visible = !collected.has(id);
    }
  };

  clueObjects.reset = function () {
    for (const clue of clueObjects) {
      clue.visible = true;
    }
  };

  clueObjects.getById = function (id) {
    return clueObjects.find(
      clue => clue.userData.clue?.id === id
    ) || null;
  };

  clueObjects.getAll = function () {
    return [...clueObjects];
  };

  clueObjects.destroy = function () {
    for (const clue of clueObjects) {
      scene.remove(clue);

      clue.traverse(object => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          for (const material of materials) {
            if (material.map) material.map.dispose();
            material.dispose();
          }
        }
      });
    }

    clueObjects.length = 0;
  };

  return clueObjects;
}
