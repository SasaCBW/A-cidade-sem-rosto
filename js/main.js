
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

/* ==========================================
   ELEMENTOS HTML
========================================== */

const gameContainer = document.getElementById("gameContainer");
const mainMenu = document.getElementById("mainMenu");
const startButton = document.getElementById("startButton");
const continueButton = document.getElementById("continueButton");
const aboutButton = document.getElementById("aboutButton");

const pauseMenu = document.getElementById("pauseMenu");
const resumeButton = document.getElementById("resumeButton");
const returnMenuButton = document.getElementById("returnMenuButton");

const aboutModal = document.getElementById("aboutModal");
const closeAboutButton = document.getElementById("closeAboutButton");

const journalButton = document.getElementById("journalButton");
const closeJournalButton = document.getElementById("closeJournal");

const flashlightButton = document.getElementById("flashlightBtn");

const hud = document.getElementById("hud");

/* ==========================================
   ESTADO DO JOGO
========================================== */

let scene;
let camera;
let renderer;

let world;
let player;
let controls;
let gameInterface;
let audio;
let flashlight;
let interactions;
let inventoryUI;
let doors;
let interior;
let apparition;
let lighting;
let effects;
let journal;
let hospital;
let school;
let locationClues;
let locationMissions;

let animationFrame = null;
let previousTime = 0;
let elapsedTime = 0;
let saveTimer = 0;
let apparitionTimer = 0;

let gameStarted = false;
let gamePaused = false;
let gameDestroyed = false;

const collectedClues = new Set();
const openedBuildings = new Set();
const completedMissions = new Set();

const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);

/* ==========================================
   INICIALIZAÇÃO
========================================== */

function initializeGame() {
    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x080b10);
    scene.fog = new THREE.FogExp2(0x080b10, 0.012);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.8)
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    gameContainer.appendChild(renderer.domElement);

    /* Iluminação */

    lighting = createLighting(scene);

    /* Mundo */

    world = createWorld(scene);

    /* Personagem */

    player = createPlayer(camera, scene);

    const playerObject = player.group || player.playerGroup || player;

    /* Controles ligados ao personagem */

    controls = createControls(
        camera,
        renderer.domElement,
        playerObject
    );

    /* Interface */

    gameInterface = createInterface();

    /* Áudio */

    audio = createAudio();

    /* Lanterna */

    flashlight = createFlashlight(
        camera,
        flashlightButton
    );

    /* Interações */

    interactions = createInteractions(
        scene,
        camera
    );

    /* Inventário */

    inventoryUI = setupInventoryUI();

    /* Construções */

    interior = createInterior(scene);

    hospital = createHospital(scene);

    school = createSchool(scene);

    /* Portas */

    doors = createDoors(scene);

    if (doors.addDoor) {
        doors.addDoor(
            43.9,
            1.5,
            -6,
            0,
            "Delegacia"
        );

        doors.addDoor(
            43.9,
            1.5,
            -38,
            0,
            "Casa abandonada"
        );
    }

    /* Aparição */

    apparition = createApparition(scene);

    /* Efeitos */

    effects = createInteractionEffects(scene);

    /* Diário */

    journal = createJournal();

    /* Pistas especiais */

    locationClues = createLocationClues(scene);

    /* Missões */

    locationMissions = createLocationMissions();

    updateContinueButton();

    setupEvents();

    window.addEventListener("resize", onResize);

    console.log("A Cidade Sem Rosto inicializada.");
}

/* ==========================================
   EVENTOS
========================================== */

function setupEvents() {
    startButton?.addEventListener("click", startNewGame);

    continueButton?.addEventListener("click", continueGame);

    aboutButton?.addEventListener("click", () => {
        aboutModal?.classList.remove("hidden");
    });

    closeAboutButton?.addEventListener("click", () => {
        aboutModal?.classList.add("hidden");
    });

    resumeButton?.addEventListener("click", resumeGame);

    returnMenuButton?.addEventListener("click", returnToMenu);

    closeJournalButton?.addEventListener("click", () => {
        document.getElementById("journalPanel")?.classList.add("hidden");
    });

    journalButton?.addEventListener("click", () => {
        document.getElementById("journalPanel")?.classList.toggle("hidden");
    });

    document.addEventListener("keydown", onGameKeyDown);

    document.addEventListener(
        "pointerlockchange",
        onPointerLockChange
    );

    window.addEventListener("beforeunload", saveCurrentGame);
}

