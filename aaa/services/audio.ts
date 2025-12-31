
class AudioService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createGain(start: number, duration: number) {
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(start, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + duration);
    return gain;
  }

  playShoot() {
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.createGain(0.1, 0.1);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx!.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.1);
  }

  playExplosion(isBoss = false) {
    this.init();
    const duration = isBoss ? 0.8 : 0.3;
    const bufferSize = this.ctx!.sampleRate * duration;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx!.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBoss ? 500 : 1000, this.ctx!.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx!.currentTime + duration);

    const gain = this.createGain(isBoss ? 0.5 : 0.2, duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx!.destination);
    
    noise.start();
  }

  playBossShoot() {
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.createGain(0.2, 0.2);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx!.currentTime + 0.2);
    
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.2);
  }

  playDamage() {
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.createGain(0.3, 0.2);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx!.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx!.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.2);
    this.playExplosion(false);
  }

  playPowerUp() {
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.createGain(0.3, 0.4);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx!.currentTime + 0.2);
    osc.frequency.exponentialRampToValueAtTime(1320, this.ctx!.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.4);
  }

  playLevelUp() {
    this.init();
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, this.ctx!.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.1, this.ctx!.currentTime + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + i * 0.1);
      osc.stop(this.ctx!.currentTime + i * 0.1 + 0.3);
    });
  }
}

export const audio = new AudioService();
