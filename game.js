if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvasContainer');

const gameHud = document.getElementById('gameHud');
const gameScoreDisplay = document.getElementById('gameScoreDisplay');
const hudCoinsDisplay = document.getElementById('hudCoinsDisplay');
const timerTag = document.getElementById('timerTag');
const timerDisplay = document.getElementById('timerDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const stage3Meters = document.getElementById('stage3Meters');
const babyHpWrap = document.querySelector('.baby-hp-wrap');
const babyHpFill = document.getElementById('babyHpFill');
const babyHpText = document.getElementById('babyHpText');
const paddleStatusBadge = document.getElementById('paddleStatusBadge');

const startOverlay = document.getElementById('startOverlay');
const mainLevelDisplay = document.getElementById('mainLevelDisplay');
const mainXpText = document.getElementById('mainXpText');
const mainXpFill = document.getElementById('mainXpFill');
const mainCoinsDisplay = document.getElementById('mainCoinsDisplay');
const bestScoreBadge = document.getElementById('bestScoreBadge');
const lobbyMusicBtn = document.getElementById('lobbyMusicBtn');
const tapAudioHint = document.getElementById('tapAudioHint');
const startBtnText = document.getElementById('startBtnText');

const babyStage = document.getElementById('babyStage');
const babyActor = document.getElementById('babyActor');

const tipBar = document.getElementById('tipBar');
const tipIcon = document.getElementById('tipIcon');
const tipText = document.getElementById('tipText');
const levelUpToast = document.getElementById('levelUpToast');
const bossBanner = document.getElementById('bossBanner');
const exitConfirmOverlay = document.getElementById('exitConfirmOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const shopOverlay = document.getElementById('shopOverlay');
const shopGrid = document.getElementById('shopGrid');
const guideOverlay = document.getElementById('guideOverlay');

// =========================================================
// المتجر
// =========================================================
const THEMES = [
  { id: 'morning', name: 'الصباح المشرق', price: 0, minLevel: 1, icon: '☀️', skyTop: '#e0f2fe', skyMid: '#fefce8', ground: '#dcfce7', cloudColor: 'rgba(255, 255, 255, 0.85)', dark: false },
  { id: 'cyber', name: 'المختبر التقني', price: 1000, minLevel: 1, icon: '🧬', skyTop: '#020617', skyMid: '#0f172a', ground: '#1e293b', cloudColor: 'rgba(56, 189, 248, 0.16)', dark: true },
  { id: 'night', name: 'ليالي النجوم', price: 1600, minLevel: 3, icon: '🌙', skyTop: '#090d16', skyMid: '#1e1b4b', ground: '#111827', cloudColor: 'rgba(148, 163, 184, 0.18)', dark: true },
  { id: 'spring', name: 'حديقة الزهور', price: 2400, minLevel: 5, icon: '🌸', skyTop: '#fce7f3', skyMid: '#fdf2f8', ground: '#bbf7d0', cloudColor: 'rgba(255, 255, 255, 0.85)', dark: false },
  { id: 'sunset', name: 'غروب الذهب', price: 3500, minLevel: 8, icon: '🌅', skyTop: '#fed7aa', skyMid: '#fecdd3', ground: '#fde68a', cloudColor: 'rgba(255, 247, 237, 0.75)', dark: false },
  { id: 'galaxy', name: 'مجرة السديم', price: 5000, minLevel: 12, icon: '🌌', skyTop: '#020617', skyMid: '#3b0764', ground: '#1e1b4b', cloudColor: 'rgba(216, 180, 254, 0.16)', dark: true }
];

const BASKETS = [
  { id: 'classic', name: 'الخوص الكلاسيك', price: 0, minLevel: 1, icon: '🧺', c1: '#f59e0b', c2: '#b45309', rim: '#d97706', badge: '🤱' },
  { id: 'cyberpod', name: 'الكبسولة التقنية', price: 1000, minLevel: 1, icon: '🛸', c1: '#38bdf8', c2: '#0284c7', rim: '#7dd3fc', badge: '⚡' },
  { id: 'royal', name: 'السلة الملكية', price: 1600, minLevel: 3, icon: '👑', c1: '#fde047', c2: '#ca8a04', rim: '#eab308', badge: '👑' },
  { id: 'pink', name: 'المخمل الوردي', price: 2400, minLevel: 5, icon: '💖', c1: '#f472b6', c2: '#be185d', rim: '#ec4899', badge: '💖' },
  { id: 'panda', name: 'سلة الباندا', price: 3500, minLevel: 8, icon: '🐼', c1: '#f8fafc', c2: '#334155', rim: '#0f172a', badge: '🐼' },
  { id: 'quantum', name: 'الدرع الكمي', price: 5000, minLevel: 12, icon: '🔮', c1: '#c084fc', c2: '#4c1d95', rim: '#e879f9', badge: '💎' }
];

// =========================================================
// حفظ البيانات + خريطة Duolingo
// =========================================================
const STATE_KEY = 'nursing_mom_game_state_v8';
let savedData = {
  totalXP: 0,
  bestScore: 0,
  coins: 0,
  coinBuffer: 0,
  unlockedStages: [1],
  completedStages: [],
  unlockedThemes: ['morning'],
  unlockedBaskets: ['classic'],
  equippedTheme: 'morning',
  equippedBasket: 'classic'
};

try {
  const raw = localStorage.getItem(STATE_KEY) || localStorage.getItem('nursing_mom_game_state_v7');
  if (raw) {
    savedData = { ...savedData, ...JSON.parse(raw) };
  }
} catch (e) {}

function persistState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(savedData));
  } catch (e) {}
}

function getInfiniteLevelInfo(totalXP) {
  let lvl = 1;
  let remainingXP = Math.max(0, totalXP);
  while (true) {
    const neededForNext = 800 * lvl + 400 * (lvl * lvl);
    if (remainingXP >= neededForNext) {
      remainingXP -= neededForNext;
      lvl++;
    } else {
      const pct = Math.min(100, Math.max(0, (remainingXP / neededForNext) * 100));
      return { lvl, currentInLvl: remainingXP, neededForNext, pct };
    }
  }
}

let currentAccountLevel = getInfiniteLevelInfo(savedData.totalXP).lvl;
let selectedStage = Math.max(...savedData.unlockedStages);
let currentGameScore = 0;
const MAX_HEARTS = 5;
let heartsRemaining = MAX_HEARTS;

let babyHealth = 75;
let babyDrainPenalty = 0;
const paddle = {
  cooldown: 0,
  maxCooldown: 5.0,
  swingAnim: 0,
  swingDir: 1
};

const boss = {
  type: 1,
  state: 'idle',
  x: 200,
  y: -130,
  targetX: 200,
  targetY: 120,
  moveLerp: 4,
  moveTimer: 0,
  dancePhase: 0,
  handSide: 1,
  handSwing: 0,
  radius: 70,
  dir: 1,
  timer: 0,
  throwTimer: 0,
  throwTimer2: 0,
  burstRemaining: 0,
  wavesThrown: 0,
  maxWaves: 28,
  scale: 1
};

function updateDuolingoMapUI() {
  for (let s = 1; s <= 3; s++) {
    const node = document.getElementById(`nodeStage${s}`);
    const crown = document.getElementById(`crownStage${s}`);
    const isUnlocked = savedData.unlockedStages.includes(s);
    const isCompleted = savedData.completedStages.includes(s);

    node.classList.remove('locked', 'completed', 'selected');
    if (!isUnlocked) {
      node.classList.add('locked');
      if (s === 2) document.getElementById('iconStage2').textContent = '🔒';
      if (s === 3) document.getElementById('iconStage3').textContent = '🔒';
    } else {
      if (s === 2) document.getElementById('iconStage2').textContent = '🕶️';
      if (s === 3) document.getElementById('iconStage3').textContent = '🏓';
    }

    if (isCompleted) {
      node.classList.add('completed');
      crown.textContent = '👑';
    } else {
      crown.textContent = '';
    }

    if (selectedStage === s) {
      node.classList.add('selected');
    }
  }
  startBtnText.textContent = `ابدأ المرحلة ${selectedStage}`;
}

function updateAllUI() {
  const lvlInfo = getInfiniteLevelInfo(savedData.totalXP);
  currentAccountLevel = lvlInfo.lvl;

  mainLevelDisplay.textContent = currentAccountLevel;
  mainXpText.textContent = `${lvlInfo.currentInLvl} / ${lvlInfo.neededForNext} XP`;
  mainXpFill.style.width = `${lvlInfo.pct}%`;
  mainCoinsDisplay.textContent = savedData.coins;
  bestScoreBadge.textContent = `👑 أعلى سكور: ${savedData.bestScore}`;

  document.getElementById('shopLevelDisplay').textContent = currentAccountLevel;
  document.getElementById('shopCoinsDisplay').textContent = savedData.coins;

  gameScoreDisplay.textContent = currentGameScore;
  hudCoinsDisplay.textContent = savedData.coins;

  const isStage3BossActive = (selectedStage === 3 && boss.state !== 'idle');

  if (selectedStage === 3) {
    stage3Meters.classList.remove('hidden');

    if (paddle.cooldown <= 0) {
      paddleStatusBadge.textContent = '🏓 جاهز!';
      paddleStatusBadge.classList.add('ready');
    } else {
      paddleStatusBadge.textContent = `🏓 ${paddle.cooldown.toFixed(1)}s`;
      paddleStatusBadge.classList.remove('ready');
    }

    if (isStage3BossActive) {
      // وقت الوحش في ليفل 3: إخفاء شريط صحة الرضيع وإظهار 3 قلوب فقط
      if (babyHpWrap) babyHpWrap.classList.add('hidden');
      livesDisplay.classList.remove('hidden');
      let heartsHTML = '';
      for (let i = 0; i < 3; i++) {
        heartsHTML += i < heartsRemaining ? '❤️' : '<span class="heart-lost">🖤</span>';
      }
      livesDisplay.innerHTML = heartsHTML;
    } else {
      // قبل الوحش في ليفل 3: شريط صحة الرضيع بدون قلوب
      if (babyHpWrap) babyHpWrap.classList.remove('hidden');
      livesDisplay.classList.add('hidden');
      const hpClamped = Math.max(0, Math.min(100, Math.round(babyHealth)));
      babyHpFill.style.width = `${hpClamped}%`;
      babyHpText.textContent = `${hpClamped}%`;
      babyHpFill.style.background = hpClamped > 50 ? '#22c55e' : (hpClamped > 25 ? '#f59e0b' : '#ef4444');
    }
  } else {
    livesDisplay.classList.remove('hidden');
    stage3Meters.classList.add('hidden');
    let heartsHTML = '';
    for (let i = 0; i < MAX_HEARTS; i++) {
      heartsHTML += i < heartsRemaining ? '❤️' : '<span class="heart-lost">🖤</span>';
    }
    livesDisplay.innerHTML = heartsHTML;
  }

  updateDuolingoMapUI();
}
updateAllUI();

