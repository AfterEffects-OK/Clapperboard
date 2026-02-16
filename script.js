let startTime = 0;
let isRunning = false;
let animationFrame;
let fps = 24;
let isWhiteTheme = false;

const tcDisplay = document.getElementById('timecode');
tcDisplay.style.fontVariantNumeric = 'tabular-nums';
tcDisplay.style.fontFeatureSettings = '"tnum"';
tcDisplay.style.willChange = 'contents';
const fpsSelect = document.getElementById('fpsSelect');
const flashOverlay = document.getElementById('flashOverlay');
const startBtn = document.getElementById('startBtn');
const statusDot = document.getElementById('statusDot');
const dateDisplay = document.getElementById('dateDisplay');
const themeLabel = document.getElementById('themeLabel');

// Inputs for persistence
const productionInput = document.getElementById('productionInput');
const rollInput = document.getElementById('rollInput');
const dirInput = document.getElementById('dirInput');
const camInput = document.getElementById('camInput');

// Theme Toggle Function
function toggleTheme() {
    isWhiteTheme = !isWhiteTheme;
    document.body.classList.toggle('theme-white', isWhiteTheme);
    themeLabel.innerText = isWhiteTheme ? 'WHITE' : 'BLACK';
}

// Audio Context initialization
let audioCtx;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playBeep() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.9, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

function updateDate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    dateDisplay.innerText = `${y} / ${m} / ${d}`;
}
updateDate();

function adjust(id, amount) {
    const el = document.getElementById(id);
    let val = parseInt(el.value) || 1;
    val = Math.max(1, val + amount);
    el.value = val;
    saveSettings();
}

function resetCounters() {
    document.getElementById('sceneNum').value = 1;
    document.getElementById('cutNum').value = 1;
    document.getElementById('takeNum').value = 1;
    saveSettings();
}

function toggleTimer() {
    initAudio();
    if (isRunning) {
        cancelAnimationFrame(animationFrame);
        startBtn.innerHTML = '<div id="statusDot" class="w-3 h-3 rounded-full bg-zinc-500"></div> START CLOCK';
        startBtn.classList.remove('bg-green-700');
        startBtn.classList.add('bg-zinc-800');
    } else {
        startTime = performance.now();
        fps = parseFloat(fpsSelect.value);
        updateTimer();
        startBtn.innerHTML = '<div id="statusDot" class="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div> STOP CLOCK';
        startBtn.classList.remove('bg-zinc-800');
        startBtn.classList.add('bg-green-700');
    }
    isRunning = !isRunning;
}

function updateTimer() {
    const now = performance.now();
    const elapsed = now - startTime;
    const totalSeconds = elapsed / 1000;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const f = Math.floor((totalSeconds % 1) * fps);

    const pad = (n) => n.toString().padStart(2, '0');
    const padFrame = (n) => n.toString().padStart(fps >= 100 ? 3 : 2, '0');
    tcDisplay.textContent = `${pad(h)}:${pad(m)}:${pad(s)}:${padFrame(f)}`;
    animationFrame = requestAnimationFrame(updateTimer);
}

function clap() {
    initAudio();
    playBeep();
    flashOverlay.style.opacity = '1';
    document.body.classList.add('invert-colors');
    setTimeout(() => {
        flashOverlay.style.opacity = '0';
        document.body.classList.remove('invert-colors');
    }, 80);
}

fpsSelect.addEventListener('change', (e) => {
    fps = parseFloat(e.target.value);
    saveSettings();
    if (isRunning) {
        toggleTimer();
        toggleTimer();
    }
});

// Local Storage Functions
function saveSettings() {
    const settings = {
        production: productionInput.value,
        roll: rollInput.value,
        fps: fpsSelect.value,
        scene: document.getElementById('sceneNum').value,
        cut: document.getElementById('cutNum').value,
        take: document.getElementById('takeNum').value,
        dir: dirInput.value,
        cam: camInput.value,
        theme: isWhiteTheme
    };
    localStorage.setItem('clapperSettings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('clapperSettings');
    if (saved) {
        try {
            const s = JSON.parse(saved);
            if (s.production) productionInput.value = s.production;
            if (s.roll) rollInput.value = s.roll;
            if (s.fps) {
                fpsSelect.value = s.fps;
                fps = parseFloat(s.fps);
            }
            if (s.scene) document.getElementById('sceneNum').value = s.scene;
            if (s.cut) document.getElementById('cutNum').value = s.cut;
            if (s.take) document.getElementById('takeNum').value = s.take;
            if (s.dir) dirInput.value = s.dir;
            if (s.cam) camInput.value = s.cam;
            
            // Restore theme
            if (s.theme !== undefined && s.theme !== isWhiteTheme) {
                toggleTheme();
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        }
    }
}

// Attach listeners for auto-save
[productionInput, rollInput, dirInput, camInput, document.getElementById('sceneNum'), document.getElementById('cutNum'), document.getElementById('takeNum')].forEach(el => {
    el.addEventListener('input', saveSettings);
    el.addEventListener('change', saveSettings);
});

// Initialize
loadSettings();
