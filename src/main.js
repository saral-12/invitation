import './index.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';
import Lenis from 'lenis';
import { initParticles, burstPetals } from './canvas-particles.js';
import { initAudio, playMusic, togglePlay, toggleMute, setVolume } from './audio.js';
import { initScratchCard } from './scratchcard.js';

gsap.registerPlugin(ScrollTrigger);

// Reveal body once script is active
document.body.style.opacity = '1';

// 1. Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.5,
});

// Initially stop scrolling until gate is open
lenis.stop();

// Link Lenis scroll events to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Helper function to scroll to targets smoothly if needed
window.scrollToSection = (selector) => {
  lenis.scrollTo(selector);
};


// 3. Initialize Background Particle System
const bgCanvas = document.getElementById('bg-canvas');
let cleanupParticles = null;
if (bgCanvas) {
  cleanupParticles = initParticles(bgCanvas);
}

// 4. Initialize Audio Engine
initAudio();

// 5. Palace Temple Bell Synthesizer (Web Audio API)
function playPalaceBell() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;

    // Resonant bronze bell frequencies
    const fundamental = 180; 
    const partials = [1.0, 1.48, 1.95, 2.25, 2.68, 3.12, 3.8, 4.3];
    const amplitudes = [0.8, 0.5, 0.4, 0.3, 0.25, 0.18, 0.1, 0.05];
    const decays = [4.5, 3.5, 3.0, 2.5, 1.8, 1.5, 1.0, 0.6];

    partials.forEach((partial, i) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * partial, now);

      gainNode.gain.setValueAtTime(0, now);
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

// 6. Gate Opening Animation Sequence
const btnOpenGate = document.getElementById('btn-open-gate');
const royalGate = document.getElementById('royal-gate');
const mainContent = document.getElementById('main-content');
const musicWidget = document.getElementById('music-widget');

if (btnOpenGate && royalGate && mainContent) {
  btnOpenGate.addEventListener('click', () => {
    // Play bell sound
    playPalaceBell();

    // Start background music
    playMusic();

    // Trigger gate GSAP timeline
    const tl = gsap.timeline({
      onComplete: () => {
        royalGate.style.display = 'none';
        document.body.classList.remove('overflow-hidden');
        
        // Start Lenis smooth scroll after gate opens
        lenis.start();
      }
    });

    // Fade out central UI
    tl.to('#gate-center-ui', {
      scale: 0.85,
      opacity: 0,
      duration: 1.2,
      ease: 'power2.out'
    });

    // Zoom-in camera effect
    tl.to('#gate-sky', {
      scale: 1.3,
      duration: 4.5,
      ease: 'power2.inOut'
    }, 0);

    // Rotate Left & Right Doors Outward (3D effect)
    tl.to('#gate-left', {
      rotateY: -95,
      x: '-10%',
      duration: 3.8,
      ease: 'power2.inOut'
    }, 0.5);

    tl.to('#gate-right', {
      rotateY: 95,
      x: '10%',
      duration: 3.8,
      ease: 'power2.inOut'
    }, 0.5);

    // Fade lanterns and gate shadows
    tl.to('.lantern-glow', {
      opacity: 0,
      duration: 1.8,
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
    }, 2.0);

    // Final fadeout of the gate container
    tl.to(royalGate, {
      opacity: 0,
      duration: 1.8,
      ease: 'power1.inOut'
    }, 3.0);
  });
}

// 7. Audio Control Binding
const musicPlayBtn = document.getElementById('music-play-btn');
const musicMuteBtn = document.getElementById('music-mute-btn');

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

// 8. SCROLL TRIGGER ANIMATIONS (CINEMATIC SCROLL EXPERIENCES)

// Chapter 1: Welcome (Hero) text fadeout on scroll
gsap.to('#hero-content', {
  scrollTrigger: {
    trigger: '#welcome',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  },
  opacity: 0,
  y: -100,
  scale: 0.95,
  ease: 'none'
});

// Chapter 1: Parallax background image
gsap.to('#welcome', {
  scrollTrigger: {
    trigger: '#welcome',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  },
  backgroundPositionY: '30%',
  ease: 'none'
});

// Chapter 2: Story timeline items slide in on scroll
gsap.utils.toArray('.timeline-item').forEach((item) => {
  const isLeft = item.classList.contains('md:translate-x-[-100%]');
  
  gsap.from(item, {
    scrollTrigger: {
      trigger: item,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: isLeft ? -100 : 100,
    scale: 0.95,
    duration: 1.2,
    ease: 'power3.out'
  });
});

// Chapter 3: Gallery Masonry entrance parallax
gsap.from('.gallery-card', {
  scrollTrigger: {
    trigger: '#gallery',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  },
  opacity: 0,
  y: 80,
  scale: 0.95,
  stagger: 0.2,
  duration: 1.2,
  ease: 'power3.out'
});

// Chapter 5: Wedding itinerary cards scale up
gsap.from('.event-card', {
  scrollTrigger: {
    trigger: '#events',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  },
  opacity: 0,
  scale: 0.9,
  y: 50,
  stagger: 0.2,
  duration: 1.2,
  ease: 'back.out(1.2)'
});

// Chapter 6: Venue map container slide-in
gsap.from('#map-container', {
  scrollTrigger: {
    trigger: '#venue',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  },
  opacity: 0,
  scale: 0.95,
  duration: 1.2,
  ease: 'power2.out'
});

// Chapter 8: Ending Scene contents reveal
gsap.from('#ending-content > *', {
  scrollTrigger: {
    trigger: '#ending',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  },
  opacity: 0,
  y: 60,
  stagger: 0.25,
  duration: 1.5,
  ease: 'power3.out'
});

// Chapter 8: Night parallax background
gsap.to('#ending', {
  scrollTrigger: {
    trigger: '#ending',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true
  },
  backgroundPositionY: '10%',
  ease: 'none'
});

// 9. Gallery Lightbox Modal
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
      
      // Lock scroll while viewing gallery lightbox
      lenis.stop();
    });
  });

  const closeLightbox = () => {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    
    // Unlock scroll
    lenis.start();
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
  // Celebration Confetti Parameterization
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);

  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#f3e5ab', '#c5a059', '#faf6f0', '#8e6f3e']
  });
});

// 11. RSVP Form database submission
const rsvpForm = document.getElementById('rsvp-form');
const rsvpSuccessModal = document.getElementById('rsvp-success-modal');
const btnSuccessClose = document.getElementById('btn-success-close');
const rsvpSubmitBtn = document.getElementById('btn-rsvp-submit');

if (rsvpForm) {
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
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

    const originalText = rsvpSubmitBtn.innerHTML;
    rsvpSubmitBtn.disabled = true;
    rsvpSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-2"></i>Sending...';

    let success = false;

    try {
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
      console.warn('Backend server unreachable. Using local storage backup.', err);
      
      const currentList = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
      currentList.push({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem('wedding_rsvps', JSON.stringify(currentList));
      success = true;
    } finally {
      rsvpSubmitBtn.disabled = false;
      rsvpSubmitBtn.innerHTML = originalText;

      if (success) {
        // Stop scroll on success modal display
        lenis.stop();

        rsvpSuccessModal.classList.remove('hidden');
        rsvpSuccessModal.classList.add('flex');
        
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
    
    // Resume scroll after closing success popup
    lenis.start();
  });
}
