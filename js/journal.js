
/* ==========================================
   A CIDADE SEM ROSTO
   DIÁRIO DE INVESTIGAÇÃO
========================================== */

export function createJournal() {
    let entries = [];
    let selectedEntry = null;

    const journalContainer =
        document.querySelector("#journalEntries");

    const journalPanel =
        document.querySelector("#journalPanel");

    const categories = [
        "Todas",
        "Pista",
        "Documento",
        "Fotografia",
        "Mensagem",
        "Missão",
        "Acontecimento"
    ];

    let activeCategory = "Todas";

    /* ======================================
       CRIAR ELEMENTOS
    ====================================== */

    function createElement(tag, className, content = "") {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        element.textContent = content;

        return element;
    }

    /* ======================================
       ADICIONAR REGISTRO
    ====================================== */

    function addEntry(title, description, category = "Pista") {
        if (!title) return false;

        const exists = entries.some(
            (entry) => entry.title === title
        );

        if (exists) return false;

        const entry = {
            id: `journal-${Date.now()}-${entries.length}`,
            title,
            description: description || "Nenhuma descrição disponível.",
            category,
            date: new Date().toISOString()
        };

        entries.push(entry);

        render();

        window.dispatchEvent(
            new CustomEvent("journalUpdated", {
                detail: {
                    entries: getEntries(),
                    added: entry
                }
            })
        );

        return true;
    }

    /* ======================================
       REMOVER REGISTRO
    ====================================== */

    function removeEntry(id) {
        entries = entries.filter(
            (entry) => entry.id !== id
        );

        if (selectedEntry === id) {
            selectedEntry = null;
        }

        render();
    }

    /* ======================================
       CONSULTAR REGISTROS
    ====================================== */

    function getEntries() {
        return entries.map((entry) => ({ ...entry }));
    }

    function getEntry(id) {
        const entry = entries.find(
            (item) => item.id === id
        );

        return entry ? { ...entry } : null;
    }

    function getCount() {
        return entries.length;
    }

    /* ======================================
       FILTRAR CATEGORIAS
    ====================================== */

    function getFilteredEntries() {
        if (activeCategory === "Todas") {
            return entries;
        }

        return entries.filter(
            (entry) => entry.category === activeCategory
        );
    }

    /* ======================================
       ÁREA DE CATEGORIAS
    ====================================== */

    function renderCategories() {
        if (!journalPanel) return;

        let categoryContainer =
            journalPanel.querySelector("#journalCategories");

        if (!categoryContainer) {
            categoryContainer = createElement(
                "div",
                "journal-categories"
            );

            categoryContainer.id = "journalCategories";

            if (journalContainer) {
                journalPanel.insertBefore(
                    categoryContainer,
                    journalContainer
                );
            } else {
                journalPanel.appendChild(categoryContainer);
            }
        }

        categoryContainer.innerHTML = "";

        categories.forEach((category) => {
            const button = createElement(
                "button",
                "journal-category",
                category
            );

            button.type = "button";

            if (activeCategory === category) {
                button.classList.add("active");
            }

            button.addEventListener("click", () => {
                activeCategory = category;
                render();
            });

            categoryContainer.appendChild(button);
        });
    }

    /* ======================================
       DETALHES DO REGISTRO
    ====================================== */

    function renderDetails(entry) {
        if (!journalPanel) return;

        let details =
            journalPanel.querySelector("#journalDetails");

        if (!details) {
            details = createElement(
                "section",
                "journal-details"
            );

            details.id = "journalDetails";
            journalPanel.appendChild(details);
        }

        details.innerHTML = "";

        if (!entry) {
            details.appendChild(
                createElement(
                    "p",
                    "journal-empty-details",
                    "Selecione uma descoberta para ler suas anotações."
                )
            );

            return;
        }

        const title = createElement(
            "h3",
            "journal-detail-title",
            entry.title
        );

        const category = createElement(
            "span",
            "journal-detail-category",
            entry.category
        );

        const description = createElement(
            "p",
            "journal-detail-description",
            entry.description
        );

        const date = createElement(
            "small",
            "journal-detail-date",
            `Registrado em ${formatDate(entry.date)}`
        );

        details.appendChild(title);
        details.appendChild(category);
        details.appendChild(description);
        details.appendChild(date);
    }

    /* ======================================
       FORMATAR DATA
    ====================================== */

    function formatDate(value) {
        if (!value) return "Data desconhecida";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Data desconhecida";
        }

        return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    /* ======================================
       RENDERIZAR DIÁRIO
    ====================================== */

    function render() {
        renderCategories();

        if (!journalContainer) return;

        journalContainer.innerHTML = "";

        const filtered = getFilteredEntries();

        if (filtered.length === 0) {
            journalContainer.appendChild(
                createElement(
                    "div",
                    "journal-empty",
                    entries.length === 0
                        ? "Nenhuma descoberta registrada ainda. Continue explorando."
                        : "Nenhum registro nesta categoria."
                )
            );

            renderDetails(null);
            return;
        }

        filtered.forEach((entry) => {
            const button = createElement(
                "button",
                "journal-entry"
            );

            button.type = "button";

            if (selectedEntry === entry.id) {
                button.classList.add("selected");
            }

            const marker = createElement(
                "span",
                "journal-entry-marker",
                "◆"
            );

            const content = createElement(
                "span",
                "journal-entry-content"
            );

            const title = createElement(
                "strong",
                "journal-entry-title",
                entry.title
            );

            const category = createElement(
                "small",
                "journal-entry-category",
                entry.category
            );

            content.appendChild(title);
            content.appendChild(category);

            button.appendChild(marker);
            button.appendChild(content);

            button.addEventListener("click", () => {
                selectedEntry = entry.id;
                render();
            });

            journalContainer.appendChild(button);
        });

        const selected = entries.find(
            (entry) => entry.id === selectedEntry
        );

        renderDetails(selected || null);
    }

    /* ======================================
       RESTAURAR DIÁRIO
    ====================================== */

    function restore(savedEntries = []) {
        if (!Array.isArray(savedEntries)) return;

        entries = savedEntries
            .filter((entry) => entry && entry.title)
            .map((entry, index) => ({
                id: entry.id || `restored-${index}`,
                title: entry.title,
                description: entry.description || "",
                category: entry.category || "Pista",
                date: entry.date || null
            }));

        selectedEntry = null;

        render();
    }

    /* ======================================
       EXPORTAR DIÁRIO
    ====================================== */

    function exportJournal() {
        return JSON.stringify(entries, null, 2);
    }

    /* ======================================
       LIMPAR DIÁRIO
    ====================================== */

    function clear() {
        entries = [];
        selectedEntry = null;
        activeCategory = "Todas";

        render();
    }

    /* ======================================
       ESTILIZAÇÃO
    ====================================== */

    function injectStyles() {
        if (document.querySelector("#journalDynamicStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "journalDynamicStyles";

        style.textContent = `
            .journal-categories {
                display: flex;
                flex-wrap: wrap;
                gap: 7px;
                margin: 15px 0;
            }

            .journal-category {
                padding: 8px 11px;
                border: 1px solid rgba(180, 200, 225, .18);
                border-radius: 4px;
                background: rgba(20, 30, 45, .8);
                color: #b9c7d8;
                cursor: pointer;
                font-size: 11px;
                transition: .2s ease;
            }

            .journal-category:hover,
            .journal-category.active {
                background: rgba(70, 100, 140, .5);
                border-color: #8daed4;
                color: #fff;
            }

            .journal-entry {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                padding: 13px;
                margin-bottom: 8px;
                text-align: left;
                border: 1px solid rgba(170, 190, 215, .12);
                border-radius: 4px;
                background: rgba(17, 27, 42, .8);
                color: #e2e9f2;
                cursor: pointer;
                transition: .2s ease;
            }

            .journal-entry:hover,
            .journal-entry.selected {
                background: rgba(65, 91, 122, .5);
                border-color: rgba(150, 190, 230, .5);
            }

            .journal-entry-marker {
                color: #9db8d8;
                font-size: 13px;
            }

            .journal-entry-content {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .journal-entry-title {
                font-size: 13px;
            }

            .journal-entry-category {
                color: #91a2b7;
                font-size: 11px;
            }

            .journal-empty,
            .journal-empty-details {
                padding: 20px;
                color: #91a2b7;
                font-size: 13px;
                line-height: 1.7;
                text-align: center;
            }

            .journal-details {
                margin-top: 18px;
                padding: 18px;
                border-top: 1px solid rgba(180, 200, 225, .15);
                background: rgba(10, 17, 28, .5);
            }

            .journal-detail-title {
                margin: 0 0 10px;
                color: #e8eef7;
                font-size: 17px;
            }

            .journal-detail-category {
                display: inline-block;
                padding: 5px 9px;
                color: #b6cbe4;
                background: rgba(90, 125, 165, .2);
                border-radius: 3px;
                font-size: 11px;
            }

            .journal-detail-description {
                margin: 15px 0;
                color: #b4c0cf;
                font-size: 13px;
                line-height: 1.8;
            }

            .journal-detail-date {
                color: #778ba3;
                font-size: 10px;
            }
        `;

        document.head.appendChild(style);
    }

    /* ======================================
       INICIALIZAÇÃO
    ====================================== */

    injectStyles();
    render();

    /* ======================================
       DESTRUIR
    ====================================== */

    function destroy() {
        entries = [];
        selectedEntry = null;
    }

    /* ======================================
       API PÚBLICA
    ====================================== */

    return {
        addEntry,
        removeEntry,
        getEntries,
        getEntry,
        getCount,
        restore,
        render,
        clear,
        exportJournal,
        destroy
    };
}
