
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createControls } from './controls.js';
import { setupInterface } from './interface.js';
import { setupAudio } from './audio.js';
import { createFlashlight } from './flashlight.js';
import { createInteractions } from './interactions.js';
import { setupInventoryUI } from './inventory-ui.js';

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

// SISTEMAS DO JOGO

const world = createWorld(THREE, scene);

const player = createPlayer(
    THREE,
    camera,
    scene
);

const controls = createControls(
    THREE,
    camera,
    renderer.domElement,
    player
);

const flashlight = createFlashlight(
    THREE,
    camera
);

const interactions = createInteractions(
    THREE,
    scene,
    camera
);

const inventoryUI = setupInventoryUI();

const audio = setupAudio();

setupInterface({
    player,
    scene,
    camera
});

// ESTADO DO JOGO

let gameStarted = false;
let paused = false;
let previousTime = 0;

// INICIAR

function startGame() {
    gameStarted = true;
    paused = false;

    menu.classList.add('hidden');
    pauseMenu.classList.add('hidden');
    gameUI.classList.remove('hidden');

    controls.activate();

    audio.start();

    renderer.domElement.requestPointerLock?.();

    interactions.showMessage(
        'VOCÊ ACORDOU NO DISTRITO CENTRAL.',
        4500
    );
}

// PAUSAR

function pauseGame() {
    if (!gameStarted || paused) return;

    paused = true;

    pauseMenu.classList.remove('hidden');

    inventoryUI.close();

    document.exitPointerLock?.();
}

// CONTINUAR

function resumeGame() {
    if (!gameStarted) return;

    paused = false;

    pauseMenu.classList.add('hidden');

    controls.activate();

    renderer.domElement.requestPointerLock?.();
}

// VOLTAR AO MENU

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

// BOTÕES

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

// INTERAÇÕES

function handleKeyDown(event) {
    if (!gameStarted || paused) return;

    if (event.code === 'KeyF' && !event.repeat) {
        toggleFlashlight();
    }

    if (event.code === 'KeyE' && !event.repeat) {
        interactions.interact();
    }
}

window.addEventListener('keydown', handleKeyDown);

// PROGRESSO DA INVESTIGAÇÃO

window.addEventListener('clueCollected', (event) => {
    const count = interactions.getCollectedCount();

    const title = document.getElementById('mission-title');
    const description = document.getElementById('mission-description');

    if (count < 4) {
        title.textContent = 'Investigue a cidade.';
        description.textContent =
            `${count}/4 pistas encontradas. Continue explorando.`;
    } else {
        title.textContent = 'Todas as pistas encontradas.';
        description.textContent =
            'Você descobriu os primeiros segredos da cidade.';
    }

    console.log('Pista encontrada:', event.detail.name);
});

// CONTROLE DE PAUSA

document.addEventListener('keydown', (event) => {
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

        interactions.update();
    }

    renderer.render(scene, camera);
}

// REDIMENSIONAMENTO

window.addEventListener('resize', () => {
    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.8)
    );
});

// FINALIZAÇÃO DO CARREGAMENTO

loading.classList.add('hidden');

animate();

console.log(
    'A CIDADE SEM ROSTO — ETAPA 2 CARREGADA.'
);
