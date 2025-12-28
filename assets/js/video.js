// Use assets/0.mp4 through assets/4.mp4 (relative to index.html)
const videos = Array.from({ length: 5 }, (_, i) => `assets/${i}.mp4`);

// Map numeric assets/0..assets/4 to human-friendly titles.
const labels = [
    "LUCKI & Lil Yachty - I Don't Care...", // 0
    "LUCKI - GOODFELLAS",                   // 1
    "LUCKI - 13",                           // 2
    "LUCKI - Y NOT?",                       // 3
    "LUCKI - Heavy On My Heart"             // 4
];

// State to avoid immediate repeats
let lastIdx = null;
let endedHandlerAdded = false;

const video = document.getElementById('background-video');
const scrollingText = document.getElementById('scrolling-text');
// Controller elements (may be hidden until main content is shown)
const prevBtn = document.getElementById('prev-video');
const nextBtn = document.getElementById('next-video');
const selectEl = document.getElementById('video-select');
const volumeSlider = document.getElementById('volume-slider');
// set initial volume
try { video.volume = 0.5; } catch (e) {}

function pickRandomIndex() {
    if (videos.length <= 1) return 0;
    let idx;
    do {
        idx = Math.floor(Math.random() * videos.length);
    } while (idx === lastIdx);
    return idx;
}

function playIndex(idx) {
    lastIdx = idx;
    const chosen = videos[idx];
    const src = encodeURI('./' + chosen);

    const sourceEl = video.querySelector('source');
    if (sourceEl) {
        sourceEl.src = src;
        video.load();
    } else {
        video.src = src;
    }
    
    // Ensure video is unmuted when playing
    video.muted = false;

    const label = labels[idx] || chosen.split('/').pop().replace(/\.mp4$/i, '');
    scrollingText.textContent = 'Playing: ' + label;

    video.play().then(function() {
        // Initialize audio reactive features after successful playback
        initAudioReactive();
    }).catch(function(err) {
        console.warn('Video play prevented:', err);
    });
}

function playNextRandom() {
    const idx = pickRandomIndex();
    playIndex(idx);
}

document.getElementById('enter-text').addEventListener('click', function() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    
    // Ensure audio context is created on user interaction
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Handle mobile-specific initialization
    if (isMobile) {
        handleVideoPlayback();
    }

    // Add ended handler once to auto-play another random video
    if (!endedHandlerAdded) {
        video.addEventListener('ended', function() {
            playNextRandom();
        });
        endedHandlerAdded = true;
    }

    // Start playback with a random video (avoiding immediate repeats)
    playNextRandom();
});

// --- Controller wiring ---
// Populate select with labels
if (selectEl) {
    labels.forEach((lbl, i) => {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = lbl;
        selectEl.appendChild(opt);
    });
    // change handler
    selectEl.addEventListener('change', function() {
        const v = Number(this.value);
        if (!Number.isNaN(v)) playIndex(v);
    });
}

// Prev/Next buttons (sequential)
if (prevBtn) prevBtn.addEventListener('click', function() {
    const idx = (lastIdx === null) ? 0 : (lastIdx - 1 + videos.length) % videos.length;
    playIndex(idx);
});
if (nextBtn) nextBtn.addEventListener('click', function() {
    const idx = (lastIdx === null) ? 0 : (lastIdx + 1) % videos.length;
    playIndex(idx);
});

// Volume slider
if (volumeSlider) {
    // set initial slider position
    volumeSlider.value = String(video.volume || 0.5);
    volumeSlider.addEventListener('input', function() {
        const v = parseFloat(this.value);
        if (!Number.isNaN(v)) video.volume = v;
    });
}

