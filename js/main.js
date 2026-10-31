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
import { saveGame, loadGame, hasSave } from "./save-system.js";
import { createJournal } from "./journal.js";
import { createHospital } from "./hospital.js";
import { createSchool } from "./school.js";
import { createLocationClues } from "./location-clues.js";
import { createLocationMissions } from "./location-missions.js";

// ======================================================
// ELEMENTOS DA INTERFACE
// ======================================================

const element = id => document.getElementById(id);

const loadingScreen = element("loadingScreen");
const mainMenu = element("mainMenu");
const gameContainer = element("gameContainer");

const startButton = element("startButton");
const continueButton = element("continueButton");
const aboutButton = element("aboutButton");

const pauseMenu = element("pauseMenu");
const resumeButton = element("resumeButton");
const returnMenuButton = element("returnMenuButton");

const flashlightButton = element("flashlightBtn");
const journalButton = element("journalButton");
const inventoryButton = element("inventoryButton");

const journalPanel = element("journalPanel");
const closeJournalButton = element("closeJournal");
const aboutModal = element("aboutModal");
const closeAboutButton = element("closeAboutButton");

// ======================================================
// CENA THREE.JS
// ======================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x080d12);

scene.fog = new THREE.FogExp2(
    0x080d12,
    0.012
);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

