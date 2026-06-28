// Scratch Card Canvas Module

export function initScratchCard(canvasId, revealContainerId, onRevealCallback) {
  const canvas = document.getElementById(canvasId);
  const container = document.getElementById(revealContainerId);
  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let hasRevealed = false;

  // Set sizing
  function resizeCard() {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawOverlay();
  }

  // Draw the luxury gold overlay
  function drawOverlay() {
    ctx.save();
    
    // Create luxury golden gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#8e6f3e');
    grad.addColorStop(0.25, '#c5a059');
    grad.addColorStop(0.5, '#f3e5ab');
    grad.addColorStop(0.75, '#c5a059');
    grad.addColorStop(1, '#8e6f3e');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw luxury borders
    ctx.strokeStyle = '#faf6f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.strokeStyle = '#8e6f3e';
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

    // Draw elegant instruction text
    ctx.fillStyle = '#350003'; // Dark Crimson
    ctx.font = 'bold 16px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text wrap
    const text = 'Scratch to Reveal Our Wedding Date';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    ctx.restore();
  }

  // Scratch action
  function scratch(x, y) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    checkScratchPercentage();
  }

  // Calculate scratched area percentage
  function checkScratchPercentage() {
    if (hasRevealed) return;

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    const stride = 32; // Sample every 32nd pixel to optimize performance
    let transparentCount = 0;
    let totalSamples = 0;

    for (let y = 0; y < height; y += stride) {
      for (let x = 0; x < width; x += stride) {
        const idx = (y * width + x) * 4;
        const alpha = pixels[idx + 3];
        if (alpha < 50) {
          transparentCount++;
        }
        totalSamples++;
      }
    }

    const percent = (transparentCount / totalSamples) * 100;
    if (percent > 45) {
      revealDate();
    }
  }

  // Reveal date transition
  function revealDate() {
    hasRevealed = true;
    
    // Fade out canvas
    canvas.style.transition = 'opacity 0.8s ease-out';
    canvas.style.opacity = '0';
    canvas.style.pointerEvents = 'none';

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 200]);
    }

    // Trigger fireworks and confetti
    if (typeof onRevealCallback === 'function') {
      onRevealCallback();
    }
  }

  // Event Listeners for Scratching
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function handleStart(e) {
    if (hasRevealed) return;
    isDrawing = true;
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  }

  function handleMove(e) {
    if (!isDrawing || hasRevealed) return;
    e.preventDefault(); // Stop mobile scroll while scratching
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  }

  function handleEnd() {
    isDrawing = false;
  }

  canvas.addEventListener('mousedown', handleStart);
  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('mouseup', handleEnd);
  canvas.addEventListener('mouseleave', handleEnd);

  canvas.addEventListener('touchstart', handleStart);
  canvas.addEventListener('touchmove', handleMove);
  canvas.addEventListener('touchend', handleEnd);

  resizeCard();
  window.addEventListener('resize', resizeCard);

  // Return reset handler
  return {
    reset: () => {
      hasRevealed = false;
      canvas.style.opacity = '1';
      canvas.style.pointerEvents = 'auto';
      drawOverlay();
    },
    destroy: () => {
      window.removeEventListener('resize', resizeCard);
    }
  };
}
