// دعم roundRect للمتصفحات القديمة
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

// عناصر الواجهة
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvasContainer');

// عناصر الـ HUD جوه الجيم
const gameHud = document.getElementById('gameHud');
const gameScoreDisplay = document.getElementById('gameScoreDisplay');
const hudCoinsDisplay = document.getElementById('hudCoinsDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const livesDisplay = document.getElementById('livesDisplay');

// عناصر الشاشة الرئيسية (Lobby)
const startOverlay = document.getElementById('startOverlay');
const mainLevelDisplay = document.getElementById('mainLevelDisplay');
const mainXpText = document.getElementById('mainXpText');
const mainXpFill = document.getElementById('mainXpFill');
const mainCoinsDisplay = document.getElementById('mainCoinsDisplay');
const bestScoreBadge = document.getElementById('bestScoreBadge');
const lobbyMusicBtn = document.getElementById('lobbyMusicBtn');

// مسرح البيبي اللي بيكربش ويرقص
const babyStage = document.getElementById('babyStage');
const babyActor = document.getElementById('babyActor');

// التنبيهات والشاشات التانية
const tipBar = document.getElementById('tipBar');
const tipIcon = document.getElementById('tipIcon');
const tipText = document.getElementById('tipText');
const levelUpToast = document.getElementById('levelUpToast');
const bossBanner = document.getElementById('bossBanner');
const exitConfirmOverlay = document.getElementById('exitConfirmOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const shopOverlay = document.getElementById('shopOverlay');
const shopGrid = document.getElementById('shopGrid');

// توليد جزيئات متحركة في الخلفية
(function initTechParticles() {
  const holder = document.getElementById('techParticles');
  const icons = ['🥛', '🌴', '🥣', '🍼', '🧸', '✨', '💧', '🥚'];
  for (let i = 0; i < 14; i++) {
    const el = document.createElement('div');
    el.className = 'tech-particle';
    el.textContent = icons[i % icons.length];
    el.style.left = `${Math.random() * 94}%`;
    el.style.animationDuration = `${6 + Math.random() * 8}s`;
    el.style.animationDelay = `${-Math.random() * 10}s`;
    holder.appendChild(el);
  }
})();

// =========================================================
// المتجر (منتجات مقفولة بليفل + أسعار كوينز)
// =========================================================
const THEMES = [
  {
    id: 'morning',
    name: 'الصباح المشرق',
    price: 0,
    minLevel: 1,
    icon: '☀️',
    skyTop: '#e0f2fe',
    skyMid: '#fefce8',
    ground: '#dcfce7',
    cloudColor: 'rgba(255, 255, 255, 0.8)',
    dark: false
  },
  {
    id: 'cyber',
    name: 'المختبر التقني',
    price: 1000,
    minLevel: 1,
    icon: '🧬',
    skyTop: '#020617',
    skyMid: '#0f172a',
    ground: '#1e293b',
    cloudColor: 'rgba(56, 189, 248, 0.14)',
    dark: true
  },
  {
    id: 'night',
    name: 'ليالي النجوم',
    price: 1600,
    minLevel: 3,
    icon: '🌙',
    skyTop: '#090d16',
    skyMid: '#1e1b4b',
    ground: '#111827',
    cloudColor: 'rgba(148, 163, 184, 0.16)',
    dark: true
  },
  {
    id: 'spring',
    name: 'حديقة الزهور',
    price: 2400,
    minLevel: 5,
    icon: '🌸',
    skyTop: '#fce7f3',
    skyMid: '#fdf2f8',
    ground: '#bbf7d0',
    cloudColor: 'rgba(255, 255, 255, 0.85)',
    dark: false
  },
  {
    id: 'sunset',
    name: 'غروب الذهب',
    price: 3500,
    minLevel: 8,
    icon: '🌅',
    skyTop: '#fed7aa',
    skyMid: '#fecdd3',
    ground: '#fde68a',
    cloudColor: 'rgba(255, 247, 237, 0.7)',
    dark: false
  },
  {
    id: 'galaxy',
    name: 'مجرة السديم',
    price: 5000,
    minLevel: 12,
    icon: '🌌',
    skyTop: '#020617',
    skyMid: '#3b0764',
    ground: '#1e1b4b',
    cloudColor: 'rgba(216, 180, 254, 0.15)',
    dark: true
  }
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
// حفظ البيانات على الجهاز
// =========================================================
const STATE_KEY = 'nursing_mom_game_state_v5';
let savedData = {
  totalXP: 0,
  bestScore: 0,
  coins: 0,
  coinBuffer: 0,
  unlockedThemes: ['morning'],
  unlockedBaskets: ['classic'],
  equippedTheme: 'morning',
  equippedBasket: 'classic'
};

try {
  const raw = localStorage.getItem(STATE_KEY);
  if (raw) {
    savedData = { ...savedData, ...JSON.parse(raw) };
  }
} catch (e) {}

function persistState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(savedData));
  } catch (e) {}
}

