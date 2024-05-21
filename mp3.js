const audio = document.getElementById('audio');
const prog_cont = document.getElementById('progress-container');
const progress = document.getElementById('progress');
const curr_time = document.getElementById('current-time');
const duration = document.getElementById('duration');
const audioSelect = document.getElementById('audio-select');
const vol_ctrl = document.getElementById('volume');
const visualizer = document.getElementById('visualizer');
const canvas = visualizer.getContext('2d');
//btns
const btn_pause_play = document.getElementById('play-pause');
const btn_download = document.getElementById('download');
// Visualizer setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);
//all the audio files
const audioFiles = [
    { name: 'Marvel83 - Golden Dawn', path: 'Marvel83  Golden Dawn.mp3' },
    { name: 'Da Tooby – Midnight Breaks 1 – 1990s Hip Hop , Beats', path: 'Da Tooby – Midnight Breaks 1 – 1990s Hip Hop , Beats.mp3' },
    { name: 'De Lorra - Endless', path: 'De Lorra - Endless.mp3' },
    { name: 'De Lorra - Let Us', path: 'De Lorra - Let Us.mp3' },
    { name: 'De Lorra - The Night Was Ours', path: 'De Lorra - The Night Was Ours.mp3' }
];
//initialize
populateAudioSelect();
if (audioFiles.length > 0) {
    loadAudio(audioFiles[0].path);
    btn_pause_play.textContent = 'Pause';
}
//listeners
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(audio.duration);
});
prog_cont.addEventListener('click', setProgress);
audioSelect.addEventListener('change', (e) => {
    loadAudio(e.target.value);
    audio.play();
    btn_pause_play.textContent = 'Pause';
});
vol_ctrl.addEventListener('input', updateVolume);

//btn clicks
btn_pause_play.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        btn_pause_play.textContent = 'Pause';
    } else {
        audio.pause();
        btn_pause_play.textContent = 'Play';
    }
});
btn_download.addEventListener('click', () => {
    const selectedFile = audioSelect.value;
    if (selectedFile) {
        const link = document.createElement('a');
        link.href = selectedFile;
        link.download = selectedFile.split('/').pop();
        link.click();
    }
});
// Visualizer setup
source.connect(analyser);
analyser.connect(audioContext.destination);
analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

audio.addEventListener('play', () => {
    audioContext.resume().then(draw);
});

//functions
function populateAudioSelect() {
    audioFiles.forEach((file) => {
        const option = document.createElement('option');
        option.value = file.path;
        option.textContent = file.name;
        audioSelect.appendChild(option);
    });
}
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}
function updateProgress() {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${progressPercent}%`;
    curr_time.textContent = formatTime(audio.currentTime);
}
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}
function loadAudio(file) {
    audio.src = file;
    audio.load();
    btn_pause_play.textContent = 'Play';
}
function updateVolume() {
    audio.volume = vol_ctrl.value;
}
function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    canvas.fillStyle = 'rgb(0,0,0)';
    canvas.fillRect(0, 0, visualizer.width, visualizer.height);

    const barWidth = (visualizer.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        canvas.fillStyle = `rgb(${barHeight + 100},50,50)`;
        canvas.fillRect(x, visualizer.height - barHeight / 2, barWidth, barHeight);

        x += barWidth + 1;
    }
}