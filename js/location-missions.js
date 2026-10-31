
const missions = [
    {
        id: "hospital_investigation",
        name: "Os registros do hospital",
        location: "Hospital abandonado",
        description:
            "Investigue o hospital e descubra por que todos os pacientes desapareceram.",
        requiredClues: [
            "hospital_record",
            "hospital_photo"
        ],
        completed: false
    },

    {
        id: "school_investigation",
        name: "O último dia de aula",
        location: "Escola abandonada",
        description:
            "Encontre o diário e a mensagem deixada dentro da escola.",
        requiredClues: [
            "school_diary",
            "school_message"
        ],
        completed: false
    }
];

export function createLocationMissions() {
    const completedMissions = new Set();

    function checkCompletion(collectedClues) {
        if (!collectedClues) {
            return null;
        }

        for (const mission of missions) {
            if (completedMissions.has(mission.id)) {
                continue;
            }

            const allFound = mission.requiredClues.every(
                (clueId) => collectedClues.has(clueId)
            );

            if (allFound) {
                completedMissions.add(mission.id);

                mission.completed = true;

                return {
                    completed: true,
                    id: mission.id,
                    name: mission.name,
                    location: mission.location,
                    description: mission.description
                };
            }
        }

        return null;
    }

    function getCompleted() {
        return Array.from(completedMissions);
    }

    function restore(savedMissions = []) {
        completedMissions.clear();

        missions.forEach((mission) => {
            mission.completed = false;
        });

        savedMissions.forEach((id) => {
            completedMissions.add(id);

            const mission = missions.find(
                (mission) => mission.id === id
            );

            if (mission) {
                mission.completed = true;
            }
        });
    }

    function getAllMissions() {
        return missions.map((mission) => ({
            ...mission,
            requiredClues: [...mission.requiredClues],
            completed: completedMissions.has(mission.id)
        }));
    }

    function getMission(id) {
        const mission = missions.find(
            (item) => item.id === id
        );

        if (!mission) return null;

        return {
            ...mission,
            completed: completedMissions.has(mission.id)
        };
    }

    function reset() {
        completedMissions.clear();

        missions.forEach((mission) => {
            mission.completed = false;
        });
    }

    return {
        checkCompletion,
        getCompleted,
        getAllMissions,
        getMission,
        restore,
        reset
    };
}
