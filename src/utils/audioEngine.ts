/**
 * Realistic Web Audio API DSP Engine for CB Radio Transceiver Simulator
 * Includes:
 * - Real-time atmospheric RF noise generator with bandpass filter & squelch gating
 * - Squelch tail burst & relay clicks
 * - Roger Beep generator (1050 Hz tone burst)
 * - Microphone audio pipeline with CB bandpass & saturation
 * - Echo box effect
 * - Speech synthesis bridge
 */

class CBAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micBandpass: BiquadFilterNode | null = null;
  private micDistortion: WaveShaperNode | null = null;
  private micGainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private echoDelay: DelayNode | null = null;
  private echoFeedback: GainNode | null = null;
  private isMuted: boolean = false;
  private userAudioActive: boolean = false;

  private isInitialized = false;

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);

      // Voice bus
      this.voiceGain = this.ctx.createGain();
      this.voiceGain.gain.value = 1.0;
      this.voiceGain.connect(this.masterGain);

      // Echo setup
      this.echoDelay = this.ctx.createDelay(1.0);
      this.echoDelay.delayTime.value = 0.16; // 160ms delay
      this.echoFeedback = this.ctx.createGain();
      this.echoFeedback.gain.value = 0.0; // disabled by default

      this.echoDelay.connect(this.echoFeedback);
      this.echoFeedback.connect(this.echoDelay);
      this.echoDelay.connect(this.masterGain);

      // Analyser for signal visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.masterGain.connect(this.analyser);

      // Setup continuous RF static generator
      this.setupNoiseGenerator();

      this.isInitialized = true;
    } catch (err) {
      console.warn('AudioContext could not be initialized yet:', err);
    }
  }

  private setupNoiseGenerator() {
    if (!this.ctx || !this.masterGain) return;

    // Generate 3 seconds of looped atmospheric pink/white noise
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.12;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    // Bandpass filter centered on 1200Hz to mimic vintage CB receiver IF filter
    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.value = 1100;
    this.noiseFilter.Q.value = 0.9;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0.0; // starts closed until updated

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);

    this.noiseNode.start();
  }

  /**
   * Update RF noise and master levels based on radio controls
   */
  public updateLevels(params: {
    power: boolean;
    volume: number; // 0-100
    squelch: number; // 0-100
    rfGain: number; // 0-100
    noiseBlanker: boolean;
    isReceivingSignal: boolean;
    isTransmitting: boolean;
    echoEnabled: boolean;
    echoDelay?: number;
    echoFeedback?: number;
  }) {
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const {
      power,
      volume,
      squelch,
      rfGain,
      noiseBlanker,
      isReceivingSignal,
      isTransmitting,
      echoEnabled,
      echoDelay = 160,
      echoFeedback = 35,
    } = params;

    if (!power || volume === 0) {
      if (this.masterGain) this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      if (this.noiseGain) this.noiseGain.gain.setValueAtTime(0, this.ctx.currentTime);
      return;
    }

    const volNorm = Math.pow(volume / 100, 1.5);
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(volNorm * 0.75, this.ctx.currentTime, 0.02);
    }

    // Echo controls
    if (this.echoDelay && this.echoFeedback) {
      this.echoDelay.delayTime.setValueAtTime(echoDelay / 1000, this.ctx.currentTime);
      this.echoFeedback.gain.setValueAtTime(echoEnabled ? (echoFeedback / 100) * 0.65 : 0, this.ctx.currentTime);
    }

    // Noise Blanker alters static frequency shape
    if (this.noiseFilter) {
      this.noiseFilter.frequency.setValueAtTime(noiseBlanker ? 900 : 1200, this.ctx.currentTime);
      this.noiseFilter.Q.setValueAtTime(noiseBlanker ? 1.4 : 0.85, this.ctx.currentTime);
    }

    // Squelch gating calculation:
    // If squelch is below threshold (e.g. squelch < 20 or rfGain > squelch*2), static opens!
    // If an incoming transmission is playing or user is transmitting, static drops!
    if (this.noiseGain) {
      let targetNoise = 0;

      if (isTransmitting) {
        // When transmitting, mute receiver hiss
        targetNoise = 0;
      } else if (isReceivingSignal) {
        // When receiving someone, keep faint underlying RF hiss for realism
        targetNoise = 0.04 * (rfGain / 100);
      } else {
        // Free-air state: Squelch knob acts as threshold
        // If squelch is at 0, full loud static (0.35)
        // By squelch = 30-40, squelch gate shuts down static completely
        const squelchThreshold = (squelch / 100) * 100;
        const rfLevel = rfGain; // 0-100

        // If squelch is turned down or RF gain overwhelms squelch:
        if (squelchThreshold < 25 || (rfLevel > 80 && squelchThreshold < 35)) {
          const openAmount = Math.max(0, 1 - squelchThreshold / 28);
          targetNoise = openAmount * 0.28 * (rfGain / 100) * (noiseBlanker ? 0.6 : 1.0);
        } else {
          targetNoise = 0.0;
        }
      }

      this.noiseGain.gain.setTargetAtTime(targetNoise, this.ctx.currentTime, 0.03);
    }
  }

  /**
   * Play realistic mechanical PTT Mic Click (Key Down)
   */
  public playMicKeyDown() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Quick snap oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.035);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);

    // Subtle relay burst
    this.playShortNoiseBurst(0.04, 0.25);
  }

  /**
   * Play PTT Key Up (Mic release, squelch tail burst, and optional Roger Beep)
   */
  public playMicKeyUp(includeRogerBeep: boolean = false) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Mechanical unclick
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.025);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.03);

    // Squelch tail burst ("ksshh-chunk")
    this.playShortNoiseBurst(0.08, 0.35);

    // Roger Beep
    if (includeRogerBeep) {
      setTimeout(() => {
        this.playRogerBeep();
      }, 70);
    }
  }

  /**
   * Play classic 1050 Hz Roger Beep
   */
  public playRogerBeep(tone: 'classic' | 'dual' = 'classic') {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    if (tone === 'classic') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1050, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.015);
      gain.gain.setValueAtTime(0.3, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      // Also route into echo if enabled
      if (this.echoDelay) {
        gain.connect(this.echoDelay);
      }

      osc.start(now);
      osc.stop(now + 0.17);
    } else {
      // Classic NASA / Dual K-tone beep (1100Hz -> 850Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1150, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.setValueAtTime(0.25, now + 0.07);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.085);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.085);
      gain2.gain.setValueAtTime(0.001, now + 0.085);
      gain2.gain.exponentialRampToValueAtTime(0.28, now + 0.095);
      gain2.gain.setValueAtTime(0.28, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(now + 0.085);
      osc2.stop(now + 0.19);
    }
  }

  /**
   * Tactile knob rotation click SFX
   */
  public playKnobClick() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.015);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  /**
   * Tactile heavy metal toggle switch click SFX
   */
  public playSwitchToggle() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Public Address (PA) horn simulator sound
   */
  public playPAHorn() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(340, now);
    osc2.frequency.setValueAtTime(425, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
    gain.gain.setValueAtTime(0.35, now + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.65);
    osc2.stop(now + 0.65);
  }

  private playShortNoiseBurst(duration: number, volume: number) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    filter.Q.value = 1.0;

    const gain = this.ctx.createGain();
    gain.gain.value = volume;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start();
  }

  /**
   * Start capturing live microphone from user for PTT transmission
   */
  public async startMicrophoneCapture(micGainPercent: number): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;

    try {
      if (!this.micStream) {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
      }

      if (!this.micSource) {
        this.micSource = this.ctx.createMediaStreamSource(this.micStream);

        // Bandpass to give vintage CB radio voice characteristics (300Hz - 2.8kHz)
        this.micBandpass = this.ctx.createBiquadFilter();
        this.micBandpass.type = 'bandpass';
        this.micBandpass.frequency.value = 1350;
        this.micBandpass.Q.value = 0.95;

        // Mild waveshaper saturation
        this.micDistortion = this.ctx.createWaveShaper();
        this.micDistortion.curve = this.makeDistortionCurve(18);

        this.micGainNode = this.ctx.createGain();

        this.micSource.connect(this.micBandpass);
        this.micBandpass.connect(this.micDistortion);
        this.micDistortion.connect(this.micGainNode);
        this.micGainNode.connect(this.masterGain!);

        if (this.echoDelay) {
          this.micGainNode.connect(this.echoDelay);
        }
      }

      if (this.micGainNode) {
        this.micGainNode.gain.setValueAtTime((micGainPercent / 100) * 1.4, this.ctx.currentTime);
      }

      this.userAudioActive = true;
      return true;
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      return false;
    }
  }

  /**
   * Stop capturing live microphone
   */
  public stopMicrophoneCapture() {
    if (this.micGainNode && this.ctx) {
      this.micGainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);
    }
    this.userAudioActive = false;
  }

  /**
   * Get current output level (0 to 100) from the Analyser for the S/RF needle
   */
  public getAudioLevel(): number {
    if (!this.analyser) return 0;
    const array = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(array);
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    const avg = sum / array.length;
    return Math.min(100, Math.round((avg / 255) * 100 * 1.6));
  }

  private makeDistortionCurve(amount: number) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
}

export const cbAudio = new CBAudioEngine();
