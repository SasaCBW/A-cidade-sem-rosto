
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
    hasSave,
    deleteSave
} from "./save-system.js";
import { createJournal } from "./journal.js";
import { createHospital } from "./hospital.js";
import { createSchool } from "./school.js";
import { createLocationClues } from "./location-clues.js";
import { createLocationMissions } from "./location-missions.js";
import { createInventory } from "./inventory.js";

/* ==========================================
   A CIDADE SEM ROSTO
   CONTROLADOR PRINCIPAL
========================================== */

const canvas = document.querySelector("#gameCanvas");

if (!canvas) {
    throw new Error(
        "Não foi encontrado o elemento #gameCanvas no index.html."
    );
}

/* ======================================
   ESTADO DO JOGO
====================================== */

let gameStarted = false;
let gamePaused = false;
let gameDestroyed = false;

let animationFrame = null;
let previousTime = 0;
let elapsedTime = 0;
let saveTimer = 0;

const clock = new THREE.Clock();

const collectedClues = new Set();
const openedBuildings = new Set();

/* ======================================
   CENA
====================================== */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x080b12);
scene.fog = new THREE.FogExp2(0x080b12, 0.009);

/* ======================================
   CÂMERA
====================================== */

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

/* ======================================
   RENDERIZADOR
====================================== */

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;

/* ======================================
   SISTEMAS DO JOGO
====================================== */

const lighting = createLighting(scene);
const world = createWorld(scene);
const player = createPlayer(camera, scene);

/*
  IMPORTANTE:
  Passamos o objeto completo do jogador.
  Assim os controles conseguem acessar
  a resistência física e a velocidade.
*/

const controls = createControls(
    camera,
    renderer.domElement,
    player
);

const gameInterface = createInterface();
const audio = createAudio();

const flashlightButton =
    document.querySelector("#flashlightButton");

const flashlight = createFlashlight(
    camera,
    flashlightButton
);

const interactions = createInteractions(
    scene,
    camera
);

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

/* ======================================
   INTERFACE HTML
====================================== */

const startScreen =
    document.querySelector("#startScreen");

const pauseScreen =
    document.querySelector("#pauseScreen");

const gameOverScreen =
    document.querySelector("#gameOverScreen");

const startButton =
    document.querySelector("#startButton");

const continueButton =
    document.querySelector("#continueButton");

const resumeButton =
    document.querySelector("#resumeButton");

const newGameButton =
    document.querySelector("#newGameButton");

const journalButton =
    document.querySelector("#journalButton");

const journalPanel =
    document.querySelector("#journalPanel");

const journalClose =
    document.querySelector("#journalClose");

const inventoryButton =
    document.querySelector("#inventoryButton");

const inventoryPanel =
    document.querySelector("#inventoryPanel");

const missionText =
    document.querySelector("#missionText");

const staminaBar =
    document.querySelector("#staminaBar");

const staminaValue =
    document.querySelector("#staminaValue");

/* ======================================
   UTILITÁRIOS
====================================== */

function showElement(element) {
    if (element) {
        element.classList.remove("hidden");
        element.style.display = "";
    }
}

function hideElement(element) {
    if (element) {
        element.classList.add("hidden");
    }
}

function showMessage(message, duration = 3000) {
    gameInterface.showMessage(message, duration);
}

function updateMission(message) {
    if (missionText) {
        missionText.textContent = message;
    }

    gameInterface.setMission(message);
}

/* ======================================
   CRIAR PORTAS
====================================== */

const policeDoor = doors.addDoor(
    43.9,
    1.5,
    -6,
    0,
    "Delegacia"
);

const houseDoor = doors.addDoor(
    43.9,
    1.5,
    -38,
    0,
    "Casa abandonada"
);

/* ======================================
   INICIAR NOVO JOGO
====================================== */

function startNewGame() {
    deleteSave();

    collectedClues.clear();
    openedBuildings.clear();

    inventory.clear();
    journal.clear();
    locationMissions.reset();

    if (player.group) {
        player.group.position.set(0, 0, 8);
    }

    elapsedTime = 0;
    saveTimer = 0;

    gamePaused = false;
    gameStarted = true;

    gameInterface.startClock();
    gameInterface.showHUD();

    updateMission(
        "Explore a cidade e descubra o que aconteceu."
    );

    hideElement(startScreen);
    hideElement(pauseScreen);

    audio.start();

    controls.lock();

    startAnimation();
}

/* ======================================
   CONTINUAR JOGO
====================================== */