// =========================================================
// نظام الليفلات اللانهائي فائق الصعوبة
// =========================================================
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
let currentGameScore = 0;
const MAX_HEARTS = 5;
let heartsRemaining = MAX_HEARTS;

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

  let heartsHTML = '';
  for (let i = 0; i < MAX_HEARTS; i++) {
    heartsHTML += i < heartsRemaining ? '❤️' : '<span class="heart-lost">🖤</span>';
  }
  livesDisplay.innerHTML = heartsHTML;
}
updateAllUI();

// =========================================================
// محرك الصوت والموسيقى (مع فك القفل الفوري على الموبايل)
// =========================================================
let soundEnabled = true;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let audioUnlocked = false;

function getAudioContext() {
  if (!soundEnabled) return null;
  if (!audioCtx && AudioCtx) {
    audioCtx = new AudioCtx();
  }
  return audioCtx;
}

function unlockBrowserAudio() {
  if (!soundEnabled) return;
  const ctxAudio = getAudioContext();
  if (!ctxAudio) return;

  // تشغيل نبضة صامتة لفك قفل الصوت في متصفحات الموبايل
  if (!audioUnlocked) {
    try {
      const buffer = ctxAudio.createBuffer(1, 1, 22050);
      const source = ctxAudio.createBufferSource();
      source.buffer = buffer;
      source.connect(ctxAudio.destination);
      source.start(0);
      audioUnlocked = true;
    } catch (e) {}
  }

  if (ctxAudio.state === 'suspended') {
    ctxAudio.resume().then(() => {
      if (soundEnabled && isBabyDancing && !startOverlay.classList.contains('hidden') && !danceMusicInterval) {
        startBabyDanceMusic();
      }
    }).catch(() => {});
  } else if (ctxAudio.state === 'running') {
    if (soundEnabled && isBabyDancing && !startOverlay.classList.contains('hidden') && !danceMusicInterval) {
      startBabyDanceMusic();
    }
  }
}

['touchstart', 'pointerdown', 'mousedown', 'keydown'].forEach(evt => {
  document.addEventListener(evt, unlockBrowserAudio, { passive: true });
});

// 1. مزيكا رقص البيبي في الشاشة الرئيسية
let danceMusicInterval = null;
let isBabyDancing = false;

