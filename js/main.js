
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

import { createWorld } from "./world.js";
import { createPlayer } from "./player.js";
import { createControls } from "./controls.js";
import { createInterface } from "./interface.js";
import { createAudio } from "./audio.js";
import { createFlashlight } from "./flashlight.js";
import { createInteractions } from "./interactions.js";
import { setupInventoryUI } from "./inventory-ui.js";
import { createDoors } from "./doors.js";
import { createInterior } from "./interior.js";
import { createApparition } from "./apparition.js";
import {
  completeChapter,
  showChapter
} from "./chapters.js";

import { createLighting } from "./lighting.js";
import { createInteractionEffects } from "./interaction-effects.js";

import {
  saveGame,
  loadGame
} from "./save-system.js";

import { createJournal } from "./journal.js";

import {
  createHospital
} from "./hospital.js";

import {
  createSchool
} from "./school.js";

import {
  createLocationClues
} from "./location-clues.js";

import {
  createLocationMissions
} from "./location-missions.js";

// ==================================================
// ELEMENTOS DA INTERFACE
// ==================================================

const container = document.getElementById("gameContainer");
const loadingScreen = document.getElementById("loadingScreen");
const mainMenu = document.getElementById("mainMenu");
const pauseMenu = document.getElementById("pauseMenu");

const missionText = document.getElementById("missionText");
const gameClock = document.getElementById("gameClock");
const gameMessage = document.getElementById("gameMessage");

const journalPanel = document.getElementById("journalPanel");
const journalButton = document.getElementById("journalButton");
const closeJournal = document.getElementById("closeJournal");

// ==================================================
// CENA 3D
// ==================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x101722);
scene.fog = new THREE.FogExp2(0x101722, 0.012);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 1.7, 8);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

container.prepend(renderer.domElement);

// ==================================================
// CRIAÇÃO DO MUNDO
// ==================================================

createLighting(scene);
createWorld(scene);

const player = createPlayer(camera);
const controls = createControls(camera, renderer.domElement);
const gameInterface = createInterface();
const audio = createAudio();

// ==================================================
// LANTERNA
// ==================================================

const flashlightButton = document.getElementById("flashlightBtn");

const flashlight = createFlashlight(
  camera,
  flashlightButton
);

// ==================================================
// INVENTÁRIO E INTERAÇÕES
// ==================================================

const interactions = createInteractions(
  scene,
  camera
);

setupInventoryUI();

// ==================================================
// EDIFÍCIOS
// ==================================================

createInterior(scene);

const hospital = createHospital(scene);
const school = createSchool(scene);

// ==================================================
// PORTAS
// ==================================================

const doors = createDoors(scene);

doors.addDoor(
  43.9,
  0,
  -6,
  0,
  "Delegacia"
);

doors.addDoor(
  43.9,
  0,
  -38,
  0,
  "Casa abandonada"
);

// ==================================================
// PERSONAGENS E EFEITOS
// ==================================================

const apparition = createApparition(scene);

const effects = createInteractionEffects(scene);

// ==================================================
// PISTAS DO HOSPITAL E DA ESCOLA
// ==================================================

const locationClueObjects = createLocationClues(scene);

const locationMissionSystem = createLocationMissions();

// ==================================================
// DIÁRIO
// ==================================================

const journal = createJournal();

// ==================================================
// SALVAMENTO
// ==================================================

const savedGame = loadGame();

let collectedClues = new Set();
let openedBuildings = new Set();

let gameStarted = false;
let gamePaused = false;

let elapsedTime = 0;

let messageTimeout = null;

// ==================================================
// RESTAURAÇÃO DO PROGRESSO
// ==================================================

if (savedGame) {
  collectedClues = new Set(
    savedGame.collectedClues || []
  );

  openedBuildings = new Set(
    savedGame.openedBuildings || []
  );

  if (savedGame.journal) {
    journal.restore(savedGame.journal);
  }

  if (savedGame.completedLocationMissions) {
    locationMissionSystem.restore(
      savedGame.completedLocationMissions
    );
  }

  if (savedGame.position) {
    camera.position.set(
      savedGame.position.x,
      savedGame.position.y,
      savedGame.position.z
    );
  }
}

// ==================================================
// MENSAGENS
// ==================================================

function showMessage(message) {
  if (!gameMessage) return;

  gameMessage.textContent = message;
  gameMessage.classList.add("visible");

  clearTimeout(messageTimeout);

  messageTimeout = setTimeout(() => {
    gameMessage.classList.remove("visible");
  }, 3500);
}

