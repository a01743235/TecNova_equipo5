// Generador sintetizado de sonido de despegue de cohete usando Web Audio API
// Garantiza compatibilidad sin requerir archivos mp3 externos propensos a fallas 404

class RocketAudioSynthesizer {
  constructor() {
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playLaunchSound() {
    this.init();
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const duration = 5.5; // duración del rugido del despegue

    // 1. Ruido blanco para emular la combustión y turbulencia intensa
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Filtro pasa bajas para el estruendo de los propulsores
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(80, now);
    filter.frequency.exponentialRampToValueAtTime(750, now + 2.0);
    filter.frequency.exponentialRampToValueAtTime(220, now + duration);

    // Control de ganancia (volumen progresivo)
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.exponentialRampToValueAtTime(1.0, now + 1.2);
    noiseGain.gain.exponentialRampToValueAtTime(0.7, now + 3.5);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // 2. Oscilador subsónico de baja frecuencia (vibración de motores principales)
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(45, now);
    subOsc.frequency.linearRampToValueAtTime(110, now + 2.5);
    subOsc.frequency.linearRampToValueAtTime(30, now + duration);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.6, now + 1.0);
    subGain.gain.linearRampToValueAtTime(0.001, now + duration);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    // 3. Beep de ignición inicial
    const beepOsc = ctx.createOscillator();
    beepOsc.type = 'sine';
    beepOsc.frequency.setValueAtTime(880, now);
    beepOsc.frequency.setValueAtTime(1760, now + 0.15);

    const beepGain = ctx.createGain();
    beepGain.gain.setValueAtTime(0.3, now);
    beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    beepOsc.connect(beepGain);
    beepGain.connect(ctx.destination);

    // Iniciar nodos
    beepOsc.start(now);
    beepOsc.stop(now + 0.35);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);

    subOsc.start(now);
    subOsc.stop(now + duration);
  }
}

window.rocketAudio = new RocketAudioSynthesizer();