[1, 2, 3].forEach(s => {
  document.getElementById(`rowStage${s}`).addEventListener('click', () => {
    if (!savedData.unlockedStages.includes(s)) {
      alert(`المرحلة ${s} مقفولة حالياً! خلص المرحلة ${s - 1} الأول عشان تفتحها 💪`);
      return;
    }
    selectedStage = s;
    playTone('good');
    updateDuolingoMapUI();
  });
});

let secretTapCount = 0;
document.getElementById('mapTitleSecret').addEventListener('click', () => {
  secretTapCount++;
  if (secretTapCount >= 5) {
    savedData.unlockedStages = [1, 2, 3];
    persistState();
    updateDuolingoMapUI();
    alert('🔓 تم فتح جميع المراحل للتجربة يا كبير!');
    secretTapCount = 0;
  }
});

// =========================================================
// محرك الصوت والموسيقى
// =========================================================
let soundEnabled = true;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let danceMusicInterval = null;
let isBabyDancing = false;

function handleUserGestureAudio() {
  if (!soundEnabled) return;
  if (!audioCtx && AudioCtx) {
    audioCtx = new AudioCtx();
  }
  if (!audioCtx) return;

  const onReady = () => {
    tapAudioHint.classList.add('hidden');
    if (soundEnabled && isBabyDancing && !startOverlay.classList.contains('hidden') && !danceMusicInterval) {
      startBabyDanceMusic();
    }
  };

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(onReady).catch(() => {});
  } else if (audioCtx.state === 'running') {
    onReady();
  }
}

['touchstart', 'pointerdown', 'click', 'keydown'].forEach(evt => {
  document.addEventListener(evt, handleUserGestureAudio, { passive: true });
});

function startBabyDanceMusic() {
  if (!soundEnabled || danceMusicInterval) return;
  if (!audioCtx || audioCtx.state !== 'running') return;

  const melody = [523.25, 659.25, 783.99, 659.25, 880.00, 783.99, 659.25, 587.33];
  const bass = [130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00];
  let step = 0;

  const playBeat = () => {
    if (!soundEnabled || !isBabyDancing || startOverlay.classList.contains('hidden')) {
      stopBabyDanceMusic();
      return;
    }
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(melody[step % melody.length], now);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    if (step % 2 === 0) {
      const bOsc = audioCtx.createOscillator();
      const bGain = audioCtx.createGain();
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(bass[step % bass.length], now);
      bOsc.frequency.exponentialRampToValueAtTime(55, now + 0.22);
      bGain.gain.setValueAtTime(0.24, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      bOsc.connect(bGain);
      bGain.connect(audioCtx.destination);
      bOsc.start(now);
      bOsc.stop(now + 0.25);
    }
    step++;
  };

  playBeat();
  danceMusicInterval = setInterval(playBeat, 230);
}

function stopBabyDanceMusic() {
  if (danceMusicInterval) {
    clearInterval(danceMusicInterval);
    danceMusicInterval = null;
  }
}

let tenseMusicInterval = null;
function startTensePreBossMusic() {
  if (!soundEnabled || tenseMusicInterval || !audioCtx) return;
  const tenseNotes = [110, 116.54, 110, 123.47, 130.81, 138.59, 146.83, 155.56];
  let idx = 0;
  tenseMusicInterval = setInterval(() => {
    if (!soundEnabled || !isRunning || isPaused || !audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(tenseNotes[idx % tenseNotes.length], now);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
    idx++;
  }, 190);
}

function stopTensePreBossMusic() {
  if (tenseMusicInterval) {
    clearInterval(tenseMusicInterval);
    tenseMusicInterval = null;
  }
}

let bossMusicMasterGain = null;
let bossLoopInterval = null;

function playRisingBoss3Ost() {
  if (!soundEnabled || !audioCtx || audioCtx.state !== 'running') return;
  stopBossMusic();

  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(280, now);
  filter.frequency.exponentialRampToValueAtTime(4800, now + 3.5);

  master.gain.setValueAtTime(0.015, now);
  master.gain.exponentialRampToValueAtTime(0.32, now + 3.5);

  filter.connect(master);
  master.connect(audioCtx.destination);
  bossMusicMasterGain = master;

  const F4 = 349.23, G4 = 392.00, A4 = 440.00, C5 = 523.25, D5 = 587.33;
  const macarenaPhrase = [
    { f: F4, d: 0.20, w: 'square' }, { f: F4, d: 0.14, w: 'square' }, { f: F4, d: 0.14, w: 'square' },
    { f: F4, d: 0.20, w: 'square' }, { f: F4, d: 0.14, w: 'square' }, { f: F4, d: 0.14, w: 'square' },
    { f: A4, d: 0.16, w: 'triangle' }, { f: C5, d: 0.16, w: 'triangle' }, { f: A4, d: 0.16, w: 'triangle' }, { f: F4, d: 0.24, w: 'square' },
    { f: F4, d: 0.20, w: 'square' }, { f: F4, d: 0.14, w: 'square' }, { f: F4, d: 0.14, w: 'square' },
    { f: A4, d: 0.16, w: 'triangle' }, { f: C5, d: 0.16, w: 'triangle' }, { f: D5, d: 0.20, w: 'triangle' },
    { f: C5, d: 0.16, w: 'triangle' }, { f: A4, d: 0.20, w: 'triangle' }, { f: G4, d: 0.20, w: 'square' }, { f: F4, d: 0.36, w: 'square' }
  ];

  const schedulePhrase = (startTime) => {
    let t = startTime;
    macarenaPhrase.forEach(note => {
      if (!audioCtx || !bossMusicMasterGain) return;
      const osc = audioCtx.createOscillator();
      const noteGain = audioCtx.createGain();
      osc.type = note.w;
      osc.frequency.setValueAtTime(note.f, t);

      noteGain.gain.setValueAtTime(0.001, t);
      noteGain.gain.linearRampToValueAtTime(0.85, t + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.01, t + note.d * 0.92);

      osc.connect(noteGain);
      noteGain.connect(filter);
      osc.start(t);
      osc.stop(t + note.d);

      t += note.d + 0.025;
    });
    return t - startTime;
  };

  const phraseDur = schedulePhrase(now + 0.04);
  bossLoopInterval = setInterval(() => {
    if (!soundEnabled || !isRunning || isPaused || boss.state === 'idle' || boss.state === 'defeated') {
      stopBossMusic();
      return;
    }
    if (audioCtx && audioCtx.state === 'running') {
      schedulePhrase(audioCtx.currentTime + 0.02);
    }
  }, phraseDur * 1000);
}

function playBossEntranceMusic(bossType) {
  if (bossType === 3) {
    playRisingBoss3Ost();
    return;
  }
  if (!soundEnabled || !audioCtx || audioCtx.state !== 'running') return;
  stopBossMusic();

  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0.28, audioCtx.currentTime);
  master.connect(audioCtx.destination);
  bossMusicMasterGain = master;

  let pattern = [];
  if (bossType === 1) {
    const D4 = 293.66, E4 = 329.63, G4 = 392.00, Fs4 = 369.99;
    pattern = [
      { f: D4, d: 0.30, w: 'triangle' }, { f: E4, d: 0.30, w: 'triangle' },
      { f: G4, d: 0.17, w: 'triangle' }, { f: G4, d: 0.17, w: 'triangle' }, { f: G4, d: 0.17, w: 'triangle' },
      { f: G4, d: 0.13, w: 'triangle' }, { f: G4, d: 0.17, w: 'triangle' }, { f: G4, d: 0.13, w: 'triangle' }, { f: G4, d: 0.22, w: 'triangle' },
      { f: D4, d: 0.30, w: 'triangle' }, { f: E4, d: 0.30, w: 'triangle' },
      { f: G4, d: 0.17, w: 'triangle' }, { f: G4, d: 0.17, w: 'triangle' }, { f: G4, d: 0.17, w: 'triangle' },
      { f: G4, d: 0.13, w: 'triangle' }, { f: G4, d: 0.17, w: 'triangle' }, { f: G4, d: 0.13, w: 'triangle' }, { f: Fs4, d: 0.42, w: 'triangle' }
    ];
  } else {
    const E3 = 164.81, G3 = 196.00, A3 = 220.00, B3 = 246.94, D4 = 293.66, E4 = 329.63;
    pattern = [
      { f: E3, d: 0.20, w: 'sawtooth' }, { f: E4, d: 0.16, w: 'square' }, { f: D4, d: 0.16, w: 'square' }, { f: B3, d: 0.20, w: 'sawtooth' },
      { f: A3, d: 0.20, w: 'sawtooth' }, { f: G3, d: 0.18, w: 'sawtooth' }, { f: A3, d: 0.18, w: 'square' }, { f: B3, d: 0.28, w: 'square' },
      { f: E3, d: 0.20, w: 'sawtooth' }, { f: E4, d: 0.16, w: 'square' }, { f: D4, d: 0.16, w: 'square' }, { f: B3, d: 0.20, w: 'sawtooth' },
      { f: D4, d: 0.18, w: 'square' }, { f: E4, d: 0.22, w: 'square' }, { f: G3, d: 0.18, w: 'sawtooth' }, { f: E3, d: 0.42, w: 'sawtooth' }
    ];
  }

  let t = audioCtx.currentTime + 0.04;
  pattern.forEach(note => {
    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();
    osc.type = note.w;
    osc.frequency.setValueAtTime(note.f, t);

    noteGain.gain.setValueAtTime(0.001, t);
    noteGain.gain.linearRampToValueAtTime(0.85, t + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.01, t + note.d * 0.92);

    osc.connect(noteGain);
    noteGain.connect(master);
    osc.start(t);
    osc.stop(t + note.d);

    t += note.d + 0.03;
  });
}

function fadeOutBossMusic() {
  if (bossLoopInterval) {
    clearInterval(bossLoopInterval);
    bossLoopInterval = null;
  }
  if (!audioCtx || !bossMusicMasterGain) return;
  const now = audioCtx.currentTime;
  bossMusicMasterGain.gain.cancelScheduledValues(now);
  bossMusicMasterGain.gain.setValueAtTime(Math.max(0.01, bossMusicMasterGain.gain.value), now);
  bossMusicMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
  setTimeout(() => stopBossMusic(), 1900);
}

function stopBossMusic() {
  if (bossLoopInterval) {
    clearInterval(bossLoopInterval);
    bossLoopInterval = null;
  }
  if (bossMusicMasterGain) {
    try { bossMusicMasterGain.disconnect(); } catch (e) {}
    bossMusicMasterGain = null;
  }
}

function synthesizeBabyWaaah(ctxAudio, startTime, duration = 0.42) {
  const osc1 = ctxAudio.createOscillator();
  const osc2 = ctxAudio.createOscillator();
  const filter = ctxAudio.createBiquadFilter();
  const gain = ctxAudio.createGain();

  osc1.type = 'sawtooth';
  osc2.type = 'triangle';
  osc1.frequency.setValueAtTime(440, startTime);
  osc1.frequency.linearRampToValueAtTime(530, startTime + duration * 0.25);
  osc1.frequency.exponentialRampToValueAtTime(340, startTime + duration);

  osc2.frequency.setValueAtTime(444, startTime);
  osc2.frequency.linearRampToValueAtTime(535, startTime + duration * 0.25);
  osc2.frequency.exponentialRampToValueAtTime(343, startTime + duration);

  filter.type = 'bandpass';
  filter.Q.value = 3.2;
  filter.frequency.setValueAtTime(420, startTime);
  filter.frequency.exponentialRampToValueAtTime(1050, startTime + duration * 0.3);
  filter.frequency.exponentialRampToValueAtTime(620, startTime + duration);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(0.24, startTime + 0.06);
  gain.gain.setValueAtTime(0.18, startTime + duration * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctxAudio.destination);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + duration);
  osc2.stop(startTime + duration);
}

