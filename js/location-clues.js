
export const locationClues = [
  {
    id: "hospital_record",
    name: "Prontuário esquecido",
    description:
      "Um prontuário encontrado no hospital registra pacientes que foram transferidos na mesma noite. Os nomes foram apagados.",
    position: [75, 1.1, -35]
  },
  {
    id: "hospital_photo",
    name: "Fotografia do hospital",
    description:
      "Uma fotografia antiga mostra funcionários reunidos. Os rostos das pessoas estão completamente ausentes.",
    position: [80, 1.1, -31]
  },
  {
    id: "school_diary",
    name: "Diário de estudante",
    description:
      "Um estudante escreveu que algumas pessoas começaram a desaparecer das fotografias antes de desaparecerem da cidade.",
    position: [75, 1.1, -75]
  },
  {
    id: "school_message",
    name: "Mensagem no quadro",
    description:
      "Uma mensagem deixada no quadro diz: 'Não confie nas fotografias. Elas mostram o que a cidade quer esconder.'",
    position: [75, 2.6, -84]
  }
];

export function createLocationClues(scene) {
  const objects = [];

  const materials = [
    new THREE.MeshStandardMaterial({
      color: 0xc9b98d,
      roughness: 0.95
    }),
    new THREE.MeshStandardMaterial({
      color: 0x8c2727,
      roughness: 0.85
    }),
    new THREE.MeshStandardMaterial({
      color: 0xddddc8,
      roughness: 0.95
    })
  ];

  locationClues.forEach((clue, index) => {
    const geometry = new THREE.BoxGeometry(
      0.55,
      0.08,
      0.4
    );

    const object = new THREE.Mesh(
      geometry,
      materials[index % materials.length]
    );

    object.position.set(...clue.position);
    object.rotation.y = index * 0.35;
    object.castShadow = true;

    object.userData.clue = clue;

    scene.add(object);
    objects.push(object);
  });

  return objects;
}
