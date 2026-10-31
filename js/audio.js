export function createAudio() {

  let audioContext = null;
  let masterGain = null;

  let windGain = null;
  let windOscillator = null;
  let windFilter = null;

  let ambientStarted = false;
  let muted = false;

  const activeNodes = [];

  // =========================================
  // INICIALIZAÇÃO DO ÁUDIO
  // =========================================

  function initialize() {

    if (audioContext) return;

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      console.warn("Áudio não suportado neste navegador.");
      return;
    }

    audioContext = new AudioContextClass();

    masterGain = audioContext.createGain();

    masterGain.gain.value = 0.35;

    masterGain.connect(audioContext.destination);

  }

  // =========================================
  // RUÍDO DE VENTO
  // =========================================

  function createWind() {

    if (!audioContext || windOscillator) return;

    windOscillator = audioContext.createOscillator();

    windFilter = audioContext.createBiquadFilter();

    windGain = audioContext.createGain();

    windOscillator.type = "sawtooth";

    windOscillator.frequency.value = 65;

    windFilter.type = "lowpass";

    windFilter.frequency.value = 180;

    windGain.gain.value = 0.025;

    windOscillator.connect(windFilter);

    windFilter.connect(windGain);

    windGain.connect(masterGain);

    windOscillator.start();

    activeNodes.push(windOscillator);

  }

  // =========================================
  // SOM ATMOSFÉRICO
  // =========================================

  function createAmbientTone(frequency, volume, duration = 4) {

    if (!audioContext || muted) return;

    const oscillator = audioContext.createOscillator();

    const gain = audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(
      0,
      audioContext.currentTime
    );

    gain.gain.linearRampToValueAtTime(
      volume,
      audioContext.currentTime + 1
    );

    gain.gain.linearRampToValueAtTime(
      0,
      audioContext.currentTime + duration
    );

    oscillator.connect(gain);

    gain.connect(masterGain);

    oscillator.start();

    oscillator.stop(
      audioContext.currentTime + duration + 0.1
    );

    activeNodes.push(oscillator);

  }

  // =========================================
  // RUÍDO DISTANTE
  // =========================================

  function createDistantSound() {

    if (!audioContext || muted) return;

    const frequency =
      90 + Math.random() * 180;

    const duration =
      2 + Math.random() * 3;

    createAmbientTone(
      frequency,
      0.012,
      duration
    );

  }

  // =========================================
  // INICIAR AMBIENTAÇÃO
  // =========================================

  async function start() {

    initialize();

    if (!audioContext) return;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    if (ambientStarted) return;

    ambientStarted = true;

    createWind();

    ambientLoop();

  }

  // =========================================
  // CICLO DE AMBIENTAÇÃO
  // =========================================

  let ambientTimer = null;

  function ambientLoop() {

    if (!ambientStarted) return;

    createDistantSound();

    ambientTimer = setTimeout(
      ambientLoop,
      5000 + Math.random() * 7000
    );

  }

  // =========================================
  // EFEITO DE SUSPENSE
  // =========================================

  function playSuspense() {

    initialize();

    if (!audioContext || muted) return;

    createAmbientTone(
      42,
      0.07,
      5
    );

    createAmbientTone(
      110,
      0.025,
      4
    );

  }

  // =========================================
  // EFEITO DE DESCOBERTA
  // =========================================

  function playDiscovery() {

    initialize();

    if (!audioContext || muted) return;

    createAmbientTone(
      440,
      0.025,
      0.7
    );

    createAmbientTone(
      554,
      0.025,
      1
    );

  }

  // =========================================
  // CONTROLE DE VOLUME
  // =========================================

  function setVolume(value) {

    initialize();

    if (!masterGain || !audioContext) return;

    const volume = Math.max(
      0,
      Math.min(1, Number(value))
    );

    masterGain.gain.setTargetAtTime(
      volume,
      audioContext.currentTime,
      0.1
    );

  }

  // =========================================
  // SILENCIAR
  // =========================================

  function mute() {

    muted = true;

    if (masterGain && audioContext) {
      masterGain.gain.setTargetAtTime(
        0,
        audioContext.currentTime,
        0.1
      );
    }

  }

  function unmute() {

    muted = false;

    if (masterGain && audioContext) {
      masterGain.gain.setTargetAtTime(
        0.35,
        audioContext.currentTime,
        0.1
      );
    }

  }

  // =========================================
  // ENCERRAR ÁUDIO
  // =========================================

  function stop() {

    ambientStarted = false;

    if (ambientTimer) {
      clearTimeout(ambientTimer);
      ambientTimer = null;
    }

    if (windOscillator) {
      try {
        windOscillator.stop();
      } catch (error) {}

      windOscillator = null;
    }

    activeNodes.forEach(node => {
      try {
        node.stop();
      } catch (error) {}
    });

    activeNodes.length = 0;

  }

  // =========================================
  // DESTRUIR SISTEMA
  // =========================================

  function destroy() {

    stop();

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

  }

  return {
    start,
    stop,
    mute,
    unmute,
    setVolume,
    playSuspense,
    playDiscovery,
    destroy,

    isMuted: () => muted
  };

}