function synthesizeBabyGiggle(ctxAudio, now) {
  const notes = [680, 860, 760, 980];
  notes.forEach((freq, idx) => {
    const t = now + idx * 0.06;
    const osc = ctxAudio.createOscillator();
    const gain = ctxAudio.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.18, t + 0.05);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    osc.connect(gain);
    gain.connect(ctxAudio.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  });
}

function playTone(type) {
  if (!soundEnabled || !audioCtx || audioCtx.state !== 'running') return;
  const now = audioCtx.currentTime;

  if (type === 'good') {
    synthesizeBabyGiggle(audioCtx, now);
  } else if (type === 'bad') {
    synthesizeBabyWaaah(audioCtx, now, 0.35);
    synthesizeBabyWaaah(audioCtx, now + 0.38, 0.42);
  } else if (type === 'paddle') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.14);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  } else if (type === 'levelup') {
    synthesizeBabyGiggle(audioCtx, now);
    synthesizeBabyGiggle(audioCtx, now + 0.25);
  } else if (type === 'boss_cry') {
    synthesizeBabyWaaah(audioCtx, now, 0.5);
    synthesizeBabyWaaah(audioCtx, now + 0.52, 0.65);
  } else if (type === 'gameover') {
    synthesizeBabyWaaah(audioCtx, now, 0.85);
  }
}

// =========================================================
// أنيميشن البيبي في الشاشة الرئيسية
// =========================================================
let babyChoreoTimer = null;

function startLobbyBabyAnimation() {
  stopBabyDanceMusic();
  clearTimeout(babyChoreoTimer);

  isBabyDancing = false;
  babyStage.classList.remove('dancing');
  babyActor.className = 'baby-actor crawling';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      babyActor.classList.add('at-center');
    });
  });

  babyChoreoTimer = setTimeout(() => {
    babyActor.classList.remove('crawling');
    babyActor.classList.add('dancing');
    babyStage.classList.add('dancing');
    isBabyDancing = true;
    startBabyDanceMusic();
  }, 2000);
}

lobbyMusicBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  soundEnabled = !soundEnabled;
  lobbyMusicBtn.textContent = soundEnabled ? '🎵' : '🔇';
  document.getElementById('soundBtn').textContent = soundEnabled ? '🔊' : '🔇';
  if (soundEnabled) {
    handleUserGestureAudio();
    if (isBabyDancing) startBabyDanceMusic();
  } else {
    stopBabyDanceMusic();
  }
});

startLobbyBabyAnimation();

// =========================================================
// الأكلات
// =========================================================
const FOODS_TIER_20 = [
  { emoji: '🐟', name: 'السردين', points: 20, good: true, tip: '+20! أوميجا 3 وكالسيوم مركز!' },
  { emoji: '🐠', name: 'السلمون', points: 20, good: true, tip: '+20! يطور مخ الرضيع وبصره!' },
  { emoji: '🐡', name: 'التراوت', points: 20, good: true, tip: '+20! بروتين وأحماض دهنية نادرة!' },
  { emoji: '🧠', name: 'عين الجمل', points: 20, good: true, tip: '+20! ممتاز لصحة المخ والتركيز!' },
  { emoji: '🌱', name: 'بذور الشيا', points: 20, good: true, tip: '+20! ألياف وأوميجا 3 وكالسيوم!' },
  { emoji: '🌾', name: 'بذور الكتان', points: 20, good: true, tip: '+20! يدعم جودة حليب الأم!' },
  { emoji: '🥑', name: 'الأفوكادو', points: 20, good: true, tip: '+20! دهون صحية وبوتاسيوم عالي!' },
  { emoji: '🥣', name: 'الشوفان', points: 20, good: true, tip: '+20! أشهر غذاء لإدرار الحليب!' },
  { emoji: '🥛', name: 'اللبن', points: 20, good: true, tip: '+20! كالسيوم وبروتين أساسي!' },
  { emoji: '🧀', name: 'الجبنة القريش', points: 20, good: true, tip: '+20! بروتين صافي وقليل الدهون!' }
];

const FOODS_TIER_15 = [
  { emoji: '🐟', name: 'البلطي', points: 15, good: true, tip: '+15! بروتين خفيف وسهل الهضم!' },
  { emoji: '🌰', name: 'اللوز', points: 15, good: true, tip: '+15! كالسيوم وفيتامين E!' },
  { emoji: '🥜', name: 'الكاجو', points: 15, good: true, tip: '+15! حديد وزنك وطاقة للأم!' },
  { emoji: '🌰', name: 'البندق', points: 15, good: true, tip: '+15! مضادات أكسدة وفيتامينات!' },
  { emoji: '🫒', name: 'زيت الزيتون', points: 15, good: true, tip: '+15! دهون أحادية صحية للقلب!' },
  { emoji: '🍯', name: 'الطحينة', points: 15, good: true, tip: '+15! كالسيوم وحديد من السمسم!' },
  { emoji: '🥯', name: 'السمسم', points: 15, good: true, tip: '+15! كنز كالسيوم طبيعي!' },
  { emoji: '🍞', name: 'عيش الحبوب الكاملة', points: 15, good: true, tip: '+15! ألياف وفيتامينات ب!' },
  { emoji: '🌾', name: 'البرغل', points: 15, good: true, tip: '+15! حبوب كاملة مشبعة ومغذية!' },
  { emoji: '🌿', name: 'الفريك', points: 15, good: true, tip: '+15! حديد وألياف ممتازة!' },
  { emoji: '🥣', name: 'القمح والبليلة', points: 15, good: true, tip: '+15! طاقة وإدرار طبيعي للحليب!' },
  { emoji: '🍨', name: 'الزبادي', points: 15, good: true, tip: '+15! بروبيوتيك لصحة الهضم!' },
  { emoji: '🧀', name: 'الجبن الطبيعي', points: 15, good: true, tip: '+15! كالسيوم ودهون طبيعية!' }
];

const FOODS_TIER_10 = [
  { emoji: '🫛', name: 'البسلة', points: 10, good: true, tip: '+10! بروتين نباتي وفيتامينات!' },
  { emoji: '🥜', name: 'الفول السوداني', points: 10, good: true, tip: '+10! طاقة وبروتين اقتصادي!' },
  { emoji: '🍚', name: 'الأرز', points: 10, good: true, tip: '+10! مصدر طاقة سريع للأم!' },
  { emoji: '🫓', name: 'العيش البلدي', points: 10, good: true, tip: '+10! ردة وحديد وطاقة!' },
  { emoji: '🍝', name: 'المكرونة', points: 10, good: true, tip: '+10! كربوهيدرات تمد الجسم بالطاقة!' },
  { emoji: '🥔', name: 'البطاطس', points: 10, good: true, tip: '+10! بوتاسيوم وطاقة صحية!' },
  { emoji: '🌽', name: 'الذرة', points: 10, good: true, tip: '+10! ألياف وفيتامينات مفيدة!' },
  { emoji: '🧀', name: 'الجبنة البيضاء', points: 10, good: true, tip: '+10! كالسيوم خفيف!' }
];

const BAD_FOODS = [
  { emoji: '🍔', name: 'الوجبات السريعة', good: false, tip: 'دهون مشبعة وملح عالي!' },
  { emoji: '🍔', name: 'البرجر', good: false, tip: 'لحوم مصنعة ودهون ثقيلة!' },
  { emoji: '🍟', name: 'البطاطس المقلية', good: false, tip: 'زيوت مقلية ومهدرجة!' },
  { emoji: '🥡', name: 'الشيبسي', good: false, tip: 'مواد حافظة وأملاح عالية!' },
  { emoji: '🍤', name: 'المقليات', good: false, tip: 'تسبب حموضة وعسر هضم!' },
  { emoji: '🍕', name: 'الوجبات الجاهزة', good: false, tip: 'سعرات عالية بدون قيمة!' },
  { emoji: '🥤', name: 'البيبسي والكولا', good: false, tip: 'كافيين وسكر يسهر الرضيع!' },
  { emoji: '🥫', name: 'المشروبات الغازية', good: false, tip: 'تقلل امتصاص الكالسيوم!' },
  { emoji: '⚡', name: 'مشروبات الطاقة', good: false, tip: 'كافيين خطير جداً أثناء الرضاعة!' },
  { emoji: '🧃', name: 'العصائر المعلبة المحلاة', good: false, tip: 'سكر صناعي وألوان!' },
  { emoji: '🍰', name: 'الكيك', good: false, tip: 'سكريات ودهون عالية!' },
  { emoji: '🍩', name: 'الدونات', good: false, tip: 'مقلي ومليان سكر!' },
  { emoji: '🍪', name: 'البسكويت المحلى', good: false, tip: 'دهون نباتية وسكر مكرر!' },
  { emoji: '🍮', name: 'الحلويات الشرقية', good: false, tip: 'شربات وسمن تقيل!' },
  { emoji: '🍫', name: 'الشوكولاتة بكميات كبيرة', good: false, tip: 'كافيين وثيوبرومين يقلق الطفل!' },
  { emoji: '☕', name: 'القهوة', good: false, tip: 'الكافيين ينتقل لحليب الأم!' },
  { emoji: '🫖', name: 'الشاي', good: false, tip: 'يقلل امتصاص الحديد!' },
  { emoji: '☕', name: 'النسكافيه', good: false, tip: 'كافيين مركز يسبب أرق للبيبي!' },
  { emoji: '🥤', name: 'الكولا', good: false, tip: 'صودا وكافيين وسكر!' },
  { emoji: '🍫', name: 'الشوكولاتة', good: false, tip: 'الإكثار منها يسبب مغص للطفل!' }
];

