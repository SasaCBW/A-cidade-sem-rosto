
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createControls } from './controls.js';
import { setupInterface } from './interface.js';
import { setupAudio } from './audio.js';
import { createFlashlight } from './flashlight.js';
import { createInteractions } from './interactions.js';
import { setupInventoryUI } from './inventory-ui.js';
import { createDoors } from './doors.js';
import { createInterior } from './interior.js';
import { createApparition } from './apparition.js';
import { chapters, completeChapter } from './chapters.js';

const container = document.getElementById('game-container');

const loading = document.getElementById('loading-screen');
const menu = document.getElementById('main-menu');
const gameUI = document.getElementById('game-ui');
const pauseMenu = document.getElementById('pause-menu');

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x080d14);
scene.fog = new THREE.FogExp2(0x101923, 0.018);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

camera.position.set(0, 1.7, 8);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

container.appendChild(renderer.domElement);

// SISTEMAS

const world = createWorld(THREE, scene);
const player = createPlayer(THREE, camera, scene);

const controls = createControls(
    THREE,
    camera,
    renderer.domElement,
    player
);

const flashlight = createFlashlight(THREE, camera);
const interactions = createInteractions(THREE, scene, camera);
const inventoryUI = setupInventoryUI();
const audio = setupAudio();

const doors = createDoors(THREE, scene);
createInterior(THREE, scene);

const apparition = createApparition(THREE, scene);

doors.addDoor(43.9, 0, -6, 0, 'Delegacia');
doors.addDoor(43.9, 0, -38, 0, 'Casa abandonada');

setupInterface({ player, scene, camera });

// ESTADO

let gameStarted = false;
let paused = false;
let previousTime = 0;

let currentChapter = 1;
let openedBuildings = new Set();

const missionTitle = document.getElementById('mission-title');
const missionDescription = document.getElementById('mission-description');

function showChapter(id) {
    const chapter = chapters.find(item => item.id === id);

    if (!chapter) return;

    missionTitle.textContent = chapter.title;
    missionDescription.textContent = chapter.objective;

    interactions.showMessage(
        `CAPÍTULO ${chapter.id}: ${chapter.title.toUpperCase()}`,
        5000
    );
}

function startGame() {
    gameStarted = true;
    paused = false;

    menu.classList.add('hidden');
    pauseMenu.classList.add('hidden');
    gameUI.classList.remove('hidden');

    controls.activate();
    audio.start();

    renderer.domElement.requestPointerLock?.();

    showChapter(1);
}

function pauseGame() {
    if (!gameStarted || paused) return;

    paused = true;

    pauseMenu.classList.remove('hidden');
    inventoryUI.close();

    document.exitPointerLock?.();
}

function resumeGame() {
    if (!gameStarted) return;

    paused = false;

    pauseMenu.classList.add('hidden');

    controls.activate();

    renderer.domElement.requestPointerLock?.();
}

function returnToMenu() {
    gameStarted = false;
    paused = false;

    pauseMenu.classList.add('hidden');
    gameUI.classList.add('hidden');
    menu.classList.remove('hidden');

    document.exitPointerLock?.();

    controls.deactivate();
    flashlight.setEnabled(false);
    inventoryUI.close();
    audio.stop();
}

document.getElementById('start-button')
    .addEventListener('click', startGame);

document.getElementById('resume-button')
    .addEventListener('click', resumeGame);

document.getElementById('menu-button')
    .addEventListener('click', returnToMenu);

document.getElementById('about-button')
    .addEventListener('click', () => {
        document.getElementById('about-modal')
            .classList.remove('hidden');
    });

document.getElementById('close-about')
    .addEventListener('click', () => {
        document.getElementById('about-modal')
            .classList.add('hidden');
    });

// LANTERNA

function toggleFlashlight() {
    if (!gameStarted || paused) return;

    const enabled = flashlight.toggle();

    document.getElementById('flashlight-button')
        .textContent = enabled
            ? 'LANTERNA LIGADA [F]'
            : 'LANTERNA DESLIGADA [F]';

    interactions.showMessage(
        enabled ? 'LANTERNA LIGADA' : 'LANTERNA DESLIGADA',
        1200
    );
}

document.getElementById('flashlight-button')
    .addEventListener('click', toggleFlashlight);

// PORTAS

function tryOpenDoor() {
    const position = camera.position;

    for (let i = 0; i < doors.getDoors().length; i++) {
        const door = doors.getDoors()[i];

        const distance = position.distanceTo(
            new THREE.Vector3(
                door.pivot.position.x + 0.9,
                1.4,
                door.pivot.position.z
            )
        );

        if (distance < 3.5) {
            doors.toggle(door);

            if (door.opened) {
                openedBuildings.add(door.name);

                interactions.showMessage(
                    `${door.name.toUpperCase()} — ENTRADA LIBERADA`,
                    3500
                );

                if (door.name === 'Delegacia') {
                    completeChapter(1);
                    currentChapter = 2;
                    showChapter(2);
                }

                if (door.name === 'Casa abandonada') {
                    completeChapter(2);
                    currentChapter = 3;
                    showChapter(3);
                }
            } else {
                interactions.showMessage(
                    'PORTA FECHADA',
                    1500
                );
            }

            return true;
        }
    }

    return false;
}

// TECLADO

window.addEventListener('keydown', event => {
    if (!gameStarted || paused) return;

    if (event.code === 'KeyF' && !event.repeat) {
        toggleFlashlight();
    }

    if (event.code === 'KeyE' && !event.repeat) {
        const doorHandled = tryOpenDoor();

        if (!doorHandled) {
            interactions.interact();
        }
    }
});

// DESCOBERTA DE PISTAS

window.addEventListener('clueCollected', event => {
    const count = interactions.getCollectedCount();

    missionTitle.textContent = 'Investigue os documentos';

    missionDescription.textContent =
        `${count} pistas encontradas. Continue explorando.`;

    if (count >= 4) {
        completeChapter(3);
        currentChapter = 4;

        showChapter(4);
    }

    console.log('Pista:', event.detail.name);
});

// PAUSA

document.addEventListener('keydown', event => {
    if (
        event.code === 'Escape' &&
        gameStarted &&
        !paused
    ) {
        pauseGame();
    }
});

document.addEventListener('pointerlockchange', () => {
    if (
        gameStarted &&
        !paused &&
        document.pointerLockElement !== renderer.domElement
    ) {
        pauseGame();
    }
});

// ANIMAÇÃO

function animate(time = 0) {
    requestAnimationFrame(animate);

    const delta = Math.min(
        (time - previousTime) / 1000,
        0.05
    );

    previousTime = time;

    if (gameStarted && !paused) {
        controls.update(delta);
        player.update(delta);
        world.update(delta);
        doors.update(delta);
        interactions.update();
        apparition.update(delta, camera);
    }

    renderer.render(scene, camera);
}

// REDIMENSIONAMENTO

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.8)
    );
});

// INICIAR

loading.classList.add('hidden');

animate();

console.log('A CIDADE SEM ROSTO — ETAPA 3 CARREGADA.');
