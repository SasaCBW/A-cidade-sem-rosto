
export function setupInterface({ player, scene, camera }) {
    const clock = document.getElementById('clock');
    const message = document.getElementById('interaction-message');

    let elapsed = 0;

    function updateClock() {
        elapsed += 1;

        const hours = 3;
        const minutes = 17 + Math.floor(elapsed / 60);

        const formattedMinutes = String(minutes % 60).padStart(2, '0');

        clock.textContent = `${String(hours).padStart(2, '0')}:${formattedMinutes} AM`;
    }

    const clockTimer = setInterval(() => {
        updateClock();
    }, 60000);

    message.textContent = '';

    return {
        showMessage(text) {
            message.textContent = text;
        },

        hideMessage() {
            message.textContent = '';
        },

        destroy() {
            clearInterval(clockTimer);
        }
    };
}
