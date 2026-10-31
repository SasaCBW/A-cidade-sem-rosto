
export function createFlashlight(THREE, camera) {
    const light = new THREE.SpotLight(
        0xe5f0ff,
        35,
        35,
        Math.PI / 7,
        0.45,
        1.2
    );

    light.position.set(0, 0, 0);
    light.target.position.set(0, 0, -1);

    camera.add(light);
    camera.add(light.target);

    let enabled = false;

    function toggle() {
        enabled = !enabled;
        light.visible = enabled;
        return enabled;
    }

    function setEnabled(value) {
        enabled = Boolean(value);
        light.visible = enabled;
    }

    function isEnabled() {
        return enabled;
    }

    setEnabled(false);

    return {
        toggle,
        setEnabled,
        isEnabled
    };
}
