
const SAVE_KEY = "aCidadeSemRosto_save";

export function saveGame(data = {}) {
  const saveData = {
    ...data,
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error("Não foi possível salvar:", error);
    return false;
  }
}

export function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Erro ao carregar:", error);
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}
