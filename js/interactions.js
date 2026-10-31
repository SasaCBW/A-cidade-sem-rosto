
import { Inventory } from './inventory.js';

export function createInteractions(THREE, scene, camera) {
    const inventory = new Inventory();
    const raycaster = new THREE.Raycaster();

    const objects = [];
    const collected = new Set();

    const message = document.getElementById('interaction-message');
    const inventoryList = document.getElementById('inventory-list');
    const inventoryCount = document.getElementById('inventory-count');

    let currentObject = null;
    let messageTimer = null;

    const clues = [
        {
            id: 'photo_01',
            name: 'Fotografia sem rosto',
            description: 'Uma fotografia antiga. Os rostos das pessoas parecem ter desaparecido.',
            type: 'photo',
            position: [4.5, 0.9, -12]
        },
        {
            id: 'document_01',
            name: 'Documento abandonado',
            description: 'O documento registra o desaparecimento de moradores do Distrito Central.',
            type: 'document',
            position: [-4.5, 0.9, -28]
        },
        {
            id: 'photo_02',
            name: 'Retrato misterioso',
            description: 'Uma família aparece na fotografia. Nenhum rosto pode ser identificado.',
            type: 'photo',
            position: [4.5, 0.9, -48]
        },
        {
            id: 'note_01',
            name: 'Bilhete encontrado',
            description: 'A cidade não está vazia. Alguém está observando você.',
            type: 'document',
            position: [-4.5, 0.9, -70]
        }
    ];

    const photoMaterial = new THREE.MeshStandardMaterial({
        color: 0xc2bba5,
        emissive: 0x383023,
        roughness: 0.8
    });

    const documentMaterial = new THREE.MeshStandardMaterial({
        color: 0xc6c0a9,
        emissive: 0x302d20,
        roughness: 0.9
    });

    function createClue(data) {
        const geometry = new THREE.BoxGeometry(0.7, 0.9, 0.06);

        const material = data.type === 'photo'
            ? photoMaterial.clone()
            : documentMaterial.clone();

        const object = new THREE.Mesh(geometry, material);

        object.position.set(...data.position);
        object.rotation.y = Math.PI * 0.08;
        object.userData.clue = data;

        const glow = new THREE.PointLight(
            0x9bb8ca,
            0.45,
            3
        );

        glow.position.set(0, 0.5, 0.5);
        object.add(glow);

        scene.add(object);
        objects.push(object);
    }

    clues.forEach(createClue);

    function showMessage(text, duration = 3500) {
        message.textContent = text;

        clearTimeout(messageTimer);

        messageTimer = setTimeout(() => {
            message.textContent = '';
        }, duration);
    }

    function updateInventory() {
        inventoryList.innerHTML = '';

        const items = inventory.getItems();

        inventoryCount.textContent = items.length;

        items.forEach(item => {
            const element = document.createElement('div');

            element.className = 'inventory-item';

            const icon = item.id.startsWith('photo')
                ? '▧'
                : '▤';

            element.innerHTML = `
                <span class="item-icon">${icon}</span>
                <span>${item.name}</span>
            `;

            inventoryList.appendChild(element);
        });
    }

    function update() {
        raycaster.setFromCamera(
            new THREE.Vector2(0, 0),
            camera
        );

        const intersections = raycaster.intersectObjects(
            objects,
            false
        );

        currentObject = null;

        if (intersections.length > 0) {
            const target = intersections[0].object;

            const distance = intersections[0].distance;

            if (distance < 3.5) {
                currentObject = target;

                message.textContent =
                    `PRESSIONE E PARA INVESTIGAR: ${target.userData.clue.name}`;

                return;
            }
        }

        message.textContent = '';
    }

    function interact() {
        if (!currentObject) return;

        const data = currentObject.userData.clue;

        if (collected.has(data.id)) return;

        const success = inventory.addItem(data);

        if (!success) return;

        collected.add(data.id);

        scene.remove(currentObject);

        const index = objects.indexOf(currentObject);

        if (index !== -1) {
            objects.splice(index, 1);
        }

        currentObject = null;

        updateInventory();

        showMessage(
            `PISTA DESCOBERTA: ${data.name}`,
            4500
        );

        const event = new CustomEvent('clueCollected', {
            detail: data
        });

        window.dispatchEvent(event);
    }

    function getInventory() {
        return inventory.getItems();
    }

    function getCollectedCount() {
        return collected.size;
    }

    return {
        update,
        interact,
        getInventory,
        getCollectedCount,
        showMessage
    };
}
