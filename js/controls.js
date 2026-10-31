
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createControls(camera, domElement, player = null) {
    const playerObject = player || camera;

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

    const bounds = {
        minX: -85,
        maxX: 85,
        minZ: -165,
        maxZ: 65
    };

    let enabled = true;
    let locked = false;
    let pitch = 0;

    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    function setKey(code, pressed) {
        switch (code) {
            case "KeyW":
            case "ArrowUp":
                keys.forward = pressed;
                break;

            case "KeyS":
            case "ArrowDown":
                keys.backward = pressed;
                break;

            case "KeyA":
            case "ArrowLeft":
                keys.left = pressed;
                break;

            case "KeyD":
            case "ArrowRight":
                keys.right = pressed;
                break;

            case "ShiftLeft":
            case "ShiftRight":
                keys.sprint = pressed;
                break;
        }
    }

    function onKeyDown(event) {
        setKey(event.code, true);
    }

    function onKeyUp(event) {
        setKey(event.code, false);
    }

    function onMouseMove(event) {
        if (!locked || !enabled) return;

        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        playerObject.rotation.y -=
            movementX * settings.mouseSensitivity;

        pitch -= movementY * settings.mouseSensitivity;

        pitch = THREE.MathUtils.clamp(
            pitch,
            settings.minPitch,
            settings.maxPitch
        );

        camera.rotation.x = pitch;
    }

    function onPointerLockChange() {
        locked = document.pointerLockElement === domElement;

        if (!locked) {
            clearKeys();
        }
    }

    function onPointerLockError() {
        locked = false;
        clearKeys();
    }

    function lock() {
        if (!domElement || !domElement.requestPointerLock) return;

        const result = domElement.requestPointerLock();

        if (result && typeof result.catch === "function") {
            result.catch(() => {
                locked = false;
            });
        }
    }

    function unlock() {
        if (document.pointerLockElement === domElement) {
            document.exitPointerLock();
        }

        locked = false;
        clearKeys();
    }

    function clearKeys() {
        Object.keys(keys).forEach((key) => {
            keys[key] = false;
        });
    }

    function update(delta) {
        if (!enabled || !Number.isFinite(delta)) return;

        const movingForward = keys.forward || keys.backward;
        const movingSideways = keys.left || keys.right;

        if (!movingForward && !movingSideways) return;

        const speed = keys.sprint
            ? settings.sprintSpeed
            : settings.walkSpeed;

        const movement = speed * Math.min(delta, 0.05);

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

        if (direction.lengthSq() === 0) return;

        direction.normalize().multiplyScalar(movement);

        playerObject.position.x += direction.x;
        playerObject.position.z += direction.z;

        playerObject.position.x = THREE.MathUtils.clamp(
            playerObject.position.x,
            bounds.minX,
            bounds.maxX
        );

        playerObject.position.z = THREE.MathUtils.clamp(
            playerObject.position.z,
            bounds.minZ,
            bounds.maxZ
        );
    }

    function setMovementEnabled(value) {
        enabled = Boolean(value);

        if (!enabled) {
            clearKeys();
        }
    }

    function setBounds(newBounds = {}) {
        Object.assign(bounds, newBounds);
    }

    function isLocked() {
        return locked;
    }

    function destroy() {
        unlock();

        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("keyup", onKeyUp);
        document.removeEventListener(
            "mousemove",
            onMouseMove
        );

        document.removeEventListener(
            "pointerlockchange",
            onPointerLockChange
        );

        document.removeEventListener(
            "pointerlockerror",
            onPointerLockError
        );
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);

    document.addEventListener(
        "pointerlockchange",
        onPointerLockChange
    );

    document.addEventListener(
        "pointerlockerror",
        onPointerLockError
    );

    return {
        lock,
        unlock,
        update,
        clearKeys,
        setMovementEnabled,
        setBounds,
        isLocked,
        destroy
    };
}