/* ==========================================
   NOVO JOGO
========================================== */

function startNewGame() {
    deleteSave();

    collectedClues.clear();
    openedBuildings.clear();
    completedMissions.clear();

    elapsedTime = 0;
    saveTimer = 0;
    apparitionTimer = 0;

    journal.clear();

    if (player?.group) {
        player.group.position.set(0, 0, 8);
        player.group.rotation.set(0, 0, 0);
    }

    if (camera) {
        camera.rotation.set(0, 0, 0);
        camera.position.set(0, 1.7, 0);
    }

    gameStarted = true;
    gamePaused = false;

    mainMenu?.classList.add("hidden");
    pauseMenu?.classList.add("hidden");
    gameContainer?.classList.remove("hidden");
    hud?.classList.remove("hidden");

    gameInterface?.showHUD?.();
    gameInterface?.setMission?.(
        "Explore a cidade e descubra o que aconteceu."
    );

    gameInterface?.startClock?.();

    audio?.start?.();

    controls?.setMovementEnabled(true);
    controls?.lock();

    previousTime = performance.now();

    startAnimation();
}

/* ==========================================
   CONTINUAR JOGO
========================================== */

function continueGame() {
    const savedData = loadGame();

    if (!savedData) {
        startNewGame();
        return;
    }

    collectedClues.clear();
    openedBuildings.clear();
    completedMissions.clear();

    elapsedTime = savedData.playTime || 0;

    (savedData.collectedClues || []).forEach((id) => {
        collectedClues.add(id);
    });

    (savedData.openedBuildings || []).forEach((id) => {
        openedBuildings.add(id);
    });

    (savedData.completedMissions || []).forEach((id) => {
        completedMissions.add(id);
    });

    if (savedData.position && player?.group) {
        player.group.position.set(
            savedData.position.x ?? 0,
            0,
            savedData.position.z ?? 8
        );
    }

    journal?.restore?.(savedData.journal || []);

    gameStarted = true;
    gamePaused = false;

    mainMenu?.classList.add("hidden");
    pauseMenu?.classList.add("hidden");
    gameContainer?.classList.remove("hidden");
    hud?.classList.remove("hidden");

    gameInterface?.showHUD?.();
    gameInterface?.startClock?.();

    audio?.start?.();

    controls?.setMovementEnabled(true);
    controls?.lock();

    previousTime = performance.now();

    startAnimation();
}

/* ==========================================
   BOTÃO CONTINUAR
========================================== */

function updateContinueButton() {
    if (!continueButton) return;

    continueButton.style.display = hasSave()
        ? "inline-flex"
        : "none";
}

/* ==========================================
   TECLADO
========================================== */

function onGameKeyDown(event) {
    if (!gameStarted || gamePaused) return;

    if (event.code === "Escape") {
        if (document.pointerLockElement) {
            pauseGame();
        }
    }

    if (event.code === "KeyF") {
        flashlight?.toggle?.();
    }

    if (event.code === "KeyJ") {
        document.getElementById("journalPanel")
            ?.classList.toggle("hidden");
    }

    if (event.code === "Tab") {
        event.preventDefault();
        inventoryUI?.toggle?.();
    }

    if (event.code === "KeyE") {
        event.preventDefault();
        tryInteraction();
    }
}

/* ==========================================
   INTERAÇÕES
========================================== */

function tryInteraction() {
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

    interactions?.interact?.();
}

/* ==========================================
   IDENTIFICAR PISTAS ESPECIAIS
========================================== */

