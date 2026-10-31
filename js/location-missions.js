
/* ==========================================
   A CIDADE SEM ROSTO
   MISSÕES DE INVESTIGAÇÃO
========================================== */

export function createLocationMissions() {

    const missions = [
        {
            id: "hospital_investigation",
            name: "Os registros do hospital",
            location: "Hospital abandonado",

            description:
                "Os registros médicos revelam que vários pacientes foram internados sem qualquer identificação.",

            objective:
                "Encontre o prontuário médico e a fotografia antiga.",

            requiredClues: [
                "hospital_record",
                "hospital_photo"
            ],

            reward:
                "Uma nova informação sobre os desaparecimentos."
        },

        {
            id: "school_investigation",
            name: "O último dia de aula",
            location: "Escola abandonada",

            description:
                "Um diário esquecido e uma mensagem no quadro podem explicar o que aconteceu com os estudantes.",

            objective:
                "Encontre o diário e investigue a mensagem deixada na sala.",

            requiredClues: [
                "school_diary",
                "school_message"
            ],

            reward:
                "Uma pista sobre a origem do mistério."
        }
    ];

    let completedMissions = [];
    let activeMissionIndex = 0;

    /* ======================================
       VERIFICAR CONCLUSÃO
    ====================================== */

    function checkCompletion(collectedClues = []) {
        const clues = new Set(collectedClues);

        for (const mission of missions) {
            const alreadyCompleted =
                completedMissions.includes(mission.id);

            if (alreadyCompleted) continue;

            const allFound =
                mission.requiredClues.every(
                    (clueId) => clues.has(clueId)
                );

            if (allFound) {
                completedMissions.push(mission.id);

                activeMissionIndex = Math.min(
                    missions.findIndex(
                        (item) => item.id === mission.id
                    ) + 1,
                    missions.length - 1
                );

                return {
                    completed: true,
                    id: mission.id,
                    name: mission.name,
                    location: mission.location,
                    description: mission.description,
                    reward: mission.reward
                };
            }
        }

        return null;
    }

    /* ======================================
       MISSÃO ATUAL
    ====================================== */

    function getCurrentMission() {
        const nextMission = missions.find(
            (mission) =>
                !completedMissions.includes(mission.id)
        );

        return nextMission
            ? { ...nextMission }
            : null;
    }

    /* ======================================
       PROGRESSO DA MISSÃO
    ====================================== */

    function getMissionProgress(id, collectedClues = []) {
        const mission = getMission(id);

        if (!mission) return null;

        const clues = new Set(collectedClues);

        const found = mission.requiredClues.filter(
            (clueId) => clues.has(clueId)
        ).length;

        return {
            found,
            total: mission.requiredClues.length,
            percentage: Math.round(
                (found / mission.requiredClues.length) * 100
            ),
            completed: completedMissions.includes(id)
        };
    }

    /* ======================================
       TODAS AS MISSÕES
    ====================================== */

    function getAllMissions() {
        return missions.map((mission) => ({
            ...mission,
            requiredClues: [...mission.requiredClues],
            completed: completedMissions.includes(mission.id)
        }));
    }

    /* ======================================
       BUSCAR MISSÃO
    ====================================== */

    function getMission(id) {
        const mission = missions.find(
            (item) => item.id === id
        );

        if (!mission) return null;

        return {
            ...mission,
            requiredClues: [...mission.requiredClues]
        };
    }

    /* ======================================
       CONCLUIR MANUALMENTE
    ====================================== */

    function completeMission(id) {
        const mission = getMission(id);

        if (!mission) return false;

        if (completedMissions.includes(id)) {
            return false;
        }

        completedMissions.push(id);

        return true;
    }

    /* ======================================
       RESTAURAR PROGRESSO
    ====================================== */

    function restore(savedMissions = []) {
        if (!Array.isArray(savedMissions)) return;

        completedMissions = savedMissions.filter(
            (id) =>
                missions.some((mission) => mission.id === id)
        );

        activeMissionIndex = missions.findIndex(
            (mission) =>
                !completedMissions.includes(mission.id)
        );

        if (activeMissionIndex < 0) {
            activeMissionIndex = missions.length;
        }
    }

    /* ======================================
       CONSULTAR CONCLUÍDAS
    ====================================== */

    function getCompleted() {
        return [...completedMissions];
    }

    /* ======================================
       VERIFICAR SE TERMINOU
    ====================================== */

    function areAllCompleted() {
        return completedMissions.length === missions.length;
    }

    /* ======================================
       REINICIAR MISSÕES
    ====================================== */

    function reset() {
        completedMissions = [];
        activeMissionIndex = 0;
    }

    /* ======================================
       RETORNO
    ====================================== */

    return {
        checkCompletion,
        getCurrentMission,
        getMissionProgress,
        getAllMissions,
        getMission,
        completeMission,
        getCompleted,
        areAllCompleted,
        restore,
        reset
    };
}