function startBabyDanceMusic() {
  if (!soundEnabled || danceMusicInterval || !isBabyDancing) return;
  const ctxAudio = getAudioContext();
  if (!ctxAudio) return;

  if (ctxAudio.state === 'suspended') {
    ctxAudio.resume().catch(() => {});
  }

  const melody = [523.25, 659.25, 783.99, 659.25, 880.00, 783.99, 659.25, 587.33];
  const bass = [130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00];
  let step = 0;

  const playBeat = () => {
    if (!soundEnabled || !isBabyDancing || startOverlay.classList.contains('hidden')) {
      stopBabyDanceMusic();
      return;
    }
    const c = getAudioContext();
    if (!c) return;
    if (c.state === 'suspended') {
      c.resume().catch(() => {});
      return;
    }

    const now = c.currentTime;

    // نغمة اللحن الرئيسي (واضحة ومبهجة)
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(melody[step % melody.length], now);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    // بيز إيقاعي
    if (step % 2 === 0) {
      const bOsc = c.createOscillator();
      const bGain = c.createGain();
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(bass[step % bass.length], now);
      bOsc.frequency.exponentialRampToValueAtTime(55, now + 0.22);
      bGain.gain.setValueAtTime(0.22, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      bOsc.connect(bGain);
      bGain.connect(c.destination);
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

// 2. موسيقى دخول الوحوش (Baby Shark للوحش الأول + Funky Beat للوحش التاني) + تلاشي تدريجي
let bossMusicMasterGain = null;

function playBossEntranceMusic(bossType) {
  const ctxAudio = getAudioContext();
  if (!ctxAudio) return;
  if (ctxAudio.state === 'suspended') ctxAudio.resume().catch(() => {});

  stopBossMusic();

  const master = ctxAudio.createGain();
  master.gain.setValueAtTime(0.26, ctxAudio.currentTime);
  master.connect(ctxAudio.destination);
  bossMusicMasterGain = master;

  let pattern = [];
  if (bossType === 1) {
    // لحن Baby Shark للوحش الأول (500 سكور)
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
    // لحن رقص فانكي كول للوحش التاني أبو نضارة (1000 سكور)
    const E3 = 164.81, G3 = 196.00, A3 = 220.00, B3 = 246.94, D4 = 293.66, E4 = 329.63;
    pattern = [
      { f: E3, d: 0.20, w: 'sawtooth' }, { f: E4, d: 0.16, w: 'square' }, { f: D4, d: 0.16, w: 'square' }, { f: B3, d: 0.20, w: 'sawtooth' },
      { f: A3, d: 0.20, w: 'sawtooth' }, { f: G3, d: 0.18, w: 'sawtooth' }, { f: A3, d: 0.18, w: 'square' }, { f: B3, d: 0.28, w: 'square' },
      { f: E3, d: 0.20, w: 'sawtooth' }, { f: E4, d: 0.16, w: 'square' }, { f: D4, d: 0.16, w: 'square' }, { f: B3, d: 0.20, w: 'sawtooth' },
      { f: D4, d: 0.18, w: 'square' }, { f: E4, d: 0.22, w: 'square' }, { f: G3, d: 0.18, w: 'sawtooth' }, { f: E3, d: 0.42, w: 'sawtooth' }
    ];
  }

  let t = ctxAudio.currentTime + 0.04;
  pattern.forEach(note => {
    const osc = ctxAudio.createOscillator();
    const noteGain = ctxAudio.createGain();
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
  if (!audioCtx || !bossMusicMasterGain) return;
  const now = audioCtx.currentTime;
  bossMusicMasterGain.gain.cancelScheduledValues(now);
  bossMusicMasterGain.gain.setValueAtTime(Math.max(0.01, bossMusicMasterGain.gain.value), now);
  bossMusicMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
  setTimeout(() => {
    stopBossMusic();
  }, 1900);
}

function stopBossMusic() {
  if (bossMusicMasterGain) {
    try { bossMusicMasterGain.disconnect(); } catch (e) {}
    bossMusicMasterGain = null;
  }
}

// 3. مؤثرات أصوات الأطفال (واء + ضحكة)
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
  const ctxAudio = getAudioContext();
  if (!ctxAudio) return;
  if (ctxAudio.state === 'suspended') ctxAudio.resume().catch(() => {});
  const now = ctxAudio.currentTime;

  if (type === 'good') {
    synthesizeBabyGiggle(ctxAudio, now);
  } else if (type === 'bad') {
    synthesizeBabyWaaah(ctxAudio, now, 0.35);
    synthesizeBabyWaaah(ctxAudio, now + 0.38, 0.42);
  } else if (type === 'levelup') {
    synthesizeBabyGiggle(ctxAudio, now);
    synthesizeBabyGiggle(ctxAudio, now + 0.25);
  } else if (type === 'boss_cry') {
    synthesizeBabyWaaah(ctxAudio, now, 0.5);
    synthesizeBabyWaaah(ctxAudio, now + 0.52, 0.65);
  } else if (type === 'gameover') {
    synthesizeBabyWaaah(ctxAudio, now, 0.85);
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
  }, 2400);
}

lobbyMusicBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  soundEnabled = !soundEnabled;
  lobbyMusicBtn.textContent = soundEnabled ? '🎵' : '🔇';
  document.getElementById('soundBtn').textContent = soundEnabled ? '🔊' : '🔇';
  if (soundEnabled) {
    unlockBrowserAudio();
    if (isBabyDancing) startBabyDanceMusic();
  } else {
    stopBabyDanceMusic();
  }
});

startLobbyBabyAnimation();

// =========================================================
// الأكلات (حجم أكبر وأوضح) والوحوش والسلة
// =========================================================
const GOOD_FOODS = [
  { emoji: '🥛', name: 'حليب', good: true, tip: 'كالسيوم أساسي للأم والرضيع!' },
  { emoji: '🌴', name: 'تمر', good: true, tip: 'طاقة طبيعية ويدعم إدرار الحليب!' },
  { emoji: '🥣', name: 'شوفان', good: true, tip: 'حديد وألياف ممتازة للرضاعة!' },
  { emoji: '🐟', name: 'سلمون مطبوخ', good: true, tip: 'أوميجا 3 لنمو مخ الطفل!' },
  { emoji: '🥬', name: 'سبانخ', good: true, tip: 'فيتامينات وحديد بعد الولادة!' },
  { emoji: '💧', name: 'ميه', good: true, tip: 'الترطيب سر إنتاج الحليب!' },
  { emoji: '🥚', name: 'بيض', good: true, tip: 'بروتين متكامل للأم المرضعة!' },
  { emoji: '🥜', name: 'مكسرات', good: true, tip: 'دهون صحية وطاقة مستمرة!' }
];

const BAD_FOODS = [
  { emoji: '☕', name: 'كافيين زيادة', good: false, tip: 'الكافيين الزيادة بيسهر البيبي!' },
  { emoji: '🥤', name: 'مشروب غازي', good: false, tip: 'سكريات وكافيين بدون أي فايدة!' },
  { emoji: '🍔', name: 'وجبة سريعة', good: false, tip: 'دهون مهدرجة تتعب الهضم!' },
  { emoji: '🌶️', name: 'شطة حارة', good: false, tip: 'الأكل الحار يسبب مغص للرضيع!' },
  { emoji: '🍣', name: 'سمك ني', good: false, tip: 'الأسماك النية وعالية الزئبق خطر!' },
  { emoji: '🍬', name: 'حلويات مصنعة', good: false, tip: 'ترفع السكر فجأة وتزود الإرهاق!' }
];

const basket = {
  x: 160,
  y: 420,
  targetX: 160,
  targetY: 420,
  width: 72,
  height: 48,
  vx: 0,
  tilt: 0
};

// كائن الوحش (يدعم الوحش 1 عند 500 والوحش 2 الراقص أبو نضارة عند 1000)
const boss = {
  type: 1, // 1 = البيبي القرش | 2 = البيبي الراقص أبو نضارة
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
  burstRemaining: 0,
  burstPattern: 'curve',
  wavesThrown: 0,
  maxWaves: 24,
  scale: 1
};

let nextBossGameScore = 500;
let bossEncountersCount = 0;

let isRunning = false;
let isPaused = false;
let lastTime = 0;
let spawnTimer = 0;
let sideSpawnTimer = 0;
let elapsedSeconds = 0;
let screenShake = 0;

let items = [];
let sideWarnings = [];
let popups = [];

let stars = Array.from({ length: 30 }, () => ({
  x: Math.random(),
  y: Math.random() * 0.78,
  r: 1 + Math.random() * 1.8,
  phase: Math.random() * Math.PI * 2
}));

let clouds = [
  { x: 50, y: 75, speed: 12, scale: 1 },
  { x: 240, y: 115, speed: 9, scale: 0.85 },
  { x: 390, y: 65, speed: 14, scale: 1.1 }
];

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

// تحكم لمس ناعم في 4 اتجاهات
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
window.addEventListener('keydown', (e) => {
  if (e.key in keys) keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
  if (e.key in keys) keys[e.key] = false;
});

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
// إدارة بدء الجيم والخروج للشاشة الرئيسية
// =========================================================
function startNewRun() {
  unlockBrowserAudio();
  stopBabyDanceMusic();
  stopBossMusic();

  startOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  shopOverlay.classList.add('hidden');
  exitConfirmOverlay.classList.add('hidden');
  bossBanner.classList.add('hidden');

  gameHud.classList.remove('hidden');
  tipBar.classList.remove('hidden');

  currentGameScore = 0;
  heartsRemaining = MAX_HEARTS;
  elapsedSeconds = 0;
  spawnTimer = 0;
  sideSpawnTimer = 0;
  activeTouchId = null;
  screenShake = 0;

  items = [];
  sideWarnings = [];
  popups = [];

  boss.state = 'idle';
  boss.type = 1;
  boss.y = -130;
  boss.wavesThrown = 0;
  boss.burstRemaining = 0;
  nextBossGameScore = 500;
  bossEncountersCount = 0;

  resizeCanvas();
  basket.targetX = (canvas.width - basket.width) / 2;
  basket.targetY = canvas.height - basket.height - 28;
  clampBasketTargets();
  basket.x = basket.targetX;
  basket.y = basket.targetY;

  timerDisplay.textContent = '00:00';
  setTipUI('', '🤱', 'حركي السلة في كل الاتجاهات! الوحش الأول عند 500 والتاني عند 1000');
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
  stopBossMusic();

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

document.getElementById('startBtn').addEventListener('click', startNewRun);
document.getElementById('restartBtn').addEventListener('click', startNewRun);
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
    unlockBrowserAudio();
  } else {
    stopBossMusic();
  }
});

