export function createMissions() {

  const missions = [
    {
      id: "chapter_1",
      title: "O Despertar",
      description: "Descubra onde você está e investigue os arredores.",
      objectives: [
        "Explore a rua principal.",
        "Encontre a primeira fotografia.",
        "Investigue o documento abandonado."
      ],
      requiredClues: [
        "photo_01",
        "document_01"
      ],
      completed: false
    },
    {
      id: "chapter_2",
      title: "Memórias Perdidas",
      description: "As fotografias parecem esconder uma história.",
      objectives: [
        "Encontre a fotografia da escola.",
        "Procure mensagens deixadas na cidade.",
        "Descubra o que aconteceu com os moradores."
      ],
      requiredClues: [
        "photo_02",
        "note_01"
      ],
      completed: false
    },
    {
      id: "chapter_3",
      title: "Lugares Esquecidos",
      description: "Investigue os prédios abandonados.",
      objectives: [
        "Entre no hospital.",
        "Investigue os registros médicos.",
        "Visite a escola abandonada."
      ],
      requiredClues: [
        "hospital_record",
        "hospital_photo",
        "school_diary",
        "school_message"
      ],
      completed: false
    },
    {
      id: "chapter_4",
      title: "A Cidade Sem Rosto",
      description: "As pistas começam a revelar a verdade.",
      objectives: [
        "Reúna todas as pistas.",
        "Descubra a origem do mistério.",
        "Encontre o último registro da cidade."
      ],
      requiredClues: [],
      completed: false
    }
  ];

  let currentMissionIndex = 0;

  const collectedClues = new Set();

  const completedMissions = new Set();

  // =========================================
  // MISSÃO ATUAL
  // =========================================

  function getCurrentMission() {
    return missions[currentMissionIndex] || null;
  }

  // =========================================
  // LISTA DE MISSÕES
  // =========================================

  function getAllMissions() {

    return missions.map(mission => ({
      ...mission,
      objectives: [...mission.objectives],
      requiredClues: [...mission.requiredClues]
    }));

  }

  // =========================================
  // ATUALIZAR OBJETIVO
  // =========================================

  function getCurrentObjective() {

    const mission = getCurrentMission();

    if (!mission) {
      return "A investigação foi concluída.";
    }

    const remaining = mission.requiredClues.filter(
      id => !collectedClues.has(id)
    );

    if (remaining.length > 0) {
      return mission.objectives[0];
    }

    return mission.objectives[
      mission.objectives.length - 1
    ];

  }

  // =========================================
  // REGISTRAR PISTA
  // =========================================

  function collectClue(clueId) {

    if (!clueId) return false;

    collectedClues.add(clueId);

    checkMissionCompletion();

    return true;

  }

  // =========================================
  // VERIFICAR CONCLUSÃO
  // =========================================

  function checkMissionCompletion() {

    const mission = getCurrentMission();

    if (!mission) return false;

    const completed = mission.requiredClues.every(
      id => collectedClues.has(id)
    );

    if (!completed) return false;

    mission.completed = true;

    completedMissions.add(mission.id);

    return true;

  }

  // =========================================
  // AVANÇAR MISSÃO
  // =========================================

  function nextMission() {

    checkMissionCompletion();

    const mission = getCurrentMission();

    if (!mission || !mission.completed) {
      return false;
    }

    if (currentMissionIndex >= missions.length - 1) {
      return false;
    }

    currentMissionIndex++;

    return true;

  }

  // =========================================
  // RESTAURAR PROGRESSO
  // =========================================

  function restore(data = {}) {

    collectedClues.clear();
    completedMissions.clear();

    (data.collectedClues || []).forEach(id => {
      collectedClues.add(id);
    });

    (data.completedMissions || []).forEach(id => {
      completedMissions.add(id);
    });

    currentMissionIndex = Math.max(
      0,
      Math.min(
        Number(data.currentMissionIndex) || 0,
        missions.length - 1
      )
    );

    missions.forEach(mission => {
      mission.completed =
        completedMissions.has(mission.id);
    });

    checkMissionCompletion();

  }

  // =========================================
  // SALVAR PROGRESSO
  // =========================================

  function getProgress() {

    return {
      currentMissionIndex,
      collectedClues: Array.from(collectedClues),
      completedMissions: Array.from(completedMissions)
    };

  }

  // =========================================
  // REINICIAR
  // =========================================

  function reset() {

    currentMissionIndex = 0;

    collectedClues.clear();

    completedMissions.clear();

    missions.forEach(mission => {
      mission.completed = false;
    });

  }

  return {
    getCurrentMission,
    getCurrentObjective,
    getAllMissions,
    collectClue,
    checkMissionCompletion,
    nextMission,
    restore,
    getProgress,
    reset
  };

}
