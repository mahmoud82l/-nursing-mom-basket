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
// حفظ البيانات على الجهاز (الخبرة التراكمية + الكوينز + أعلى سكور)
// =========================================================
const STATE_KEY = 'nursing_mom_game_state_v5';
let savedData = {
  totalXP: 0,      // النقط التراكمية اللي بترفع الليفل اللانهائي
  bestScore: 0,    // أعلى سكور اتحقق في جيم واحد
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
  } else {
    // نقل بيانات النسخة القديمة لو موجودة
    const oldRaw = localStorage.getItem('nursing_mom_game_state_v4') || localStorage.getItem('nursing_mom_game_state_v3');
    if (oldRaw) {
      const oldParsed = JSON.parse(oldRaw);
      savedData.totalXP = oldParsed.score || 0;
      savedData.bestScore = oldParsed.score || 0;
      savedData.coins = oldParsed.coins || 0;
      savedData.coinBuffer = oldParsed.coinBuffer || 0;
      savedData.unlockedThemes = oldParsed.unlockedThemes || ['morning'];
      savedData.unlockedBaskets = oldParsed.unlockedBaskets || ['classic'];
      savedData.equippedTheme = oldParsed.equippedTheme || 'morning';
      savedData.equippedBasket = oldParsed.equippedBasket || 'classic';
    }
  }
} catch (e) {}

function persistState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(savedData));
  } catch (e) {}
}

