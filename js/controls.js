import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createControls(camera, domElement) {
  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
  };

  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();

  const euler = new THREE.Euler(0, 0, 0, "YXZ");

  const playerHeight = 1.7;
  const walkSpeed = 4.2;
  const sprintSpeed = 7.2;

  let isLocked = false;
  let movementEnabled = true;

  const bounds = {
    minX: -85,
    maxX: 85,
    minZ: -165,
    maxZ: 65
  };

  camera.position.set(0, playerHeight, 8);

  camera.rotation.order = "YXZ";

  function onMouseMove(event) {
    if (!isLocked || !movementEnabled) return;

    const sensitivity = 0.002;

    euler.setFromQuaternion(camera.quaternion);

    euler.y -= event.movementX * sensitivity;
    euler.x -= event.movementY * sensitivity;

    const verticalLimit = Math.PI / 2 - 0.05;

    euler.x = Math.max(
      -verticalLimit,
      Math.min(verticalLimit, euler.x)
    );

    camera.quaternion.setFromEuler(euler);
  }

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

  function clearKeys() {
    Object.keys(keys).forEach(key => {
      keys[key] = false;
    });

    velocity.set(0, 0, 0);
  }

  function onPointerLockChange() {
    isLocked = document.pointerLockElement === domElement;

    if (!isLocked) {
      clearKeys();
    }
  }

  function lock() {
    if (!domElement || !domElement.requestPointerLock) {
      return;
    }

    domElement.requestPointerLock();
  }

  function unlock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    clearKeys();
  }

  function update(delta) {
    if (!movementEnabled || !isLocked) return;

    const dt = Math.min(delta, 0.05);

    direction.set(0, 0, 0);

    if (keys.forward) direction.z -= 1;
    if (keys.backward) direction.z += 1;
    if (keys.left) direction.x -= 1;
    if (keys.right) direction.x += 1;

    if (direction.lengthSq() === 0) {
      velocity.set(0, 0, 0);
      return;
    }

    direction.normalize();

    const speed = keys.sprint ? sprintSpeed : walkSpeed;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
    right.normalize();

    const movement = new THREE.Vector3();

    movement.addScaledVector(forward, -direction.z);
    movement.addScaledVector(right, direction.x);

    movement.normalize();

    velocity.copy(movement).multiplyScalar(speed * dt);

    camera.position.x += velocity.x;
    camera.position.z += velocity.z;

    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x,
      bounds.minX,
      bounds.maxX
    );

    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      bounds.minZ,
      bounds.maxZ
    );

    // Mantém a câmera na altura dos olhos.
    camera.position.y = playerHeight;
  }

  function setMovementEnabled(enabled) {
    movementEnabled = Boolean(enabled);

    if (!movementEnabled) {
      clearKeys();
    }
  }

  function setBounds(newBounds = {}) {
    Object.assign(bounds, newBounds);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  document.addEventListener("pointerlockchange", onPointerLockChange);
  window.addEventListener("blur", clearKeys);

  return {
    lock,
    unlock,
    update,
    clearKeys,
    setMovementEnabled,
    setBounds,

    isLocked: () => isLocked,

    destroy() {
      unlock();

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      window.removeEventListener("blur", clearKeys);
    }
  };
}
