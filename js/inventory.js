
/* ==========================================
   A CIDADE SEM ROSTO
   SISTEMA DE INVENTÁRIO
========================================== */

export function createInventory() {
    let items = [];
    let selectedItem = null;

    const categories = [
        "Todos",
        "Documento",
        "Fotografia",
        "Diário",
        "Mensagem",
        "Objeto",
        "Pista"
    ];

    /* ======================================
       ADICIONAR ITEM
    ====================================== */

    function add(item) {
        if (!item || !item.id) return false;

        const alreadyExists = items.some(
            (existing) => existing.id === item.id
        );

        if (alreadyExists) return false;

        const newItem = {
            id: item.id,
            name: item.name || item.title || "Objeto desconhecido",
            description: item.description || "Nenhuma descrição disponível.",
            category: item.category || "Objeto",
            collectedAt: new Date().toISOString(),
            icon: item.icon || "◆"
        };

        items.push(newItem);

        window.dispatchEvent(
            new CustomEvent("inventoryUpdated", {
                detail: {
                    items: getItems(),
                    added: newItem
                }
            })
        );

        window.dispatchEvent(
            new CustomEvent("inventoryItemAdded", {
                detail: newItem
            })
        );

        return true;
    }

    /* ======================================
       REMOVER ITEM
    ====================================== */

    function remove(id) {
        const initialLength = items.length;

        items = items.filter(
            (item) => item.id !== id
        );

        if (selectedItem === id) {
            selectedItem = null;
        }

        const removed = items.length !== initialLength;

        if (removed) {
            dispatchUpdate();
        }

        return removed;
    }

    /* ======================================
       CONSULTAR ITENS
    ====================================== */

    function getItems() {
        return items.map((item) => ({ ...item }));
    }

    function getItem(id) {
        const item = items.find(
            (entry) => entry.id === id
        );

        return item ? { ...item } : null;
    }

    function count() {
        return items.length;
    }

    /* ======================================
       SELECIONAR ITEM
    ====================================== */

    function select(id) {
        const exists = items.some(
            (item) => item.id === id
        );

        if (!exists) return false;

        selectedItem = id;

        return true;
    }

    function getSelected() {
        return selectedItem
            ? getItem(selectedItem)
            : null;
    }

    /* ======================================
       FILTRAR CATEGORIAS
    ====================================== */

    function filter(category = "Todos") {
        if (category === "Todos") {
            return getItems();
        }

        return items
            .filter((item) => item.category === category)
            .map((item) => ({ ...item }));
    }

    function getCategories() {
        return [...categories];
    }

    /* ======================================
       RESTAURAR INVENTÁRIO
    ====================================== */

    function restore(savedItems = []) {
        if (!Array.isArray(savedItems)) return;

        items = savedItems
            .filter((item) => item && item.id)
            .map((item) => ({
                id: item.id,
                name: item.name || item.title || "Objeto desconhecido",
                description: item.description || "",
                category: item.category || "Objeto",
                collectedAt: item.collectedAt || null,
                icon: item.icon || "◆"
            }));

        selectedItem = null;

        dispatchUpdate();
    }

    /* ======================================
       EXPORTAR INVENTÁRIO
    ====================================== */

    function exportItems() {
        return JSON.stringify(items, null, 2);
    }

    /* ======================================
       LIMPAR INVENTÁRIO
    ====================================== */

    function clear() {
        items = [];
        selectedItem = null;

        dispatchUpdate();
    }

    /* ======================================
       ATUALIZAR INTERFACE
    ====================================== */

    function dispatchUpdate() {
        window.dispatchEvent(
            new CustomEvent("inventoryUpdated", {
                detail: {
                    items: getItems()
                }
            })
        );
    }

    /* ======================================
       API PÚBLICA
    ====================================== */

    return {
        add,
        remove,
        getItems,
        getItem,
        count,
        select,
        getSelected,
        filter,
        getCategories,
        restore,
        exportItems,
        clear
    };
}
