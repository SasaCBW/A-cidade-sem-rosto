
const SAVE_KEY = "aCidadeSemRosto_save";
const SAVE_VERSION = 1;

/* ==========================================
   PREPARAR DADOS
========================================== */

function createSaveData(data = {}) {
    return {
        version: SAVE_VERSION,

        savedAt: new Date().toISOString(),

        position: {
            x: Number(data.position?.x ?? 0),
            y: Number(data.position?.y ?? 0),
            z: Number(data.position?.z ?? 8)
        },

        collectedClues: Array.isArray(data.collectedClues)
            ? [...new Set(data.collectedClues)]
            : [],

        openedBuildings: Array.isArray(data.openedBuildings)
            ? [...new Set(data.openedBuildings)]
            : [],

        journal: Array.isArray(data.journal)
            ? data.journal
            : [],

        completedMissions: Array.isArray(data.completedMissions)
            ? [...new Set(data.completedMissions)]
            : [],

        currentChapter: Number(data.currentChapter ?? 1),

        playTime: Number(data.playTime ?? 0)
    };
}

/* ==========================================
   SALVAR JOGO
========================================== */

export function saveGame(data = {}) {
    try {
        const saveData = createSaveData(data);

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(saveData)
        );

        console.log("Progresso salvo com sucesso.");

        return true;
    } catch (error) {
        console.error("Erro ao salvar o jogo:", error);

        return false;
    }
}

/* ==========================================
   CARREGAR JOGO
========================================== */

export function loadGame() {
    try {
        const rawData = localStorage.getItem(SAVE_KEY);

        if (!rawData) return null;

        const data = JSON.parse(rawData);

        if (!data || typeof data !== "object") {
            return null;
        }

        if (data.version !== SAVE_VERSION) {
            console.warn("Versão de salvamento incompatível.");
            return null;
        }

        return createSaveData(data);
    } catch (error) {
        console.error("Erro ao carregar o jogo:", error);

        return null;
    }
}

/* ==========================================
   VERIFICAR SALVAMENTO
========================================== */

export function hasSave() {
    try {
        return localStorage.getItem(SAVE_KEY) !== null;
    } catch (error) {
        console.error("Erro ao verificar salvamento:", error);

        return false;
    }
}

/* ==========================================
   APAGAR SALVAMENTO
========================================== */

export function deleteSave() {
    try {
        localStorage.removeItem(SAVE_KEY);

        console.log("Salvamento apagado.");

        return true;
    } catch (error) {
        console.error("Erro ao apagar salvamento:", error);

        return false;
    }
}

/* ==========================================
   DATA DO SALVAMENTO
========================================== */

export function getSaveDate() {
    const data = loadGame();

    if (!data?.savedAt) return null;

    const date = new Date(data.savedAt);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

/* ==========================================
   TEMPO DE JOGO
========================================== */

export function formatPlayTime(seconds = 0) {
    const totalSeconds = Math.max(
        0,
        Math.floor(Number(seconds) || 0)
    );

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const remainingSeconds = totalSeconds % 60;

    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(remainingSeconds).padStart(2, "0")
    ].join(":");
}
