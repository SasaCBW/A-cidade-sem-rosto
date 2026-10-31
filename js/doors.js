
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createDoors(scene) {
    const doors = [];

    const materials = {
        frame: new THREE.MeshStandardMaterial({
            color: 0x242a30,
            roughness: 0.85,
            metalness: 0.25
        }),

        wood: new THREE.MeshStandardMaterial({
            color: 0x302a25,
            roughness: 0.92
        }),

        metal: new THREE.MeshStandardMaterial({
            color: 0x343c43,
            roughness: 0.65,
            metalness: 0.65
        }),

        handle: new THREE.MeshStandardMaterial({
            color: 0x9b8560,
            metalness: 0.8,
            roughness: 0.3
        }),

        glass: new THREE.MeshStandardMaterial({
            color: 0x17232c,
            roughness: 0.2,
            metalness: 0.35,
            transparent: true,
            opacity: 0.55
        })
    };

    function createDoor(x, y, z, rotation, name, options = {}) {
        const width = options.width || 1.6;
        const height = options.height || 3;
        const depth = options.depth || 0.16;
        const material = options.material || materials.wood;

        const pivot = new THREE.Group();

        pivot.position.set(x, y, z);
        pivot.rotation.y = rotation || 0;

        pivot.userData.name = name;
        pivot.userData.isDoor = true;
        pivot.userData.isOpen = false;

        const frame = new THREE.Group();

        const doorGeometry = new THREE.BoxGeometry(
            width,
            height,
            depth
        );

        const doorMesh = new THREE.Mesh(
            doorGeometry,
            material
        );

        doorMesh.position.set(
            width / 2,
            height / 2,
            0
        );

        doorMesh.castShadow = true;
        doorMesh.receiveShadow = true;

        doorMesh.userData.parentDoor = pivot;

        frame.add(doorMesh);

        /* Moldura */

        const frameThickness = 0.12;

        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(
                frameThickness,
                height + 0.2,
                depth + 0.12
            ),
            materials.frame
        );

        leftFrame.position.set(
            -frameThickness / 2,
            height / 2,
            0
        );

        const rightFrame = leftFrame.clone();

        rightFrame.position.x = width + frameThickness / 2;

        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(
                width + frameThickness * 2,
                frameThickness,
                depth + 0.12
            ),
            materials.frame
        );

        topFrame.position.set(
            width / 2,
            height + frameThickness / 2,
            0
        );

        frame.add(leftFrame, rightFrame, topFrame);

        /* Maçaneta */

        const handle = new THREE.Mesh(
            new THREE.SphereGeometry(0.075, 12, 12),
            materials.handle
        );

        handle.position.set(
            width - 0.18,
            height * 0.48,
            depth / 2 + 0.045
        );

        frame.add(handle);

        /* Placa de identificação */

        const signCanvas = document.createElement("canvas");

        signCanvas.width = 512;
        signCanvas.height = 128;

        const context = signCanvas.getContext("2d");

        context.fillStyle = "#111820";
        context.fillRect(0, 0, 512, 128);

        context.strokeStyle = "#8997a3";
        context.lineWidth = 4;
        context.strokeRect(5, 5, 502, 118);

        context.fillStyle = "#d6dce1";
        context.font = "bold 36px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(name.toUpperCase(), 256, 64);

        const signTexture = new THREE.CanvasTexture(signCanvas);

        const signMaterial = new THREE.MeshStandardMaterial({
            map: signTexture,
            roughness: 0.8
        });

        const sign = new THREE.Mesh(
            new THREE.PlaneGeometry(1.25, 0.32),
            signMaterial
        );

        sign.position.set(
            width / 2,
            height + 0.38,
            depth / 2 + 0.07
        );

        frame.add(sign);

        pivot.add(frame);

        pivot.userData.doorMesh = doorMesh;
        pivot.userData.frame = frame;
        pivot.userData.signTexture = signTexture;
        pivot.userData.signMaterial = signMaterial;
        pivot.userData.originalRotation = rotation || 0;
        pivot.userData.targetRotation = rotation || 0;

        pivot.userData.openAngle = -Math.PI / 2;

        pivot.userData.animationSpeed = 2.8;

        pivot.userData.width = width;
        pivot.userData.height = height;

        pivot.userData.isAnimating = false;

        scene.add(pivot);

        doors.push(pivot);

        return pivot;
    }

    function addDoor(x, y, z, rotation, name, options = {}) {
        return createDoor(
            x,
            y,
            z,
            rotation,
            name,
            options
        );
    }

    function toggle(door) {
        if (!door || !door.userData?.isDoor) {
            return false;
        }

        if (door.userData.isAnimating) {
            return false;
        }

        const data = door.userData;

        data.isOpen = !data.isOpen;

        data.targetRotation = data.isOpen
            ? data.originalRotation + data.openAngle
            : data.originalRotation;

        data.isAnimating = true;

        return true;
    }

    function update(delta) {
        doors.forEach((door) => {
            const data = door.userData;

            if (!data.isAnimating) return;

            const difference =
                data.targetRotation - door.rotation.y;

            const step =
                data.animationSpeed * Math.min(delta, 0.05);

            if (Math.abs(difference) <= step) {
                door.rotation.y = data.targetRotation;
                data.isAnimating = false;
            } else {
                door.rotation.y += Math.sign(difference) * step;
            }
        });
    }

    function getDoors() {
        return doors;
    }

    function getDoorByName(name) {
        return doors.find(
            (door) => door.userData.name === name
        ) || null;
    }

    function destroy() {
        doors.forEach((door) => {
            door.traverse((object) => {
                if (!object.isMesh) return;

                object.geometry?.dispose();

                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => {
                        material.dispose();
                    });
                } else {
                    object.material?.dispose();
                }
            });

            door.userData.signTexture?.dispose();

            scene.remove(door);
        });

        doors.length = 0;

        Object.values(materials).forEach((material) => {
            material.dispose();
        });
    }

    return {
        addDoor,
        toggle,
        update,
        getDoors,
        getDoorByName,
        destroy
    };
}
