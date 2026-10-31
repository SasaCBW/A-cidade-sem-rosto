
export function createJournal() {
  const entries = [];

  function addEntry(title, description) {
    if (entries.some(entry => entry.title === title)) {
      return false;
    }

    entries.push({
      title,
      description,
      date: new Date().toLocaleString("pt-BR")
    });

    updateDisplay();
    return true;
  }

  function updateDisplay() {
    const list = document.getElementById("journalEntries");

    if (!list) return;

    list.innerHTML = "";

    if (entries.length === 0) {
      list.innerHTML = "<p>Nenhuma pista encontrada ainda.</p>";
      return;
    }

    entries.forEach(entry => {
      const article = document.createElement("article");
      const title = document.createElement("h3");
      const description = document.createElement("p");
      const date = document.createElement("small");

      title.textContent = entry.title;
      description.textContent = entry.description;
      date.textContent = entry.date;

      article.append(title, description, date);
      list.appendChild(article);
    });
  }

  function getEntries() {
    return [...entries];
  }

  function restore(savedEntries = []) {
    entries.length = 0;
    entries.push(...savedEntries);
    updateDisplay();
  }

  return {
    addEntry,
    getEntries,
    restore
  };
}
