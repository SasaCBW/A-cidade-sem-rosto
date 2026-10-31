import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

export function createInteractionEffects(scene) {
    const effects = new THREE.Group();
    effects.name = "InteractionEffects";

    scene.add(effects);

    // Poeira suspensa no ar
    const particleCount = 280;

    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 65;
        positions[i * 3 + 1] = Math.random() * 12 + 0.5;
        positions[i * 3 + 2] = -Math.random() * 120 + 20;

        velocities.push({
            x: (Math.random() - 0.5) * 0.12,
            y: Math.random() * 0.08 + 0.015,
            z: (Math.random() - 0.5) * 0.12
        });
    }

    const dustGeometry = new THREE.BufferGeometry();

    dustGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const dustMaterial = new THREE.PointsMaterial({
        color: 0xb8c4ca,
        size: 0.055,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        sizeAttenuation: true
    });

    const dust = new THREE.Points(dustGeometry, dustMaterial);

    effects.add(dust);

    // Pequenos brilhos para pistas e interações
    const bursts = [];

    function burst(position, color = 0x9dc9d8) {
        const count = 18;

        const geometry = new THREE.BufferGeometry();
        const burstPositions = new Float32Array(count * 3);
        const burstVelocities = [];

        for (let i = 0; i < count; i++) {
            burstPositions[i * 3] = position.x;
            burstPositions[i * 3 + 1] = position.y;
            burstPositions[i * 3 + 2] = position.z;

            burstVelocities.push(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 1.8,
                    Math.random() * 1.5 + 0.3,
                    (Math.random() - 0.5) * 1.8
                )
            );
        }

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(burstPositions, 3)
        );

        const material = new THREE.PointsMaterial({
            color,
            size: 0.09,
            transparent: true,
            opacity: 0.9,
            depthWrite: false
        });

        const points = new THREE.Points(geometry, material);

        effects.add(points);

        bursts.push({
            points,
            velocities: burstVelocities,
            age: 0,
            duration: 1.1
        });
    }

    // Atualização dos efeitos
    function update(delta) {
        const dt = Math.min(delta, 0.05);

        const attribute = dust.geometry.attributes.position;

        for (let i = 0; i < particleCount; i++) {
            const index = i * 3;

            attribute.array[index] += velocities[i].x * dt;
            attribute.array[index + 1] += velocities[i].y * dt;
            attribute.array[index + 2] += velocities[i].z * dt;

            if (attribute.array[index + 1] > 14) {
                attribute.array[index + 1] = 0.5;
            }

            if (attribute.array[index] > 35) {
                attribute.array[index] = -35;
            }

            if (attribute.array[index] < -35) {
                attribute.array[index] = 35;
            }

            if (attribute.array[index + 2] > 25) {
                attribute.array[index + 2] = -120;
            }

            if (attribute.array[index + 2] < -125) {
                attribute.array[index + 2] = 20;
            }
        }

        attribute.needsUpdate = true;

        // Atualiza partículas temporárias
        for (let i = bursts.length - 1; i >= 0; i--) {
            const item = bursts[i];

            item.age += dt;

            const positions = item.points.geometry.attributes.position;

            for (let j = 0; j < item.velocities.length; j++) {
                const index = j * 3;
                const velocity = item.velocities[j];

                positions.array[index] += velocity.x * dt;
                positions.array[index + 1] += velocity.y * dt;
                positions.array[index + 2] += velocity.z * dt;

                velocity.y -= 1.2 * dt;
            }

            positions.needsUpdate = true;

            item.points.material.opacity = Math.max(
                0,
                1 - item.age / item.duration
            );

            if (item.age >= item.duration) {
                effects.remove(item.points);

                item.points.geometry.dispose();
                item.points.material.dispose();

                bursts.splice(i, 1);
            }
        }
    }

    function destroy() {
        effects.remove(dust);

        dust.geometry.dispose();
        dust.material.dispose();

        for (const item of bursts) {
            effects.remove(item.points);
            item.points.geometry.dispose();
            item.points.material.dispose();
        }

        bursts.length = 0;

        scene.remove(effects);
    }

    return {
        update,
        burst,
        destroy
    };
}
