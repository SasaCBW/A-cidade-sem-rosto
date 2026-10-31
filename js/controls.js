
export function createControls(THREE, camera, canvas, player) {
    const keys = {};

    let active = false;
    let yaw = 0;
    let pitch = 0;

    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    function onKeyDown(event) {
        keys[event.code] = true;
    }

    function onKeyUp(event) {
        keys[event.code] = false;
    }

    function onMouseMove(event) {
        if (!active || document.pointerLockElement !== canvas) {
            return;
        }

        const sensitivity = 0.002;

        yaw -= event.movementX * sensitivity;
        pitch -= event.movementY * sensitivity;

        pitch = THREE.MathUtils.clamp(
            pitch,
            -Math.PI / 2 + 0.05,
            Math.PI / 2 - 0.05
        );

        camera.rotation.order = 'YXZ';
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
    }

    function activate() {
        active = true;

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        document.addEventListener('mousemove', onMouseMove);
    }

    function deactivate() {
        active = false;

        Object.keys(keys).forEach(key => {
            keys[key] = false;
        });

        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        document.removeEventListener('mousemove', onMouseMove);
    }

    function update(delta) {
        if (!active) return;

        direction.set(0, 0, 0);

        forward.set(
            -Math.sin(yaw),
            0,
            -Math.cos(yaw)
        );

        right.set(
            Math.cos(yaw),
            0,
            -Math.sin(yaw)
        );

        if (keys['KeyW'] || keys['ArrowUp']) {
            direction.add(forward);
        }

        if (keys['KeyS'] || keys['ArrowDown']) {
            direction.sub(forward);
        }

        if (keys['KeyD'] || keys['ArrowRight']) {
            direction.add(right);
        }

        if (keys['KeyA'] || keys['ArrowLeft']) {
            direction.sub(right);
        }

        const moving = direction.lengthSq() > 0;

        player.moving = moving;

        if (moving) {
            direction.normalize();

            const speed = keys['ShiftLeft']
                ? 7
                : player.speed;

            camera.position.addScaledVector(
                direction,
                speed * delta
            );
        }

        camera.position.x = THREE.MathUtils.clamp(
            camera.position.x,
            -55,
            55
        );

        camera.position.z = THREE.MathUtils.clamp(
            camera.position.z,
            -110,
            110
        );
    }

    return {
        activate,
        deactivate,
        update
    };
}
