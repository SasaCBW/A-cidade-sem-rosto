export function createInventory() {

  const items = [];

  const itemIds = new Set();

  let selectedItem = null;

  // =========================================
  // ADICIONAR OBJETO
  // =========================================

  function addItem(item) {

    if (!item || !item.id) {
      return false;
    }

    if (itemIds.has(item.id)) {
      return false;
    }

    const newItem = {
      id: item.id,
      name: item.name || "Objeto desconhecido",
      description: item.description || "Nenhuma informação disponível.",
      type: item.type || "object",
      collectedAt: new Date().toISOString()
    };

    items.push(newItem);

    itemIds.add(newItem.id);

    window.dispatchEvent(
      new CustomEvent("inventoryItemAdded", {
        detail: newItem
      })
    );

    return true;

  }

  // =========================================
  // REMOVER OBJETO
  // =========================================

  function removeItem(id) {

    const index = items.findIndex(
      item => item.id === id
    );

    if (index === -1) {
      return false;
    }

    items.splice(index, 1);

    itemIds.delete(id);

    if (selectedItem === id) {
      selectedItem = null;
    }

    return true;

  }

  // =========================================
  // BUSCAR OBJETO
  // =========================================

  function getItem(id) {

    return items.find(
      item => item.id === id
    ) || null;

  }

  // =========================================
  // LISTAR OBJETOS
  // =========================================

  function getItems() {

    return items.map(item => ({
      ...item
    }));

  }

  // =========================================
  // SELECIONAR OBJETO
  // =========================================

  function selectItem(id) {

    const item = getItem(id);

    if (!item) {
      return null;
    }

    selectedItem = id;

    return {
      ...item
    };

  }

  function getSelectedItem() {

    return getItem(selectedItem);

  }

  // =========================================
  // VERIFICAR OBJETO
  // =========================================

  function hasItem(id) {

    return itemIds.has(id);

  }

  // =========================================
  // CONTAGEM
  // =========================================

  function getCount() {

    return items.length;

  }

  // =========================================
  // FILTRAR POR CATEGORIA
  // =========================================

  function getItemsByType(type) {

    return items
      .filter(item => item.type === type)
      .map(item => ({ ...item }));

  }

  // =========================================
  // RESTAURAR INVENTÁRIO
  // =========================================

  function restore(savedItems = []) {

    items.length = 0;

    itemIds.clear();

    selectedItem = null;

    savedItems.forEach(item => {

      if (!item || !item.id || itemIds.has(item.id)) {
        return;
      }

      items.push({
        id: item.id,
        name: item.name || "Objeto desconhecido",
        description: item.description || "",
        type: item.type || "object",
        collectedAt: item.collectedAt || null
      });

      itemIds.add(item.id);

    });

  }

  // =========================================
  // EXPORTAR PARA SALVAMENTO
  // =========================================

  function exportData() {

    return getItems();

  }

  // =========================================
  // LIMPAR INVENTÁRIO
  // =========================================

  function clear() {

    items.length = 0;

    itemIds.clear();

    selectedItem = null;

  }

  // =========================================
  // RETORNO
  // =========================================

  return {

    addItem,

    removeItem,

    getItem,

    getItems,

    selectItem,

    getSelectedItem,

    hasItem,

    getCount,

    getItemsByType,

    restore,

    exportData,

    clear

  };

}
