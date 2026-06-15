/* ============================================
   NEXUSPLAY — GAMING WEBSITE JAVASCRIPT
   ============================================ */

'use strict';

/* ============================================
   1. CUSTOM CURSOR
   ============================================ */
const cursorOuter = document.getElementById('cursorOuter');
const cursorInner = document.getElementById('cursorInner');

let mouseX = 0, mouseY = 0;
let outerX = 0, outerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorInner.style.left = mouseX + 'px';
  cursorInner.style.top  = mouseY + 'px';
});

function animateCursor() {
  outerX += (mouseX - outerX) * 0.12;
  outerY += (mouseY - outerY) * 0.12;
  cursorOuter.style.left = outerX + 'px';
  cursorOuter.style.top  = outerY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .game-card, .lb-filter, .dot').forEach(el => {
  el.addEventListener('mouseenter', () => cursorOuter.classList.add('hovered'));
  el.addEventListener('mouseleave', () => cursorOuter.classList.remove('hovered'));
});

/* ============================================
   2. PARTICLE SYSTEM
   ============================================ */
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLORS = ['#00f5ff', '#bf00ff', '#00ff88', '#ff006e'];

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x     = Math.random() * canvas.width;
    this.y     = Math.random() * canvas.height;
    this.size  = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.6 + 0.2;
    this.life  = Math.random() * 300 + 100;
    this.age   = 0;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.age++;
    if (this.age > this.life) this.reset();
    if (this.x < 0 || this.x > canvas.width)  this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha * (1 - this.age / this.life);
    ctx.fillStyle   = this.color;
    ctx.shadowBlur  = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Create particles
for (let i = 0; i < 120; i++) {
  particles.push(new Particle());
}

// Draw connecting lines between nearby particles
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.save();
        ctx.globalAlpha = 0.05 * (1 - dist / 100);
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ============================================
   3. NAVBAR SCROLL EFFECT
   ============================================ */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // Scrolled style
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active nav link
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    // Close mobile menu
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('hamburger').classList.remove('open');
  });
});

// Hamburger
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open');
});

/* ============================================
   4. COUNTER ANIMATION (Hero Stats)
   ============================================ */
function animateCounter(el, target, duration = 2000) {
  const start     = performance.now();
  const startVal  = 0;
  const easeFn    = t => 1 - Math.pow(1 - t, 3);

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.floor(easeFn(progress) * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

// Trigger counters when hero is visible
const statNums = document.querySelectorAll('.stat-num');
let countersStarted = false;

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      statNums.forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
    }
  });
}, { threshold: 0.5 });

if (statNums.length) counterObserver.observe(statNums[0].closest('.hero-stats'));

/* ============================================
   5. GAME SLIDER
   ============================================ */
const sliderTrack  = document.getElementById('sliderTrack');
const sliderPrev   = document.getElementById('sliderPrev');
const sliderNext   = document.getElementById('sliderNext');
const dotsContainer = document.getElementById('sliderDots');
const cards        = document.querySelectorAll('.game-card');

let currentSlide   = 0;
let autoSlideTimer = null;

function getVisibleCards() {
  const w = window.innerWidth;
  if (w < 600) return 1;
  if (w < 900) return 2;
  return 3;
}

function getCardWidth() {
  const card = cards[0];
  const style = getComputedStyle(sliderTrack);
  const gap   = parseFloat(style.gap) || 24;
  return card.offsetWidth + gap;
}

function getTotalSlides() {
  return Math.max(0, cards.length - getVisibleCards());
}