// =========================================================
// نظام الليفلات اللانهائي فائق الصعوبة (Infinite Exponential)
// =========================================================
function getInfiniteLevelInfo(totalXP) {
  let lvl = 1;
  let remainingXP = Math.max(0, totalXP);

  // كل ليفل بيحتاج نقط أكتر بشكل تربيعي (ملوش نهاية)
  // ليفل 1->2: 1200 | ليفل 2->3: 3200 | ليفل 3->4: 6000 | ليفل 4->5: 9600 ...
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

  // تحديث الشاشة الرئيسية
  mainLevelDisplay.textContent = currentAccountLevel;
  mainXpText.textContent = `${lvlInfo.currentInLvl} / ${lvlInfo.neededForNext} XP`;
  mainXpFill.style.width = `${lvlInfo.pct}%`;
  mainCoinsDisplay.textContent = savedData.coins;
  bestScoreBadge.textContent = `👑 أعلى سكور: ${savedData.bestScore}`;

  // تحديث المتجر
  document.getElementById('shopLevelDisplay').textContent = currentAccountLevel;
  document.getElementById('shopCoinsDisplay').textContent = savedData.coins;

  // تحديث شريط الجيم
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
// محرك الصوت والموسيقى (Web Audio API)
// =========================================================
let soundEnabled = true;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function ensureAudio() {
  if (!soundEnabled) return null;
  if (!audioCtx) audioCtx = new AudioCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// 1. مزيكا رقص البيبي في الشاشة الرئيسية
let danceMusicInterval = null;
let isBabyDancing = false;

function startBabyDanceMusic() {
  if (!soundEnabled || danceMusicInterval || !isBabyDancing) return;
  const ctxAudio = ensureAudio();
  if (!ctxAudio) return;

  // نغمات إيقاعية مبهجة للبيبي وهو لابس النضارة وبيرقص
  const melody = [523.25, 659.25, 783.99, 659.25, 880.00, 783.99, 659.25, 587.33];
  const bass = [130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00];
  let step = 0;

  const playBeat = () => {
    if (!soundEnabled || !isBabyDancing || startOverlay.classList.contains('hidden')) {
      stopBabyDanceMusic();
      return;
    }
    const c = ensureAudio();
    if (!c || c.state !== 'running') return;
    const now = c.currentTime;

    // نغمة اللحن
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(melody[step % melody.length], now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.19);

    // بيز خفيف كل خطوتين
    if (step % 2 === 0) {
      const bOsc = c.createOscillator();
      const bGain = c.createGain();
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(bass[step % bass.length], now);
      bOsc.frequency.exponentialRampToValueAtTime(55, now + 0.22);
      bGain.gain.setValueAtTime(0.14, now);
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

// 2. لحن Baby Shark عند ظهور الوحش + تلاشي تدريجي (Fade Out)
let bossMusicMasterGain = null;

function playBabySharkEntrance() {
  const ctxAudio = ensureAudio();
  if (!ctxAudio) return;

  stopBabySharkMusic();

  const master = ctxAudio.createGain();
  master.gain.setValueAtTime(0.22, ctxAudio.currentTime);
  master.connect(ctxAudio.destination);
  bossMusicMasterGain = master;

  // لحن Baby Shark: D4, E4, G4, G4, G4, G4, G4, G4, G4 (مرتين)
  const D4 = 293.66, E4 = 329.63, G4 = 392.00, Fs4 = 369.99;
  const pattern = [
    { f: D4, d: 0.32 }, { f: E4, d: 0.32 },
    { f: G4, d: 0.18 }, { f: G4, d: 0.18 }, { f: G4, d: 0.18 },
    { f: G4, d: 0.14 }, { f: G4, d: 0.18 }, { f: G4, d: 0.14 }, { f: G4, d: 0.24 },

    { f: D4, d: 0.32 }, { f: E4, d: 0.32 },
    { f: G4, d: 0.18 }, { f: G4, d: 0.18 }, { f: G4, d: 0.18 },
    { f: G4, d: 0.14 }, { f: G4, d: 0.18 }, { f: G4, d: 0.14 }, { f: G4, d: 0.24 },

    { f: D4, d: 0.30 }, { f: E4, d: 0.30 },
    { f: G4, d: 0.18 }, { f: G4, d: 0.18 }, { f: G4, d: 0.18 },
    { f: G4, d: 0.14 }, { f: G4, d: 0.18 }, { f: G4, d: 0.14 }, { f: Fs4, d: 0.45 }
  ];

  let t = ctxAudio.currentTime + 0.05;
  pattern.forEach(note => {
    const osc = ctxAudio.createOscillator();
    const noteGain = ctxAudio.createGain();
    osc.type = 'triangle';
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

function fadeOutBabySharkMusic() {
  if (!audioCtx || !bossMusicMasterGain) return;
  const now = audioCtx.currentTime;
  bossMusicMasterGain.gain.cancelScheduledValues(now);
  bossMusicMasterGain.gain.setValueAtTime(bossMusicMasterGain.gain.value, now);
  // تلاشي تدريجي ناعم خلال 1.8 ثانية أول ما الفايت يبدأ
  bossMusicMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
  setTimeout(() => {
    stopBabySharkMusic();
  }, 1900);
}

function stopBabySharkMusic() {
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
  gain.gain.linearRampToValueAtTime(0.22, startTime + 0.06);
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
    gain.gain.linearRampToValueAtTime(0.13, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    osc.connect(gain);
    gain.connect(ctxAudio.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  });
}

function playTone(type) {
  const ctxAudio = ensureAudio();
  if (!ctxAudio) return;
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
// أنيميشن البيبي في الشاشة الرئيسية (يزحف للنص -> يلبس نضارة -> يرقص بمزيكا)
// =========================================================
let babyChoreoTimer = null;

function startLobbyBabyAnimation() {
  stopBabyDanceMusic();
  clearTimeout(babyChoreoTimer);

  isBabyDancing = false;
  babyStage.classList.remove('dancing');
  babyActor.className = 'baby-actor crawling';

  // بدء حركة الزحف لنص الشاشة بعد لحظة قصيرة
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      babyActor.classList.add('at-center');
    });
  });

  // بعد 2.4 ثانية (لما يوصل في نص الشاشة): يقف + يلبس النضارة + يرقص + يشغل المزيكا
  babyChoreoTimer = setTimeout(() => {
    babyActor.classList.remove('crawling');
    babyActor.classList.add('dancing');
    babyStage.classList.add('dancing');
    isBabyDancing = true;
    startBabyDanceMusic();
  }, 2400);
}

// فك قفل الصوت في المتصفح عند أول لمسة على الشاشة الرئيسية عشان مزيكا الرقص تشتغل
startOverlay.addEventListener('pointerdown', () => {
  if (soundEnabled) {
    ensureAudio();
    if (isBabyDancing && !danceMusicInterval) {
      startBabyDanceMusic();
    }
  }
});

lobbyMusicBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  soundEnabled = !soundEnabled;
  lobbyMusicBtn.textContent = soundEnabled ? '🎵' : '🔇';
  document.getElementById('soundBtn').textContent = soundEnabled ? '🔊' : '🔇';
  if (soundEnabled && isBabyDancing) {
    startBabyDanceMusic();
  } else {
    stopBabyDanceMusic();
  }
});

// تشغيل الأنيميشن أول ما الصفحة تفتح
startLobbyBabyAnimation();

// =========================================================
// الأكلات والوحش والسلة
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
  width: 68,
  height: 46,
  vx: 0,
  tilt: 0
};

const boss = {
  state: 'idle',
  x: 200,
  y: -120,
  radius: 68,
  dir: 1,
  timer: 0,
  throwTimer: 0,
  wavesThrown: 0,
  maxWaves: 24,
  scale: 1
};

let nextBossGameScore = 500; // الوحش بيظهر عند 500 سكور في الجيم!

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
  stopBabyDanceMusic();
  stopBabySharkMusic();

  startOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  shopOverlay.classList.add('hidden');
  exitConfirmOverlay.classList.add('hidden');
  bossBanner.classList.add('hidden');

  gameHud.classList.remove('hidden');
  tipBar.classList.remove('hidden');

  // كل جيم بيبدأ من 0!
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
  boss.y = -130;
  boss.wavesThrown = 0;
  nextBossGameScore = 500; // الوحش عند 500 سكور في الجيم

  resizeCanvas();
  basket.targetX = (canvas.width - basket.width) / 2;
  basket.targetY = canvas.height - basket.height - 28;
  clampBasketTargets();
  basket.x = basket.targetX;
  basket.y = basket.targetY;

  timerDisplay.textContent = '00:00';
  setTipUI('', '🤱', 'حركي السلة في كل الاتجاهات! الوحش هيظهر عند 500 نقطة');
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
  stopBabySharkMusic();

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

// زرار الخروج من الجيم + نافذة التأكيد
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
  if (!soundEnabled) stopBabySharkMusic();
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
  stopBabySharkMusic();
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
// المتجر (من الشاشة الرئيسية فقط + قفل الليفلات)
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
// منطق اللعب والوحش (عند 500 سكور + Baby Shark)
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
  const radius = 23;
  const padding = 30;
  const x = padding + Math.random() * Math.max(20, canvas.width - padding * 2);

  const timeBoost = elapsedSeconds * 3.8;
  const scoreBoost = Math.floor(currentGameScore / 250) * 18;
  const speed = 190 + Math.random() * 75 + timeBoost + scoreBoost;

  items.push({
    ...template,
    x,
    y: -30,
    vx: 0,
    vy: speed,
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
    x: fromLeft ? -24 : canvas.width + 24,
    y: startY,
    vx: speedX,
    vy: 45 + Math.random() * 45,
    radius: 22,
    isSide: true
  });
}

function startBossSequence() {
  boss.state = 'warning';
  boss.timer = 3.2; // وقت دخول الوحش على لحن Baby Shark
  boss.x = canvas.width / 2;
  boss.y = -120;
  boss.wavesThrown = 0;
  boss.maxWaves = 22 + Math.floor(currentGameScore / 500) * 3;
  boss.scale = 1;
  screenShake = 11;

  items = [];
  sideWarnings = [];
  bossBanner.classList.remove('hidden');
  setTipUI('tip-boss', '🦈', 'بيبي شارك دو دو دو! استعد لتفادي هجمات البيبي المشاغب!');
  playBabySharkEntrance();
}

function updateBoss(dt) {
  if (boss.state === 'idle') return;

  if (boss.state === 'warning') {
    boss.timer -= dt;
    screenShake = 6;
    if (boss.timer <= 0) {
      boss.state = 'fighting';
      bossBanner.classList.add('hidden');
      setTipUI('tip-boss', '😈', 'الفايت بدأ! اهرب بالسلة في كل الاتجاهات!');
      // تلاشي أغنية Baby Shark بالتدريج أول ما الفايت يبدأ
      fadeOutBabySharkMusic();
    }
    return;
  }

  if (boss.state === 'fighting') {
    const targetY = 120;
    boss.y += (targetY - boss.y) * Math.min(1, 4 * dt);

    const moveSpeed = 140 + Math.floor(currentGameScore / 500) * 14;
    boss.x += boss.dir * moveSpeed * dt;
    if (boss.x > canvas.width - 75) {
      boss.x = canvas.width - 75;
      boss.dir = -1;
    } else if (boss.x < 75) {
      boss.x = 75;
      boss.dir = 1;
    }

    boss.throwTimer += dt;
    const throwInterval = Math.max(0.35, 0.6 - Math.floor(currentGameScore / 500) * 0.03);
    if (boss.throwTimer >= throwInterval && boss.wavesThrown < boss.maxWaves) {
      boss.throwTimer = 0;
      boss.wavesThrown++;

      const badTemplate = BAD_FOODS[Math.floor(Math.random() * BAD_FOODS.length)];
      const targetBasketX = basket.x + basket.width / 2 + (Math.random() * 90 - 45);
      const targetBasketY = basket.y + basket.height / 2;
      const dx = targetBasketX - boss.x;
      const dy = Math.max(120, targetBasketY - boss.y);
      const dist = Math.hypot(dx, dy) || 1;
      const projectileSpeed = 320 + Math.floor(currentGameScore / 500) * 20;

      items.push({
        ...badTemplate,
        x: boss.x,
        y: boss.y + 30,
        vx: (dx / dist) * projectileSpeed * 0.72,
        vy: Math.max(240, (dy / dist) * projectileSpeed),
        radius: 21,
        isBossShot: true
      });
    }

    if (boss.wavesThrown >= boss.maxWaves && items.length === 0) {
      boss.state = 'defeated';
      boss.timer = 2.6;
      playTone('boss_cry');
      setTipUI('tip-good', '😭', 'واء! البيبي عيّط وهرب! عاش يا بطل (+150 نقطة مكافأة)!');

      // مكافأة النجاة
      currentGameScore += 150;
      savedData.totalXP += 150;
      if (currentGameScore > savedData.bestScore) savedData.bestScore = currentGameScore;

      savedData.coinBuffer += 150;
      const earned = Math.floor(savedData.coinBuffer / 20);
      savedData.coins += earned;
      savedData.coinBuffer %= 20;

      const prevLvl = currentAccountLevel;
      const newLvl = getInfiniteLevelInfo(savedData.totalXP).lvl;
      if (newLvl > prevLvl) triggerLevelUp(newLvl);

      addPopup(canvas.width / 2, canvas.height / 2, '+150 نقطة نجاة! 🎉', '#22c55e');
      nextBossGameScore = currentGameScore + 1000;
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
  ctx.scale(boss.scale, boss.scale);

  const auraRadius = boss.radius + 14 + Math.sin(now * 0.01) * 5;
  const aura = ctx.createRadialGradient(0, 0, 15, 0, 0, auraRadius);
  aura.addColorStop(0, boss.state === 'defeated' ? 'rgba(56, 189, 248, 0.45)' : 'rgba(239, 68, 68, 0.5)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '92px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const wobble = Math.sin(now * 0.015) * 0.08;
  ctx.rotate(wobble);
  ctx.fillText(boss.state === 'defeated' ? '😭' : '👶', 0, 0);

  if (boss.state === 'fighting') {
    ctx.font = '32px Arial';
    ctx.fillText('🦈', 0, -56);

    const remainingRatio = Math.max(0, (boss.maxWaves - boss.wavesThrown) / boss.maxWaves);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(-55, 52, 110, 10, 5);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(-53, 54, 106 * remainingRatio, 6, 3);
    ctx.fill();
  } else if (boss.state === 'defeated') {
    ctx.font = '24px Arial';
    ctx.fillText('💦', -48, 10);
    ctx.fillText('💦', 48, 10);
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

    const wx = w.fromLeft ? 22 : canvas.width - 22;
    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.beginPath();
    ctx.arc(wx, w.y, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.font = '900 16px Cairo, sans-serif';
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

  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(skin.badge, 0, 5);

  ctx.restore();
}

function drawFood(item) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
  ctx.fillStyle = item.isBossShot ? '#fef2f2' : '#ffffff';
  ctx.shadowColor = item.isSide || item.isBossShot ? 'rgba(239, 68, 68, 0.45)' : 'rgba(0,0,0,0.16)';
  ctx.shadowBlur = 8;
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = item.good ? '#22c55e' : '#ef4444';
  ctx.stroke();
  ctx.restore();

  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.emoji, item.x, item.y + 1);

  ctx.font = 'bold 10.5px Cairo, Tahoma, sans-serif';
  const tw = ctx.measureText(item.name).width;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.beginPath();
  ctx.roundRect(item.x - tw / 2 - 5, item.y + item.radius + 2, tw + 10, 15, 7);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.fillText(item.name, item.x, item.y + item.radius + 9.5);
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
    const spawnInterval = Math.max(0.38, 0.95 - elapsedSeconds * 0.0065);
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      spawnTopFood();
    }

    // الهجمات الجانبية تبدأ بعد 200 نقطة في الجيم
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
    item.x += (item.vx || 0) * dt;
    item.y += item.vy * dt;
    drawFood(item);

    const caught =
      item.y + item.radius >= basket.y + 5 &&
      item.y - item.radius <= basket.y + basket.height &&
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

      // تفعيل الوحش عند 500 سكور في الجيم!
      if (boss.state === 'idle' && currentGameScore >= nextBossGameScore) {
        startBossSequence();
      }
      continue;
    }

    if (
      item.y - item.radius > canvas.height + 35 ||
      item.x < -60 ||
      item.x > canvas.width + 60
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
