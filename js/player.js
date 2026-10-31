
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

/* ==========================================
   CONFIGURAÇÕES DO PERSONAGEM
========================================== */

const PLAYER_HEIGHT = 1.7;

const PLAYER_START_POSITION = {
    x: 0,
    y: 0,
    z: 8
};

export function createPlayer(camera, scene = null) {
    const group = new THREE.Group();

    group.name = "Player";

    group.position.set(
        PLAYER_START_POSITION.x,
        PLAYER_START_POSITION.y,
        PLAYER_START_POSITION.z
    );

    /* ======================================
       CÂMERA EM PRIMEIRA PESSOA
    ====================================== */

    camera.position.set(0, PLAYER_HEIGHT, 0);

    camera.rotation.set(0, 0, 0);

    camera.rotation.order = "YXZ";

    group.add(camera);

    /* ======================================
       SOMBRA DISCRETA
    ====================================== */

    const shadowGeometry = new THREE.CircleGeometry(
        0.35,
        20
    );

    const shadowMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.18,
        depthWrite: false
    });

    const shadow = new THREE.Mesh(
        shadowGeometry,
        shadowMaterial
    );

    shadow.rotation.x = -Math.PI / 2;

    shadow.position.y = 0.025;

    group.add(shadow);

    /* ======================================
       ESTADO DO PERSONAGEM
    ====================================== */

    let stamina = 100;

    const maxStamina = 100;

    const staminaRecovery = 18;

    const staminaConsumption = 25;

    let isSprinting = false;

    /* ======================================
       ADICIONAR AO CENÁRIO
    ====================================== */

    if (scene) {
        scene.add(group);
    }

    /* ======================================
       ATUALIZAR PERSONAGEM
    ====================================== */

    function update(delta, sprintRequested = false) {
        const safeDelta = Math.min(
            Math.max(delta || 0, 0),
            0.05
        );

        if (sprintRequested && stamina > 0) {
            isSprinting = true;

            stamina -= staminaConsumption * safeDelta;
        } else {
            isSprinting = false;

            stamina += staminaRecovery * safeDelta;
        }

        stamina = THREE.MathUtils.clamp(
            stamina,
            0,
            maxStamina
        );

        return {
            stamina,
            isSprinting,
            canSprint: stamina > 0
        };
    }

    /* ======================================
       POSIÇÃO
    ====================================== */

    function setPosition(x, y = 0, z = 8) {
        group.position.set(x, y, z);
    }

    function getPosition() {
        return {
            x: group.position.x,
            y: group.position.y,
            z: group.position.z
        };
    }

    /* ======================================
       RESISTÊNCIA
    ====================================== */

    function getStamina() {
        return stamina;
    }

    function resetStamina() {
        stamina = maxStamina;
        isSprinting = false;
    }

    /* ======================================
       MOVIMENTO
    ====================================== */

    function getMovementSpeed() {
        return isSprinting ? 7 : 4.2;
    }

    function canSprint() {
        return stamina > 0;
    }

    /* ======================================
       DESTRUIR
    ====================================== */

    function destroy() {
        scene?.remove(group);

        shadowGeometry.dispose();
        shadowMaterial.dispose();

        group.clear();
    }

    /* ======================================
       API DO PERSONAGEM
    ====================================== */

    return {
        group,
        camera,
        update,
        setPosition,
        getPosition,
        getStamina,
        resetStamina,
        getMovementSpeed,
        canSprint,
        destroy
    };
}