(function populateFoodGuide() {
  const box = document.getElementById('guideContent');
  const makeChips = (arr) => arr.map(f => `<span class="food-chip">${f.emoji} ${f.name}</span>`).join('');

  box.innerHTML = `
    <div class="guide-section-title tier-20">🌟 فائدة قصوى (+20 نقطة)</div>
    <div class="guide-chips">${makeChips(FOODS_TIER_20)}</div>

    <div class="guide-section-title tier-15">💎 فائدة عالية (+15 نقطة)</div>
    <div class="guide-chips">${makeChips(FOODS_TIER_15)}</div>

    <div class="guide-section-title tier-10">✅ فائدة أساسية (+10 نقط)</div>
    <div class="guide-chips">${makeChips(FOODS_TIER_10)}</div>

    <div class="guide-section-title tier-bad">❌ أكلات ضارة (تخصم نقط وصحة)</div>
    <div class="guide-chips">${makeChips(BAD_FOODS)}</div>
  `;
})();

document.getElementById('openGuideBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  guideOverlay.classList.remove('hidden');
});
document.getElementById('closeGuideBtn').addEventListener('click', () => {
  guideOverlay.classList.add('hidden');
});

// =========================================================
// السلة والبراكين
// =========================================================
const basket = {
  x: 160,
  y: 420,
  targetX: 160,
  targetY: 420,
  width: 74,
  height: 48,
  vx: 0,
  tilt: 0
};

let isRunning = false;
let isPaused = false;
let lastTime = 0;
let spawnTimer = 0;
let sideSpawnTimer = 0;
let bossSkyFoodTimer = 0;
let elapsedSeconds = 0;
let stage3Phase = 'normal';
let screenShake = 0;

let volcanoThemeActive = false;
let volcanoEruptTimer = 0;
let volcanoFlashAlpha = 0;
let lavaParticles = [];

let items = [];
let sideWarnings = [];
let popups = [];

let stars = Array.from({ length: 24 }, () => ({
  x: Math.random(),
  y: Math.random() * 0.78,
  r: 1 + Math.random() * 1.6,
  phase: Math.random() * Math.PI * 2
}));

let clouds = [
  { x: 50, y: 75, speed: 14, scale: 1 },
  { x: 240, y: 115, speed: 10, scale: 0.85 },
  { x: 390, y: 65, speed: 16, scale: 1.1 }
];

function triggerVolcanoExplosion() {
  volcanoFlashAlpha = 0.35;
  screenShake = Math.max(screenShake, 9);

  const peaks = [
    { x: canvas.width * 0.18, y: canvas.height - 108 },
    { x: canvas.width * 0.50, y: canvas.height - 142 },
    { x: canvas.width * 0.82, y: canvas.height - 104 }
  ];
  const peak = peaks[Math.floor(Math.random() * peaks.length)];

  for (let i = 0; i < 22; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.3;
    const speed = 150 + Math.random() * 260;
    const isSmoke = i % 4 === 0;
    lavaParticles.push({
      x: peak.x + (Math.random() * 16 - 8),
      y: peak.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: isSmoke ? (10 + Math.random() * 10) : (3 + Math.random() * 4.5),
      color: isSmoke ? 'rgba(68, 64, 60, 0.75)' : (Math.random() < 0.5 ? '#facc15' : '#ef4444'),
      life: 1.0 + Math.random() * 0.6,
      isSmoke
    });
  }
}

function clampBasketTargets() {
  const minY = 56;
  const maxY = Math.max(minY, canvas.height - basket.height - 12);
  basket.targetX = Math.max(0, Math.min(canvas.width - basket.width, basket.targetX));
  basket.targetY = Math.max(minY, Math.min(maxY, basket.targetY));
}

function resizeCanvas() {
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  clampBasketTargets();
  basket.x = basket.targetX;
  basket.y = basket.targetY;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let activeTouchId = null;
let lastTouchX = 0;
let lastTouchY = 0;

canvas.addEventListener('touchstart', (e) => {
  if (!isRunning || isPaused) return;
  if (activeTouchId === null && e.changedTouches.length > 0) {
    const touch = e.changedTouches[0];
    activeTouchId = touch.identifier;
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;
  }
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
  if (!isRunning || isPaused || activeTouchId === null) return;
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    if (touch.identifier === activeTouchId) {
      const dx = touch.clientX - lastTouchX;
      const dy = touch.clientY - lastTouchY;
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
      basket.targetX += dx;
      basket.targetY += dy;
      clampBasketTargets();
      break;
    }
  }
}, { passive: true });

function endTouch(e) {
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === activeTouchId) {
      activeTouchId = null;
      break;
    }
  }
}
canvas.addEventListener('touchend', endTouch, { passive: true });
canvas.addEventListener('touchcancel', endTouch, { passive: true });

canvas.addEventListener('mousemove', (e) => {
  if (!isRunning || isPaused) return;
  const rect = canvas.getBoundingClientRect();
  basket.targetX = e.clientX - rect.left - basket.width / 2;
  basket.targetY = e.clientY - rect.top - basket.height / 2;
  clampBasketTargets();
});

const keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false };
window.addEventListener('keydown', (e) => { if (e.key in keys) keys[e.key] = true; });
window.addEventListener('keyup', (e) => { if (e.key in keys) keys[e.key] = false; });

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function setTipUI(mode, icon, message) {
  tipBar.className = 'floating-tip-pill';
  if (mode) tipBar.classList.add(mode);
  tipIcon.textContent = icon;
  tipText.textContent = message;
}