// Ensure background scrollers are long enough to never show gaps.
function ensureScrollerLengths() {
    const inners = document.querySelectorAll('.sins-inner');
    inners.forEach(inner => {
        const containerWidth = inner.parentElement.clientWidth;
        const firstText = inner.querySelector('.sins-text');
        if (!firstText) return;
        // Grow the content of the first text until it's at least the container width
        const base = firstText.textContent;
        // Avoid infinite loops; cap iterations
        let attempts = 0;
        while (firstText.offsetWidth < containerWidth && attempts < 10) {
            firstText.textContent = firstText.textContent + '\u00A0' + base;
            attempts++;
        }
        // Ensure there is a second identical copy for seamless loop
        let copies = inner.querySelectorAll('.sins-text');
        if (copies.length < 2) {
            const clone = firstText.cloneNode(true);
            inner.appendChild(clone);
        } else {
            // sync second copy
            copies[1].textContent = firstText.textContent;
        }
    });
}

// run on load and resize (debounced)
window.addEventListener('load', ensureScrollerLengths);
let scResizeTimer = null;
window.addEventListener('resize', function() {
    clearTimeout(scResizeTimer);
    scResizeTimer = setTimeout(ensureScrollerLengths, 150);
});

// Audio-reactive animation setup
let audioCtx, analyzer, dataArray, animationId;
const y2kImage = document.getElementById('image');

// Mobile detection
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Handle mobile video playback
function handleVideoPlayback() {
    if (video.paused) {
        video.play().then(() => {
            video.muted = false;
            initAudioReactive();
        }).catch(err => {
            console.warn('Playback failed:', err);
            // If autoplay fails, show a play button
            showPlayButton();
        });
    }
}

// Create and show play button if needed
function showPlayButton() {
    if (!document.getElementById('play-button')) {
        const playBtn = document.createElement('button');
        playBtn.id = 'play-button';
        playBtn.innerHTML = '▶ Play';
        playBtn.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 5;
            background: rgba(255, 0, 0, 0.8);
            color: white;
            border: none;
            padding: 20px 40px;
            font-size: 24px;
            border-radius: 8px;
            cursor: pointer;
        `;
        playBtn.addEventListener('click', () => {
            handleVideoPlayback();
            playBtn.remove();
        });
        document.body.appendChild(playBtn);
    }
}

function initAudioReactive() {
    try {
        if (audioCtx) return; // already initialized

        console.log('Initializing audio reactive features...');
        
        // Create audio context and analyzer
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyzer = audioCtx.createAnalyser();
        analyzer.fftSize = 256;
        const bufferLength = analyzer.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Connect video audio to analyzer
        const source = audioCtx.createMediaElementSource(video);
        source.connect(analyzer);
        analyzer.connect(audioCtx.destination);

        console.log('Audio context and analyzer set up successfully');

        // Start animation loop
        animateY2K();
        console.log('Animation loop started');
    } catch (error) {
        console.error('Error initializing audio reactive features:', error);
    }
}

function animateY2K() {
    animationId = requestAnimationFrame(animateY2K);
    
    // Get frequency data
    analyzer.getByteFrequencyData(dataArray);
    
    // Calculate average amplitude (focused on bass/mid frequencies)
    let sum = 0;
    const sampleSize = 20; // lower frequencies
    for (let i = 0; i < sampleSize; i++) {
        sum += dataArray[i];
    }
    const average = sum / sampleSize;
    
    // Map 0-255 amplitude to visual effects
    const normalizedAmp = average / 255;
    const minScale = 0.5;  // minimum scale
    const maxScale = 0.65; // maximum scale (adjust these as needed)
    const scale = minScale + (normalizedAmp * (maxScale - minScale));
    
    // Apply visual effects
    if (y2kImage) {
        // Scale and move based on amplitude
        y2kImage.style.transform = `translate(-50%, -50%) scale(${scale})`;
        // Fade opacity slightly with amplitude
        y2kImage.style.opacity = 0.8 + (normalizedAmp * 0.2);
        // Add a slight vertical bounce
        const bounce = Math.sin(Date.now() / 200) * normalizedAmp * 10;
        y2kImage.style.marginTop = `${bounce}px`;
    }
}
