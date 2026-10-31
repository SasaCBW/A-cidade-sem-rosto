
export function setupAudio() {
    let audioContext = null;
    let oscillator = null;
    let gain = null;
    let active = false;

    function start() {
        if (active) return;

        try {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) return;

            audioContext = new AudioContextClass();

            oscillator = audioContext.createOscillator();
            gain = audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = 48;

            gain.gain.value = 0.025;

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.start();

            audioContext.resume();
            active = true;
        } catch (error) {
            console.warn('Áudio ambiente indisponível:', error);
        }
    }

    function stop() {
        if (!active) return;

        try {
            oscillator?.stop();
            audioContext?.close();
        } catch (error) {
            console.warn('Não foi possível interromper o áudio:', error);
        }

        oscillator = null;
        gain = null;
        audioContext = null;
        active = false;
    }

    return {
        start,
        stop
    };
}