// ==================================================
// MISSÕES
// ==================================================

function updateMission(text) {
  if (missionText) {
    missionText.textContent = text;
  }
}

function updateProgress() {
  const total = collectedClues.size;

  if (total === 0) {
    updateMission(
      "Explore a cidade abandonada e procure pistas."
    );
  } else if (total < 4) {
    updateMission(
      `Encontre as pistas da cidade: ${total}/4.`
    );
  } else {
    updateMission(
      "Investigue os edifícios e descubra a verdade."
    );
  }
}

// ==================================================
// SISTEMA DE SALVAMENTO
// ==================================================

function saveProgress() {
  saveGame({
    collectedClues: [...collectedClues],

    openedBuildings: [...openedBuildings],

    journal: journal.getEntries(),

    completedLocationMissions:
      locationMissionSystem.getCompleted(),

    position: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    }
  });
}

// ==================================================
// COLETA DE PISTAS
// ==================================================

function registerClue(clue) {
  if (!clue || !clue.id) return;

  if (collectedClues.has(clue.id)) {
    return;
  }

  collectedClues.add(clue.id);

  journal.addEntry(
    clue.name || "Nova evidência",
    clue.description || "Uma evidência encontrada na cidade."
  );

  showMessage("NOVA PISTA ADICIONADA AO DIÁRIO");

  const completedMissions =
    locationMissionSystem.checkCompletion(collectedClues);

  completedMissions.forEach(mission => {
    journal.addEntry(
      mission.title,
      mission.description
    );

    showMessage("MISSÃO CONCLUÍDA: " + mission.title);
  });

  if (collectedClues.size >= 4) {
    completeChapter(3);
    showChapter(4);

    updateMission(
      "Todas as pistas foram encontradas. Descubra o que aconteceu."
    );
  } else {
    updateProgress();
  }

  saveProgress();
}

// ==================================================
// PISTAS ESPECIAIS: HOSPITAL E ESCOLA
// ==================================================

const clueRaycaster = new THREE.Raycaster();

function findNearbyLocationClue() {
  clueRaycaster.setFromCamera(
    new THREE.Vector2(0, 0),
    camera
  );

  const availableObjects = locationClueObjects.filter(
    object => {
      const clue = object.userData.clue;

      return clue && !collectedClues.has(clue.id);
    }
  );

  const intersections = clueRaycaster.intersectObjects(
    availableObjects,
    false
  );

  if (intersections.length === 0) {
    return null;
  }

  const selected = intersections[0];

  if (selected.distance > 3.5) {
    return null;
  }

  return selected.object;
}

function collectLocationClue() {
  const object = findNearbyLocationClue();

  if (!object) {
    return false;
  }

  const clue = object.userData.clue;

  registerClue(clue);

  scene.remove(object);

  const index = locationClueObjects.indexOf(object);

  if (index !== -1) {
    locationClueObjects.splice(index, 1);
  }

  return true;
}

// ==================================================
// PORTAS DOS EDIFÍCIOS
// ==================================================

function findNearbyDoor() {
  return doors.getDoors().find(door => {
    const position = door.pivot.position;

    const distance = camera.position.distanceTo(
      new THREE.Vector3(
        position.x + 0.9,
        1.4,
        position.z
      )
    );

    return distance < 3;
  });
}

function interactWithDoor() {
  const door = findNearbyDoor();

  if (!door) return false;

  const opened = doors.toggle(door);

  if (opened) {
    openedBuildings.add(door.name);

    if (door.name === "Delegacia") {
      completeChapter(1);
      showChapter(2);

      journal.addEntry(
        "Delegacia abandonada",
        "A delegacia parece ter sido abandonada às pressas. Existem documentos que precisam ser investigados."
      );
    }

    if (door.name === "Casa abandonada") {
      completeChapter(2);
      showChapter(3);

      journal.addEntry(
        "Casa abandonada",
        "A casa guarda vestígios de uma família que desapareceu misteriosamente."
      );
    }

    showMessage("PORTA ABERTA: " + door.name);

    saveProgress();
  }

  return true;
}

// ==================================================
// EVENTOS DO SISTEMA DE INTERAÇÕES
// ==================================================

window.addEventListener("clueCollected", event => {
  registerClue(event.detail);
});

// ==================================================
// INTERAÇÃO PELA TECLA E
// ==================================================

