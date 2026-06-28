export function initParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Resize handler
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const particles = [];
  const maxPetals = 40;
  const maxFireflies = 30;
  const maxSparkles = 20;

  // Particle Classes
  class Petal {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Distribute vertically initially
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -20;
      this.size = Math.random() * 12 + 8;
      this.speedY = Math.random() * 1.5 + 0.8;
      this.speedX = Math.random() * 1 - 0.5;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 2 - 1;
      this.opacity = Math.random() * 0.5 + 0.4;
      this.swing = Math.random() * 2 + 1;
      this.swingSpeed = Math.random() * 0.02 + 0.01;
      this.swingStep = Math.random() * 100;
    }

    update() {
      this.y += this.speedY;
      this.swingStep += this.swingSpeed;
      this.x += this.speedX + Math.sin(this.swingStep) * this.swing;
      this.rotation += this.rotationSpeed;

      if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;

      // Draw stylized rose petal
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(this.size / 2, -this.size / 2, this.size, 0, this.size / 2, this.size);
      ctx.bezierCurveTo(0, this.size * 1.5, -this.size / 2, this.size, 0, 0);
      
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      grad.addColorStop(0, '#d93847'); // Bright rose
      grad.addColorStop(1, '#580c10'); // Royal crimson
      ctx.fillStyle = grad;
      ctx.fill();
      
      ctx.restore();
    }
  }

  class Firefly {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.5 + 1.5;
      this.speedY = Math.random() * 0.6 - 0.3;
      this.speedX = Math.random() * 0.6 - 0.3;
      this.opacity = 0;
      this.fadeSpeed = Math.random() * 0.01 + 0.005;
      this.fadingIn = true;
      this.maxOpacity = Math.random() * 0.6 + 0.3;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Pulse opacity
      if (this.fadingIn) {
        this.opacity += this.fadeSpeed;
        if (this.opacity >= this.maxOpacity) this.fadingIn = false;
      } else {
        this.opacity -= this.fadeSpeed;
        if (this.opacity <= 0.05) this.fadingIn = true;
      }

      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
      glow.addColorStop(0, '#fef08a'); // Soft yellow glow
      glow.addColorStop(0.3, 'rgba(253, 224, 71, 0.4)');
      glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
      
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.restore();
    }
  }

  class Sparkle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.3;
      this.pulseSpeed = Math.random() * 0.05 + 0.02;
    }

    update() {
      this.alpha += this.pulseSpeed;
      if (this.alpha > 0.9 || this.alpha < 0.1) {
        this.pulseSpeed = -this.pulseSpeed;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = '#c5a059'; // Gold sparkle
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f3e5ab';
      ctx.fill();
      ctx.restore();
    }
  }

  // Populate particles
  for (let i = 0; i < maxPetals; i++) particles.push(new Petal());
  for (let i = 0; i < maxFireflies; i++) particles.push(new Firefly());
  for (let i = 0; i < maxSparkles; i++) particles.push(new Sparkle());

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    animationFrameId = requestAnimationFrame(animate);
  }
  
  animate();

  // Return a cleanup function
  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', resizeCanvas);
  };
}

// Function to trigger a bursts of falling petals (e.g. during gate open)
export function burstPetals(canvas, count = 30) {
  const ctx = canvas.getContext('2d');
  const tempPetals = [];

  class BurstPetal {
    constructor() {
      // Petals fly out from center/top
      this.x = canvas.width / 2 + (Math.random() * 200 - 100);
      this.y = canvas.height / 2 - 100;
      this.size = Math.random() * 20 + 15; // Bigger petals for cinematic gate open
      
      // Radial velocity pointing outward/downward
      const angle = Math.random() * Math.PI + 0.1; // down half-circle
      const speed = Math.random() * 8 + 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed + 2;
      
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 10 - 5;
      this.opacity = 1;
      this.decay = Math.random() * 0.015 + 0.008;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.1; // Gravity effect
      this.rotation += this.rotationSpeed;
      this.opacity -= this.decay;
    }

    draw() {
      if (this.opacity <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(this.size / 2, -this.size / 2, this.size, 0, this.size / 2, this.size);
      ctx.bezierCurveTo(0, this.size * 1.5, -this.size / 2, this.size, 0, 0);
      
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      grad.addColorStop(0, '#f43f5e'); // rose-500
      grad.addColorStop(1, '#9f1239'); // rose-800
      ctx.fillStyle = grad;
      ctx.fill();
      
      ctx.restore();
    }
  }

  for (let i = 0; i < count; i++) {
    tempPetals.push(new BurstPetal());
  }

  function runBurst() {
    if (tempPetals.length === 0) return;
    
    // Filter out invisible petals
    for (let i = tempPetals.length - 1; i >= 0; i--) {
      const p = tempPetals[i];
      p.update();
      p.draw();
      if (p.opacity <= 0 || p.y > canvas.height + 50) {
        tempPetals.splice(i, 1);
      }
    }
    
    if (tempPetals.length > 0) {
      requestAnimationFrame(runBurst);
    }
  }

  runBurst();
}