// Create dots
function buildDots() {
  dotsContainer.innerHTML = '';
  const total = getTotalSlides() + 1;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === currentSlide ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

function updateDots() {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function goToSlide(index) {
  const total = getTotalSlides();
  currentSlide = Math.max(0, Math.min(index, total));
  const offset = currentSlide * getCardWidth();
  sliderTrack.style.transform = `translateX(-${offset}px)`;

  // Active card highlight
  cards.forEach((card, i) => {
    card.classList.toggle('active', i === currentSlide);
  });
  updateDots();
}

sliderNext.addEventListener('click', () => {
  const total = getTotalSlides();
  goToSlide(currentSlide < total ? currentSlide + 1 : 0);
  resetAutoSlide();
});
sliderPrev.addEventListener('click', () => {
  const total = getTotalSlides();
  goToSlide(currentSlide > 0 ? currentSlide - 1 : total);
  resetAutoSlide();
});

function startAutoSlide() {
  autoSlideTimer = setInterval(() => {
    const total = getTotalSlides();
    goToSlide(currentSlide < total ? currentSlide + 1 : 0);
  }, 3500);
}

function resetAutoSlide() {
  clearInterval(autoSlideTimer);
  startAutoSlide();
}

// Touch/drag support
let dragStartX   = 0;
let isDragging   = false;

sliderTrack.addEventListener('mousedown',  e => { isDragging = true; dragStartX = e.clientX; });
sliderTrack.addEventListener('touchstart', e => { isDragging = true; dragStartX = e.touches[0].clientX; }, { passive: true });

document.addEventListener('mouseup', e => {
  if (!isDragging) return;
  isDragging = false;
  const diff = dragStartX - e.clientX;
  if (Math.abs(diff) > 50) goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
});
document.addEventListener('touchend', e => {
  if (!isDragging) return;
  isDragging = false;
  const diff = dragStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
});

window.addEventListener('resize', () => { buildDots(); goToSlide(0); });

buildDots();
startAutoSlide();

/* ============================================
   6. VIDEO PLAYER
   ============================================ */
const heroVideo        = document.getElementById('heroVideo');
const videoOverlay     = document.getElementById('videoOverlay');
const videoPlayBtn     = document.getElementById('videoPlayBtn');
const vcPlayPause      = document.getElementById('vcPlayPause');
const vcMute           = document.getElementById('vcMute');
const vcFullscreen     = document.getElementById('vcFullscreen');
const vcProgressFill   = document.getElementById('vcProgressFill');
const videoControlsBar = document.getElementById('videoControlsBar');

let controlsTimeout = null;

function showControls() {
  videoControlsBar.style.opacity = '1';
  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(hideControls, 3000);
}
function hideControls() {
  videoControlsBar.style.opacity = '0';
}

// Play / pause toggle
function togglePlay() {
  if (heroVideo.paused) {
    heroVideo.play();
    vcPlayPause.textContent = '⏸';
    videoOverlay.classList.add('hidden');
  } else {
    heroVideo.pause();
    vcPlayPause.textContent = '▶';
    videoOverlay.classList.remove('hidden');
  }
}

videoPlayBtn.addEventListener('click', togglePlay);
vcPlayPause.addEventListener('click', togglePlay);

// Auto-play muted on load
heroVideo.muted  = true;
heroVideo.volume = 0;
heroVideo.play().catch(() => {});
videoOverlay.classList.add('hidden');
vcPlayPause.textContent = '⏸';

// Mute toggle
vcMute.addEventListener('click', () => {
  heroVideo.muted = !heroVideo.muted;
  vcMute.textContent = heroVideo.muted ? '🔇' : '🔊';
});

// Progress update
heroVideo.addEventListener('timeupdate', () => {
  if (!heroVideo.duration) return;
  const pct = (heroVideo.currentTime / heroVideo.duration) * 100;
  vcProgressFill.style.width = pct + '%';
});

// Fullscreen
vcFullscreen.addEventListener('click', () => {
  const frame = heroVideo.parentElement;
  if (!document.fullscreenElement) {
    frame.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});

// Show controls on mouse move over video
heroVideo.parentElement.addEventListener('mousemove', showControls);
heroVideo.parentElement.addEventListener('mouseenter', showControls);
heroVideo.parentElement.addEventListener('mouseleave', hideControls);

// Click on video area to toggle
heroVideo.addEventListener('click', togglePlay);

// Video error fallback - show poster
heroVideo.addEventListener('error', () => {
  videoControlsBar.style.display = 'none';
  videoOverlay.classList.remove('hidden');
  videoPlayBtn.style.display = 'none';
  const msg = document.createElement('div');
  msg.style.cssText = 'color:#7b82a8;font-family:Share Tech Mono,monospace;font-size:.75rem;letter-spacing:2px;text-align:center;padding:20px;';
  msg.textContent = 'PREVIEW VIDEO · CLICK TO PLAY ON YOUR DEVICE';
  videoOverlay.appendChild(msg);
});

/* ============================================
   7. LEADERBOARD DATA
   ============================================ */
const leaderboardData = {
  global: [
    { rank: 1, name: 'ShadowX', tag: '#0001', avatar: '🦅', game: 'Shadow Strike', wins: '8,421', score: '2,847,300' },
    { rank: 2, name: 'QuantumV', tag: '#0044', avatar: '⚡', game: 'Void Sector',   wins: '7,889', score: '2,491,200' },
    { rank: 3, name: 'IronLegend', tag: '#0123', avatar: '🛡️', game: 'Iron Fortress', wins: '7,200', score: '2,100,560' },
    { rank: 4, name: 'NightBlade', tag: '#0556', avatar: '🌙', game: 'Dragon Realm', wins: '6,744', score: '1,988,400' },
    { rank: 5, name: 'TurboGhost', tag: '#0712', avatar: '🏎️', game: 'Turbo Blaze',  wins: '6,011', score: '1,756,900' },
    { rank: 6, name: 'StarForge',  tag: '#0891', avatar: '⭐', game: 'Void Sector',  wins: '5,500', score: '1,620,100' },
    { rank: 7, name: 'WildHunter', tag: '#1020', avatar: '🌲', game: 'Dark Wilds',   wins: '5,002', score: '1,540,800' },
  ],
  weekly: [
    { rank: 1, name: 'NightBlade', tag: '#0556', avatar: '🌙', game: 'Dragon Realm', wins: '312', score: '142,400' },
    { rank: 2, name: 'StarForge',  tag: '#0891', avatar: '⭐', game: 'Void Sector',  wins: '290', score: '133,100' },
    { rank: 3, name: 'ShadowX',    tag: '#0001', avatar: '🦅', game: 'Shadow Strike', wins: '278', score: '128,700' },
    { rank: 4, name: 'QuantumV',   tag: '#0044', avatar: '⚡', game: 'Void Sector',  wins: '251', score: '114,300' },
    { rank: 5, name: 'TurboGhost', tag: '#0712', avatar: '🏎️', game: 'Turbo Blaze', wins: '240', score: '108,900' },
  ],
  monthly: [
    { rank: 1, name: 'QuantumV',   tag: '#0044', avatar: '⚡', game: 'Void Sector',   wins: '1,400', score: '524,800' },
    { rank: 2, name: 'IronLegend', tag: '#0123', avatar: '🛡️', game: 'Iron Fortress', wins: '1,288', score: '499,200' },
    { rank: 3, name: 'ShadowX',    tag: '#0001', avatar: '🦅', game: 'Shadow Strike',  wins: '1,101', score: '470,500' },
    { rank: 4, name: 'WildHunter', tag: '#1020', avatar: '🌲', game: 'Dark Wilds',     wins: '988',   score: '401,100' },
    { rank: 5, name: 'NightBlade', tag: '#0556', avatar: '🌙', game: 'Dragon Realm',   wins: '901',   score: '380,400' },
    { rank: 6, name: 'TurboGhost', tag: '#0712', avatar: '🏎️', game: 'Turbo Blaze',  wins: '844',   score: '360,200' },
  ]
};

function renderLeaderboard(filter) {
  const data  = leaderboardData[filter] || leaderboardData.global;
  const table = document.getElementById('lbTable');
  table.innerHTML = `
    <div class="lb-row lb-header">
      <span>Rank</span>
      <span>Player</span>
      <span>Game</span>
      <span>Wins</span>
      <span>Score</span>
    </div>`;

  data.forEach((player, idx) => {
    const row = document.createElement('div');
    row.className = `lb-row rank-${player.rank}`;
    row.style.animationDelay = (idx * 0.08) + 's';
    row.innerHTML = `
      <span class="rank-num">${player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : '#' + player.rank}</span>
      <div class="lb-player">
        <div class="lb-avatar">${player.avatar}</div>
        <div>
          <div class="lb-name">${player.name}</div>
          <div class="lb-tag">${player.tag}</div>
        </div>
      </div>
      <span class="lb-game">${player.game}</span>
      <span class="lb-wins">${player.wins}</span>
      <span class="lb-score">${player.score}</span>`;
    // Slide-in animation
    row.style.opacity = '0';
    row.style.transform = 'translateX(-20px)';
    row.style.transition = `opacity 0.4s ease ${idx * 0.07}s, transform 0.4s ease ${idx * 0.07}s`;
    table.appendChild(row);
    setTimeout(() => {
      row.style.opacity = '1';
      row.style.transform = 'translateX(0)';
    }, 50);
  });
}

const lbFilters = document.querySelectorAll('.lb-filter');
lbFilters.forEach(btn => {
  btn.addEventListener('click', () => {
    lbFilters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderLeaderboard(btn.dataset.filter);
  });
});

renderLeaderboard('global');

/* ============================================
   8. SCROLL REVEAL ANIMATION
   ============================================ */
const revealEls = document.querySelectorAll(
  '.game-card, .feature-card, .section-header, .video-wrapper, .lb-container, .cta-content, .footer-brand, .footer-col'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ============================================
   9. BUTTON CLICK EFFECTS
   ============================================ */
function createRipple(e, btn) {
  const rect   = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size   = Math.max(rect.width, rect.height);
  ripple.style.cssText = `
    position:absolute;
    width:${size}px; height:${size}px;
    left:${e.clientX - rect.left - size/2}px;
    top:${e.clientY - rect.top - size/2}px;
    background:rgba(255,255,255,0.25);
    border-radius:50%;
    transform:scale(0);
    animation:rippleAnim 0.6s ease-out;
    pointer-events:none;
  `;
  if (!document.querySelector('#rippleStyle')) {
    const style = document.createElement('style');
    style.id = 'rippleStyle';
    style.textContent = '@keyframes rippleAnim { to { transform:scale(4); opacity:0; } }';
    document.head.appendChild(style);
  }
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

document.querySelectorAll('.btn-neon, .btn-primary, .card-btn').forEach(btn => {
  btn.addEventListener('click', (e) => createRipple(e, btn));
});

/* ============================================
   10. FEATURE CARD BAR ANIMATION
   ============================================ */
const fcFill = document.querySelector('.fc-fill');
if (fcFill) {
  const targetWidth = fcFill.style.width;
  fcFill.style.width = '0%';
  const barObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      fcFill.style.width = targetWidth;
      barObserver.disconnect();
    }
  }, { threshold: 0.5 });
  barObserver.observe(fcFill.closest('.feature-card'));
}

/* ============================================
   11. TITLE TYPING EFFECT (Subtle)
   ============================================ */
const heroDesc = document.querySelector('.hero-desc');
if (heroDesc) {
  const originalText = heroDesc.textContent.trim();
  heroDesc.textContent = '';
  let charIdx = 0;

  function typeChar() {
    if (charIdx < originalText.length) {
      heroDesc.textContent += originalText[charIdx];
      charIdx++;
      setTimeout(typeChar, 18);
    }
  }
  // Start after hero animations
  setTimeout(typeChar, 1200);
}

/* ============================================
   12. PARALLAX HERO VISUAL
   ============================================ */
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    heroVisual.style.transform = `translate(${dx * 12}px, ${dy * 8}px)`;
  });
}

/* ============================================
   13. CTA BUTTON GLOW ON HOVER
   ============================================ */
const ctaBtn = document.getElementById('ctaBtn');
if (ctaBtn) {
  ctaBtn.addEventListener('mousemove', (e) => {
    const rect = ctaBtn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ctaBtn.style.background = `radial-gradient(circle at ${x}% ${y}%, #00ff88, #00f5ff)`;
  });
  ctaBtn.addEventListener('mouseleave', () => {
    ctaBtn.style.background = '';
  });
}

/* ============================================
   14. MOBILE NAV AUTO-CLOSE ON LINK CLICK
   ============================================ */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

console.log('%c⬡ NEXUSPLAY LOADED', 'color:#00f5ff;font-family:Orbitron;font-size:18px;font-weight:900;text-shadow:0 0 10px #00f5ff');