function getLocationClueTarget() {
    if (!Array.isArray(locationClues)) return null;

    const available = locationClues.filter((clue) => {
        const data = clue.userData?.clue;

        return data && !collectedClues.has(data.id);
    });

    if (available.length === 0) return null;

    raycaster.setFromCamera(screenCenter, camera);

    const hits = raycaster.intersectObjects(
        available,
        true
    );

    if (hits.length === 0) return null;

    let object = hits[0].object;

    while (object && !object.userData?.clue) {
        object = object.parent;
    }

    return object?.userData?.clue ? object : null;
}

/* ==========================================
   COLETAR PISTA
========================================== */

function collectLocationClue(object) {
    const clue = object.userData.clue;

    if (!clue || collectedClues.has(clue.id)) return;

    collectedClues.add(clue.id);

    object.visible = false;

    journal?.addEntry?.(
        clue.title || clue.name || "Nova pista",
        clue.description || "Uma pista encontrada na cidade.",
        clue.category || "Investigação"
    );

    window.dispatchEvent(
        new CustomEvent("inventoryItemAdded", {
            detail: {
                id: clue.id,
                name: clue.title || clue.name || "Pista encontrada",
                description: clue.description || "Uma nova pista foi encontrada."
            }
        })
    );

    effects?.burst?.(
        object.position,
        0x9bbbd3
    );

    audio?.playDiscovery?.();

    gameInterface?.showMessage?.(
        "Nova pista adicionada ao diário."
    );

    checkLocationMissions();
}

/* ==========================================
   MISSÕES DE LOCALIZAÇÃO
========================================== */

function checkLocationMissions() {
    const result = locationMissions?.checkCompletion?.(
        collectedClues
    );

    if (!result) return;

    if (result.completed && result.name) {
        completedMissions.add(result.name);

        gameInterface?.showMessage?.(
            "Local investigado: " + result.name
        );
    } else if (typeof result === "string") {
        completedMissions.add(result);

        gameInterface?.showMessage?.(
            "Investigação concluída: " + result
        );
    }
}

/* ==========================================
   PORTAS
========================================== */

function getDoorTarget() {
    const availableDoors = doors?.getDoors?.();

    if (!Array.isArray(availableDoors)) return null;

    raycaster.setFromCamera(screenCenter, camera);

    const hits = raycaster.intersectObjects(
        availableDoors,
        true
    );

    if (hits.length === 0) return null;

    let object = hits[0].object;

    while (
        object &&
        !availableDoors.includes(object) &&
        !availableDoors.some((door) => door === object)
    ) {
        object = object.parent;
    }

    return object || null;
}

function toggleDoor(door) {
    if (!door) return;

    const result = doors?.toggle?.(door);

    if (result) {
        const name = door.userData?.name || "Porta";

        openedBuildings.add(name);

        effects?.burst?.(
            door.position,
            0x9bbbd3
        );

        gameInterface?.showMessage?.(
            "Você abriu: " + name
        );

        audio?.playDiscovery?.();
    }
}

/* ==========================================
   PAUSAR
========================================== */

function pauseGame() {
    if (!gameStarted || gamePaused) return;

    gamePaused = true;

    controls?.setMovementEnabled(false);
    controls?.unlock();

    audio?.stop?.();

    gameInterface?.stopClock?.();

    pauseMenu?.classList.remove("hidden");

    saveCurrentGame();
}

/* ==========================================
   RETOMAR
========================================== */

function resumeGame() {
    if (!gameStarted) return;

    gamePaused = false;

    pauseMenu?.classList.add("hidden");

    controls?.setMovementEnabled(true);
    controls?.lock();

    audio?.start?.();

    gameInterface?.startClock?.();

    previousTime = performance.now();
}

/* ==========================================
   VOLTAR AO MENU
========================================== */

function returnToMenu() {
    saveCurrentGame();

    gamePaused = false;
    gameStarted = false;

    controls?.unlock();
    controls?.setMovementEnabled(false);

    audio?.stop?.();

    gameInterface?.stopClock?.();
    gameInterface?.hideHUD?.();

    pauseMenu?.classList.add("hidden");
    gameContainer?.classList.add("hidden");
    hud?.classList.add("hidden");
    mainMenu?.classList.remove("hidden");

    updateContinueButton();
}