// =========================================================
// بدء المرحلة والعودة للخريطة
// =========================================================
function startStageRun() {
  handleUserGestureAudio();
  stopBabyDanceMusic();
  stopBossMusic();
  stopTensePreBossMusic();

  startOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  shopOverlay.classList.add('hidden');
  guideOverlay.classList.add('hidden');
  exitConfirmOverlay.classList.add('hidden');
  bossBanner.classList.add('hidden');

  gameHud.classList.remove('hidden');
  tipBar.classList.remove('hidden');
  timerTag.classList.remove('tense');

  currentGameScore = 0;
  heartsRemaining = MAX_HEARTS;
  babyHealth = 75;
  babyDrainPenalty = 0;
  paddle.cooldown = 0;
  paddle.swingAnim = 0;
  elapsedSeconds = 0;
  stage3Phase = 'normal';
  spawnTimer = 0;
  sideSpawnTimer = 0;
  bossSkyFoodTimer = 0;
  activeTouchId = null;
  screenShake = 0;

  volcanoThemeActive = false;
  volcanoEruptTimer = 0;
  volcanoFlashAlpha = 0;
  lavaParticles = [];

  items = [];
  sideWarnings = [];
  popups = [];

  boss.state = 'idle';
  boss.type = selectedStage;
  boss.y = -130;
  boss.wavesThrown = 0;
  boss.burstRemaining = 0;

  resizeCanvas();
  basket.targetX = (canvas.width - basket.width) / 2;
  basket.targetY = canvas.height - basket.height - 28;
  clampBasketTargets();
  basket.x = basket.targetX;
  basket.y = basket.targetY;

  timerDisplay.textContent = '00:00';
  if (selectedStage === 1) {
    setTipUI('', '🦈', 'المرحلة 1: اجمعي الأكل الصحي لحد 1000 نقطة لمواجهة الوحش!');
  } else if (selectedStage === 2) {
    setTipUI('', '🕶️', 'المرحلة 2: سرعة أعلى! الوحش الراقص أبو نضارة مستنيك عند 1200!');
  } else {
    setTipUI('', '🏓', 'المرحلة 3: أكل الرضيع بسرعة! الأكل المضر بيسرّع تدهور حالته!');
  }
  updateAllUI();

  isRunning = true;
  isPaused = false;
  document.getElementById('pauseBtn').textContent = '⏸️';
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function returnToLobby() {
  isRunning = false;
  isPaused = false;
  volcanoThemeActive = false;
  boss.state = 'idle';
  stopBossMusic();
  stopTensePreBossMusic();

  gameHud.classList.add('hidden');
  tipBar.classList.add('hidden');
  bossBanner.classList.add('hidden');
  exitConfirmOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  shopOverlay.classList.add('hidden');

  startOverlay.classList.remove('hidden');
  updateAllUI();
  startLobbyBabyAnimation();
}

document.getElementById('startBtn').addEventListener('click', startStageRun);
document.getElementById('restartBtn').addEventListener('click', startStageRun);
document.getElementById('gameOverHomeBtn').addEventListener('click', returnToLobby);

document.getElementById('exitGameBtn').addEventListener('click', () => {
  if (!isRunning) return;
  isPaused = true;
  exitConfirmOverlay.classList.remove('hidden');
});

document.getElementById('confirmExitYes').addEventListener('click', returnToLobby);
document.getElementById('confirmExitNo').addEventListener('click', () => {
  exitConfirmOverlay.classList.add('hidden');
  isPaused = false;
  document.getElementById('pauseBtn').textContent = '⏸️';
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
});

document.getElementById('pauseBtn').addEventListener('click', () => {
  if (!isRunning) return;
  isPaused = !isPaused;
  document.getElementById('pauseBtn').textContent = isPaused ? '▶️' : '⏸️';
  if (!isPaused) {
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }
});

document.getElementById('soundBtn').addEventListener('click', (e) => {
  soundEnabled = !soundEnabled;
  e.target.textContent = soundEnabled ? '🔊' : '🔇';
  lobbyMusicBtn.textContent = soundEnabled ? '🎵' : '🔇';
  if (soundEnabled) {
    handleUserGestureAudio();
  } else {
    stopBossMusic();
    stopTensePreBossMusic();
  }
});

let levelToastTimer = null;
function triggerLevelUp(newLvl) {
  playTone('levelup');
  levelUpToast.textContent = `🎉 أسطورة! حسابك وصل ليفل ${newLvl}`;
  levelUpToast.classList.add('show');
  clearTimeout(levelToastTimer);
  levelToastTimer = setTimeout(() => levelUpToast.classList.remove('show'), 2400);
}

function finishStageRun(isVictory) {
  const lostDuringStage3Boss = (selectedStage === 3 && boss.state !== 'idle');
  isRunning = false;
  volcanoThemeActive = false;
  boss.state = 'idle';
  stopBossMusic();
  stopTensePreBossMusic();
  bossBanner.classList.add('hidden');
  tipBar.classList.add('hidden');

  const endIcon = document.getElementById('endScreenIcon');
  const endTitle = document.getElementById('endScreenTitle');
  const endSub = document.getElementById('endScreenSub');

  if (isVictory) {
    playTone('levelup');
    endIcon.textContent = '🏆';
    endTitle.textContent = `مبروك! خلصت المرحلة ${selectedStage}!`;
    endTitle.classList.add('win');

    if (!savedData.completedStages.includes(selectedStage)) {
      savedData.completedStages.push(selectedStage);
    }
    if (selectedStage < 3 && !savedData.unlockedStages.includes(selectedStage + 1)) {
      savedData.unlockedStages.push(selectedStage + 1);
      selectedStage = selectedStage + 1;
      endSub.textContent = `تم فتح المرحلة ${selectedStage} في الخريطة وجاهزة للعب! 🎉`;
    } else {
      endSub.textContent = 'أنت بطل التغذية بلا منازع! 👑';
    }
    persistState();
  } else {
    playTone('gameover');
    if (selectedStage === 3 && !lostDuringStage3Boss) {
      endIcon.textContent = '👶💔';
      endTitle.textContent = 'تدهورت صحة الرضيع!';
      endTitle.classList.remove('win');
      endSub.textContent = 'الرضيع احتاج أكل مفيد أسرع! ابعدي عن الأكل المضر واستغلي المضرب 🏓';
    } else if (lostDuringStage3Boss) {
      endIcon.textContent = '💔';
      endTitle.textContent = 'انتهت الـ 3 قلوب!';
      endTitle.classList.remove('win');
      endSub.textContent = 'خسرت الـ 3 قلوب قدام الوحوش! جرب مرة تانية واستغل المضرب 🏓';
    } else {
      endIcon.textContent = '💔';
      endTitle.textContent = 'انتهت القلوب!';
      endTitle.classList.remove('win');
      endSub.textContent = 'خسرت الـ 5 قلوب! جرب مرة تانية 💪';
    }
  }

  document.getElementById('gameOverStats').innerHTML = `
    🏆 سكور الجيم: <b>${currentGameScore}</b> | 👑 الأعلى: <b>${savedData.bestScore}</b><br>
    ⏱️ الوقت: <b>${formatTime(elapsedSeconds)}</b><br>
    ⭐ ليفل حسابك: <b>${currentAccountLevel}</b> | 🪙 الكوينز: <b>${savedData.coins}</b>
  `;
  gameOverOverlay.classList.remove('hidden');
}

// =========================================================
// المتجر
// =========================================================
let currentShopTab = 'themes';

document.getElementById('openShopBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  stopBabyDanceMusic();
  renderShop();
  shopOverlay.classList.remove('hidden');
});

document.getElementById('closeShopBtn').addEventListener('click', () => {
  shopOverlay.classList.add('hidden');
  if (isBabyDancing && soundEnabled) startBabyDanceMusic();
});

document.getElementById('tabThemes').addEventListener('click', (e) => {
  currentShopTab = 'themes';
  e.target.classList.add('active');
  document.getElementById('tabBaskets').classList.remove('active');
  renderShop();
});

document.getElementById('tabBaskets').addEventListener('click', (e) => {
  currentShopTab = 'baskets';
  e.target.classList.add('active');
  document.getElementById('tabThemes').classList.remove('active');
  renderShop();
});

function renderShop() {
  updateAllUI();
  shopGrid.innerHTML = '';

  const list = currentShopTab === 'themes' ? THEMES : BASKETS;
  const unlockedList = currentShopTab === 'themes' ? savedData.unlockedThemes : savedData.unlockedBaskets;
  const equippedId = currentShopTab === 'themes' ? savedData.equippedTheme : savedData.equippedBasket;

  list.forEach(item => {
    const isUnlocked = unlockedList.includes(item.id);
    const isEquipped = equippedId === item.id;
    const isLevelLocked = !isUnlocked && currentAccountLevel < item.minLevel;

    const card = document.createElement('div');
    card.className = `shop-item ${isEquipped ? 'equipped' : ''} ${isLevelLocked ? 'locked' : ''}`;

    const bgStyle = currentShopTab === 'themes'
      ? `background: linear-gradient(180deg, ${item.skyTop}, ${item.skyMid}, ${item.ground});`
      : `background: linear-gradient(135deg, ${item.c1}, ${item.c2}); color: white;`;

    let btnHTML = '';
    if (isEquipped) btnHTML = `<button class="item-action btn-equipped" disabled>مُفعّل حالياً ✅</button>`;
    else if (isUnlocked) btnHTML = `<button class="item-action btn-equip" data-id="${item.id}" data-action="equip">اختيار ✨</button>`;
    else if (isLevelLocked) btnHTML = `<button class="item-action btn-locked" disabled>🔒 مطلوب ليفل ${item.minLevel}</button>`;
    else btnHTML = `<button class="item-action btn-buy" data-id="${item.id}" data-action="buy">شراء بـ ${item.price} 🪙</button>`;

    card.innerHTML = `
      <div class="item-preview" style="${bgStyle}">${isLevelLocked ? '🔒' : item.icon}</div>
      <div class="item-title">${item.name}</div>
      ${btnHTML}
    `;
    shopGrid.appendChild(card);
  });

  shopGrid.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const list = currentShopTab === 'themes' ? THEMES : BASKETS;
      const item = list.find(x => x.id === id);
      if (!item) return;

      if (action === 'buy') {
        if (currentAccountLevel < item.minLevel) return;
        if (savedData.coins < item.price) {
          alert(`معاك ${savedData.coins} كوين بس، محتاج ${item.price} كوين! 💪`);
          return;
        }
        savedData.coins -= item.price;
        if (currentShopTab === 'themes') {
          savedData.unlockedThemes.push(id);
          savedData.equippedTheme = id;
        } else {
          savedData.unlockedBaskets.push(id);
          savedData.equippedBasket = id;
        }
        playTone('levelup');
      } else if (action === 'equip') {
        if (currentShopTab === 'themes') savedData.equippedTheme = id;
        else savedData.equippedBasket = id;
        playTone('good');
      }
      persistState();
      renderShop();
    });
  });
}

// =========================================================
// اختيار الأكلات حسب التدرج
// =========================================================
function getAvailableGoodFoodPool() {
  if (currentGameScore >= 600 || selectedStage === 3) {
    return [...FOODS_TIER_10, ...FOODS_TIER_15, ...FOODS_TIER_20];
  } else if (currentGameScore >= 250) {
    return [...FOODS_TIER_10, ...FOODS_TIER_15];
  }
  return FOODS_TIER_10;
}

let tipTimeout = null;
function showTip(item) {
  if (boss.state !== 'idle') return;
  clearTimeout(tipTimeout);
  if (item.good) {
    setTipUI('tip-good', item.emoji, `${item.name}: ${item.tip}`);
  } else {
    setTipUI('tip-bad', '😭', `واء! (${item.name}): ${item.tip}`);
  }
  tipTimeout = setTimeout(() => {
    if (boss.state === 'idle') {
      setTipUI('', '🪙', selectedStage === 3 ? 'أكل الرضيع باستمرار! المضرب بيصد كل 5 ثواني' : 'كل 20 نقطة = 1 كوين .. احذر الهجمات الجانبية!');
    }
  }, 2300);
}

function addPopup(x, y, text, color) {
  popups.push({ x, y, text, color, alpha: 1, vy: -60 });
}

function spawnTopFood(forceGood = false) {
  const goodRatio = selectedStage === 3 ? 0.46 : (selectedStage === 2 ? 0.50 : 0.52);
  const pool = (forceGood || Math.random() < goodRatio) ? getAvailableGoodFoodPool() : BAD_FOODS;
  const template = pool[Math.floor(Math.random() * pool.length)];
  const radius = 31;
  const padding = 38;
  const x = padding + Math.random() * Math.max(20, canvas.width - padding * 2);

  const scoreSpeedBonus = Math.min(130, currentGameScore * 0.12);
  const stageSpeedMult = selectedStage === 1 ? 1.18 : (selectedStage === 2 ? 1.32 : (stage3Phase === 'frenzy' ? 1.65 : 1.4));
  const speed = (210 + Math.random() * 80) * stageSpeedMult + scoreSpeedBonus;

  items.push({
    ...template,
    x,
    y: -38,
    vx: 0,
    vy: speed,
    ax: 0,
    radius,
    isSide: false
  });
}

function spawnStage3RandomBadFood() {
  const template = BAD_FOODS[Math.floor(Math.random() * BAD_FOODS.length)];
  const mode = Math.floor(Math.random() * 3);
  const mult = stage3Phase === 'frenzy' ? 1.35 : 1.0;
  let x, y, vx, vy;

  if (mode === 0) {
    x = 30 + Math.random() * (canvas.width - 60);
    y = -32;
    vx = (Math.random() - 0.5) * 190 * mult;
    vy = (250 + Math.random() * 110) * mult;
  } else if (mode === 1) {
    x = -32;
    y = canvas.height * (0.15 + Math.random() * 0.55);
    vx = (240 + Math.random() * 110) * mult;
    vy = (80 + Math.random() * 120) * mult;
  } else {
    x = canvas.width + 32;
    y = canvas.height * (0.15 + Math.random() * 0.55);
    vx = -(240 + Math.random() * 110) * mult;
    vy = (80 + Math.random() * 120) * mult;
  }

  items.push({
    ...template,
    x,
    y,
    vx,
    vy,
    ax: 0,
    radius: 30,
    isSide: true
  });
}

