import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createPlayer(camera) {
  const player = new THREE.Group();

  player.name = "Jogador";

  // Configurações do personagem
  const settings = {
    height: 1.7,
    walkSpeed: 4.2,
    runSpeed: 7.2,
    eyeHeight: 1.62
  };

  // Posição inicial na cidade
  player.position.set(0, 0, 8);

  // Câmera em primeira pessoa
  camera.position.set(
    0,
    settings.eyeHeight,
    0
  );

  camera.rotation.set(0, 0, 0);
  camera.rotation.order = "YXZ";

  player.add(camera);

  // Dados do jogador
  const state = {
    isMoving: false,
    isRunning: false,
    stamina: 100,
    maxStamina: 100
  };

  // Atualização da posição
  function update(delta) {
    const dt = Math.min(delta, 0.05);

    if (state.isRunning && state.isMoving) {
      state.stamina = Math.max(
        0,
        state.stamina - dt * 18
      );

      if (state.stamina <= 0) {
        state.isRunning = false;
      }
    } else {
      state.stamina = Math.min(
        state.maxStamina,
        state.stamina + dt * 10
      );
    }
  }

  function setMoving(value) {
    state.isMoving = Boolean(value);
  }

  function setRunning(value) {
    state.isRunning =
      Boolean(value) && state.stamina > 0;
  }

  function getState() {
    return { ...state };
  }

  function reset() {
    player.position.set(0, 0, 8);

    camera.position.set(
      0,
      settings.eyeHeight,
      0
    );

    camera.rotation.set(0, 0, 0);

    state.isMoving = false;
    state.isRunning = false;
    state.stamina = state.maxStamina;
  }

  return {
    group: player,
    camera,
    settings,
    state,

    update,
    setMoving,
    setRunning,
    getState,
    reset,

    getPosition() {
      return player.position.clone();
    },

    destroy() {
      player.remove(camera);
    }
  };
}