let levelToastTimer = null;
function triggerLevelUp(newLvl) {
  playTone('levelup');
  levelUpToast.textContent = `🎉 أسطورة! حسابك وصل ليفل ${newLvl}`;
  levelUpToast.classList.add('show');
  clearTimeout(levelToastTimer);
  levelToastTimer = setTimeout(() => {
    levelUpToast.classList.remove('show');
  }, 2500);
}

function triggerGameOver() {
  isRunning = false;
  stopBossMusic();
  bossBanner.classList.add('hidden');
  tipBar.classList.add('hidden');
  playTone('gameover');

  document.getElementById('gameOverStats').innerHTML = `
    🏆 سكور الجيم ده: <b>${currentGameScore}</b><br>
    👑 أعلى سكور ليك: <b>${savedData.bestScore}</b><br>
    ⏱️ مدة الصمود: <b>${formatTime(elapsedSeconds)}</b><br>
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
  if (isBabyDancing && soundEnabled) {
    startBabyDanceMusic();
  }
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
    if (isEquipped) {
      btnHTML = `<button class="item-action btn-equipped" disabled>مُفعّل حالياً ✅</button>`;
    } else if (isUnlocked) {
      btnHTML = `<button class="item-action btn-equip" data-id="${item.id}" data-action="equip">اختيار ✨</button>`;
    } else if (isLevelLocked) {
      btnHTML = `<button class="item-action btn-locked" disabled>🔒 مطلوب ليفل ${item.minLevel}</button>`;
    } else {
      btnHTML = `<button class="item-action btn-buy" data-id="${item.id}" data-action="buy">شراء بـ ${item.price} 🪙</button>`;
    }

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
          alert(`معاك ${savedData.coins} كوين بس، محتاج ${item.price} كوين! العب وجمع نقط أكتر 💪`);
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
// منطق اللعب والوحوش (الوحش 1 عند 500 + الوحش 2 أبو نضارة عند 1000)
// =========================================================
let tipTimeout = null;
function showTip(item) {
  if (boss.state !== 'idle') return;
  clearTimeout(tipTimeout);
  if (item.good) {
    setTipUI('tip-good', item.emoji, `+10 (${item.name}): ${item.tip}`);
  } else {
    setTipUI('tip-bad', '😭', `واء! -5 وراح قلب (${item.name}): ${item.tip}`);
  }
  tipTimeout = setTimeout(() => {
    if (boss.state === 'idle') {
      setTipUI('', '🪙', 'كل 20 نقطة = 1 كوين .. احذر الهجمات الجانبية!');
    }
  }, 2500);
}

function addPopup(x, y, text, color) {
  popups.push({ x, y, text, color, alpha: 1, vy: -60 });
}

function spawnTopFood() {
  const pool = Math.random() < 0.56 ? GOOD_FOODS : BAD_FOODS;
  const template = pool[Math.floor(Math.random() * pool.length)];
  const radius = 31; // تكبير حجم الأكلات
  const padding = 38;
  const x = padding + Math.random() * Math.max(20, canvas.width - padding * 2);

  const timeBoost = elapsedSeconds * 3.8;
  const scoreBoost = Math.floor(currentGameScore / 250) * 18;
  const speed = 190 + Math.random() * 75 + timeBoost + scoreBoost;

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

function queueSideAttack() {
  const fromLeft = Math.random() < 0.5;
  const targetY = canvas.height * (0.24 + Math.random() * 0.58);
  sideWarnings.push({
    fromLeft,
    y: targetY,
    timer: 0.65
  });
}

function launchSideFood(fromLeft, startY) {
  const template = BAD_FOODS[Math.floor(Math.random() * BAD_FOODS.length)];
  const speedX = (230 + Math.min(180, elapsedSeconds * 2.5)) * (fromLeft ? 1 : -1);
  items.push({
    ...template,
    x: fromLeft ? -32 : canvas.width + 32,
    y: startY,
    vx: speedX,
    vy: 45 + Math.random() * 45,
    ax: 0,
    radius: 30, // تكبير حجم الأكلات الجانبية
    isSide: true
  });
}

function startBossSequence() {
  bossEncountersCount++;
  if (bossEncountersCount === 1) {
    boss.type = 1; // الوحش الأول عند 500
    nextBossGameScore = 1000;
  } else if (bossEncountersCount === 2) {
    boss.type = 2; // الوحش التاني أبو نضارة عند 1000
    nextBossGameScore = currentGameScore + 1200;
  } else {
    boss.type = (bossEncountersCount % 2 === 1) ? 1 : 2;
    nextBossGameScore = currentGameScore + 1200;
  }

  boss.state = 'warning';
  boss.timer = 3.2;
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
  boss.maxWaves = boss.type === 1 ? 22 : 28;
  boss.scale = 1;
  screenShake = 11;

  items = [];
  sideWarnings = [];
  bossBanner.classList.remove('hidden');

  if (boss.type === 1) {
    bossBanner.textContent = '🦈⚠️ تحذير! البيبي القرش المشاغب قادم ⚠️🦈';
    setTipUI('tip-boss', '🦈', 'بيبي شارك دو دو دو! استعد لتفادي هجماته!');
  } else {
    bossBanner.textContent = '🕶️🕺 تحذير! البيبي الراقص أبو نضارة دخل الساحة 🕺🕶️';
    setTipUI('tip-boss', '🕶️', 'احذر! بيرقص بحركات عشوائية وبيرمي الأكل الضار بكرف ومستقيم ورا بعض!');
  }

  playBossEntranceMusic(boss.type);
}

// رمية من إيد الوحش التاني (مستقيم أو كرف)
function throwBoss2HandProjectile(pattern) {
  const badTemplate = BAD_FOODS[Math.floor(Math.random() * BAD_FOODS.length)];
  const basketCenterX = basket.x + basket.width / 2;
  const basketCenterY = basket.y + basket.height / 2;

  // تبديل الإيد اللي بيرمي بيها وتحريكها
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
    // رمية بكرف واضح (انحناء أفقي قوي في الهوا)
    const curveDir = (handX > canvas.width / 2) ? -1 : 1;
    const curveStrength = (260 + Math.random() * 140) * curveDir;
    ax = curveStrength;
    // حساب السرعة الابتدائية بحيث الكرف يلف ويوصل ناحية السلة
    vx = ((basketCenterX - handX) / flightTime) - 0.5 * ax * flightTime;
  } else {
    // رمية مستقيمة سريعة نحو السلة
    const dx = (basketCenterX + (Math.random() * 50 - 25)) - handX;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 385;
    vx = (dx / dist) * speed;
    vy = Math.max(270, (dy / dist) * speed);
    ax = 0;
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
      if (boss.type === 1) {
        setTipUI('tip-boss', '😈', 'الفايت بدأ! اهرب بالسلة في كل الاتجاهات!');
      } else {
        setTipUI('tip-boss', '🕺', 'البيبي أبو نضارة بيرقص ويرمي بإيده! ركز في الكرف!');
      }
      fadeOutBossMusic();
    }
    return;
  }

  if (boss.state === 'fighting') {
    if (boss.type === 1) {
      // === سلوك الوحش الأول (البيبي القرش عند 500) ===
      const targetY = 120;
      boss.y += (targetY - boss.y) * Math.min(1, 4 * dt);

      const moveSpeed = 145;
      boss.x += boss.dir * moveSpeed * dt;
      if (boss.x > canvas.width - 75) {
        boss.x = canvas.width - 75;
        boss.dir = -1;
      } else if (boss.x < 75) {
        boss.x = 75;
        boss.dir = 1;
      }

      boss.throwTimer += dt;
      if (boss.throwTimer >= 0.56 && boss.wavesThrown < boss.maxWaves) {
        boss.throwTimer = 0;
        boss.wavesThrown++;

        const badTemplate = BAD_FOODS[Math.floor(Math.random() * BAD_FOODS.length)];
        const targetBasketX = basket.x + basket.width / 2 + (Math.random() * 85 - 42);
        const targetBasketY = basket.y + basket.height / 2;
        const dx = targetBasketX - boss.x;
        const dy = Math.max(120, targetBasketY - boss.y);
        const dist = Math.hypot(dx, dy) || 1;
        const projectileSpeed = 330;

        items.push({
          ...badTemplate,
          x: boss.x,
          y: boss.y + 30,
          vx: (dx / dist) * projectileSpeed * 0.72,
          vy: Math.max(245, (dy / dist) * projectileSpeed),
          ax: 0,
          radius: 28,
          isBossShot: true
        });
      }
    } else {
      // === سلوك الوحش التاني (البيبي الراقص أبو نضارة عند 1000) ===
      boss.dancePhase += dt * 12;
      boss.handSwing = Math.max(0, boss.handSwing - dt * 4);

      // حركات رقص مفاجئة وغير متوقعة في الجزء العلوي
      boss.moveTimer -= dt;
      if (boss.moveTimer <= 0) {
        boss.moveTimer = 0.35 + Math.random() * 0.75; // تغيير مفاجئ كل 0.35 إلى 1.1 ثانية
        boss.targetX = 72 + Math.random() * Math.max(40, canvas.width - 144);
        boss.targetY = 90 + Math.random() * Math.min(135, canvas.height * 0.22);
        boss.moveLerp = 3.5 + Math.random() * 6.5; // سرعة حركة متغيرة (ساعات هادية وساعات داش سريع!)
      }

      boss.x += (boss.targetX - boss.x) * Math.min(1, boss.moveLerp * dt);
      boss.y += (boss.targetY - boss.y) * Math.min(1, boss.moveLerp * dt);

      // نظام الرمي بالإيد: كرف + مستقيم + ورا بعض
      if (boss.wavesThrown < boss.maxWaves) {
        if (boss.burstRemaining > 0) {
          boss.throwTimer -= dt;
          if (boss.throwTimer <= 0) {
            boss.burstRemaining--;
            boss.wavesThrown++;
            const pat = (boss.burstRemaining % 2 === 0) ? 'straight' : 'curve';
            throwBoss2HandProjectile(pat);
            boss.throwTimer = 0.17; // رميات سريعة ورا بعض!
          }
        } else {
          boss.throwTimer += dt;
          if (boss.throwTimer >= 0.78) {
            boss.throwTimer = 0;
            const roll = Math.random();
            if (roll < 0.42) {
              // هجمة ورا بعض (3 رميات متتالية)
              boss.burstRemaining = Math.min(3, boss.maxWaves - boss.wavesThrown);
              boss.throwTimer = 0.01;
            } else if (roll < 0.74) {
              // رمية بكرف
              boss.wavesThrown++;
              throwBoss2HandProjectile('curve');
            } else {
              // رمية مستقيمة
              boss.wavesThrown++;
              throwBoss2HandProjectile('straight');
            }
          }
        }
      }
    }

    // التحقق من هزيمة الوحش
    if (boss.wavesThrown >= boss.maxWaves && items.length === 0) {
      boss.state = 'defeated';
      boss.timer = 2.6;
      playTone('boss_cry');

      const bonus = boss.type === 1 ? 150 : 250;
      setTipUI('tip-good', '😭', `واء! البيبي عيّط وهرب! عاش يا بطل (+${bonus} نقطة مكافأة)!`);

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

      addPopup(canvas.width / 2, canvas.height / 2, `+${bonus} نقطة نجاة! 🎉`, '#22c55e');
      if (currentGameScore >= nextBossGameScore) {
        nextBossGameScore = currentGameScore + 1200;
      }
      persistState();
      updateAllUI();
    }
    return;
  }

  if (boss.state === 'defeated') {
    boss.timer -= dt;
    boss.y -= 170 * dt;
    boss.scale = Math.max(0.1, boss.scale - 0.35 * dt);
    if (boss.timer <= 0) {
      boss.state = 'idle';
      setTipUI('', '🤱', 'كمل تجميع الأكل المفيد!');
    }
  }
}

function drawBoss(now) {
  if (boss.state === 'idle' || boss.state === 'warning') return;

  ctx.save();
  ctx.translate(boss.x, boss.y);

  if (boss.type === 2 && boss.state === 'fighting') {
    // أنيميشن الرقص للوحش التاني (تمدد وانكماش وميلان على الإيقاع)
    const squashX = 1 + Math.sin(boss.dancePhase) * 0.09;
    const squashY = 1 - Math.sin(boss.dancePhase) * 0.09;
    ctx.scale(boss.scale * squashX, boss.scale * squashY);
    ctx.rotate(Math.sin(boss.dancePhase * 0.5) * 0.16);
  } else {
    ctx.scale(boss.scale, boss.scale);
    ctx.rotate(Math.sin(now * 0.015) * 0.08);
  }

  // هالة طاقة حول الوحش
  const auraRadius = boss.radius + 16 + Math.sin(now * 0.012) * 6;
  const aura = ctx.createRadialGradient(0, 0, 15, 0, 0, auraRadius);
  if (boss.state === 'defeated') {
    aura.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
  } else if (boss.type === 1) {
    aura.addColorStop(0, 'rgba(239, 68, 68, 0.52)');
  } else {
    aura.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
  }
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
  ctx.fill();

  // رسم وجه البيبي
  ctx.font = '94px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(boss.state === 'defeated' ? '😭' : '👶', 0, 0);

  if (boss.state === 'fighting') {
    if (boss.type === 1) {
      // تاج القرش للوحش الأول
      ctx.font = '34px Arial';
      ctx.fillText('🦈', 0, -56);
    } else {
      // نضارة الشمس الكول للوحش التاني على عينه!
      ctx.save();
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-34, -14, 29, 17, 4);
      ctx.roundRect(5, -14, 29, 17, 4);
      ctx.fill();
      ctx.stroke();

      // جسر النضارة الذهبي
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-5, -7);
      ctx.lineTo(5, -7);
      ctx.stroke();

      // لمعة على العدسات
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-28, -11);
      ctx.lineTo(-22, -2);
      ctx.moveTo(11, -11);
      ctx.lineTo(17, -2);
      ctx.stroke();
      ctx.restore();

      // نوتات موسيقية طايرة حواليه وهو بيرقص
      ctx.font = '24px Arial';
      const noteYOffset = Math.sin(boss.dancePhase * 0.8) * 6;
      ctx.fillText('🎵', -54, -36 + noteYOffset);
      ctx.fillText('🎶', 54, -40 - noteYOffset);

      // الإيد اللي بيرمي بيها الأكل الضار
      ctx.save();
      const handX = boss.handSide * 52;
      const handY = 14 - boss.handSwing * 14;
      ctx.translate(handX, handY);
      ctx.rotate(boss.handSide * (0.3 + boss.handSwing * 0.9));
      ctx.font = '36px Arial';
      ctx.fillText('🫴', 0, 0);
      ctx.restore();
    }

    // شريط صحة/موجات الوحش
    const remainingRatio = Math.max(0, (boss.maxWaves - boss.wavesThrown) / boss.maxWaves);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(-56, 54, 112, 10, 5);
    ctx.fill();

    ctx.fillStyle = boss.type === 1 ? '#ef4444' : '#a855f7';
    ctx.beginPath();
    ctx.roundRect(-54, 56, 108 * remainingRatio, 6, 3);
    ctx.fill();
  } else if (boss.state === 'defeated') {
    ctx.font = '26px Arial';
    ctx.fillText('💦', -50, 10);
    ctx.fillText('💦', 50, 10);
  }

  ctx.restore();
}

function drawBackground(dt, now) {
  const theme = THEMES.find(t => t.id === savedData.equippedTheme) || THEMES[0];

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, theme.skyTop);
  grad.addColorStop(0.82, theme.skyMid);
  grad.addColorStop(1, theme.ground);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (theme.dark) {
    stars.forEach(s => {
      const alpha = 0.35 + 0.55 * Math.sin(now * 0.003 + s.phase);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
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
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.beginPath();
    ctx.arc(wx, w.y, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
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
  ctx.rotate(tilt);

  const hw = width / 2;
  const hh = height / 2;

  ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
  ctx.beginPath();
  ctx.ellipse(0, hh + 5, hw * 0.85, 5, 0, 0, Math.PI * 2);
  ctx.fill();

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
  ctx.save();
  ctx.beginPath();
  ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
  ctx.fillStyle = item.isCurved ? '#faf5ff' : (item.isBossShot ? '#fef2f2' : '#ffffff');
  ctx.shadowColor = item.isCurved ? 'rgba(168, 85, 247, 0.55)' : (item.isSide || item.isBossShot ? 'rgba(239, 68, 68, 0.45)' : 'rgba(0,0,0,0.18)');
  ctx.shadowBlur = 9;
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = item.good ? '#22c55e' : (item.isCurved ? '#a855f7' : '#ef4444');
  ctx.stroke();
  ctx.restore();

  // إيموجي أكبر وأوضح
  ctx.font = '33px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.emoji, item.x, item.y + 1);

  // اسم الأكلة بخط أكبر
  ctx.font = 'bold 12px Cairo, Tahoma, sans-serif';
  const tw = ctx.measureText(item.name).width;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.beginPath();
  ctx.roundRect(item.x - tw / 2 - 6, item.y + item.radius + 2, tw + 12, 18, 8);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.fillText(item.name, item.x, item.y + item.radius + 11);
}

// =========================================================
// حلقة اللعبة الأساسية
// =========================================================
function gameLoop(now) {
  if (!isRunning || isPaused) return;
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  elapsedSeconds += dt;
  timerDisplay.textContent = formatTime(elapsedSeconds);

  ctx.save();
  if (screenShake > 0) {
    const sx = (Math.random() - 0.5) * screenShake;
    const sy = (Math.random() - 0.5) * screenShake;
    ctx.translate(sx, sy);
    screenShake = Math.max(0, screenShake - 28 * dt);
  }

  drawBackground(dt, now);
  drawBoss(now);

  const kbSpeed = 520;
  if (keys.ArrowLeft) basket.targetX -= kbSpeed * dt;
  if (keys.ArrowRight) basket.targetX += kbSpeed * dt;
  if (keys.ArrowUp) basket.targetY -= kbSpeed * dt;
  if (keys.ArrowDown) basket.targetY += kbSpeed * dt;
  clampBasketTargets();

  const prevX = basket.x;
  const smooth = Math.min(1, 25 * dt);
  basket.x += (basket.targetX - basket.x) * smooth;
  basket.y += (basket.targetY - basket.y) * smooth;
  basket.vx = (basket.x - prevX) / Math.max(0.001, dt);
  basket.tilt = Math.max(-0.18, Math.min(0.18, basket.vx * 0.00028));

  if (boss.state !== 'idle') {
    updateBoss(dt);
  } else {
    spawnTimer += dt;
    const spawnInterval = Math.max(0.4, 0.95 - elapsedSeconds * 0.0065);
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      spawnTopFood();
    }

    if (currentGameScore >= 200) {
      sideSpawnTimer += dt;
      const sideInterval = Math.max(1.9, 4.0 - Math.floor(currentGameScore / 400) * 0.25);
      if (sideSpawnTimer >= sideInterval) {
        sideSpawnTimer = 0;
        queueSideAttack();
      }
    }
  }

  drawSideWarnings(dt);

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    // تطبيق تسارع الكرف لو الرمية بكرف
    if (item.ax) {
      item.vx += item.ax * dt;
    }
    item.x += (item.vx || 0) * dt;
    item.y += item.vy * dt;
    drawFood(item);

    const caught =
      item.y + item.radius * 0.85 >= basket.y + 4 &&
      item.y - item.radius * 0.85 <= basket.y + basket.height &&
      item.x + item.radius * 0.55 >= basket.x &&
      item.x - item.radius * 0.55 <= basket.x + basket.width;

    if (caught) {
      if (item.good) {
        currentGameScore += 10;
        savedData.totalXP += 10;
        if (currentGameScore > savedData.bestScore) {
          savedData.bestScore = currentGameScore;
        }

        savedData.coinBuffer += 10;
        if (savedData.coinBuffer >= 20) {
          const earned = Math.floor(savedData.coinBuffer / 20);
          savedData.coins += earned;
          savedData.coinBuffer %= 20;
          addPopup(basket.x + basket.width / 2, basket.y - 34, `+${earned} 🪙`, '#eab308');
        }

        const prevLvl = currentAccountLevel;
        const newLvl = getInfiniteLevelInfo(savedData.totalXP).lvl;
        if (newLvl > prevLvl) {
          triggerLevelUp(newLvl);
        }

        playTone('good');
        addPopup(basket.x + basket.width / 2, basket.y - 10, '+10', '#16a34a');
      } else {
        currentGameScore = Math.max(0, currentGameScore - 5);
        heartsRemaining = Math.max(0, heartsRemaining - 1);
        screenShake = 9;
        playTone('bad');
        addPopup(basket.x + basket.width / 2, basket.y - 10, 'واء! -5 | -1 ❤️', '#ef4444');
      }

      persistState();
      updateAllUI();
      showTip(item);
      items.splice(i, 1);

      if (heartsRemaining <= 0) {
        ctx.restore();
        triggerGameOver();
        return;
      }

      // تفعيل الوحش الأول عند 500 والوحش التاني عند 1000
      if (boss.state === 'idle' && currentGameScore >= nextBossGameScore) {
        startBossSequence();
      }
      continue;
    }

    if (
      item.y - item.radius > canvas.height + 45 ||
      item.x < -90 ||
      item.x > canvas.width + 90
    ) {
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
    ctx.font = '900 18px Cairo, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  }

  ctx.restore();
  requestAnimationFrame(gameLoop);
}