window.addEventListener("keydown", event => {
  if (!gameStarted || gamePaused) return;

  if (event.code !== "KeyE") return;

  if (collectLocationClue()) {
    return;
  }

  if (interactWithDoor()) {
    return;
  }

  interactions.interact();
});

// ==================================================
// DIÁRIO DE INVESTIGAÇÃO
// ==================================================

function toggleJournal(force) {
  if (!journalPanel) return;

  const shouldOpen =
    typeof force === "boolean"
      ? force
      : !journalPanel.classList.contains("open");

  journalPanel.classList.toggle(
    "open",
    shouldOpen
  );
}

journalButton?.addEventListener("click", () => {
  toggleJournal(true);
});

closeJournal?.addEventListener("click", () => {
  toggleJournal(false);
});

window.addEventListener("keydown", event => {
  if (
    event.code === "KeyJ" &&
    gameStarted &&
    !gamePaused
  ) {
    toggleJournal();
  }
});

// ==================================================
// INVENTÁRIO
// ==================================================

window.addEventListener("keydown", event => {
  if (
    event.code === "Tab" &&
    gameStarted &&
    !gamePaused
  ) {
    event.preventDefault();
  }
});

// ==================================================
// MENU PRINCIPAL
// ==================================================

function startGame() {
  gameStarted = true;
  gamePaused = false;

  mainMenu.style.display = "none";
  pauseMenu.style.display = "none";
  container.style.display = "block";

  loadingScreen.style.display = "none";

  updateProgress();

  if (audio.start) {
    audio.start();
  }

  controls.lock?.();
}

function pauseGame() {
  if (!gameStarted || gamePaused) return;

  gamePaused = true;

  pauseMenu.style.display = "flex";

  controls.unlock?.();

  saveProgress();
}

function resumeGame() {
  gamePaused = false;

  pauseMenu.style.display = "none";

  controls.lock?.();
}

function returnToMenu() {
  gameStarted = false;
  gamePaused = false;

  pauseMenu.style.display = "none";
  container.style.display = "none";
  mainMenu.style.display = "flex";

  controls.unlock?.();

  saveProgress();
}

document.getElementById("startButton")
  ?.addEventListener("click", startGame);

document.getElementById("continueButton")
  ?.addEventListener("click", startGame);

document.getElementById("resumeButton")
  ?.addEventListener("click", resumeGame);

document.getElementById("returnMenuButton")
  ?.addEventListener("click", returnToMenu);

// ==================================================
// SOBRE O JOGO
// ==================================================

document.getElementById("aboutButton")
  ?.addEventListener("click", () => {
    document.getElementById("aboutModal").style.display = "flex";
  });

document.getElementById("closeAboutButton")
  ?.addEventListener("click", () => {
    document.getElementById("aboutModal").style.display = "none";
  });

// ==================================================
// PAUSA
// ==================================================

window.addEventListener("keydown", event => {
  if (
    event.code === "Escape" &&
    gameStarted &&
    !gamePaused
  ) {
    pauseGame();
  }
});

document.addEventListener("pointerlockchange", () => {
  if (
    gameStarted &&
    !gamePaused &&
    document.pointerLockElement !== renderer.domElement
  ) {
    pauseGame();
  }
});

// ==================================================
// RELÓGIO
// ==================================================

function updateClock(delta) {
  elapsedTime += delta;

  if (!gameClock) return;

  const totalMinutes =
    (23 * 60 + 47 + Math.floor(elapsedTime * 2)) % 1440;

  const hours = String(
    Math.floor(totalMinutes / 60)
  ).padStart(2, "0");

  const minutes = String(
    totalMinutes % 60
  ).padStart(2, "0");

  gameClock.textContent = `${hours}:${minutes}`;
}

// ==================================================
// REDIMENSIONAMENTO
// ==================================================

window.addEventListener("resize", () => {
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );
});

// ==================================================
// ANIMAÇÃO
// ==================================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(
    clock.getDelta(),
    0.05
  );

  if (gameStarted && !gamePaused) {
    updateClock(delta);

    player.update?.(delta);
    controls.update?.(delta);

    doors.update?.(delta);

    apparition.update?.(delta, camera);

    effects.update?.(delta);

    interactions.update?.();

    renderer.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
}

// ==================================================
// INICIALIZAÇÃO
// ==================================================

container.style.display = "none";
pauseMenu.style.display = "none";
loadingScreen.style.display = "none";

updateProgress();

animate();

console.log(
  "A CIDADE SEM ROSTO — Sistemas inicializados."
);