function queueSideAttack() {
  const fromLeft = Math.random() < 0.5;
  const targetY = canvas.height * (0.24 + Math.random() * 0.58);
  sideWarnings.push({ fromLeft, y: targetY, timer: 0.55 });
}

function launchSideFood(fromLeft, startY) {
  const template = BAD_FOODS[Math.floor(Math.random() * BAD_FOODS.length)];
  const speedX = (275 + (selectedStage === 2 ? 55 : 0)) * (fromLeft ? 1 : -1);
  items.push({
    ...template,
    x: fromLeft ? -32 : canvas.width + 32,
    y: startY,
    vx: speedX,
    vy: 50 + Math.random() * 45,
    ax: 0,
    radius: 30,
    isSide: true
  });
}

// =========================================================
// منطق الوحوش
// =========================================================
function startBossSequence(bossType) {
  boss.type = bossType;
  boss.state = 'warning';
  boss.timer = 3.5;
  boss.x = canvas.width / 2;
  boss.y = -130;
  boss.targetX = canvas.width / 2;
  boss.targetY = 125;
  boss.moveTimer = 0.5;
  boss.dancePhase = 0;
  boss.handSide = 1;
  boss.handSwing = 0;
  boss.wavesThrown = 0;
  boss.burstRemaining = 0;
  boss.throwTimer = 0;
  boss.throwTimer2 = 0;
  boss.maxWaves = bossType === 1 ? 28 : (bossType === 2 ? 32 : 46);
  boss.scale = 1;
  screenShake = 12;

  items = [];
  sideWarnings = [];
  bossBanner.classList.remove('hidden');

  if (bossType === 1) {
    bossBanner.textContent = '🦈⚠️ تحذير! البيبي القرش المشاغب قادم ⚠️🦈';
    setTipUI('tip-boss', '🦈', 'بيبي شارك دو دو دو! استعد لتفادي هجماته السريعة!');
  } else if (bossType === 2) {
    bossBanner.textContent = '🕶️🕺 تحذير! البيبي الراقص أبو نضارة دخل الساحة 🕺🕶️';
    setTipUI('tip-boss', '🕶️', 'احذر! بيرقص بحركات عشوائية وبيرمي الأكل الضار بكرف ومستقيم!');
  } else {
    // عند ظهور الوحش في المرحلة 3: نرجعها 3 قلوب فقط!
    heartsRemaining = 3;
    volcanoThemeActive = true;
    triggerVolcanoExplosion();
    bossBanner.textContent = '🌋🍦🍔 البراكين بتنفجر! معاك 3 قلوب قدام الوحوش! 🎶';
    setTipUI('tip-boss', '❤️', 'رجعت 3 قلوب قدام الوحوش! تفادى هجماتهم واستغل المضرب 🏓');
    updateAllUI();
  }

  playBossEntranceMusic(bossType);
}

function throwBoss2HandProjectile(pattern) {
  const badTemplate = BAD_FOODS[Math.floor(Math.random() * BAD_FOODS.length)];
  const basketCenterX = basket.x + basket.width / 2;
  const basketCenterY = basket.y + basket.height / 2;

  boss.handSide = basketCenterX >= boss.x ? 1 : -1;
  boss.handSwing = 1.0;

  const handX = boss.x + boss.handSide * 52;
  const handY = boss.y + 12;

  const dy = Math.max(150, basketCenterY - handY);
  const flightTime = Math.max(0.75, Math.min(1.25, dy / 350));

  let vx = 0;
  let vy = dy / flightTime;
  let ax = 0;

  if (pattern === 'curve') {
    const curveDir = (handX > canvas.width / 2) ? -1 : 1;
    ax = (260 + Math.random() * 140) * curveDir;
    vx = ((basketCenterX - handX) / flightTime) - 0.5 * ax * flightTime;
  } else {
    const dx = (basketCenterX + (Math.random() * 50 - 25)) - handX;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 385;
    vx = (dx / dist) * speed;
    vy = Math.max(270, (dy / dist) * speed);
  }

  items.push({
    ...badTemplate,
    x: handX,
    y: handY,
    vx,
    vy,
    ax,
    radius: 28,
    isBossShot: true,
    isCurved: pattern === 'curve'
  });
}

function updateBoss(dt) {
  if (boss.state === 'idle') return;

  if (boss.state === 'warning') {
    boss.timer -= dt;
    screenShake = 6;
    if (boss.timer <= 0) {
      boss.state = 'fighting';
      bossBanner.classList.add('hidden');
      if (boss.type !== 3) {
        fadeOutBossMusic();
        setTipUI('tip-boss', '😈', 'الفايت بدأ! اهرب بالسلة في كل الاتجاهات!');
      } else {
        spawnTopFood(true);
        spawnTopFood(true);
        setTipUI('tip-boss', '🍦', 'حافظ على الـ 3 قلوب! تفادى الآيس كريم والفاست فود بالمضرب 🏓');
      }
    }
    return;
  }

  if (boss.state === 'fighting') {
    if (boss.type === 1) {
      boss.y += (120 - boss.y) * Math.min(1, 4 * dt);
      boss.x += boss.dir * 165 * dt;
      if (boss.x > canvas.width - 75) { boss.x = canvas.width - 75; boss.dir = -1; }
      else if (boss.x < 75) { boss.x = 75; boss.dir = 1; }

      boss.throwTimer += dt;
      if (boss.throwTimer >= 0.48 && boss.wavesThrown < boss.maxWaves) {
        boss.throwTimer = 0;
        boss.wavesThrown++;
        const badTemplate = BAD_FOODS[Math.floor(Math.random() * BAD_FOODS.length)];
        const targetBasketX = basket.x + basket.width / 2 + (Math.random() * 85 - 42);
        const targetBasketY = basket.y + basket.height / 2;
        const dx = targetBasketX - boss.x;
        const dy = Math.max(120, targetBasketY - boss.y);
        const dist = Math.hypot(dx, dy) || 1;
        items.push({
          ...badTemplate,
          x: boss.x,
          y: boss.y + 30,
          vx: (dx / dist) * 355 * 0.75,
          vy: Math.max(265, (dy / dist) * 355),
          ax: 0,
          radius: 28,
          isBossShot: true
        });
      }
    } else if (boss.type === 2) {
      boss.dancePhase += dt * 12;
      boss.handSwing = Math.max(0, boss.handSwing - dt * 4);
      boss.moveTimer -= dt;
      if (boss.moveTimer <= 0) {
        boss.moveTimer = 0.35 + Math.random() * 0.75;
        boss.targetX = 72 + Math.random() * Math.max(40, canvas.width - 144);
        boss.targetY = 90 + Math.random() * Math.min(135, canvas.height * 0.22);
        boss.moveLerp = 3.5 + Math.random() * 6.5;
      }
      boss.x += (boss.targetX - boss.x) * Math.min(1, boss.moveLerp * dt);
      boss.y += (boss.targetY - boss.y) * Math.min(1, boss.moveLerp * dt);

      if (boss.wavesThrown < boss.maxWaves) {
        if (boss.burstRemaining > 0) {
          boss.throwTimer -= dt;
          if (boss.throwTimer <= 0) {
            boss.burstRemaining--;
            boss.wavesThrown++;
            throwBoss2HandProjectile((boss.burstRemaining % 2 === 0) ? 'straight' : 'curve');
            boss.throwTimer = 0.17;
          }
        } else {
          boss.throwTimer += dt;
          if (boss.throwTimer >= 0.75) {
            boss.throwTimer = 0;
            const roll = Math.random();
            if (roll < 0.42) {
              boss.burstRemaining = Math.min(3, boss.maxWaves - boss.wavesThrown);
              boss.throwTimer = 0.01;
            } else if (roll < 0.74) {
              boss.wavesThrown++;
              throwBoss2HandProjectile('curve');
            } else {
              boss.wavesThrown++;
              throwBoss2HandProjectile('straight');
            }
          }
        }
      }
    } else {
      boss.dancePhase += dt * 11;
      boss.y += (115 - boss.y) * Math.min(1, 4 * dt);

      const leftVendorX = canvas.width * 0.24 + Math.sin(boss.dancePhase * 0.45) * 32;
      const rightVendorX = canvas.width * 0.76 - Math.sin(boss.dancePhase * 0.45) * 32;

      boss.throwTimer += dt;
      if (boss.throwTimer >= 0.35 && boss.wavesThrown < boss.maxWaves) {
        boss.throwTimer = 0;
        boss.wavesThrown++;
        const iceCreams = [
          { emoji: '🍦', name: 'آيس كريم', good: false, tip: 'سكر ودهون مجمدة!' },
          { emoji: '🍨', name: 'آيس كريم كاسات', good: false, tip: 'سعرات عالية وسكر!' },
          { emoji: '🍧', name: 'مثلجات ملونة', good: false, tip: 'ألوان صناعية وسكر!' }
        ];
        const ic = iceCreams[Math.floor(Math.random() * iceCreams.length)];
        const targetX = basket.x + basket.width / 2 + (Math.random() * 64 - 32);
        const dx = targetX - leftVendorX;
        const dy = Math.max(140, basket.y - boss.y);
        const dist = Math.hypot(dx, dy) || 1;
        const fastSpeed = 460;

        items.push({
          ...ic,
          x: leftVendorX,
          y: boss.y + 25,
          vx: (dx / dist) * fastSpeed * 0.85,
          vy: Math.max(340, (dy / dist) * fastSpeed),
          ax: 0,
          radius: 27,
          isBossShot: true
        });
      }

      boss.throwTimer2 += dt;
      if (boss.throwTimer2 >= 0.48 && boss.wavesThrown < boss.maxWaves) {
        boss.throwTimer2 = 0;
        boss.wavesThrown++;
        const fastFoods = BAD_FOODS.slice(0, 8);
        const ff = fastFoods[Math.floor(Math.random() * fastFoods.length)];
        const targetX = basket.x + basket.width / 2 + (Math.random() * 40 - 20);
        const dy = Math.max(140, basket.y - boss.y);
        const flightTime = 0.88;
        const ax = (Math.random() < 0.5 ? -210 : 140);
        const vx = ((targetX - rightVendorX) / flightTime) - 0.5 * ax * flightTime;

        items.push({
          ...ff,
          x: rightVendorX,
          y: boss.y + 25,
          vx,
          vy: dy / flightTime,
          ax,
          radius: 29,
          isBossShot: true,
          isCurved: true
        });
      }

      bossSkyFoodTimer += dt;
      if (bossSkyFoodTimer >= 1.1) {
        bossSkyFoodTimer = 0;
        spawnTopFood(true);
      }
    }

    if (boss.wavesThrown >= boss.maxWaves && items.filter(it => !it.good).length === 0) {
      boss.state = 'defeated';
      boss.timer = 2.0;
      fadeOutBossMusic();
      playTone('boss_cry');

      const bonus = boss.type === 1 ? 200 : (boss.type === 2 ? 300 : 450);
      currentGameScore += bonus;
      savedData.totalXP += bonus;
      if (currentGameScore > savedData.bestScore) savedData.bestScore = currentGameScore;

      savedData.coinBuffer += bonus;
      const earned = Math.floor(savedData.coinBuffer / 20);
      savedData.coins += earned;
      savedData.coinBuffer %= 20;

      const prevLvl = currentAccountLevel;
      const newLvl = getInfiniteLevelInfo(savedData.totalXP).lvl;
      if (newLvl > prevLvl) triggerLevelUp(newLvl);

      addPopup(canvas.width / 2, canvas.height / 2, `+${bonus} نقطة الفوز! 🏆`, '#22c55e');
      persistState();
      updateAllUI();
    }
    return;
  }

  if (boss.state === 'defeated') {
    boss.timer -= dt;
    boss.y -= 170 * dt;
    boss.scale = Math.max(0.1, boss.scale - 0.45 * dt);
    if (boss.timer <= 0) {
      boss.state = 'idle';
      finishStageRun(true);
    }
  }
}

