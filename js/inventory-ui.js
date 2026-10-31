
export function setupInventoryUI() {
    const panel = document.getElementById('inventory-panel');
    const button = document.getElementById('inventory-button');

    let opened = false;

    function toggle() {
        opened = !opened;
        panel.classList.toggle('inventory-open', opened);
    }

    function close() {
        opened = false;
        panel.classList.remove('inventory-open');
    }

    button.addEventListener('click', toggle);

    window.addEventListener('keydown', event => {
        if (event.code === 'Tab') {
            event.preventDefault();
            toggle();
        }

        if (event.code === 'Escape' && opened) {
            close();
        }
    });

    return {
        toggle,
        close,
        isOpen: () => opened
    };
}
