/**
 * Agrismart — Main Frontend JS
 * Handles: navbar, scroll reveals, counter animations,
 *          particles, tab switching, API calls
 */

(function () {
  'use strict';

  const API = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http'))
    ? window.location.origin
    : 'http://127.0.0.1:8000';

  /* ══════════════════════════════════════════
     NAVBAR
  ══════════════════════════════════════════ */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');
  if (sections.length && navLinkEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinkEls.forEach(l => l.classList.remove('active'));
          const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => obs.observe(s));
  }

  /* ══════════════════════════════════════════
     SCROLL REVEAL
  ══════════════════════════════════════════ */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('revealed'), i * 80);
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => revealObs.observe(el));
  }

  /* ══════════════════════════════════════════
     COUNTER ANIMATION
  ══════════════════════════════════════════ */
  const counters = document.querySelectorAll('[data-target]');
  if (counters.length) {
    const countObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          countObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => countObs.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(eased * target);
      el.textContent = val >= 1000 ? val.toLocaleString() + '+' : val + (target === 94 ? '%' : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ══════════════════════════════════════════
     HERO PARTICLES (DOM)
  ══════════════════════════════════════════ */
  const particlesContainer = document.getElementById('particles');
  if (particlesContainer) {
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: hsla(142, 70%, 60%, ${Math.random() * 0.5 + 0.2});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: floatParticle ${Math.random() * 8 + 6}s ease-in-out infinite;
        animation-delay: -${Math.random() * 8}s;
      `;
      particlesContainer.appendChild(p);
    }
    // Inject keyframes
    if (!document.getElementById('particleKF')) {
      const style = document.createElement('style');
      style.id = 'particleKF';
      style.textContent = `
        @keyframes floatParticle {
          0%, 100% { transform: translate(0,0) scale(1); opacity: 0.5; }
          33% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * -40 - 10}px) scale(1.2); opacity: 0.8; }
          66% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 20}px) scale(0.8); opacity: 0.3; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ══════════════════════════════════════════
     STRIP DUPLICATE (for infinite scroll effect)
  ══════════════════════════════════════════ */
  const stripInner = document.querySelector('.strip-inner');
  if (stripInner) {
    stripInner.innerHTML += stripInner.innerHTML;
  }

  /* ══════════════════════════════════════════
     CHART BARS (dashboard)
  ══════════════════════════════════════════ */
  const chartBars = document.querySelectorAll('.chart-bar');
  if (chartBars.length) {
    const heights = [45, 62, 78, 55, 85, 70, 92, 68, 80, 60, 75, 88];
    chartBars.forEach((bar, i) => {
      bar.style.height = '0%';
      setTimeout(() => {
        bar.style.height = (heights[i] || Math.random() * 50 + 40) + '%';
      }, i * 80 + 300);
    });
  }

  /* ══════════════════════════════════════════
     PREDICT PAGE TABS
  ══════════════════════════════════════════ */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const predictContents = document.querySelectorAll('.predict-content');
  if (tabBtns.length) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        predictContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
    // Auto-select from URL hash
    const hash = window.location.hash;
    if (hash) {
      const targetBtn = document.querySelector(`[data-tab="${hash.replace('#', '')}"]`);
      if (targetBtn) targetBtn.click();
    }
  }

  /* ══════════════════════════════════════════
     CROP PREDICTION FORM
  ══════════════════════════════════════════ */
  const cropForm = document.getElementById('cropForm');
  if (cropForm) {
    cropForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = cropForm.querySelector('.submit-btn');
      const spinner = cropForm.querySelector('.spinner');
      const resultBox = document.getElementById('cropResult');

      btn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';

      const data = {
        N: parseFloat(document.getElementById('N').value),
        P: parseFloat(document.getElementById('P').value),
        K: parseFloat(document.getElementById('K').value),
        temperature: parseFloat(document.getElementById('temperature').value),
        humidity: parseFloat(document.getElementById('humidity').value),
        ph: parseFloat(document.getElementById('ph').value),
        rainfall: parseFloat(document.getElementById('rainfall').value),
      };

      try {
        const res = await fetch(`${API}/Agri/api/predict/crop/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        if (json.success) {
          showCropResult(json.data.crop, resultBox);
        } else {
          showError(resultBox, json.error || 'Prediction failed');
        }
      } catch (err) {
        showError(resultBox, 'Could not connect to server. Make sure Django is running.');
      } finally {
        btn.disabled = false;
        if (spinner) spinner.style.display = 'none';
      }
    });
  }

  function showCropResult(crop, box) {
    const cropEmojis = {
      rice: '🌾', wheat: '🌾', maize: '🌽', cotton: '🌸', sugarcane: '🎋',
      jute: '🌿', coffee: '☕', coconut: '🥥', papaya: '🍈', orange: '🍊',
      apple: '🍎', muskmelon: '🍈', watermelon: '🍉', grapes: '🍇',
      mango: '🥭', banana: '🍌', pomegranate: '🍎', lentil: '🌱',
      blackgram: '🌱', mungbean: '🌱', mothbeans: '🌱', pigeonpeas: '🌱',
      kidneybeans: '🫘', chickpea: '🫘',
    };
    const emoji = cropEmojis[crop.toLowerCase()] || '🌱';
    box.innerHTML = `
      <span class="result-emoji">${emoji}</span>
      <div class="result-label">Recommended Crop</div>
      <div class="result-value">${crop.charAt(0).toUpperCase() + crop.slice(1)}</div>
      <div class="result-note">Based on your soil parameters and climate data</div>
    `;
    box.classList.add('show');
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ══════════════════════════════════════════
     FERTILIZER PREDICTION FORM
  ══════════════════════════════════════════ */
  const fertForm = document.getElementById('fertForm');
  if (fertForm) {
    fertForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = fertForm.querySelector('.submit-btn');
      const spinner = fertForm.querySelector('.spinner');
      const resultBox = document.getElementById('fertResult');

      btn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';

      const data = {
        N: parseFloat(document.getElementById('fN').value),
        P: parseFloat(document.getElementById('fP').value),
        K: parseFloat(document.getElementById('fK').value),
        T: parseFloat(document.getElementById('fT').value),
        Hum: parseFloat(document.getElementById('fHum').value),
        Moisture: parseFloat(document.getElementById('fMoisture').value),
        Soil_Type: document.getElementById('fSoil').value,
        Crop_Type: document.getElementById('fCrop').value,
      };

      try {
        const res = await fetch(`${API}/Agri/api/predict/fertilizer/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.success) {
          showFertResult(json.data.fertilizer, resultBox);
        } else {
          showError(resultBox, json.error || 'Prediction failed');
        }
      } catch (err) {
        showError(resultBox, 'Could not connect to server. Make sure Django is running.');
      } finally {
        btn.disabled = false;
        if (spinner) spinner.style.display = 'none';
      }
    });
  }

  function showFertResult(fertilizer, box) {
    box.innerHTML = `
      <span class="result-emoji">🧪</span>
      <div class="result-label">Recommended Fertilizer</div>
      <div class="result-value">${fertilizer}</div>
      <div class="result-note">Optimized for your soil type and crop selection</div>
    `;
    box.classList.add('show');
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ══════════════════════════════════════════
     DISEASE PREDICTION FORM
  ══════════════════════════════════════════ */
  const diseaseForm = document.getElementById('diseaseForm');
  if (diseaseForm) {
    diseaseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = diseaseForm.querySelector('.submit-btn');
      const spinner = diseaseForm.querySelector('.spinner');
      const resultBox = document.getElementById('diseaseResult');
      const fileInput = document.getElementById('diseaseImage');

      if (!fileInput.files || fileInput.files.length === 0) {
        showError(resultBox, 'Please select an image file first.');
        return;
      }

      btn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';

      const formData = new FormData();
      formData.append('image', fileInput.files[0]);

      try {
        const res = await fetch(`${API}/Agri/api/predict/disease/`, {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (json.success) {
          showDiseaseResult(json.data, resultBox);
        } else {
          showError(resultBox, json.error || 'Prediction failed');
        }
      } catch (err) {
        showError(resultBox, 'Could not connect to server. Make sure Django is running.');
      } finally {
        btn.disabled = false;
        if (spinner) spinner.style.display = 'none';
      }
    });
  }

  function showDiseaseResult(data, box) {
    box.innerHTML = `
      <span class="result-emoji">🦠</span>
      <div class="result-label">Detected Condition</div>
      <div class="result-value" style="font-size:1.5rem">${data.disease}</div>
      <div class="result-note">Confidence: ${(data.confidence * 100).toFixed(1)}%</div>
    `;
    box.classList.add('show');
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showError(box, msg) {
    box.innerHTML = `
      <span class="result-emoji">❌</span>
      <div class="result-label">Error</div>
      <div class="result-value" style="font-size:1.2rem;color:#f87171">${msg}</div>
    `;
    box.classList.add('show');
  }

  /* ══════════════════════════════════════════
     AUTH FORMS
  ══════════════════════════════════════════ */
  const authTabs = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('.auth-form');
  if (authTabs.length) {
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        authTabs.forEach(t => t.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.form);
        if (target) target.classList.add('active');
      });
    });
    // Check URL hash for register
    if (window.location.hash === '#register') {
      const regTab = document.querySelector('[data-form="registerForm"]');
      if (regTab) regTab.click();
    }
  }

  // Login form
  const loginFormEl = document.getElementById('loginForm');
  if (loginFormEl) {
    loginFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('loginMsg');
      const btn = loginFormEl.querySelector('.auth-submit');

      btn.disabled = true;
      btn.textContent = 'Signing in...';
      if (msg) { msg.className = 'auth-message'; msg.textContent = ''; }

      const data = {
        username: document.getElementById('loginUser').value.trim(),
        password: document.getElementById('loginPass').value,
      };

      try {
        const res = await fetch(`${API}/Agri/api/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success) {
          showAuthMsg(msg, `Welcome back, ${json.data.username}! Redirecting...`, 'success');
          setTimeout(() => window.location.href = 'dashboard.html', 1200);
        } else {
          showAuthMsg(msg, json.error || 'Login failed', 'error');
        }
      } catch {
        showAuthMsg(msg, 'Cannot connect to server.', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });
  }

  // Register form
  const registerFormEl = document.getElementById('registerForm');
  if (registerFormEl) {
    registerFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('registerMsg');
      const btn = registerFormEl.querySelector('.auth-submit');

      btn.disabled = true;
      btn.textContent = 'Creating account...';
      if (msg) { msg.className = 'auth-message'; msg.textContent = ''; }

      const data = {
        username: document.getElementById('regUser').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regPass').value,
      };

      if (data.password !== document.getElementById('regPass2').value) {
        showAuthMsg(msg, 'Passwords do not match', 'error');
        btn.disabled = false;
        btn.textContent = 'Create Account';
        return;
      }

      try {
        const res = await fetch(`${API}/Agri/api/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.success) {
          showAuthMsg(msg, 'Account created! Please sign in.', 'success');
          setTimeout(() => {
            const loginTab = document.querySelector('[data-form="loginForm"]');
            if (loginTab) loginTab.click();
          }, 1500);
        } else {
          showAuthMsg(msg, json.error || 'Registration failed', 'error');
        }
      } catch {
        showAuthMsg(msg, 'Cannot connect to server.', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    });
  }

  function showAuthMsg(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = `auth-message ${type}`;
  }

  /* ══════════════════════════════════════════
     WEATHER (dashboard)
  ══════════════════════════════════════════ */
  async function loadWeather() {
    const tempEl = document.getElementById('dashTemp');
    const descEl = document.getElementById('dashDesc');
    const locEl = document.getElementById('dashLoc');
    const rainEl = document.getElementById('dashRain');
    if (!tempEl) return;

    try {
      const keyRes = await fetch(`${API}/Agri/api/weather-key/`);
      const { api_key } = await keyRes.json();

      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const wRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`
        );
        const w = await wRes.json();

        if (tempEl) tempEl.textContent = `${Math.round(w.main.temp)}°C`;
        if (descEl) descEl.textContent = w.weather[0].description;
        if (locEl) locEl.textContent = `${w.name}, ${w.sys.country}`;
        const rain = w.rain ? (w.rain['1h'] || w.rain['3h'] || 0) : 0;
        if (rainEl) rainEl.textContent = `${rain} mm`;

        // Update dashboard humidity
        const humEl = document.getElementById('dashHum');
        if (humEl) humEl.textContent = `${w.main.humidity}%`;

        // Map
        loadMap(lat, lon);
      }, () => {
        if (locEl) locEl.textContent = 'Location not available';
      });
    } catch (err) {
      console.warn('Weather fetch failed:', err);
    }
  }

  function loadMap(lat, lon) {
    const mapEl = document.getElementById('dashMap');
    if (!mapEl) return;
    mapEl.innerHTML = `
      <iframe
        width="100%" height="100%" style="border:none; border-radius: 12px;"
        src="https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05}%2C${lat - 0.05}%2C${lon + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lon}"
        allowfullscreen loading="lazy">
      </iframe>`;
  }

  if (document.getElementById('dashTemp')) {
    loadWeather();
  }

  /* ══════════════════════════════════════════
     LOADING SCREEN
  ══════════════════════════════════════════ */
  const loading = document.getElementById('loadingOverlay');
  if (loading) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loading.style.opacity = '0';
        loading.style.transition = 'opacity 0.5s';
        setTimeout(() => loading.style.display = 'none', 500);
      }, 800);
    });
  }

  /* ══════════════════════════════════════════
     SMOOTH SCROLL for anchor links
  ══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
