
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
import { createLighting } from "./lighting.js";
import { createInteractionEffects } from "./interaction-effects.js";
import {
  saveGame,
  loadGame,
  hasSave
} from "./save-system.js";
import { createJournal } from "./journal.js";
import { createHospital } from "./hospital.js";
import { createSchool } from "./school.js";
import { createLocationClues } from "./location-clues.js";
import { createLocationMissions } from "./location-missions.js";
import { createInventory } from "./inventory.js";

const canvas = document.querySelector("#gameCanvas");

if (!canvas) {
  throw new Error("Não foi encontrado o elemento #gameCanvas.");
}

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x080b12);
scene.fog = new THREE.FogExp2(0x080b12, 0.009);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  600
);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const clock = new THREE.Clock();

const world = createWorld(scene);
const lighting = createLighting(scene);

const player = createPlayer(camera, scene);
const controls = createControls(camera, renderer.domElement, player);

const gameInterface = createInterface();
const audio = createAudio();

const flashlightButton = document.querySelector("#flashlightButton");
const flashlight = createFlashlight(camera, flashlightButton);

const interactions = createInteractions(scene, camera);
const inventory = createInventory();
const inventoryUI = setupInventoryUI();

const doors = createDoors(scene);
const interior = createInterior(scene);

const apparition = createApparition(scene);
const effects = createInteractionEffects(scene);

const journal = createJournal();
const hospital = createHospital(scene);
const school = createSchool(scene);

const locationClues = createLocationClues(scene);
const locationMissions = createLocationMissions();

const collectedClues = new Set();
const openedBuildings = new Set();

let gameStarted = false;
let gamePaused = false;
let gameOver = false;
let elapsedTime = 0;
let saveTimer = 0;
let apparitionTimer = 0;
let lastMissionMessage = "";

const startScreen = document.querySelector("#startScreen");
const pauseScreen = document.querySelector("#pauseScreen");
const gameOverScreen = document.querySelector("#gameOverScreen");

const startButton = document.querySelector("#startButton");
const continueButton = document.querySelector("#continueButton");
const resumeButton = document.querySelector("#resumeButton");
const restartButton = document.querySelector("#restartButton");

const journalButton = document.querySelector("#journalButton");
const journalClose = document.querySelector("#journalClose");
const inventoryButton = document.querySelector("#inventoryButton");

const missionElement = document.querySelector("#missionText");
const timerElement = document.querySelector("#gameTimer");
const staminaElement = document.querySelector("#staminaFill");

function showElement(element) {
  if (element) element.classList.remove("hidden");
}

function hideElement(element) {
  if (element) element.classList.add("hidden");
}

function setMission(text) {
  gameInterface.setMission(text);

  if (missionElement) {
    missionElement.textContent = text;
  }
}

function showMessage(text, duration = 3500) {
  gameInterface.showMessage(text, duration);
}