function continueGame() {
    const savedData = loadGame();

    if (!savedData) {
        showMessage("Nenhum progresso salvo encontrado.");
        return;
    }

    collectedClues.clear();
    openedBuildings.clear();

    (savedData.collectedClues || []).forEach((id) => {
        collectedClues.add(id);
    });

    (savedData.openedBuildings || []).forEach((name) => {
        openedBuildings.add(name);
    });

    if (savedData.position && player.group) {
        player.group.position.set(
            savedData.position.x || 0,
            savedData.position.y || 0,
            savedData.position.z || 8
        );
    }

    if (Array.isArray(savedData.journal)) {
        journal.restore(savedData.journal);
    }

    if (Array.isArray(savedData.completedMissions)) {
        locationMissions.restore(
            savedData.completedMissions
        );
    }

    if (Array.isArray(savedData.collectedClues)) {
        savedData.collectedClues.forEach((id) => {
            inventory.add({
                id,
                name: id.replaceAll("_", " "),
                description: "Pista encontrada anteriormente.",
                category: "Pista"
            });
        });
    }

    elapsedTime = savedData.playTime || 0;

    gameStarted = true;
    gamePaused = false;

    gameInterface.startClock();
    gameInterface.showHUD();

    updateMission(
        "Continue investigando os mistérios da cidade."
    );

    hideElement(startScreen);
    hideElement(pauseScreen);

    audio.start();

    controls.lock();

    startAnimation();
}

/* ======================================
   PAUSAR JOGO
====================================== */

function pauseGame() {
    if (!gameStarted || gamePaused) return;

    gamePaused = true;

    controls.setMovementEnabled(false);

    gameInterface.stopClock();

    audio.stop();

    showElement(pauseScreen);

    controls.unlock();
}

/* ======================================
   RETOMAR JOGO
====================================== */

function resumeGame() {
    if (!gameStarted) return;

    gamePaused = false;

    controls.setMovementEnabled(true);

    hideElement(pauseScreen);

    audio.start();

    controls.lock();

    gameInterface.startClock();

    startAnimation();
}

/* ======================================
   LOCALIZAR PISTAS ESPECIAIS
====================================== */

const clueRaycaster = new THREE.Raycaster();

clueRaycaster.far = 3.5;

function getLocationClueTarget() {
    clueRaycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );

    const intersections =
        clueRaycaster.intersectObjects(
            locationClues,
            true
        );

    if (!intersections.length) return null;

    for (const intersection of intersections) {
        let object = intersection.object;

        while (object) {
            if (object.userData?.clue) {
                return object;
            }

            object = object.parent;
        }
    }

    return null;
}

/* ======================================
   COLETAR PISTA ESPECIAL
====================================== */

function collectLocationClue(object) {
    if (!object || object.userData.collected) {
        return false;
    }

    const clue = object.userData.clue;

    if (!clue || collectedClues.has(clue.id)) {
        return false;
    }

    collectedClues.add(clue.id);

    object.userData.collected = true;
    object.visible = false;

    const added = inventory.add({
        id: clue.id,
        name: clue.title || clue.name,
        description: clue.description,
        category: clue.category || "Pista"
    });

    journal.addEntry(
        clue.title || clue.name,
        clue.description,
        clue.category || "Pista"
    );

    effects.burst?.(
        object.position.clone(),
        0x9bc7ff
    );

    audio.playDiscovery?.();

    showMessage(
        `Pista encontrada: ${clue.title || clue.name}`
    );

    checkLocationMissions();

    return added;
}

/* ======================================
   VERIFICAR MISSÕES
====================================== */

function checkLocationMissions() {
    const result = locationMissions.checkCompletion(
        [...collectedClues]
    );

    if (result && result.completed) {
        showMessage(
            `Missão concluída: ${result.name}`,
            5000
        );

        journal.addEntry(
            result.name,
            result.description,
            "Missão"
        );
    }
}

/* ======================================
   LOCALIZAR PORTAS
====================================== */

const doorRaycaster = new THREE.Raycaster();

doorRaycaster.far = 3.5;

function getDoorTarget() {
    doorRaycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );

    const doorGroups = doors.getDoors();

    const intersections =
        doorRaycaster.intersectObjects(
            doorGroups,
            true
        );

    if (!intersections.length) return null;

    for (const intersection of intersections) {
        let object = intersection.object;

        while (object) {
            if (doorGroups.includes(object)) {
                return object;
            }

            object = object.parent;
        }
    }

    return null;
}

/* ======================================
   ABRIR E FECHAR PORTAS
====================================== */

function toggleDoor(door) {
    if (!door) return false;

    const changed = doors.toggle(door);

    if (!changed) return false;

    const name = door.userData.name || "Local";

    if (door.userData.isOpen) {
        openedBuildings.add(name);
        showMessage(`${name}: porta aberta.`);
        audio.playDiscovery?.();
    } else {
        showMessage(`${name}: porta fechada.`);
    }

    return true;
}

/* ======================================
   INTERAÇÃO PRINCIPAL
====================================== */

function tryInteraction() {
    if (!gameStarted || gamePaused) return;

    const clue = getLocationClueTarget();

    if (clue) {
        collectLocationClue(clue);
        return;
    }

    const door = getDoorTarget();

    if (door) {
        toggleDoor(door);
        return;
    }

    interactions.interact();
}

/* ======================================
   ATUALIZAR RESISTÊNCIA
====================================== */