function drawBoss(now) {
  if (boss.state === 'idle' || boss.state === 'warning') return;

  if (boss.type === 3) {
    const leftX = canvas.width * 0.24 + Math.sin(boss.dancePhase * 0.45) * 32;
    const rightX = canvas.width * 0.76 - Math.sin(boss.dancePhase * 0.45) * 32;
    const bob = Math.sin(boss.dancePhase) * 6;

    ctx.save();
    ctx.translate(leftX, boss.y + bob);
    ctx.scale(boss.scale, boss.scale);
    ctx.font = '74px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(boss.state === 'defeated' ? '😭' : '👨‍🍳', 0, 0);
    ctx.font = '32px Arial';
    ctx.fillText('🍦', -30, 16);
    ctx.fillText('🍨', 30, -18);
    ctx.restore();

    ctx.save();
    ctx.translate(rightX, boss.y - bob);
    ctx.scale(boss.scale, boss.scale);
    ctx.font = '74px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(boss.state === 'defeated' ? '😭' : '🧑‍🍳', 0, 0);
    ctx.font = '32px Arial';
    ctx.fillText('🍔', 30, 16);
    ctx.fillText('🍟', -30, -18);
    ctx.restore();

    if (boss.state === 'fighting') {
      const rem = Math.max(0, (boss.maxWaves - boss.wavesThrown) / boss.maxWaves);
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 - 70, boss.y + 48, 140, 11, 5);
      ctx.fill();
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 - 68, boss.y + 50, 136 * rem, 7, 3);
      ctx.fill();
    }
    return;
  }

  ctx.save();
  ctx.translate(boss.x, boss.y);

  if (boss.type === 2 && boss.state === 'fighting') {
    const squashX = 1 + Math.sin(boss.dancePhase) * 0.09;
    const squashY = 1 - Math.sin(boss.dancePhase) * 0.09;
    ctx.scale(boss.scale * squashX, boss.scale * squashY);
    ctx.rotate(Math.sin(boss.dancePhase * 0.5) * 0.16);
  } else {
    ctx.scale(boss.scale, boss.scale);
    ctx.rotate(Math.sin(now * 0.015) * 0.08);
  }

  const auraRadius = boss.radius + 14;
  ctx.fillStyle = boss.state === 'defeated'
    ? 'rgba(56, 189, 248, 0.25)'
    : (boss.type === 1 ? 'rgba(239, 68, 68, 0.28)' : 'rgba(168, 85, 247, 0.32)');
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '92px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(boss.state === 'defeated' ? '😭' : '👶', 0, 0);

  if (boss.state === 'fighting') {
    if (boss.type === 1) {
      ctx.font = '34px Arial';
      ctx.fillText('🦈', 0, -56);
    } else {
      ctx.save();
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-34, -14, 29, 17, 4);
      ctx.roundRect(5, -14, 29, 17, 4);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-5, -7);
      ctx.lineTo(5, -7);
      ctx.stroke();
      ctx.restore();

      ctx.font = '24px Arial';
      ctx.fillText('🎵', -54, -36 + Math.sin(boss.dancePhase * 0.8) * 6);
      ctx.fillText('🎶', 54, -40 - Math.sin(boss.dancePhase * 0.8) * 6);

      ctx.save();
      ctx.translate(boss.handSide * 52, 14 - boss.handSwing * 14);
      ctx.rotate(boss.handSide * (0.3 + boss.handSwing * 0.9));
      ctx.font = '36px Arial';
      ctx.fillText('🫴', 0, 0);
      ctx.restore();
    }

    const remainingRatio = Math.max(0, (boss.maxWaves - boss.wavesThrown) / boss.maxWaves);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(-56, 54, 112, 10, 5);
    ctx.fill();

    ctx.fillStyle = boss.type === 1 ? '#ef4444' : '#a855f7';
    ctx.beginPath();
    ctx.roundRect(-54, 56, 108 * remainingRatio, 6, 3);
    ctx.fill();
  }
  ctx.restore();
}

