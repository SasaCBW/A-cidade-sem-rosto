
export function createPlayer(THREE, camera, scene) {
    const player = {
        speed: 5,
        height: 1.7,
        velocity: new THREE.Vector3(),
        bobTime: 0,
        moving: false,

        update(delta) {
            if (this.moving) {
                this.bobTime += delta * 8;

                camera.position.y =
                    this.height +
                    Math.sin(this.bobTime) * 0.035;
            } else {
                camera.position.y = THREE.MathUtils.lerp(
                    camera.position.y,
                    this.height,
                    delta * 5
                );
            }
        },

        reset() {
            camera.position.set(0, this.height, 8);
            camera.rotation.set(0, 0, 0);
            this.velocity.set(0, 0, 0);
            this.moving = false;
        }
    };

    camera.position.set(0, player.height, 8);

    return player;
}