/* ==========================================
   SALVAMENTO
========================================== */

function saveCurrentGame() {
    if (!gameStarted || !player?.group) return;

    const position = player.group.position;

    saveGame({
        position: {
            x: position.x,
            y: position.y,
            z: position.z
        },

        collectedClues: Array.from(collectedClues),

        openedBuildings: Array.from(openedBuildings),

        journal: journal?.getEntries?.() || [],

        completedMissions: Array.from(completedMissions),

        currentChapter: 1,

        playTime: elapsedTime
    });

    updateContinueButton();
}

/* ==========================================
   POINTER LOCK
========================================== */

function onPointerLockChange() {
    if (!gameStarted) return;

    if (
        !document.pointerLockElement &&
        !gamePaused
    ) {
        pauseGame();
    }
}

/* ==========================================
   REDIMENSIONAMENTO
========================================== */

function onResize() {
    if (!camera || !renderer) return;

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}

/* ==========================================
   APARIÇÃO
========================================== */

function updateApparition(delta) {
    apparitionTimer += delta;

    if (apparitionTimer >= 95) {
        apparitionTimer = 0;

        if (Math.random() > 0.25 && camera) {
            apparition?.appearNearPlayer?.(camera);
        }
    }

    apparition?.update?.(delta, camera);
}

/* ==========================================
   ATUALIZAÇÃO DO JOGO
========================================== */

function updateGame(delta) {
    controls?.update?.(delta);

    world?.update?.(delta);

    hospital?.update?.(delta);

    school?.update?.(delta);

    doors?.update?.(delta);

    flashlight?.update?.(delta);

    effects?.update?.(delta);

    interactions?.updatePrompt?.();

    updateApparition(delta);

    saveTimer += delta;

    if (saveTimer >= 60) {
        saveTimer = 0;
        saveCurrentGame();
    }

    elapsedTime += delta;
}

/* ==========================================
   LOOP DE ANIMAÇÃO
========================================== */

function animate(currentTime) {
    if (gameDestroyed) return;

    animationFrame = requestAnimationFrame(animate);

    if (!gameStarted || gamePaused) return;

    const delta = Math.min(
        (currentTime - previousTime) / 1000,
        0.05
    );

    previousTime = currentTime;

    updateGame(delta);

    renderer.render(scene, camera);
}

/* ==========================================
   INICIAR ANIMAÇÃO
========================================== */

function startAnimation() {
    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
    }

    previousTime = performance.now();

    animationFrame = requestAnimationFrame(animate);
}

/* ==========================================
   ENCERRAR RECURSOS
========================================== */

function destroyGame() {
    gameDestroyed = true;

    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
    }

    saveCurrentGame();

    controls?.destroy?.();
    interactions?.destroy?.();
    inventoryUI?.destroy?.();
    journal?.destroy?.();
    audio?.destroy?.();
    flashlight?.destroy?.();
    apparition?.destroy?.();
    effects?.destroy?.();
    hospital?.destroy?.();
    school?.destroy?.();
    doors?.destroy?.();
    interior?.destroy?.();
    world?.destroy?.();
    lighting?.destroy?.();

    renderer?.dispose();

    window.removeEventListener("resize", onResize);
    window.removeEventListener("beforeunload", saveCurrentGame);

    document.removeEventListener("keydown", onGameKeyDown);
    document.removeEventListener(
        "pointerlockchange",
        onPointerLockChange
    );
}

/* ==========================================
   INICIAR A APLICAÇÃO
========================================== */

try {
    initializeGame();
} catch (error) {
    console.error(
        "Erro ao inicializar A Cidade Sem Rosto:",
        error
    );

    const loadingScreen = document.getElementById("loadingScreen");

    if (loadingScreen) {
        loadingScreen.textContent =
            "Não foi possível iniciar o jogo. Verifique os arquivos e o console.";
    }
}

window.addEventListener("pagehide", destroyGame);
