import { useRef, useCallback, useState, useEffect, useMemo } from 'react';

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const audioCtxRef = useRef(null);
  const musicIntervalRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq, type = 'sine', duration = 0.1, gainVal = 0.15) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // Minecraft UI Button Click (random.click)
  const playTick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1250, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // Urgent TNT Fuse Sizzle / Rapid Flint
  const playUrgentTick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // White noise fuse burst
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // Iconic Minecraft XP Level Up Chime (random.levelup)
  const playSuccess = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Ascending pentatonic chime notes: G5, A5, C6, D6, E6, G6
      const notes = [783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.06;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // Minecraft Player Hurt / Anvil Clink
  const playWarning = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Low punch hurt grunt
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.18);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // Warning Alarm / Raid Horn
  const playAlarm = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Minecraft Raid Horn / Alert tone
      [220, 277.18, 329.63].forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      });
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // Minecraft Wood Dig / Block Slide (dig.wood)
  const playSlide = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // Minecraft Stone Block Impact (step.stone / fall.big)
  const playBlockThud = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // Authentic Minecraft TNT Explosion (random.explode)
  const playCrash = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 1.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Filter noise to create deep bass explosive rumble
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 1.1);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // Ambient War-Room Tension Beat
  const playAmbientPulse = useCallback((isUrgent = false) => {
    if (!soundEnabled || !musicEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Low cyberpunk sub-bass heartbeat
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 85 : 55, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

      gain.gain.setValueAtTime(isUrgent ? 0.08 : 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }, [soundEnabled, musicEnabled, getAudioContext]);

  // 1. Emergency Klaxon Siren (Two-Tone High Urgency Warble)
  const playSiren = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      // Oscillate frequency 650Hz to 950Hz
      for (let i = 0; i < 4; i++) {
        const t = now + i * 0.25;
        osc.frequency.setValueAtTime(650, t);
        osc.frequency.linearRampToValueAtTime(950, t + 0.12);
        osc.frequency.linearRampToValueAtTime(650, t + 0.24);
      }
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.0);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // 2. Creeper Hiss (White noise rising swell with punchy thud)
  const playCreeper = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.9, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.linearRampToValueAtTime(3200, now + 0.8);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.35, now + 0.75);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // 3. Veto Slap / Whipcrack Slap
  const playSlap = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // 4. Meme Airhorn Triplet (bwa-bwa-bwaaa!)
  const playAirhorn = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [
        { freq: 466.16, start: 0, dur: 0.12 },    // Bb4
        { freq: 466.16, start: 0.16, dur: 0.12 }, // Bb4
        { freq: 466.16, start: 0.32, dur: 0.35 }, // Bb4 long
      ];
      notes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.25, now + start);
        gain.gain.exponentialRampToValueAtTime(0.01, now + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // 5. Digital Glitch Static
  const playGlitch = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = [320, 880, 210, 1400, 480];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        const t = now + idx * 0.03;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.03);
      });
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // 6. Heavy Rubber Stamp Thud
  const playRubberStamp = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.2);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  // 7. Discordant Blunder Buzzer
  const playBuzzer = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [145, 154].forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch {}
  }, [soundEnabled, getAudioContext]);

  const toggleSound = useCallback(() => setSoundEnabled((prev) => !prev), []);
  const toggleMusic = useCallback(() => setMusicEnabled((prev) => !prev), []);

  return useMemo(
    () => ({
      soundEnabled,
      toggleSound,
      musicEnabled,
      toggleMusic,
      playTick,
      playUrgentTick,
      playSuccess,
      playWarning,
      playAlarm,
      playCrash,
      playSlide,
      playBlockThud,
      playAmbientPulse,
      playSiren,
      playCreeper,
      playSlap,
      playAirhorn,
      playGlitch,
      playRubberStamp,
      playBuzzer,
    }),
    [
      soundEnabled,
      toggleSound,
      musicEnabled,
      toggleMusic,
      playTick,
      playUrgentTick,
      playSuccess,
      playWarning,
      playAlarm,
      playCrash,
      playSlide,
      playBlockThud,
      playAmbientPulse,
      playSiren,
      playCreeper,
      playSlap,
      playAirhorn,
      playGlitch,
      playRubberStamp,
      playBuzzer,
    ]
  );
}
