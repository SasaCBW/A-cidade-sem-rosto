
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

/* ==========================================
   A CIDADE SEM ROSTO
   CONTROLES DO PERSONAGEM
========================================== */

export function createControls(camera, domElement, player = null) {
    const playerAPI = player?.group ? player : null;
    const playerObject = playerAPI
        ? playerAPI.group
        : player || camera;

    const keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false
    };

    const settings = {
        walkSpeed: 4.2,
        sprintSpeed: 7,
        mouseSensitivity: 0.002,
        minPitch: -Math.PI / 2 + 0.08,
        maxPitch: Math.PI / 2 - 0.08
    };

    let movementEnabled = true;
    let pointerLocked = false;
    let pitch = 0;

    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    /* ======================================
       TECLADO
    ====================================== */

    function onKeyDown(event) {
        switch (event.code) {
            case "KeyW":
            case "ArrowUp":
                keys.forward = true;
                break;

            case "KeyS":
            case "ArrowDown":
                keys.backward = true;
                break;

            case "KeyA":
            case "ArrowLeft":
                keys.left = true;
                break;

            case "KeyD":
            case "ArrowRight":
                keys.right = true;
                break;

            case "ShiftLeft":
            case "ShiftRight":
                keys.sprint = true;
                break;
        }
    }

    function onKeyUp(event) {
        switch (event.code) {
            case "KeyW":
            case "ArrowUp":
                keys.forward = false;
                break;

            case "KeyS":
            case "ArrowDown":
                keys.backward = false;
                break;

            case "KeyA":
            case "ArrowLeft":
                keys.left = false;
                break;

            case "KeyD":
            case "ArrowRight":
                keys.right = false;
                break;

            case "ShiftLeft":
            case "ShiftRight":
                keys.sprint = false;
                break;
        }
    }

    /* ======================================
       MOVIMENTO DO MOUSE
    ====================================== */

    function onMouseMove(event) {
        if (!pointerLocked || !movementEnabled) return;

        playerObject.rotation.y -=
            event.movementX * settings.mouseSensitivity;

        pitch -=
            event.movementY * settings.mouseSensitivity;

        pitch = THREE.MathUtils.clamp(
            pitch,
            settings.minPitch,
            settings.maxPitch
        );

        camera.rotation.x = pitch;
    }

    /* ======================================
       POINTER LOCK
    ====================================== */

    function lock() {
        if (domElement.requestPointerLock) {
            domElement.requestPointerLock();
        }
    }

    function unlock() {
        if (document.pointerLockElement === domElement) {
            document.exitPointerLock();
        }
    }

    function onPointerLockChange() {
        pointerLocked =
            document.pointerLockElement === domElement;

        if (!pointerLocked) {
            clearKeys();
        }
    }

    /* ======================================
       ATUALIZAÇÃO DO MOVIMENTO
    ====================================== */

    function update(delta) {
        if (!movementEnabled) {
            return {
                moving: false,
                isSprinting: false,
                stamina: playerAPI?.getStamina?.() ?? 100
            };
        }

        forward.set(0, 0, -1);
        forward.applyQuaternion(playerObject.quaternion);
        forward.y = 0;
        forward.normalize();

        right.set(1, 0, 0);
        right.applyQuaternion(playerObject.quaternion);
        right.y = 0;
        right.normalize();

        direction.set(0, 0, 0);

        if (keys.forward) direction.add(forward);
        if (keys.backward) direction.sub(forward);
        if (keys.right) direction.add(right);
        if (keys.left) direction.sub(right);

        const moving = direction.lengthSq() > 0;

        if (moving) {
            direction.normalize();
        }

        const sprintRequested = keys.sprint && moving;

        let stamina = playerAPI?.getStamina?.() ?? 100;
        let isSprinting = sprintRequested && stamina > 0;

        if (playerAPI?.update) {
            const status = playerAPI.update(
                delta,
                sprintRequested
            );

            if (status && typeof status === "object") {
                isSprinting = Boolean(status.isSprinting);
                stamina = status.stamina ?? stamina;
            } else {
                stamina = playerAPI.getStamina?.() ?? stamina;
                isSprinting = sprintRequested && stamina > 0;
            }
        }

        const speed = isSprinting
            ? settings.sprintSpeed
            : settings.walkSpeed;

        if (moving) {
            playerObject.position.addScaledVector(
                direction,
                speed * delta
            );
        }

        /* Limites da cidade */

        playerObject.position.x = THREE.MathUtils.clamp(
            playerObject.position.x,
            -85,
            85
        );

        playerObject.position.z = THREE.MathUtils.clamp(
            playerObject.position.z,
            -165,
            65
        );

        return {
            moving,
            isSprinting,
            stamina
        };
    }

    /* ======================================
       CONTROLE DE TECLAS
    ====================================== */

    function clearKeys() {
        Object.keys(keys).forEach((key) => {
            keys[key] = false;
        });
    }

    function setMovementEnabled(enabled) {
        movementEnabled = Boolean(enabled);

        if (!movementEnabled) {
            clearKeys();
        }
    }

    function setBounds(minX, maxX, minZ, maxZ) {
        settings.minX = minX;
        settings.maxX = maxX;
        settings.minZ = minZ;
        settings.maxZ = maxZ;
    }

    function isLocked() {
        return pointerLocked;
    }

    function isMoving() {
        return (
            keys.forward ||
            keys.backward ||
            keys.left ||
            keys.right
        );
    }

    function destroy() {
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("keyup", onKeyUp);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener(
            "pointerlockchange",
            onPointerLockChange
        );

        domElement.removeEventListener("click", lock);

        clearKeys();
    }

    /* ======================================
       EVENTOS
    ====================================== */

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);

    document.addEventListener(
        "pointerlockchange",
        onPointerLockChange
    );

    domElement.addEventListener("click", lock);

    /* ======================================
       RETORNO
    ====================================== */

    return {
        update,
        lock,
        unlock,
        clearKeys,
        setMovementEnabled,
        setBounds,
        isLocked,
        isMoving,
        destroy
    };
}
