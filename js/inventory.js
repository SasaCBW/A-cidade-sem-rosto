
export class Inventory {
    constructor() {
        this.items = [];
    }

    addItem(item) {
        if (!item || !item.id) return false;

        if (this.items.some(existing => existing.id === item.id)) {
            return false;
        }

        this.items.push({
            id: item.id,
            name: item.name,
            description: item.description || ''
        });

        return true;
    }

    removeItem(id) {
        const index = this.items.findIndex(item => item.id === id);

        if (index === -1) return false;

        this.items.splice(index, 1);
        return true;
    }

    getItems() {
        return [...this.items];
    }

    hasItem(id) {
        return this.items.some(item => item.id === id);
    }

    clear() {
        this.items = [];
    }
}
