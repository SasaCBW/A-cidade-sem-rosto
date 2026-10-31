export function createInterface() {

  const elements = {
    clock: document.getElementById("gameClock"),
    mission: document.getElementById("missionText"),
    prompt: document.getElementById("interactionPrompt"),
    message: document.getElementById("gameMessage"),
    hud: document.getElementById("hud")
  };

  let messageTimeout = null;
  let clockInterval = null;
  let elapsedSeconds = 0;

  let currentMission =
    "Explore a cidade e descubra o que aconteceu.";

  // =========================================
  // RELÓGIO DO JOGO
  // =========================================

  function updateClock() {

    elapsedSeconds++;

    const hours = 23 + Math.floor(
      elapsedSeconds / 60
    );

    const minutes = elapsedSeconds % 60;

    const formattedHours = String(
      hours % 24
    ).padStart(2, "0");

    const formattedMinutes = String(
      minutes
    ).padStart(2, "0");

    if (elements.clock) {
      elements.clock.textContent =
        `${formattedHours}:${formattedMinutes}`;
    }

  }

  function startClock() {

    if (clockInterval) return;

    clockInterval = setInterval(
      updateClock,
      60000
    );

    if (elements.clock) {
      elements.clock.textContent = "23:00";
    }

  }

  function stopClock() {

    if (clockInterval) {
      clearInterval(clockInterval);
      clockInterval = null;
    }

  }

  // =========================================
  // MISSÕES
  // =========================================

  function setMission(text) {

    currentMission = text;

    if (elements.mission) {
      elements.mission.textContent = text;
    }

  }

  function getMission() {
    return currentMission;
  }

  // =========================================
  // MENSAGENS
  // =========================================

  function showMessage(title, description, duration = 4500) {

    if (!elements.message) return;

    elements.message.innerHTML = `
      <div class="interface-message">
        <h2>${title}</h2>
        <p>${description}</p>
      </div>
    `;

    elements.message.classList.add("visible");

    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }

    messageTimeout = setTimeout(() => {
      elements.message.classList.remove("visible");
    }, duration);

  }

  function hideMessage() {

    if (!elements.message) return;

    elements.message.classList.remove("visible");

    if (messageTimeout) {
      clearTimeout(messageTimeout);
      messageTimeout = null;
    }

  }

  // =========================================
  // INDICAÇÃO DE INTERAÇÃO
  // =========================================

  function showPrompt(text = "Pressione E para interagir") {

    if (!elements.prompt) return;

    elements.prompt.textContent = text;

    elements.prompt.classList.add("visible");

  }

  function hidePrompt() {

    if (!elements.prompt) return;

    elements.prompt.classList.remove("visible");

  }

  // =========================================
  // HUD
  // =========================================

  function showHUD() {

    if (elements.hud) {
      elements.hud.classList.remove("hidden");
    }

  }

  function hideHUD() {

    if (elements.hud) {
      elements.hud.classList.add("hidden");
    }

  }

  // =========================================
  // INICIALIZAÇÃO
  // =========================================

  setMission(currentMission);

  showHUD();

  // =========================================
  // RETORNO
  // =========================================

  return {

    startClock,

    stopClock,

    setMission,

    getMission,

    showMessage,

    hideMessage,

    showPrompt,

    hidePrompt,

    showHUD,

    hideHUD,

    getElapsedTime() {
      return elapsedSeconds;
    },

    destroy() {

      stopClock();

      hideMessage();

      hidePrompt();

    }

  };

}