function updateStamina() {
    const stamina = player.getStamina?.() ?? 100;

    if (staminaBar) {
        staminaBar.style.width =
            `${THREE.MathUtils.clamp(stamina, 0, 100)}%`;
    }

    if (staminaValue) {
        staminaValue.textContent =
            `${Math.round(stamina)}%`;
    }
}

/* ======================================
   SALVAR PROGRESSO
====================================== */

function saveCurrentGame() {
    if (!gameStarted || !player.group) return;

    saveGame({
        position: {
            x: player.group.position.x,
            y: player.group.position.y,
            z: player.group.position.z
        },

        collectedClues: [...collectedClues],

        openedBuildings: [...openedBuildings],

        journal: journal.getEntries(),

        completedMissions:
            locationMissions.getCompleted(),

        currentChapter: 1,

        playTime: elapsedTime
    });
}

/* ======================================
   ATUALIZAR APARIÇÃO
====================================== */

let apparitionTimer = 0;

function updateApparition(delta) {
    apparitionTimer += delta;

    if (apparitionTimer >= 95) {
        apparitionTimer = 0;

        const shouldAppear = Math.random() > 0.35;

        if (shouldAppear) {
            apparition.appearNearPlayer(camera);
        }
    }

    apparition.update(delta, camera);
}

/* ======================================
   CICLO PRINCIPAL
====================================== */

function updateGame(delta) {
    const movement = controls.update(delta);

    player.update?.(
        delta,
        movement?.isSprinting || false
    );

    updateStamina();

    world.update?.(delta);
    hospital.update?.(delta);
    school.update?.(delta);
    doors.update?.(delta);
    flashlight.update?.(delta);
    effects.update?.(delta);
    interactions.updatePrompt?.();

    updateApparition(delta);

    elapsedTime += delta;
    saveTimer += delta;

    if (saveTimer >= 30) {
        saveTimer = 0;
        saveCurrentGame();
    }
}

/* ======================================
   ANIMAÇÃO
====================================== */

function animate() {
    if (!gameStarted || gamePaused || gameDestroyed) {
        return;
    }

    animationFrame = requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    updateGame(delta);

    renderer.render(scene, camera);
}

function startAnimation() {
    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
    }

    clock.start();
    previousTime = performance.now();

    animate();
}

/* ======================================
   EVENTOS DE TECLADO
====================================== */

function onKeyDown(event) {
    if (event.code === "Escape") {
        if (gameStarted && !gamePaused) {
            pauseGame();
        }

        return;
    }

    if (!gameStarted || gamePaused) return;

    if (event.code === "KeyE") {
        tryInteraction();
    }

    if (event.code === "KeyJ") {
        journalPanel?.classList.toggle("active");
    }

    if (event.code === "KeyF") {
        flashlight.toggle();
    }
}

/* ======================================
   BOTÕES
====================================== */

startButton?.addEventListener(
    "click",
    startNewGame
);

newGameButton?.addEventListener(
    "click",
    startNewGame
);

continueButton?.addEventListener(
    "click",
    continueGame
);

resumeButton?.addEventListener(
    "click",
    resumeGame
);

journalButton?.addEventListener("click", () => {
    journalPanel?.classList.toggle("active");
});

journalClose?.addEventListener("click", () => {
    journalPanel?.classList.remove("active");
});

inventoryButton?.addEventListener("click", () => {
    inventoryUI.toggle();
});

/* ======================================
   EVENTOS GERAIS
====================================== */

document.addEventListener("keydown", onKeyDown);

document.addEventListener(
    "pointerlockchange",
    () => {
        if (
            gameStarted &&
            !gamePaused &&
            document.pointerLockElement !== renderer.domElement
        ) {
            pauseGame();
        }
    }
);

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

/* ======================================
   VISIBILIDADE DA PÁGINA
====================================== */

document.addEventListener(
    "visibilitychange",
    () => {
        if (
            document.hidden &&
            gameStarted &&
            !gamePaused
        ) {
            saveCurrentGame();
            pauseGame();
        }
    }
);

/* ======================================
   ENCERRAR JOGO
====================================== */

function destroyGame() {
    if (gameDestroyed) return;

    gameDestroyed = true;

    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
    }

    saveCurrentGame();

    gameInterface.stopClock();

    controls.destroy();
    flashlight.destroy();
    interactions.destroy();
    inventoryUI.close?.();

    audio.destroy();
    apparition.destroy();
    effects.destroy();
    journal.destroy();

    doors.destroy();
    interior.destroy();
    hospital.destroy();
    school.destroy();
    world.destroy();
    lighting.destroy();
    player.destroy?.();

    renderer.dispose();
}

window.addEventListener(
    "pagehide",
    destroyGame,
    { once: true }
);

/* ======================================
   MENU INICIAL
====================================== */

if (continueButton) {
    continueButton.disabled = !hasSave();

    if (!hasSave()) {
        continueButton.style.opacity = "0.45";
        continueButton.style.cursor = "not-allowed";
    }
}

gameInterface.hideHUD();

showElement(startScreen);

renderer.render(scene, camera);

console.log(
    "A Cidade Sem Rosto: sistemas principais inicializados."
);
