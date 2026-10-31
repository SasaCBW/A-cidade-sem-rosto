
export const locationMissions = [
  {
    id: "hospital",
    title: "O silêncio do hospital",
    description:
      "Investigue o hospital abandonado e descubra o que aconteceu com seus pacientes.",
    requiredClues: [
      "hospital_record",
      "hospital_photo"
    ]
  },
  {
    id: "school",
    title: "A última aula",
    description:
      "Explore a escola e procure registros deixados pelos estudantes.",
    requiredClues: [
      "school_diary",
      "school_message"
    ]
  }
];

export function createLocationMissions() {
  const completed = new Set();

  function checkCompletion(collectedClues) {
    const completedNow = [];

    locationMissions.forEach(mission => {
      const finished = mission.requiredClues.every(
        id => collectedClues.has(id)
      );

      if (finished && !completed.has(mission.id)) {
        completed.add(mission.id);
        completedNow.push(mission);
      }
    });

    return completedNow;
  }

  function getCompleted() {
    return [...completed];
  }

  function restore(saved = []) {
    completed.clear();
    saved.forEach(id => completed.add(id));
  }

  return {
    checkCompletion,
    getCompleted,
    restore
  };
}
