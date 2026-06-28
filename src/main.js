import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';
import { initParticles, burstPetals } from './canvas-particles.js';
import { initAudio, playMusic, togglePlay, toggleMute, setVolume } from './audio.js';
import { initScratchCard } from './scratchcard.js';

gsap.registerPlugin(ScrollTrigger);

// Reveal body once script is active
document.body.style.opacity = '1';
document.body.classList.remove('overflow-hidden');
if (!document.getElementById('royal-gate')) {
  document.body.classList.add('overflow-y-auto');
} else {
  document.body.classList.add('overflow-hidden');
}

// 1. Initialize Custom Cursor
const cursor = document.getElementById('custom-cursor');
const cursorDot = document.getElementById('custom-cursor-dot');

if (cursor && cursorDot) {
  document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.02 });
  });

  // Cursor Hover Effects
  const interactives = document.querySelectorAll('a, button, input, select, textarea, .gallery-card, #scratch-canvas');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '40px';
      cursor.style.height = '40px';
      cursor.style.borderColor = '#f3e5ab';
      cursor.style.backgroundColor = 'rgba(243, 229, 171, 0.1)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      cursor.style.borderColor = '#c5a059';
      cursor.style.backgroundColor = 'transparent';
    });
  });
}

// 2. Initialize Background Particle System
const bgCanvas = document.getElementById('bg-canvas');
let cleanupParticles = null;
if (bgCanvas) {
  cleanupParticles = initParticles(bgCanvas);
}

// 3. Initialize Audio API
initAudio();

// 4. Palace Temple Bell Synthesizer (Web Audio API)
function playPalaceBell() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;

    // Resonant bronze bell frequencies
    const fundamental = 180; // deep base bell frequency
    const partials = [1.0, 1.48, 1.95, 2.25, 2.68, 3.12, 3.8, 4.3];
    const amplitudes = [0.8, 0.5, 0.4, 0.3, 0.25, 0.18, 0.1, 0.05];
    const decays = [4.5, 3.5, 3.0, 2.5, 1.8, 1.5, 1.0, 0.6];

    partials.forEach((partial, i) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * partial, now);

      gainNode.gain.setValueAtTime(0, now);
      // Sharp strike attack, exponential tail
      gainNode.gain.linearRampToValueAtTime(amplitudes[i], now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decays[i]);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + decays[i] + 0.5);
    });
  } catch (err) {
    console.warn('AudioContext failed:', err);
  }
}

// 5. Gate Opening Animation
const btnOpenGate = document.getElementById('btn-open-gate');
const royalGate = document.getElementById('royal-gate');
const mainContent = document.getElementById('main-content');
const musicWidget = document.getElementById('music-widget');

if (btnOpenGate && royalGate && mainContent) {
  btnOpenGate.addEventListener('click', () => {
    // 1. Play temple bell
    playPalaceBell();

    // 2. Play soundtrack
    playMusic();

    // 3. Trigger cinematic gate opening GSAP timeline
    const tl = gsap.timeline({
      onComplete: () => {
        // Remove gate from DOM to release resources
        royalGate.style.display = 'none';
        document.body.classList.remove('overflow-hidden');
        document.body.classList.add('overflow-y-auto');
      }
    });

    // Animate central UI out
    tl.to('#gate-center-ui', {
      scale: 0.85,
      opacity: 0,
      duration: 1,
      ease: 'power2.out'
    });

    // Zoom-in camera effect
    tl.to('#gate-sky', {
      scale: 1.3,
      duration: 4,
      ease: 'power2.inOut'
    }, 0);

    // Rotate Left & Right Doors Outward (3D effect)
    tl.to('#gate-left', {
      rotateY: -95,
      x: '-10%',
      duration: 3.5,
      ease: 'power2.inOut'
    }, 0.5);

    tl.to('#gate-right', {
      rotateY: 95,
      x: '10%',
      duration: 3.5,
      ease: 'power2.inOut'
    }, 0.5);

    // Fade lanterns and gate shadows
    tl.to('.lantern-glow', {
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out'
    }, 1);

    // Burst petals from screen center
    tl.add(() => {
      burstPetals(bgCanvas, 50);
    }, 1.5);

    // Show main content and fade it in
    tl.add(() => {
      mainContent.classList.remove('hidden');
      mainContent.classList.add('flex', 'flex-col');
      
      // Animate Hero text stagger reveal
      gsap.from('#hero-content > *', {
        y: 80,
        opacity: 0,
        stagger: 0.25,
        duration: 1.8,
        ease: 'power3.out'
      });
      
      // Show audio widget controls
      musicWidget.style.opacity = '1';
      musicWidget.style.transform = 'translateY(0)';
      musicWidget.style.pointerEvents = 'auto';
    }, 2);

    // Final fadeout of the gate container
    tl.to(royalGate, {
      opacity: 0,
      duration: 1.5,
      ease: 'power1.inOut'
    }, 3);
  });
}

// 6. Audio Control Event Binding
const musicPlayBtn = document.getElementById('music-play-btn');
const musicMuteBtn = document.getElementById('music-mute-btn');
const musicVolume = document.getElementById('music-volume');

if (musicPlayBtn) {
  musicPlayBtn.addEventListener('click', () => {
    const isPlaying = togglePlay();
    musicPlayBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
  });
}

if (musicMuteBtn) {
  musicMuteBtn.addEventListener('click', () => {
    const isMuted = toggleMute();
    musicMuteBtn.innerHTML = isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
  });
}

if (musicVolume) {
  musicVolume.addEventListener('input', (e) => {
    setVolume(parseInt(e.target.value, 10));
  });
}