function drawVolcanoBackdrop(dt, now) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#140303');
  grad.addColorStop(0.55, '#450a0a');
  grad.addColorStop(0.88, '#9a3412');
  grad.addColorStop(1, '#ea580c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  volcanoEruptTimer += dt;
  if (volcanoEruptTimer >= 0.72) {
    volcanoEruptTimer = 0;
    triggerVolcanoExplosion();
  }

  const volcanoes = [
    { cx: canvas.width * 0.18, w: 170, h: 112 },
    { cx: canvas.width * 0.50, w: 220, h: 148 },
    { cx: canvas.width * 0.82, w: 175, h: 108 }
  ];

  const glowPulse = 0.7 + 0.3 * Math.sin(now * 0.018);

  volcanoes.forEach(v => {
    const baseY = canvas.height;
    const topY = canvas.height - v.h;

    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(v.cx - v.w / 2, baseY);
    ctx.lineTo(v.cx - 22, topY);
    ctx.lineTo(v.cx + 22, topY);
    ctx.lineTo(v.cx + v.w / 2, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(250, 204, 21, ${glowPulse})`;
    ctx.beginPath();
    ctx.ellipse(v.cx, topY + 2, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(v.cx - 8, topY + 4);
    ctx.quadraticCurveTo(v.cx - 25, topY + v.h * 0.45, v.cx - 18, baseY);
    ctx.moveTo(v.cx + 10, topY + 4);
    ctx.quadraticCurveTo(v.cx + 30, topY + v.h * 0.5, v.cx + 24, baseY);
    ctx.stroke();
  });

  for (let i = lavaParticles.length - 1; i >= 0; i--) {
    const p = lavaParticles[i];
    p.life -= dt;
    if (p.life <= 0) {
      lavaParticles.splice(i, 1);
      continue;
    }
    if (!p.isSmoke) {
      p.vy += 320 * dt;
    } else {
      p.vy -= 35 * dt;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  if (volcanoFlashAlpha > 0) {
    ctx.fillStyle = `rgba(253, 224, 71, ${volcanoFlashAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    volcanoFlashAlpha = Math.max(0, volcanoFlashAlpha - 1.1 * dt);
  }
}

function drawBackground(dt, now) {
  if (volcanoThemeActive) {
    drawVolcanoBackdrop(dt, now);
    return;
  }

  const theme = THEMES.find(t => t.id === savedData.equippedTheme) || THEMES[0];

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, theme.skyTop);
  grad.addColorStop(0.82, theme.skyMid);
  grad.addColorStop(1, theme.ground);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (selectedStage === 3 && stage3Phase === 'frenzy') {
    const pulse = 0.1 + 0.08 * Math.sin(now * 0.015);
    ctx.fillStyle = `rgba(220, 38, 38, ${pulse})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (theme.dark) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.fillStyle = theme.cloudColor;
  clouds.forEach(c => {
    c.x += c.speed * dt;
    if (c.x - 60 > canvas.width) c.x = -60;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 18 * c.scale, 0, Math.PI * 2);
    ctx.arc(c.x + 16 * c.scale, c.y - 5 * c.scale, 22 * c.scale, 0, Math.PI * 2);
    ctx.arc(c.x + 34 * c.scale, c.y, 16 * c.scale, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawSideWarnings(dt) {
  for (let i = sideWarnings.length - 1; i >= 0; i--) {
    const w = sideWarnings[i];
    w.timer -= dt;
    const wx = w.fromLeft ? 24 : canvas.width - 24;
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(wx, w.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '900 18px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(w.fromLeft ? '➡️' : '⬅️', wx, w.y);
    ctx.restore();

    if (w.timer <= 0) {
      launchSideFood(w.fromLeft, w.y);
      sideWarnings.splice(i, 1);
    }
  }
}

function drawBasket() {
  const skin = BASKETS.find(b => b.id === savedData.equippedBasket) || BASKETS[0];
  const { x, y, width, height, tilt } = basket;

  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);

  if (selectedStage === 3) {
    ctx.save();
    const swingAngle = paddle.swingAnim > 0
      ? paddle.swingDir * Math.sin(paddle.swingAnim * Math.PI) * 1.6
      : -0.25;
    ctx.translate(0, -height / 2 - 14);
    ctx.rotate(swingAngle);

    if (paddle.cooldown <= 0) {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = paddle.cooldown <= 0 ? 1 : 0.45;
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏓', 0, 0);
    ctx.restore();
  }

  ctx.rotate(tilt);
  const hw = width / 2;
  const hh = height / 2;

  const grad = ctx.createLinearGradient(0, -hh, 0, hh);
  grad.addColorStop(0, skin.c1);
  grad.addColorStop(1, skin.c2);
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(-hw + 4, -hh + 8);
  ctx.lineTo(hw - 4, -hh + 8);
  ctx.lineTo(hw - 11, hh);
  ctx.lineTo(-hw + 11, hh);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = skin.rim;
  ctx.beginPath();
  ctx.roundRect(-hw, -hh + 3, width, 10, 5);
  ctx.fill();

  ctx.font = '17px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(skin.badge, 0, 5);

  ctx.restore();
}

function drawFood(item) {
  if (item.deflected) {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.spin || 0);
    ctx.globalAlpha = 0.7;
    ctx.font = '34px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, 0, 0);
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
  ctx.fillStyle = item.good && item.points === 20 ? '#fefce8' : '#ffffff';
  ctx.fill();

  ctx.lineWidth = 3.2;
  if (!item.good) {
    ctx.strokeStyle = item.isCurved ? '#a855f7' : '#ef4444';
  } else if (item.points === 20) {
    ctx.strokeStyle = '#eab308';
  } else if (item.points === 15) {
    ctx.strokeStyle = '#0ea5e9';
  } else {
    ctx.strokeStyle = '#22c55e';
  }
  ctx.stroke();

  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.emoji, item.x, item.y + 1);

  if (item.good) {
    ctx.font = '900 10px Cairo, sans-serif';
    ctx.fillStyle = item.points === 20 ? '#ca8a04' : (item.points === 15 ? '#0284c7' : '#16a34a');
    ctx.beginPath();
    ctx.roundRect(item.x + 12, item.y - item.radius - 2, 24, 14, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`+${item.points}`, item.x + 24, item.y - item.radius + 5);
  }

  ctx.font = 'bold 11.5px Cairo, Tahoma, sans-serif';
  const tw = ctx.measureText(item.name).width;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.beginPath();
  ctx.roundRect(item.x - tw / 2 - 6, item.y + item.radius + 2, tw + 12, 17, 8);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.fillText(item.name, item.x, item.y + item.radius + 10.5);
}

// =========================================================
// حلقة اللعبة الأساسية
// =========================================================
function gameLoop(now) {
  if (!isRunning || isPaused) return;
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  elapsedSeconds += dt;
  if (selectedStage === 3 && boss.state === 'idle') {
    const remToBoss = Math.max(0, 120 - elapsedSeconds);
    timerDisplay.textContent = `${formatTime(elapsedSeconds)} / 02:00`;
    if (remToBoss <= 30 && remToBoss > 0) timerTag.classList.add('tense');
  } else {
    timerDisplay.textContent = formatTime(elapsedSeconds);
  }

  ctx.save();
  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    screenShake = Math.max(0, screenShake - 28 * dt);
  }

  drawBackground(dt, now);
  drawBoss(now);

  const kbSpeed = 540;
  if (keys.ArrowLeft) basket.targetX -= kbSpeed * dt;
  if (keys.ArrowRight) basket.targetX += kbSpeed * dt;
  if (keys.ArrowUp) basket.targetY -= kbSpeed * dt;
  if (keys.ArrowDown) basket.targetY += kbSpeed * dt;
  clampBasketTargets();

  const prevX = basket.x;
  const smooth = Math.min(1, 26 * dt);
  basket.x += (basket.targetX - basket.x) * smooth;
  basket.y += (basket.targetY - basket.y) * smooth;
  basket.vx = (basket.x - prevX) / Math.max(0.001, dt);
  basket.tilt = Math.max(-0.18, Math.min(0.18, basket.vx * 0.00028));

  if (selectedStage === 3) {
    if (paddle.cooldown > 0) paddle.cooldown = Math.max(0, paddle.cooldown - dt);
    if (paddle.swingAnim > 0) paddle.swingAnim = Math.max(0, paddle.swingAnim - dt * 3.5);

    if (boss.state === 'idle') {
      // قبل الوحش: تدهور صحة الرضيع تدريجياً
      const baseDrain = stage3Phase === 'frenzy' ? 4.4 : 3.7;
      const totalDrain = baseDrain + babyDrainPenalty;
      babyHealth -= totalDrain * dt;

      if (babyHealth <= 0) {
        babyHealth = 0;
        updateAllUI();
        ctx.restore();
        finishStageRun(false);
        return;
      }

      if (elapsedSeconds >= 90 && elapsedSeconds < 120 && stage3Phase === 'normal') {
        stage3Phase = 'frenzy';
        startTensePreBossMusic();
        setTipUI('tip-boss', '⚡', 'آخر 30 ثانية قبل الوحش! أقصى سرعة والموسيقى اشتغلت!');
      } else if (elapsedSeconds >= 120 && stage3Phase !== 'done') {
        stage3Phase = 'done';
        stopTensePreBossMusic();
        startBossSequence(3);
      }
    }
    updateAllUI();
  }

  if (boss.state !== 'idle') {
    updateBoss(dt);
  } else {
    spawnTimer += dt;
    const stage1DynamicInt = Math.max(0.45, 0.72 - currentGameScore * 0.00022);
    const baseInterval = selectedStage === 1 ? stage1DynamicInt : (selectedStage === 2 ? 0.62 : (stage3Phase === 'frenzy' ? 0.42 : 0.56));
    if (spawnTimer >= baseInterval) {
      spawnTimer = 0;
      spawnTopFood();
    }

    if (selectedStage === 3) {
      sideSpawnTimer += dt;
      const randBadInt = stage3Phase === 'frenzy' ? 0.85 : 1.35;
      if (sideSpawnTimer >= randBadInt) {
        sideSpawnTimer = 0;
        spawnStage3RandomBadFood();
      }
    } else if (currentGameScore >= 150) {
      sideSpawnTimer += dt;
      const sideInt = selectedStage === 2 ? 2.1 : 2.6;
      if (sideSpawnTimer >= sideInt) {
        sideSpawnTimer = 0;
        queueSideAttack();
      }
    }
  }

  drawSideWarnings(dt);

  const basketCenterX = basket.x + basket.width / 2;

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.ax) item.vx += item.ax * dt;
    item.x += (item.vx || 0) * dt;
    item.y += item.vy * dt;

    if (item.deflected) {
      item.spin = (item.spin || 0) + 14 * dt;
      drawFood(item);
      if (item.y < -80 || item.x < -100 || item.x > canvas.width + 100) {
        items.splice(i, 1);
      }
      continue;
    }

    if (selectedStage === 3 && !item.good && paddle.cooldown <= 0) {
      const distToBasket = Math.hypot(item.x - basketCenterX, item.y - (basket.y - 8));
      if (distToBasket < 105) {
        paddle.cooldown = paddle.maxCooldown;
        paddle.swingAnim = 1.0;
        paddle.swingDir = item.x >= basketCenterX ? 1 : -1;

        item.deflected = true;
        item.vx = paddle.swingDir * 480;
        item.vy = -420;
        item.ax = 0;

        currentGameScore += 5;
        savedData.totalXP += 5;
        if (currentGameScore > savedData.bestScore) savedData.bestScore = currentGameScore;

        playTone('paddle');
        addPopup(item.x, item.y - 10, '💥 صدّة المضرب! +5', '#38bdf8');
        persistState();
        updateAllUI();
        drawFood(item);
        continue;
      }
    }

    drawFood(item);

    const caught =
      item.y + item.radius * 0.85 >= basket.y + 4 &&
      item.y - item.radius * 0.85 <= basket.y + basket.height &&
      item.x + item.radius * 0.55 >= basket.x &&
      item.x - item.radius * 0.55 <= basket.x + basket.width;

    if (caught) {
      if (item.good) {
        const pts = item.points || 10;
        currentGameScore += pts;
        savedData.totalXP += pts;
        if (currentGameScore > savedData.bestScore) savedData.bestScore = currentGameScore;

        savedData.coinBuffer += pts;
        if (savedData.coinBuffer >= 20) {
          const earned = Math.floor(savedData.coinBuffer / 20);
          savedData.coins += earned;
          savedData.coinBuffer %= 20;
          addPopup(basketCenterX, basket.y - 36, `+${earned} 🪙`, '#eab308');
        }

        if (selectedStage === 3 && boss.state === 'idle') {
          const heal = pts === 20 ? 16 : (pts === 15 ? 12 : 8);
          babyHealth = Math.min(100, babyHealth + heal);
        }

        const prevLvl = currentAccountLevel;
        const newLvl = getInfiniteLevelInfo(savedData.totalXP).lvl;
        if (newLvl > prevLvl) triggerLevelUp(newLvl);

        playTone('good');
        const popColor = pts === 20 ? '#eab308' : (pts === 15 ? '#0ea5e9' : '#16a34a');
        addPopup(basketCenterX, basket.y - 10, `+${pts}`, popColor);
      } else {
        currentGameScore = Math.max(0, currentGameScore - 5);
        screenShake = 9;
        playTone('bad');

        if (selectedStage === 3 && boss.state === 'idle') {
          babyHealth = Math.max(0, babyHealth - 14);
          babyDrainPenalty += 0.75;
          addPopup(basketCenterX, basket.y - 10, 'واء! -14% وتدهور أسرع! 👶', '#ef4444');
        } else {
          heartsRemaining = Math.max(0, heartsRemaining - 1);
          addPopup(basketCenterX, basket.y - 10, 'واء! -5 | -1 ❤️', '#ef4444');
        }
      }

      persistState();
      updateAllUI();
      showTip(item);
      items.splice(i, 1);

      if (selectedStage === 3 && boss.state === 'idle' && babyHealth <= 0) {
        ctx.restore();
        finishStageRun(false);
        return;
      }
      if ((selectedStage !== 3 || boss.state !== 'idle') && heartsRemaining <= 0) {
        ctx.restore();
        finishStageRun(false);
        return;
      }

      if (boss.state === 'idle') {
        if (selectedStage === 1 && currentGameScore >= 1000) {
          startBossSequence(1);
        } else if (selectedStage === 2 && currentGameScore >= 1200) {
          startBossSequence(2);
        }
      }
      continue;
    }

    if (item.y - item.radius > canvas.height + 45 || item.x < -100 || item.x > canvas.width + 100) {
      items.splice(i, 1);
    }
  }

  drawBasket();

  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y += p.vy * dt;
    p.alpha -= dt * 1.1;
    if (p.alpha <= 0) {
      popups.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.font = '900 17px Cairo, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  }

  ctx.restore();
  requestAnimationFrame(gameLoop);
}
