
export function setupInventoryUI() {
  const panel = document.getElementById("inventoryPanel");
  const button = document.getElementById("inventoryButton");
  const items = document.getElementById("inventoryItems");

  if (!panel) {
    console.error("Painel do inventário não encontrado.");
    return;
  }

  let isOpen = false;

  function update() {
    panel.classList.toggle("open", isOpen);

    if (button) {
      button.textContent = isOpen
        ? "FECHAR INVENTÁRIO"
        : "🎒 INVENTÁRIO";

      button.setAttribute("aria-expanded", String(isOpen));
    }
  }

  function open() {
    isOpen = true;
    update();
  }

  function close() {
    isOpen = false;
    update();
  }

  function toggle() {
    isOpen = !isOpen;
    update();
  }

  button?.addEventListener("click", toggle);

  window.addEventListener("keydown", event => {
    if (event.code !== "Tab") return;

    event.preventDefault();

    if (event.repeat) return;

    toggle();
  });

  window.addEventListener("inventoryItemAdded", event => {
    const item = event.detail;

    if (!item || !items) return;

    const emptyMessage = items.querySelector("p");

    if (emptyMessage) {
      emptyMessage.remove();
    }

    const card = document.createElement("div");
    card.className = "inventory-item";

    const name = document.createElement("strong");
    name.textContent = item.name || "Objeto desconhecido";

    const description = document.createElement("p");
    description.textContent = item.description || "Objeto encontrado.";

    card.append(name, description);
    items.appendChild(card);
  });

  update();

  return {
    open,
    close,
    toggle,
    isOpen: () => isOpen
  };
}
