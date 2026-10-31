
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createDoors(scene) {
  const doors = [];
  const raycaster = new THREE.Raycaster();

  raycaster.far = 3.5;

  const pointer = new THREE.Vector2(0, 0);

  let activeDoor = null;

  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x302a24,
    roughness: 0.9,
    metalness: 0.05
  });

  const handleMaterial = new THREE.MeshStandardMaterial({
    color: 0x77736b,
    metalness: 0.75,
    roughness: 0.3
  });

  const hingeMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3834,
    metalness: 0.6,
    roughness: 0.5
  });

  function createDoor({
    id,
    name,
    position,
    width = 1.8,
    height = 3,
    rotation = 0,
    locked = false
  }) {
    const pivot = new THREE.Group();

    pivot.position.set(...position);
    pivot.rotation.y = rotation;

    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.12),
      doorMaterial.clone()
    );

    panel.position.set(width / 2, height / 2, 0);
    panel.castShadow = true;
    panel.receiveShadow = true;

    pivot.add(panel);

    const handle = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 12, 12),
      handleMaterial
    );

    handle.position.set(width - 0.2, 1.45, 0.09);
    panel.add(handle);

    const handleBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.18, 10),
      handleMaterial
    );

    handleBar.rotation.z = Math.PI / 2;
    handleBar.position.set(width - 0.2, 1.45, 0.09);
    panel.add(handleBar);

    const hinge = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, height - 0.2, 0.16),
      hingeMaterial
    );

    hinge.position.set(0.04, height / 2, 0);
    pivot.add(hinge);

    const frame = new THREE.Group();

    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0x55504a,
      roughness: 0.9
    });

    const sideLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, height + 0.2, 0.22),
      sideMaterial
    );

    sideLeft.position.set(-0.08, height / 2, 0);

    const sideRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, height + 0.2, 0.22),
      sideMaterial
    );

    sideRight.position.set(width + 0.08, height / 2, 0);

    const top = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.32, 0.16, 0.22),
      sideMaterial
    );

    top.position.set(width / 2, height + 0.08, 0);

    frame.add(sideLeft, sideRight, top);

    const root = new THREE.Group();

    root.position.copy(pivot.position);
    root.rotation.y = rotation;

    pivot.position.set(0, 0, 0);

    root.add(frame);
    root.add(pivot);

    root.userData.door = {
      id,
      name,
      locked,
      opened: false,
      opening: false,
      targetRotation: 0,
      pivot,
      panel
    };

    scene.add(root);

    doors.push(root);

    return root;
  }

  createDoor({
    id: "police_station",
    name: "Delegacia abandonada",
    position: [43.9, 0, -6],
    width: 1.8,
    height: 3,
    rotation: Math.PI / 2
  });

  createDoor({
    id: "abandoned_house",
    name: "Casa abandonada",
    position: [43.9, 0, -38],
    width: 1.8,
    height: 3,
    rotation: Math.PI / 2
  });

  function getDoorTarget(camera) {
    raycaster.setFromCamera(pointer, camera);

    const visibleDoors = doors.filter(
      door => door.visible
    );

    const objects = visibleDoors.map(
      door => door.userData.door.panel
    );

    const hits = raycaster.intersectObjects(objects, false);

    if (!hits.length) return null;

    const panel = hits[0].object;

    return doors.find(
      door => door.userData.door.panel === panel
    ) || null;
  }

  function showPrompt(text) {
    const prompt = document.querySelector("#interactionPrompt");

    if (!prompt) return;

    prompt.textContent = text;
    prompt.classList.remove("hidden");
  }

  function hidePrompt() {
    const prompt = document.querySelector("#interactionPrompt");

    if (!prompt) return;

    prompt.classList.add("hidden");
  }

  function updatePrompt(camera) {
    activeDoor = getDoorTarget(camera);

    if (!activeDoor) {
      hidePrompt();
      return;
    }

    const data = activeDoor.userData.door;

    if (data.locked) {
      showPrompt(`${data.name} — Trancada`);
    } else if (data.opened) {
      showPrompt(`E — Fechar ${data.name}`);
    } else {
      showPrompt(`E — Abrir ${data.name}`);
    }
  }

  function interact() {
    if (!activeDoor) return false;

    const data = activeDoor.userData.door;

    if (data.locked) {
      showPrompt("A porta está trancada.");
      return true;
    }

    data.opened = !data.opened;
    data.opening = true;

    data.targetRotation = data.opened
      ? -Math.PI / 2
      : 0;

    window.dispatchEvent(
      new CustomEvent("buildingDoorChanged", {
        detail: {
          id: data.id,
          name: data.name,
          opened: data.opened
        }
      })
    );

    showPrompt(
      data.opened
        ? `${data.name} aberta`
        : `${data.name} fechada`
    );

    return true;
  }

  function update(delta, camera = null) {
    for (const door of doors) {
      const data = door.userData.door;

      if (!data.opening) continue;

      const difference =
        data.targetRotation - data.pivot.rotation.y;

      if (Math.abs(difference) < 0.015) {
        data.pivot.rotation.y = data.targetRotation;
        data.opening = false;
      } else {
        data.pivot.rotation.y +=
          Math.sign(difference) * Math.min(delta * 2.5, Math.abs(difference));
      }
    }

    if (camera) {
      updatePrompt(camera);
    }
  }

  function restore(openedIds = []) {
    const opened = new Set(openedIds);

    for (const door of doors) {
      const data = door.userData.door;

      data.opened = opened.has(data.id);
      data.opening = false;

      data.targetRotation = data.opened
        ? -Math.PI / 2
        : 0;

      data.pivot.rotation.y = data.targetRotation;
    }
  }

  function getOpened() {
    return doors
      .filter(door => door.userData.door.opened)
      .map(door => door.userData.door.id);
  }

  function getAll() {
    return [...doors];
  }

  function destroy() {
    hidePrompt();

    for (const door of doors) {
      scene.remove(door);

      door.traverse(object => {
        if (object.geometry) object.geometry.dispose();

        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach(material => material.dispose());
        }
      });
    }

    doors.length = 0;
  }

  return {
    doors,
    interact,
    update,
    restore,
    getOpened,
    getAll,
    destroy
  };
}
