import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createFlashlight(camera, button) {

  // ================================================
  // CONFIGURAÇÕES
  // ================================================

  let isOn = false;

  const flashlightGroup = new THREE.Group();

  camera.add(flashlightGroup);

  // ================================================
  // LUZ PRINCIPAL
  // ================================================

  const spotlight = new THREE.SpotLight(
    0xddeeff,
    0,
    35,
    Math.PI / 7,
    0.45,
    1.2
  );

  spotlight.position.set(0, 0, 0);

  spotlight.castShadow = true;

  spotlight.shadow.mapSize.width = 1024;
  spotlight.shadow.mapSize.height = 1024;

  spotlight.shadow.camera.near = 0.1;
  spotlight.shadow.camera.far = 35;

  const target = new THREE.Object3D();

  target.position.set(0, 0, -1);

  camera.add(spotlight);
  camera.add(target);

  spotlight.target = target;

  // ================================================
  // LUZ PRÓXIMA
  // ================================================

  const nearbyLight = new THREE.PointLight(
    0xc8dcff,
    0,
    8,
    2
  );

  nearbyLight.position.set(0, 0, -0.3);

  camera.add(nearbyLight);

  // ================================================
  // VISUAL DO BOTÃO
  // ================================================

  function updateButton() {

    if (!button) return;

    button.textContent = isOn
      ? "🔦 Lanterna ligada"
      : "🔦 Lanterna desligada";

    button.classList.toggle(
      "flashlight-on",
      isOn
    );

    button.setAttribute(
      "aria-pressed",
      String(isOn)
    );
  }

  // ================================================
  // LIGAR E DESLIGAR
  // ================================================

  function toggle() {

    isOn = !isOn;

    spotlight.intensity = isOn ? 5 : 0;

    nearbyLight.intensity = isOn ? 1.2 : 0;

    updateButton();

    return isOn;
  }

  // ================================================
  // TECLADO
  // ================================================

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

  // ================================================
  // BOTÃO
  // ================================================

  button?.addEventListener("click", toggle);

  window.addEventListener(
    "keydown",
    handleKey
  );

  // ================================================
  // ESTADO INICIAL
  // ================================================

  updateButton();

  // ================================================
  // RETORNO DO SISTEMA
  // ================================================

  return {

    toggle,

    isOn: () => isOn,

    turnOn() {
      if (!isOn) toggle();
    },

    turnOff() {
      if (isOn) toggle();
    },

    destroy() {

      button?.removeEventListener(
        "click",
        toggle
      );

      window.removeEventListener(
        "keydown",
        handleKey
      );

      camera.remove(spotlight);
      camera.remove(target);
      camera.remove(nearbyLight);

      spotlight.dispose?.();
    }

  };

}
