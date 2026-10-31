
export function createDoors(THREE, scene) {
    const doors = [];

    const material = new THREE.MeshStandardMaterial({
        color: 0x302a24,
        roughness: 0.85
    });

    function addDoor(x, y, z, rotation = 0, name = 'Porta') {
        const pivot = new THREE.Group();

        pivot.position.set(x, y, z);
        pivot.rotation.y = rotation;

        const door = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 2.8, 0.12),
            material.clone()
        );

        door.position.set(0.9, 1.4, 0);
        door.castShadow = true;
        door.userData.door = true;

        pivot.add(door);

        const handle = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0xa18c65,
                metalness: 0.8
            })
        );

        handle.position.set(1.6, 1.4, 0.1);
        pivot.add(handle);

        scene.add(pivot);

        doors.push({
            pivot,
            name,
            opened: false,
            angle: 0,
            targetAngle: 0,
            object: door
        });

        return pivot;
    }

    function toggle(door) {
        door.opened = !door.opened;
        door.targetAngle = door.opened ? -Math.PI / 2 : 0;
    }

    function update(delta) {
        doors.forEach(door => {
            const target = door.targetAngle;

            door.angle +=
                (target - door.angle) *
                Math.min(delta * 4, 1);

            door.pivot.rotation.y =
                door.angle;
        });
    }

    function getDoors() {
        return doors;
    }

    return {
        addDoor,
        toggle,
        update,
        getDoors
    };
}