const renderer = new THREE.WebGLRenderer({
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
renderer.toneMappingExposure = 1.15;

if (gameContainer) {
    gameContainer.prepend(renderer.domElement);
} else {
    document.body.appendChild(renderer.domElement);
}

renderer.domElement.style.display = "block";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";

// ======================================================
// MUNDO E PERSONAGEM
// ======================================================

const lighting = createLighting(scene);
const world = createWorld(scene);

const player = createPlayer(camera, scene);
const controls = createControls(camera, renderer.domElement);

// ======================================================
// SISTEMAS DO JOGO
// ======================================================

const gameInterface = createInterface();
const audio = createAudio();

const flashlight = createFlashlight(
    camera,
    flashlightButton
);

const interactions = createInteractions(
    scene,
    camera
);

const inventoryUI = setupInventoryUI();

const interior = createInterior(scene);
const hospital = createHospital(scene);
const school = createSchool(scene);

const apparition = createApparition(scene);
const effects = createInteractionEffects(scene);

const journal = createJournal();
const locationMissions = createLocationMissions();

// ======================================================
// PORTAS
// ======================================================

const doors = createDoors(scene);

if (typeof doors.addDoor === "function") {
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

// ======================================================
// PISTAS DO MAPA
// ======================================================

const locationClueObjects = createLocationClues(scene);

const collectedClues = new Set();
const openedBuildings = new Set();

let gameStarted = false;
let gamePaused = false;
let gameOver = false;
let elapsedTime = 0;
let lastTime = 0;
let apparitionTimer = 0;
let autosaveTimer = 0;

// ======================================================
// MENSAGENS
// ======================================================

function showMessage(message, duration = 3500) {
    if (typeof gameInterface.showMessage === "function") {
        gameInterface.showMessage(message, duration);
        return;
    }

    const messageElement = element("gameMessage");

    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.classList.add("visible");

    setTimeout(() => {
        messageElement.classList.remove("visible");
    }, duration);
}

function updateMissionText(message) {
    if (typeof gameInterface.setMission === "function") {
        gameInterface.setMission(message);
    }
}

// ======================================================
// DIÁRIO E PISTAS
// ======================================================

function registerClue(clue) {
    if (!clue || !clue.id) return;

    if (collectedClues.has(clue.id)) return;

    collectedClues.add(clue.id);

    journal.addEntry(
        clue.name || "Pista encontrada",
        clue.description || "Uma nova pista foi encontrada.",
        clue.type || "Evidência"
    );

    window.dispatchEvent(
        new CustomEvent("inventoryItemAdded", {
            detail: {
                id: clue.id,
                name: clue.name || "Pista encontrada",
                description: clue.description || "",
                type: clue.type || "Pista"
            }
        })
    );

    if (effects && typeof effects.burst === "function") {
        effects.burst(
            camera.position.clone().add(
                camera.getWorldDirection(
                    new THREE.Vector3()
                ).multiplyScalar(2)
            )
        );
    }

    showMessage("Pista adicionada ao diário: " + clue.name);

    const completion = locationMissions.checkCompletion(
        Array.from(collectedClues)
    );

    if (completion && completion.completed) {
        showMessage(
            "Nova etapa desbloqueada: " + completion.name,
            5000
        );
    }

    updateMissionText(
        "Pistas encontradas: " + collectedClues.size
    );

    saveProgress();
}

// ======================================================
// RAYCAST DAS PISTAS ESPECIAIS
// ======================================================

const raycaster = new THREE.Raycaster();

raycaster.far = 3.5;

const screenCenter = new THREE.Vector2(0, 0);

function getLocationClueTarget() {
    raycaster.setFromCamera(screenCenter, camera);

    const available = locationClueObjects.filter(object => {
        return object && object.visible;
    });

    const hits = raycaster.intersectObjects(
        available,
        true
    );

    if (!hits.length) return null;

    let object = hits[0].object;

    while (object && !object.userData.clue) {
        object = object.parent;
    }

    if (!object || !object.userData.clue) {
        return null;
    }

    return object;
}

function collectLocationClue() {
    const target = getLocationClueTarget();

    if (!target) return false;

    const clue = target.userData.clue;

    if (!clue || collectedClues.has(clue.id)) {
        return false;
    }

    target.visible = false;

    registerClue(clue);

    return true;
}

// ======================================================
// PORTAS
// ======================================================

function tryOpenDoor() {
    if (!doors || typeof doors.getDoors !== "function") {
        return false;
    }

    const availableDoors = doors.getDoors();

    if (!Array.isArray(availableDoors)) {
        return false;
    }

    let nearestDoor = null;
    let nearestDistance = 3;

    for (const door of availableDoors) {
        const position = new THREE.Vector3();

        door.getWorldPosition(position);

        const distance = camera.position.distanceTo(position);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestDoor = door;
        }
    }

    if (!nearestDoor) return false;

    if (typeof doors.toggle === "function") {
        const result = doors.toggle(nearestDoor);

        if (result !== false) {
            const name =
                nearestDoor.userData?.name ||
                nearestDoor.name ||
                "Construção";

            openedBuildings.add(name);

            showMessage("Você abriu: " + name);

            saveProgress();

            return true;
        }
    }

    return false;
}

// ======================================================
// INTERAÇÕES
// ======================================================

function performInteraction() {
    if (!gameStarted || gamePaused || gameOver) return;

    if (collectLocationClue()) return;

    if (tryOpenDoor()) return;

    if (
        interactions &&
        typeof interactions.interact === "function"
    ) {
        interactions.interact();
    }
}

window.addEventListener("clueCollected", event => {
    registerClue(event.detail);
});

window.addEventListener("keydown", event => {
    if (event.repeat) return;

    switch (event.code) {
        case "KeyE":
            performInteraction();
            break;

        case "KeyJ":
            toggleJournal();
            break;

        case "KeyF":
            if (gameStarted && !gamePaused) {
                flashlight.toggle();
            }
            break;

        case "Escape":
            if (gameStarted && !gamePaused) {
                pauseGame();
            }
            break;

        case "Tab":
            event.preventDefault();
            inventoryUI.toggle();
            break;
    }
});

// ======================================================
// DIÁRIO
// ======================================================

function openJournal() {
    if (!journalPanel) return;

    journalPanel.classList.add("active");
}

function closeJournal() {
    if (!journalPanel) return;

    journalPanel.classList.remove("active");
}

function toggleJournal() {
    if (!journalPanel) return;

    journalPanel.classList.toggle("active");
}

journalButton?.addEventListener("click", openJournal);
closeJournalButton?.addEventListener("click", closeJournal);

// ======================================================
// SALVAMENTO
// ======================================================

function saveProgress() {
    const position = camera.getWorldPosition(
        new THREE.Vector3()
    );

    saveGame({
        position: {
            x: position.x,
            y: position.y,
            z: position.z
        },

        collectedClues: Array.from(collectedClues),

        openedBuildings: Array.from(openedBuildings),

        journal: journal.getEntries(),

        currentChapter: 1,

        completedMissions: locationMissions.getCompleted(),

        playTime: elapsedTime
    });
}

function restoreProgress() {
    const data = loadGame();

    if (!data) return false;

    camera.position.set(
        data.position.x,
        data.position.y,
        data.position.z
    );

    for (const id of data.collectedClues) {
        collectedClues.add(id);
    }

    for (const name of data.openedBuildings) {
        openedBuildings.add(name);
    }

    journal.restore(data.journal);

    locationMissions.restore(
        data.completedMissions
    );

    elapsedTime = data.playTime || 0;

    for (const object of locationClueObjects) {
        const clue = object.userData.clue;

        if (clue && collectedClues.has(clue.id)) {
            object.visible = false;
        }
    }

    return true;
}

// ======================================================
// MENU PRINCIPAL
// ======================================================

function showMainMenu() {
    gameStarted = false;
    gamePaused = false;

    if (mainMenu) {
        mainMenu.classList.remove("hidden");
    }

    if (gameContainer) {
        gameContainer.classList.add("hidden");
    }

    if (pauseMenu) {
        pauseMenu.classList.remove("active");
    }

    if (typeof controls.unlock === "function") {
        controls.unlock();
    }

    if (typeof gameInterface.stopClock === "function") {
        gameInterface.stopClock();
    }

    if (typeof audio.stop === "function") {
        audio.stop();
    }
}

function startGame(continueGame = false) {
    if (continueGame) {
        restoreProgress();
    }

    gameStarted = true;
    gamePaused = false;
    gameOver = false;

    if (mainMenu) {
        mainMenu.classList.add("hidden");
    }

    if (gameContainer) {
        gameContainer.classList.remove("hidden");
    }

    if (pauseMenu) {
        pauseMenu.classList.remove("active");
    }

    if (typeof gameInterface.showHUD === "function") {
        gameInterface.showHUD();
    }

    if (typeof gameInterface.startClock === "function") {
        gameInterface.startClock();
    }

    if (typeof audio.start === "function") {
        audio.start();
    }

    if (typeof controls.lock === "function") {
        controls.lock();
    }

    showMessage(
        "A cidade está vazia. Descubra o que aconteceu.",
        5000
    );
}

startButton?.addEventListener("click", () => {
    elapsedTime = 0;
    collectedClues.clear();
    openedBuildings.clear();

    journal.clear();

    startGame(false);
});

continueButton?.addEventListener("click", () => {
    startGame(true);
});

if (continueButton) {
    continueButton.disabled = !hasSave();
}

// ======================================================
// PAUSA
// ======================================================

function pauseGame() {
    if (!gameStarted || gamePaused) return;

    gamePaused = true;

    if (pauseMenu) {
        pauseMenu.classList.add("active");
    }

    if (typeof controls.unlock === "function") {
        controls.unlock();
    }

    if (typeof audio.stop === "function") {
        audio.stop();
    }
}

function resumeGame() {
    if (!gameStarted) return;

    gamePaused = false;

    if (pauseMenu) {
        pauseMenu.classList.remove("active");
    }

    if (typeof controls.lock === "function") {
        controls.lock();
    }

    if (typeof audio.start === "function") {
        audio.start();
    }
}

resumeButton?.addEventListener("click", resumeGame);

returnMenuButton?.addEventListener("click", () => {
    saveProgress();
    showMainMenu();
});

// ======================================================
// SOBRE O JOGO
// ======================================================

aboutButton?.addEventListener("click", () => {
    aboutModal?.classList.add("active");
});

closeAboutButton?.addEventListener("click", () => {
    aboutModal?.classList.remove("active");
});

// ======================================================
// BOTÃO DE INVENTÁRIO
// ======================================================

inventoryButton?.addEventListener("click", () => {
    inventoryUI.toggle();
});

// ======================================================
// APARIÇÃO
// ======================================================

function updateApparition(delta) {
    apparitionTimer += delta;

    if (apparitionTimer >= 95) {
        apparitionTimer = 0;

        if (Math.random() > 0.45) {
            const direction = new THREE.Vector3();

            camera.getWorldDirection(direction);

            const position = camera.position.clone().add(
                direction.multiplyScalar(13)
            );

            position.y = 0;

            apparition.appear(position);
        }
    }

    if (apparition && typeof apparition.update === "function") {
        apparition.update(delta, camera);
    }
}

// ======================================================
// REDIMENSIONAMENTO
// ======================================================

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );
});