// 7. Navbar Scroll Adjustments & Mobile Menu
const navbar = document.getElementById('navbar');
const btnMobileMenu = document.getElementById('btn-mobile-menu');
const mobileMenu = document.getElementById('mobile-menu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.remove('bg-transparent', 'py-4');
    navbar.classList.add('bg-[#350003]/95', 'py-3', 'shadow-2xl', 'border-b', 'border-[#c5a059]/25', 'backdrop-blur-md');
  } else {
    navbar.classList.remove('bg-[#350003]/95', 'py-3', 'shadow-2xl', 'border-b', 'border-[#c5a059]/25', 'backdrop-blur-md');
    navbar.classList.add('bg-transparent', 'py-4');
  }
});

if (btnMobileMenu && mobileMenu) {
  btnMobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
  });

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('flex');
    });
  });
}

// 8. Story Timeline & Event Cards Scroll Animations
gsap.from('.timeline-item', {
  scrollTrigger: {
    trigger: '#story',
    start: 'top 80%',
    toggleActions: 'play none none none'
  },
  opacity: 0,
  y: 50,
  stagger: 0.3,
  duration: 1.2,
  ease: 'power2.out'
});

gsap.from('.event-card', {
  scrollTrigger: {
    trigger: '#events',
    start: 'top 80%',
    toggleActions: 'play none none none'
  },
  opacity: 0,
  scale: 0.9,
  y: 40,
  stagger: 0.2,
  duration: 1,
  ease: 'back.out(1.2)'
});

gsap.from('.gallery-card', {
  scrollTrigger: {
    trigger: '#gallery',
    start: 'top 80%',
    toggleActions: 'play none none none'
  },
  opacity: 0,
  y: 60,
  stagger: 0.15,
  duration: 1.2,
  ease: 'power3.out'
});

// Hero parallax background
gsap.to('#home', {
  scrollTrigger: {
    trigger: '#home',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  },
  backgroundPositionY: '30%',
  ease: 'none'
});

// Fade hero content on scroll
gsap.to('#hero-content', {
  scrollTrigger: {
    trigger: '#home',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  },
  opacity: 0,
  y: -80,
  ease: 'none'
});

// 9. Gallery Lightbox
const galleryCards = document.querySelectorAll('.gallery-card');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

let currentImgIdx = 0;
const images = Array.from(document.querySelectorAll('.gallery-card img')).map(img => img.src);

if (lightbox && lightboxImg) {
  galleryCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      currentImgIdx = idx;
      lightboxImg.src = images[currentImgIdx];
      lightbox.classList.remove('hidden');
      lightbox.classList.add('flex');
      document.body.classList.add('overflow-hidden');
    });
  });

  const closeLightbox = () => {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    if (!document.getElementById('royal-gate') || document.getElementById('royal-gate').style.display === 'none') {
      document.body.classList.remove('overflow-hidden');
    }
  };

  lightboxClose.addEventListener('click', closeLightbox);

  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    currentImgIdx = (currentImgIdx - 1 + images.length) % images.length;
    lightboxImg.src = images[currentImgIdx];
  });

  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    currentImgIdx = (currentImgIdx + 1) % images.length;
    lightboxImg.src = images[currentImgIdx];
  });

  lightbox.addEventListener('click', closeLightbox);
}

// 10. Initialize Scratch Card
initScratchCard('scratch-canvas', 'scratch-container', () => {
  // Confetti explosion parameters
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // 1. Confetti Burst
  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);

  // 2. Custom Gold fireworks
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#f3e5ab', '#c5a059', '#faf6f0', '#8e6f3e']
  });
});

// 11. RSVP Form submission and database storage
const rsvpForm = document.getElementById('rsvp-form');
const rsvpSuccessModal = document.getElementById('rsvp-success-modal');
const btnSuccessClose = document.getElementById('btn-success-close');
const rsvpSubmitBtn = document.getElementById('btn-rsvp-submit');

if (rsvpForm) {
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate number of guests
    const guestsInput = document.getElementById('rsvp-guests');
    if (!guestsInput.value) {
      alert('Please select the number of guests.');
      return;
    }

    const formData = {
      name: document.getElementById('rsvp-name').value,
      phone: document.getElementById('rsvp-phone').value,
      email: document.getElementById('rsvp-email').value,
      guests: guestsInput.value,
      attending: rsvpForm.querySelector('input[name="attending"]:checked').value,
      message: document.getElementById('rsvp-message').value
    };

    // UI Loading state
    const originalText = rsvpSubmitBtn.innerHTML;
    rsvpSubmitBtn.disabled = true;
    rsvpSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-2"></i>Sending...';

    let success = false;

    try {
      // Post to our express server API
      const response = await fetch('http://localhost:5000/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const resData = await response.json();
      if (response.ok && resData.success) {
        success = true;
      }
    } catch (err) {
      console.warn('Backend server not running or unreachable. Falling back to LocalStorage.', err);
      
      // Fallback: Save to localStorage so they don't lose data and get success animation anyway!
      const currentList = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
      currentList.push({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem('wedding_rsvps', JSON.stringify(currentList));
      success = true;
    } finally {
      rsvpSubmitBtn.disabled = false;
      rsvpSubmitBtn.innerHTML = originalText;

      if (success) {
        // Show success modal
        rsvpSuccessModal.classList.remove('hidden');
        rsvpSuccessModal.classList.add('flex');
        
        // Burst success confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });

        rsvpForm.reset();
      } else {
        alert('Could not submit RSVP. Please try again.');
      }
    }
  });
}

if (rsvpSuccessModal && btnSuccessClose) {
  btnSuccessClose.addEventListener('click', () => {
    rsvpSuccessModal.classList.add('hidden');
    rsvpSuccessModal.classList.remove('flex');
  });
}
