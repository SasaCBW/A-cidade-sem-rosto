const SAVE_KEY = "aCidadeSemRosto_save";
const SAVE_VERSION = 1;

export function saveGame(data = {}) {
    try {
        const saveData = {
            version: SAVE_VERSION,
            savedAt: new Date().toISOString(),

            player: {
                position: data.position || {
                    x: 0,
                    y: 1.7,
                    z: 8
                }
            },

            collectedClues: Array.isArray(data.collectedClues)
                ? data.collectedClues
                : [],

            openedBuildings: Array.isArray(data.openedBuildings)
                ? data.openedBuildings
                : [],

            journal: Array.isArray(data.journal)
                ? data.journal
                : [],

            completedMissions: Array.isArray(data.completedMissions)
                ? data.completedMissions
                : [],

            currentChapter: Number.isInteger(data.currentChapter)
                ? data.currentChapter
                : 1,

            playTime: Number.isFinite(data.playTime)
                ? data.playTime
                : 0
        };

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(saveData)
        );

        window.dispatchEvent(
            new CustomEvent("gameSaved", {
                detail: {
                    savedAt: saveData.savedAt
                }
            })
        );

        return true;

    } catch (error) {
        console.error("Erro ao salvar o jogo:", error);
        return false;
    }
}

export function loadGame() {
    try {
        const storedData = localStorage.getItem(SAVE_KEY);

        if (!storedData) {
            return null;
        }

        const data = JSON.parse(storedData);

        if (!data || typeof data !== "object") {
            return null;
        }

        if (data.version !== SAVE_VERSION) {
            console.warn("Versão do salvamento incompatível.");
            return null;
        }

        return {
            version: data.version,
            savedAt: data.savedAt || null,

            position: {
                x: Number(data.player?.position?.x) || 0,
                y: Number(data.player?.position?.y) || 1.7,
                z: Number(data.player?.position?.z) || 8
            },

            collectedClues: Array.isArray(data.collectedClues)
                ? data.collectedClues
                : [],

            openedBuildings: Array.isArray(data.openedBuildings)
                ? data.openedBuildings
                : [],

            journal: Array.isArray(data.journal)
                ? data.journal
                : [],

            completedMissions: Array.isArray(data.completedMissions)
                ? data.completedMissions
                : [],

            currentChapter: Number.isInteger(data.currentChapter)
                ? data.currentChapter
                : 1,

            playTime: Number.isFinite(data.playTime)
                ? data.playTime
                : 0
        };

    } catch (error) {
        console.error("Erro ao carregar o salvamento:", error);
        return null;
    }
}

export function deleteSave() {
    try {
        localStorage.removeItem(SAVE_KEY);

        window.dispatchEvent(
            new CustomEvent("gameSaveDeleted")
        );

        return true;

    } catch (error) {
        console.error("Erro ao apagar o salvamento:", error);
        return false;
    }
}

export function hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

export function getSaveDate() {
    const data = loadGame();

    if (!data || !data.savedAt) {
        return null;
    }

    return new Date(data.savedAt);
}