// ======================================================
// ANIMAÇÃO PRINCIPAL
// ======================================================

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    if (gameStarted && !gamePaused && !gameOver) {
        elapsedTime += delta;
        autosaveTimer += delta;

        controls.update(delta);

        if (typeof world.update === "function") {
            world.update(delta);
        }

        if (typeof hospital.update === "function") {
            hospital.update(delta);
        }

        if (typeof school.update === "function") {
            school.update(delta);
        }

        if (typeof doors.update === "function") {
            doors.update(delta);
        }

        if (typeof flashlight.update === "function") {
            flashlight.update(delta);
        }

        if (typeof effects.update === "function") {
            effects.update(delta);
        }

        if (
            interactions &&
            typeof interactions.updatePrompt === "function"
        ) {
            interactions.updatePrompt();
        }

        updateApparition(delta);

        if (autosaveTimer >= 60) {
            autosaveTimer = 0;
            saveProgress();
        }
    }

    renderer.render(scene, camera);
}

// ======================================================
// INICIALIZAÇÃO
// ======================================================

function initialize() {
    if (loadingScreen) {
        loadingScreen.classList.add("hidden");
    }

    if (gameContainer) {
        gameContainer.classList.add("hidden");
    }

    if (mainMenu) {
        mainMenu.classList.remove("hidden");
    }

    if (continueButton) {
        continueButton.disabled = !hasSave();
    }

    updateMissionText(
        "Encontre pistas para descobrir o que aconteceu."
    );

    animate();
}

initialize();

// ======================================================
// LIMPEZA
// ======================================================

window.addEventListener("beforeunload", () => {
    if (gameStarted) {
        saveProgress();
    }

    controls.destroy?.();
    flashlight.destroy?.();
    interactions.destroy?.();
    inventoryUI.destroy?.();
    apparition.destroy?.();
    effects.destroy?.();
    journal.destroy?.();
    world.destroy?.();
    hospital.destroy?.();
    school.destroy?.();
    interior.destroy?.();
    doors.destroy?.();
    audio.destroy?.();

    renderer.dispose();
});
