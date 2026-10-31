import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createPlayer(camera, scene = null) {
    const player = new THREE.Group();

    player.name = "Player";
    player.position.set(0, 0, 8);

    // A câmera fica posicionada na altura dos olhos.
    camera.position.set(0, 1.7, 0);
    camera.rotation.set(0, 0, 0);

    player.add(camera);

    // Adiciona o personagem à cena, quando ela for fornecida.
    if (scene) {
        scene.add(player);
    }

    let stamina = 100;
    let exhausted = false;

    function update(delta, sprinting = false) {
        const dt = Math.min(delta, 0.05);

        if (sprinting && stamina > 0) {
            stamina -= 24 * dt;
        } else {
            stamina += 15 * dt;
        }

        stamina = THREE.MathUtils.clamp(stamina, 0, 100);

        if (stamina <= 0) {
            exhausted = true;
        }

        if (stamina >= 25) {
            exhausted = false;
        }

        return {
            stamina,
            exhausted
        };
    }

    function setPosition(x, y = 0, z = 8) {
        player.position.set(x, y, z);
    }

    function getPosition() {
        return player.position.clone();
    }

    function getStamina() {
        return stamina;
    }

    function resetStamina() {
        stamina = 100;
        exhausted = false;
    }

    function destroy() {
        if (player.parent) {
            player.parent.remove(player);
        }
    }

    return {
        group: player,
        camera,
        update,
        setPosition,
        getPosition,
        getStamina,
        resetStamina,
        destroy
    };
}