function updateTimer() {
  if (!timerElement) return;

  const totalSeconds = Math.floor(elapsedTime);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  timerElement.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateStamina() {
  if (!staminaElement) return;

  const stamina = player.getStamina();

  staminaElement.style.width = `${stamina}%`;
}

function getSaveData() {
  return {
    position: player.getPosition(),
    collectedClues: [...collectedClues],
    openedBuildings: [...openedBuildings],
    journal: journal.getEntries(),
    completedMissions: locationMissions.getCompleted(),
    playTime: elapsedTime,
    currentChapter: 1
  };
}

function saveProgress() {
  if (!gameStarted || gameOver) return;

  try {
    saveGame(getSaveData());
  } catch (error) {
    console.error("Erro ao salvar o jogo:", error);
  }
}

function restoreCollectedClues(ids = []) {
  collectedClues.clear();

  for (const id of ids) {
    collectedClues.add(id);
  }

  interactions.restoreCollected?.(ids);
  locationClues.restoreCollected?.(ids);

  inventory.clear();

  const allClues = [
    ...interactions.getAllClues(),
    ...locationClues.getAll()
  ];

  for (const clue of allClues) {
    const data = clue.userData.clue;

    if (!data || !collectedClues.has(data.id)) continue;

    inventory.add({
      id: data.id,
      name: data.title || data.name,
      description: data.description,
      category: data.category || "pistas",
      icon: "📄"
    });
  }
}

function checkLocationMissions() {
  const result = locationMissions.checkCompletion(
    [...collectedClues]
  );

  if (!result || !result.completed) return;

  lastMissionMessage = result.name;

  showMessage(
    `MISSÃO CONCLUÍDA: ${result.name}`,
    6000
  );

  journal.addEntry(
    `Missão concluída: ${result.name}`,
    result.description,
    "missao"
  );

  setMission(result.reward || "Continue investigando a cidade.");
  audio.playDiscovery?.();

  saveProgress();
}

function registerClue(data, position = null) {
  if (!data || !data.id) return;

  if (collectedClues.has(data.id)) return;

  collectedClues.add(data.id);

  inventory.add({
    id: data.id,
    name: data.title || data.name || "Pista encontrada",
    description: data.description || "Uma pista encontrada na cidade.",
    category: data.category || "pistas",
    icon: "📄"
  });

  journal.addEntry(
    data.title || data.name || "Nova pista",
    data.description || "Uma pista foi encontrada.",
    data.category || "pistas"
  );

  if (position && effects) {
    effects.burst(position, 0x8bbcff);
  }

  audio.playDiscovery?.();

  showMessage(
    `PISTA DESCOBERTA: ${data.title || data.name}`,
    4500
  );

  checkLocationMissions();
  saveProgress();
}

window.addEventListener("clueCollected", event => {
  const data = event.detail;

  if (!data) return;

  registerClue(data, data.position || null);
});

function collectLocationClue(clue) {
  const data = clue.userData.clue;

  if (!data || collectedClues.has(data.id)) return;

  const position = clue.position.clone();

  clue.visible = false;

  registerClue(data, position);
}

const clueRaycaster = new THREE.Raycaster();
clueRaycaster.far = 3.5;

function findLocationClue() {
  clueRaycaster.setFromCamera(
    new THREE.Vector2(0, 0),
    camera
  );

  const visibleClues = locationClues.filter(
    clue => clue.visible
  );

  const hits = clueRaycaster.intersectObjects(
    visibleClues,
    true
  );

  if (!hits.length) return null;

  let object = hits[0].object;

  while (object && !object.userData.clue) {
    object = object.parent;
  }

  return object || null;
}

function interactWithLocationClue() {
  const clue = findLocationClue();

  if (!clue) return false;

  collectLocationClue(clue);
  return true;
}

function interactWithWorld() {
  if (interactWithLocationClue()) return;

  const interacted = interactions.interact();

  if (interacted) return;

  doors.interact?.();
}

function startNewGame() {
  collectedClues.clear();
  openedBuildings.clear();

  inventory.clear();
  journal.clear();
  locationMissions.reset();

  interactions.restoreCollected?.([]);
  locationClues.reset?.();

  player.setPosition(0, 0, 8);
  player.resetStamina();

  elapsedTime = 0;
  saveTimer = 0;
  apparitionTimer = 0;

  gameOver = false;
  gamePaused = false;
  gameStarted = true;

  hideElement(startScreen);
  hideElement(pauseScreen);
  hideElement(gameOverScreen);

  gameInterface.showHUD();
  gameInterface.startClock();

  setMission("Explore a cidade e encontre as primeiras pistas.");

  audio.start?.();

  showMessage(
    "23:00 — A cidade parece completamente abandonada.",
    5000
  );

  renderer.domElement.requestPointerLock?.();

  saveProgress();
}

function continueGame() {
  const savedData = loadGame();

  if (!savedData) {
    startNewGame();
    return;
  }

  gameStarted = true;
  gamePaused = false;
  gameOver = false;

  elapsedTime = savedData.playTime || 0;

  player.setPosition(
    savedData.position?.x ?? 0,
    savedData.position?.y ?? 0,
    savedData.position?.z ?? 8
  );

  player.resetStamina();

  openedBuildings.clear();

  for (const id of savedData.openedBuildings || []) {
    openedBuildings.add(id);
  }

  restoreCollectedClues(savedData.collectedClues || []);

  journal.restore(savedData.journal || []);

  locationMissions.restore(
    savedData.completedMissions || []
  );

  updateTimer();

  hideElement(startScreen);
  hideElement(pauseScreen);
  hideElement(gameOverScreen);

  gameInterface.showHUD();
  gameInterface.startClock();

  setMission("Continue investigando os mistérios da cidade.");

  audio.start?.();

  showMessage("Progresso carregado.", 2500);

  renderer.domElement.requestPointerLock?.();
}

function pauseGame() {
  if (!gameStarted || gamePaused || gameOver) return;

  gamePaused = true;

  controls.unlock?.();
  gameInterface.stopClock();

  saveProgress();

  showElement(pauseScreen);
}

function resumeGame() {
  if (!gameStarted || !gamePaused) return;

  gamePaused = false;

  hideElement(pauseScreen);

  gameInterface.startClock();
  renderer.domElement.requestPointerLock?.();
}

function restartGame() {
  startNewGame();
}

function toggleJournal() {
  const panel = document.querySelector("#journalPanel");

  if (!panel) return;

  panel.classList.toggle("active");
}

function updateGame(delta) {
  if (!gameStarted || gamePaused || gameOver) return;

  elapsedTime += delta;
  saveTimer += delta;
  apparitionTimer += delta;

  const movement = controls.update(delta);

  updateStamina();
  updateTimer();

  world.update?.(delta);
  hospital.update?.(delta);
  school.update?.(delta);
  doors.update?.(delta);
  flashlight.update?.(delta);
  effects.update?.(delta);
  interactions.updatePrompt?.();

  apparition.update?.(delta, camera);

  if (apparitionTimer >= 95) {
    apparitionTimer = 0;

    if (Math.random() > 0.35) {
      apparition.trigger?.(player.group.position);
    }
  }

  if (saveTimer >= 30) {
    saveTimer = 0;
    saveProgress();
  }
}

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  updateGame(delta);

  renderer.render(scene, camera);
}

