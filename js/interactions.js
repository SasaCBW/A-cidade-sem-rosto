
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

/* ==========================================
   A CIDADE SEM ROSTO
   SISTEMA DE INTERAÇÕES
========================================== */

export function createInteractions(scene, camera) {
    const raycaster = new THREE.Raycaster();

    raycaster.far = 3.5;

    const center = new THREE.Vector2(0, 0);

    const collected = new Set();
    const interactableObjects = [];

    let currentTarget = null;
    let enabled = true;

    /* ======================================
       ELEMENTOS DA INTERFACE
    ====================================== */

    const prompt = document.querySelector("#interactionPrompt");
    const promptText = document.querySelector("#interactionText");

    function showPrompt(message = "Pressione E para investigar") {
        if (!prompt) return;

        if (promptText) {
            promptText.textContent = message;
        }

        prompt.classList.remove("hidden");
        prompt.classList.add("visible");
    }

    function hidePrompt() {
        if (!prompt) return;

        prompt.classList.remove("visible");
        prompt.classList.add("hidden");
    }

    /* ======================================
       MATERIAIS DAS PISTAS
    ====================================== */

    const materials = {
        paper: new THREE.MeshStandardMaterial({
            color: 0xd8cdb2,
            roughness: 0.95
        }),

        photo: new THREE.MeshStandardMaterial({
            color: 0x4c5360,
            roughness: 0.85
        }),

        dark: new THREE.MeshStandardMaterial({
            color: 0x252b35,
            roughness: 0.9
        })
    };

    /* ======================================
       CRIAR UMA PISTA
    ====================================== */

    function createClue(data) {
        const group = new THREE.Group();

        let geometry;
        let material;

        if (data.type === "photo") {
            geometry = new THREE.BoxGeometry(
                0.42,
                0.32,
                0.025
            );

            material = materials.photo;
        } else if (data.type === "document") {
            geometry = new THREE.BoxGeometry(
                0.34,
                0.44,
                0.018
            );

            material = materials.paper;
        } else {
            geometry = new THREE.BoxGeometry(
                0.28,
                0.12,
                0.035
            );

            material = materials.dark;
        }

        const object = new THREE.Mesh(
            geometry,
            material
        );

        object.castShadow = true;
        object.receiveShadow = true;

        group.add(object);

        const glow = new THREE.PointLight(
            0x9ab8df,
            0.18,
            1.8
        );

        glow.position.set(0, 0.2, 0.3);
        group.add(glow);

        group.position.set(
            data.position[0],
            data.position[1],
            data.position[2]
        );

        group.rotation.y = data.rotation || 0;

        group.userData.clue = data;
        group.userData.clueId = data.id;

        group.traverse((child) => {
            child.userData.clueId = data.id;
        });

        scene.add(group);

        interactableObjects.push(group);

        return group;
    }

    /* ======================================
       PISTAS DO PRIMEIRO CAPÍTULO
    ====================================== */

    const clues = [
        {
            id: "photo_01",
            title: "Fotografia antiga",
            description:
                "Uma fotografia encontrada na rua. Há várias pessoas na imagem, mas nenhum rosto pode ser reconhecido.",
            category: "Fotografia",
            type: "photo",
            position: [4.5, 0.9, -12]
        },
        {
            id: "document_01",
            title: "Documento rasgado",
            description:
                "Um documento parcialmente destruído. O texto menciona desaparecimentos registrados na cidade.",
            category: "Documento",
            type: "document",
            position: [-4.5, 0.9, -28]
        },
        {
            id: "photo_02",
            title: "Retrato sem rosto",
            description:
                "Uma fotografia antiga. A figura principal parece ter sido apagada da imagem.",
            category: "Fotografia",
            type: "photo",
            position: [4.5, 0.9, -48]
        },
        {
            id: "note_01",
            title: "Bilhete misterioso",
            description:
                "O bilhete contém uma frase: 'Não confie nas fotografias desta cidade'.",
            category: "Mensagem",
            type: "note",
            position: [-4.5, 0.9, -70]
        }
    ];

    /* ======================================
       CONSTRUIR OBJETOS
    ====================================== */

    clues.forEach((clue) => {
        createClue(clue);
    });

    /* ======================================
       LOCALIZAR OBJETO À FRENTE
    ====================================== */

    function getTarget() {
        if (!enabled) return null;

        raycaster.setFromCamera(center, camera);

        const intersections =
            raycaster.intersectObjects(
                interactableObjects,
                true
            );

        for (const intersection of intersections) {
            let object = intersection.object;

            while (object) {
                if (object.userData?.clue) {
                    const clue = object.userData.clue;

                    if (!collected.has(clue.id)) {
                        return object;
                    }
                }

                object = object.parent;
            }
        }

        return null;
    }

    /* ======================================
       ATUALIZAR PROMPT
    ====================================== */

    function updatePrompt() {
        if (!enabled) {
            hidePrompt();
            return;
        }

        currentTarget = getTarget();

        if (currentTarget) {
            const clue = currentTarget.userData.clue;

            showPrompt(
                `Pressione E para investigar: ${clue.title}`
            );
        } else {
            hidePrompt();
        }
    }

    /* ======================================
       INTERAGIR COM OBJETO
    ====================================== */

    function interact() {
        if (!enabled) return false;

        currentTarget = getTarget();

        if (!currentTarget) return false;

        const clue = currentTarget.userData.clue;

        if (!clue || collected.has(clue.id)) {
            return false;
        }

        collected.add(clue.id);

        currentTarget.visible = false;

        const detail = {
            id: clue.id,
            title: clue.title,
            name: clue.title,
            description: clue.description,
            category: clue.category,
            type: clue.type,
            collectedAt: new Date().toISOString()
        };

        window.dispatchEvent(
            new CustomEvent("clueCollected", {
                detail
            })
        );

        window.dispatchEvent(
            new CustomEvent("inventoryItemAdded", {
                detail: {
                    id: detail.id,
                    name: detail.title,
                    description: detail.description,
                    category: detail.category
                }
            })
        );

        window.dispatchEvent(
            new CustomEvent("journalEntryAdded", {
                detail: {
                    title: detail.title,
                    description: detail.description,
                    category: detail.category
                }
            })
        );

        hidePrompt();

        return true;
    }

    /* ======================================
       RESTAURAR PISTAS
    ====================================== */

    function restoreCollected(savedIds = []) {
        if (!Array.isArray(savedIds)) return;

        savedIds.forEach((id) => {
            collected.add(id);

            const object = interactableObjects.find(
                (entry) => entry.userData.clueId === id
            );

            if (object) {
                object.visible = false;
            }
        });
    }

    /* ======================================
       CONSULTAR PROGRESSO
    ====================================== */

    function getCollected() {
        return [...collected];
    }

    function getAllClues() {
        return clues.map((clue) => ({ ...clue }));
    }

    function getProgress() {
        return {
            collected: collected.size,
            total: clues.length,
            percentage:
                Math.round(
                    (collected.size / clues.length) * 100
                )
        };
    }

    /* ======================================
       CONTROLE DO SISTEMA
    ====================================== */

    function setEnabled(value) {
        enabled = Boolean(value);

        if (!enabled) {
            currentTarget = null;
            hidePrompt();
        }
    }

    /* ======================================
       DESTRUIR SISTEMA
    ====================================== */

    function destroy() {
        hidePrompt();

        interactableObjects.forEach((group) => {
            scene.remove(group);

            group.traverse((child) => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
            });
        });

        interactableObjects.length = 0;

        Object.values(materials).forEach((material) => {
            material.dispose();
        });

        collected.clear();
    }

    /* ======================================
       RETORNO
    ====================================== */

    return {
        interact,
        updatePrompt,
        getTarget,
        getCollected,
        getAllClues,
        getProgress,
        restoreCollected,
        setEnabled,
        destroy
    };
}
