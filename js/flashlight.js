import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createFlashlight(camera, button) {

  let isOn = false;

  // =========================================
  // LUZ PRINCIPAL
  // =========================================

  const spotlight = new THREE.SpotLight(
    0xddeeff,
    0,
    32,
    Math.PI / 7,
    0.45,
    1.2
  );

  spotlight.position.set(0, 0, 0);

  spotlight.castShadow = true;

  spotlight.shadow.mapSize.width = 1024;
  spotlight.shadow.mapSize.height = 1024;

  spotlight.shadow.camera.near = 0.5;
  spotlight.shadow.camera.far = 35;

  const target = new THREE.Object3D();

  target.position.set(0, 0, -1);

  camera.add(spotlight);
  camera.add(target);

  spotlight.target = target;

  // =========================================
  // ILUMINAÇÃO PRÓXIMA
  // =========================================

  const nearbyLight = new THREE.PointLight(
    0xc8dcff,
    0,
    8,
    2
  );

  nearbyLight.position.set(
    0,
    -0.15,
    -0.3
  );

  camera.add(nearbyLight);

  // =========================================
  // ATUALIZAR BOTÃO
  // =========================================

  function updateButton() {

    if (!button) return;

    button.classList.toggle(
      "flashlight-on",
      isOn
    );

    button.textContent = isOn
      ? "🔦 Lanterna ligada"
      : "🔦 Lanterna desligada";

    button.setAttribute(
      "aria-pressed",
      String(isOn)
    );

  }

  // =========================================
  // LIGAR
  // =========================================

  function turnOn() {

    if (isOn) return;

    isOn = true;

    spotlight.intensity = 5;

    nearbyLight.intensity = 1.2;

    updateButton();

  }

  // =========================================
  // DESLIGAR
  // =========================================

  function turnOff() {

    if (!isOn) return;

    isOn = false;

    spotlight.intensity = 0;

    nearbyLight.intensity = 0;

    updateButton();

  }

  // =========================================
  // ALTERNAR
  // =========================================

  function toggle() {

    if (isOn) {
      turnOff();
    } else {
      turnOn();
    }

  }

  // =========================================
  // TECLADO
  // =========================================

  function handleKey(event) {

    if (event.code !== "KeyF") return;

    if (event.repeat) return;

    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    toggle();

  }

  // =========================================
  // BOTÃO
  // =========================================

  function handleButtonClick() {
    toggle();
  }

  button?.addEventListener(
    "click",
    handleButtonClick
  );

  window.addEventListener(
    "keydown",
    handleKey
  );

  updateButton();

  // =========================================
  // RETORNO
  // =========================================

  return {

    toggle,

    turnOn,

    turnOff,

    isOn: () => isOn,

    destroy() {

      button?.removeEventListener(
        "click",
        handleButtonClick
      );

      window.removeEventListener(
        "keydown",
        handleKey
      );

      camera.remove(spotlight);
      camera.remove(target);
      camera.remove(nearbyLight);

      spotlight.target = new THREE.Object3D();

    }

  };

}