function onKeyDown(event) {
  if (!gameStarted || gameOver) return;

  if (event.code === "Escape") {
    if (gamePaused) {
      resumeGame();
    } else {
      pauseGame();
    }

    return;
  }

  if (gamePaused) return;

  if (event.code === "KeyE") {
    interactWithWorld();
  }

  if (event.code === "KeyJ") {
    toggleJournal();
  }

  if (event.code === "KeyF") {
    flashlight.toggle?.();
  }
}

function onPointerLockChange() {
  if (
    gameStarted &&
    !gamePaused &&
    document.pointerLockElement !== renderer.domElement
  ) {
    pauseGame();
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );
}

function bindEvents() {
  startButton?.addEventListener("click", startNewGame);

  continueButton?.addEventListener("click", continueGame);

  resumeButton?.addEventListener("click", resumeGame);

  restartButton?.addEventListener("click", restartGame);

  journalButton?.addEventListener("click", toggleJournal);

  journalClose?.addEventListener("click", () => {
    document.querySelector("#journalPanel")?.classList.remove("active");
  });

  inventoryButton?.addEventListener("click", () => {
    inventoryUI.toggle();
  });

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);

  document.addEventListener(
    "pointerlockchange",
    onPointerLockChange
  );

  if (continueButton) {
    continueButton.disabled = !hasSave();
  }
}

function destroyGame() {
  saveProgress();

  controls.destroy?.();
  flashlight.destroy?.();
  interactions.destroy?.();
  inventoryUI.destroy?.();
  audio.destroy?.();
  apparition.destroy?.();
  effects.destroy?.();
  journal.destroy?.();
  doors.destroy?.();
  interior.destroy?.();
  hospital.destroy?.();
  school.destroy?.();
  locationClues.destroy?.();
  world.destroy?.();
  lighting.destroy?.();
  player.destroy?.();

  renderer.dispose();
}

window.addEventListener("beforeunload", destroyGame);

bindEvents();

gameInterface.hideHUD();

hideElement(pauseScreen);
hideElement(gameOverScreen);
showElement(startScreen);

renderer.render(scene, camera);

animate();

console.log("A Cidade Sem Rosto foi inicializada.");
