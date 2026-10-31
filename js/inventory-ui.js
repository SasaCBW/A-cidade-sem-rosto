
/* ==========================================
   A CIDADE SEM ROSTO
   INTERFACE DO INVENTÁRIO
========================================== */

export function setupInventoryUI() {
    const panel = document.querySelector("#inventoryPanel");
    const itemsContainer = document.querySelector("#inventoryItems");
    const closeButton = document.querySelector("#inventoryClose");

    let items = [];
    let selectedCategory = "Todos";
    let selectedItem = null;
    let isOpen = false;

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
       CRIAR ELEMENTOS AUXILIARES
    ====================================== */

    function createElement(tag, className, content = "") {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        element.textContent = content;

        return element;
    }

    function createDetailsArea() {
        if (!panel) return null;

        let details = panel.querySelector("#inventoryDetails");

        if (!details) {
            details = createElement(
                "div",
                "inventory-details"
            );

            details.id = "inventoryDetails";

            panel.appendChild(details);
        }

        return details;
    }

    function createCategoryArea() {
        if (!panel) return null;

        let categoryArea = panel.querySelector(
            "#inventoryCategories"
        );

        if (!categoryArea) {
            categoryArea = createElement(
                "div",
                "inventory-categories"
            );

            categoryArea.id = "inventoryCategories";

            if (itemsContainer) {
                panel.insertBefore(
                    categoryArea,
                    itemsContainer
                );
            } else {
                panel.appendChild(categoryArea);
            }
        }

        return categoryArea;
    }

    /* ======================================
       NORMALIZAR ITENS
    ====================================== */

    function normalizeItem(item) {
        if (!item) return null;

        return {
            id: item.id || `item-${Date.now()}`,
            name: item.name || item.title || "Objeto desconhecido",
            description: item.description || "Nenhuma informação encontrada.",
            category: item.category || "Objeto",
            icon: item.icon || getIcon(item.category),
            collectedAt: item.collectedAt || null
        };
    }

    function getIcon(category) {
        const icons = {
            Documento: "▤",
            Fotografia: "▧",
            Diário: "▥",
            Mensagem: "✉",
            Objeto: "◆",
            Pista: "◇"
        };

        return icons[category] || "◆";
    }

    /* ======================================
       ATUALIZAR ITENS
    ====================================== */

    function addItem(item) {
        const normalized = normalizeItem(item);

        if (!normalized) return;

        const exists = items.some(
            (entry) => entry.id === normalized.id
        );

        if (exists) return;

        items.push(normalized);

        renderItems();
    }

    function restoreItems(savedItems = []) {
        if (!Array.isArray(savedItems)) return;

        items = [];

        savedItems.forEach((item) => {
            const normalized = normalizeItem(item);

            if (normalized) {
                items.push(normalized);
            }
        });

        renderItems();
    }

    /* ======================================
       FILTRAR CATEGORIAS
    ====================================== */

    function renderCategories() {
        const area = createCategoryArea();

        if (!area) return;

        area.innerHTML = "";

        categories.forEach((category) => {
            const button = createElement(
                "button",
                "inventory-category",
                category
            );

            if (selectedCategory === category) {
                button.classList.add("active");
            }

            button.type = "button";

            button.addEventListener("click", () => {
                selectedCategory = category;

                renderCategories();
                renderItems();
            });

            area.appendChild(button);
        });
    }

    function getFilteredItems() {
        if (selectedCategory === "Todos") {
            return items;
        }

        return items.filter(
            (item) => item.category === selectedCategory
        );
    }

    /* ======================================
       MOSTRAR DETALHES
    ====================================== */

    function showDetails(item) {
        const details = createDetailsArea();

        if (!details) return;

        details.innerHTML = "";

        if (!item) {
            details.appendChild(
                createElement(
                    "p",
                    "inventory-empty-details",
                    "Selecione uma pista para consultar seus detalhes."
                )
            );

            return;
        }

        const title = createElement(
            "h3",
            "inventory-detail-title",
            item.name
        );

        const category = createElement(
            "span",
            "inventory-detail-category",
            item.category
        );

        const description = createElement(
            "p",
            "inventory-detail-description",
            item.description
        );

        details.appendChild(title);
        details.appendChild(category);
        details.appendChild(description);
    }

    /* ======================================
       DESENHAR INVENTÁRIO
    ====================================== */

    function renderItems() {
        if (!itemsContainer) return;

        itemsContainer.innerHTML = "";

        const filtered = getFilteredItems();

        if (filtered.length === 0) {
            const empty = createElement(
                "div",
                "inventory-empty",
                items.length === 0
                    ? "Você ainda não encontrou nenhuma pista."
                    : "Nenhum objeto encontrado nesta categoria."
            );

            itemsContainer.appendChild(empty);

            if (!selectedItem) {
                showDetails(null);
            }

            return;
        }

        filtered.forEach((item) => {
            const button = createElement(
                "button",
                "inventory-item"
            );

            button.type = "button";

            if (selectedItem === item.id) {
                button.classList.add("selected");
            }

            const icon = createElement(
                "span",
                "inventory-item-icon",
                item.icon
            );

            const information = createElement(
                "span",
                "inventory-item-information"
            );

            const name = createElement(
                "strong",
                "inventory-item-name",
                item.name
            );

            const category = createElement(
                "small",
                "inventory-item-category",
                item.category
            );

            information.appendChild(name);
            information.appendChild(category);

            button.appendChild(icon);
            button.appendChild(information);

            button.addEventListener("click", () => {
                selectedItem = item.id;

                showDetails(item);
                renderItems();
            });

            itemsContainer.appendChild(button);
        });

        const selected = items.find(
            (item) => item.id === selectedItem
        );

        if (selected) {
            showDetails(selected);
        } else {
            showDetails(null);
        }
    }

    /* ======================================
       ABRIR E FECHAR
    ====================================== */

    function open() {
        if (!panel) return;

        isOpen = true;

        panel.classList.add("active");
        panel.classList.remove("hidden");

        renderCategories();
        renderItems();
    }

    function close() {
        if (!panel) return;

        isOpen = false;

        panel.classList.remove("active");
    }

    function toggle() {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }

    function isOpened() {
        return isOpen;
    }

    /* ======================================
       EVENTOS
    ====================================== */

    function onInventoryItemAdded(event) {
        addItem(event.detail);
    }

    function onKeyDown(event) {
        if (event.code !== "Tab") return;

        event.preventDefault();

        toggle();
    }

    window.addEventListener(
        "inventoryItemAdded",
        onInventoryItemAdded
    );

    document.addEventListener(
        "keydown",
        onKeyDown
    );

    closeButton?.addEventListener("click", close);

    /* ======================================
       ESTILO DINÂMICO
    ====================================== */

    function injectStyles() {
        if (document.querySelector("#inventoryUIStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "inventoryUIStyles";

        style.textContent = `
            .inventory-categories {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin: 16px 0;
            }

            .inventory-category {
                padding: 8px 12px;
                border: 1px solid rgba(180, 200, 225, .2);
                border-radius: 5px;
                color: #bdc9d8;
                background: rgba(20, 30, 45, .8);
                cursor: pointer;
                font-size: 12px;
                transition: .2s ease;
            }

            .inventory-category:hover,
            .inventory-category.active {
                color: #fff;
                background: rgba(75, 112, 155, .45);
                border-color: #8daed4;
            }

            .inventory-item {
                display: flex;
                align-items: center;
                gap: 13px;
                width: 100%;
                padding: 13px;
                margin-bottom: 8px;
                text-align: left;
                color: #dce5f0;
                background: rgba(18, 28, 43, .85);
                border: 1px solid rgba(170, 190, 215, .12);
                border-radius: 5px;
                cursor: pointer;
                transition: .2s ease;
            }

            .inventory-item:hover,
            .inventory-item.selected {
                background: rgba(65, 91, 122, .55);
                border-color: rgba(150, 190, 230, .55);
            }

            .inventory-item-icon {
                display: grid;
                place-items: center;
                width: 38px;
                height: 38px;
                flex-shrink: 0;
                color: #b7cee8;
                background: rgba(115, 150, 190, .13);
                border-radius: 4px;
                font-size: 20px;
            }

            .inventory-item-information {
                display: flex;
                flex-direction: column;
                gap: 4px;
                min-width: 0;
            }

            .inventory-item-name {
                color: #f0f4fa;
                font-size: 13px;
            }

            .inventory-item-category {
                color: #899bb1;
                font-size: 11px;
            }

            .inventory-empty,
            .inventory-empty-details {
                padding: 18px;
                color: #899bb1;
                text-align: center;
                font-size: 13px;
                line-height: 1.6;
            }

            .inventory-details {
                margin-top: 18px;
                padding: 18px;
                border-top: 1px solid rgba(180, 200, 225, .16);
                background: rgba(10, 17, 28, .55);
            }

            .inventory-detail-title {
                margin: 0 0 10px;
                color: #e7edf5;
                font-size: 17px;
            }

            .inventory-detail-category {
                display: inline-block;
                padding: 5px 9px;
                color: #b6cbe4;
                background: rgba(90, 125, 165, .2);
                border-radius: 3px;
                font-size: 11px;
            }

            .inventory-detail-description {
                margin-top: 14px;
                color: #aab8c9;
                font-size: 13px;
                line-height: 1.7;
            }
        `;

        document.head.appendChild(style);
    }

    /* ======================================
       INICIALIZAÇÃO
    ====================================== */

    injectStyles();
    renderCategories();
    renderItems();

    /* ======================================
       DESTRUIR
    ====================================== */

    function destroy() {
        window.removeEventListener(
            "inventoryItemAdded",
            onInventoryItemAdded
        );

        document.removeEventListener(
            "keydown",
            onKeyDown
        );

        closeButton?.removeEventListener("click", close);

        items = [];
        selectedItem = null;
    }

    /* ======================================
       API
    ====================================== */

    return {
        addItem,
        restoreItems,
        renderItems,
        open,
        close,
        toggle,
        isOpen: isOpened,
        getItems: () => items.map((item) => ({ ...item })),
        destroy
    };
}
