export function createJournal() {
    const entries = [];
    const container = document.getElementById("journalEntries");

    function addEntry(title, description, category = "Pista") {
        if (!title || !description) {
            return false;
        }

        const alreadyExists = entries.some(
            entry => entry.title === title
        );

        if (alreadyExists) {
            return false;
        }

        const entry = {
            id: crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now() + Math.random()),

            title,
            description,
            category,
            date: new Date().toISOString()
        };

        entries.push(entry);

        renderEntry(entry);

        window.dispatchEvent(
            new CustomEvent("journalEntryAdded", {
                detail: entry
            })
        );

        return true;
    }

    function renderEntry(entry) {
        if (!container) return;

        const emptyMessage = container.querySelector(".journal-empty");

        if (emptyMessage) {
            emptyMessage.remove();
        }

        const element = document.createElement("article");
        element.className = "journal-entry";

        const category = document.createElement("span");
        category.className = "journal-entry-category";
        category.textContent = entry.category;

        const heading = document.createElement("h3");
        heading.textContent = entry.title;

        const paragraph = document.createElement("p");
        paragraph.textContent = entry.description;

        const date = document.createElement("small");
        date.textContent = formatDate(entry.date);

        element.append(category, heading, paragraph, date);

        container.prepend(element);
    }

    function formatDate(value) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Data desconhecida";
        }

        return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function restore(savedEntries = []) {
        entries.length = 0;

        if (container) {
            container.innerHTML = "";
        }

        for (const entry of savedEntries) {
            if (!entry || !entry.title || !entry.description) {
                continue;
            }

            entries.push({
                id: entry.id || String(Date.now() + Math.random()),
                title: entry.title,
                description: entry.description,
                category: entry.category || "Pista",
                date: entry.date || new Date().toISOString()
            });
        }

        renderAll();
    }

    function renderAll() {
        if (!container) return;

        container.innerHTML = "";

        if (entries.length === 0) {
            const empty = document.createElement("p");

            empty.className = "journal-empty";
            empty.textContent =
                "Seu diário está vazio. As pistas encontradas aparecerão aqui.";

            container.appendChild(empty);

            return;
        }

        entries.forEach(renderEntry);
    }

    function getEntries() {
        return entries.map(entry => ({ ...entry }));
    }

    function clear() {
        entries.length = 0;
        renderAll();
    }

    function destroy() {
        if (container) {
            container.innerHTML = "";
        }

        entries.length = 0;
    }

    renderAll();

    return {
        addEntry,
        getEntries,
        restore,
        clear,
        destroy
    };
}
