let startTime = 0;
let isRunning = false;
let animationFrame;
let fps = 24;
let isWhiteTheme = false;

const tcDisplay = document.getElementById('timecode');
const fpsSelect = document.getElementById('fpsSelect');
const flashOverlay = document.getElementById('flashOverlay');
const startBtn = document.getElementById('startBtn');
const statusDot = document.getElementById('statusDot');
const dateDisplay = document.getElementById('dateDisplay');
const themeLabel = document.getElementById('themeLabel');

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
}

function resetCounters() {
    document.getElementById('sceneNum').value = 1;
    document.getElementById('cutNum').value = 1;
    document.getElementById('takeNum').value = 1;
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
    tcDisplay.innerText = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
    animationFrame = requestAnimationFrame(updateTimer);
}

function clap() {
    initAudio();
    playBeep();
    flashOverlay.style.opacity = '1';
    setTimeout(() => {
        flashOverlay.style.opacity = '0';
    }, 80);
}

fpsSelect.addEventListener('change', (e) => {
    fps = parseFloat(e.target.value);
    if (isRunning) {
        toggleTimer();
        toggleTimer();
    }
});
