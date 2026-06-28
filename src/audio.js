// Audio Controller using YouTube IFrame Player API

let player;
let isMuted = false;
let currentVolume = 50;

export function initAudio() {
  // 1. Create a container for the YouTube player if it doesn't exist
  if (!document.getElementById('yt-player')) {
    const div = document.createElement('div');
    div.id = 'yt-player';
    div.style.position = 'absolute';
    div.style.width = '1px';
    div.style.height = '1px';
    div.style.opacity = '0';
    div.style.pointerEvents = 'none';
    document.body.appendChild(div);
  }

  // 2. Load YouTube API Script
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // 3. Callback when API is ready
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('yt-player', {
      videoId: 'BcSejVIxB0E', // "Ishq Hai" song ID
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        loop: 1,
        playlist: 'BcSejVIxB0E', // Loop requires playlist with same video ID
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: (event) => {
          player.setVolume(currentVolume);
          // Auto-play might be blocked by browser until user clicks
        },
        onStateChange: (event) => {
          // Sync UI icon animations if playing/paused
          updateWaveAnimation(event.data === YT.PlayerState.PLAYING);
        }
      }
    });
  };
}

export function playMusic() {
  if (player && typeof player.playVideo === 'function') {
    player.playVideo();
  }
}

export function pauseMusic() {
  if (player && typeof player.pauseVideo === 'function') {
    player.pauseVideo();
  }
}

export function togglePlay() {
  if (player && typeof player.getPlayerState === 'function') {
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
      return false;
    } else {
      player.playVideo();
      return true;
    }
  }
  return false;
}

export function toggleMute() {
  if (player && typeof player.mute === 'function') {
    if (isMuted) {
      player.unMute();
      isMuted = false;
    } else {
      player.mute();
      isMuted = true;
    }
    return isMuted;
  }
  return false;
}

export function setVolume(vol) {
  currentVolume = vol;
  if (player && typeof player.setVolume === 'function') {
    player.setVolume(vol);
  }
}

// Visualizer Wave effect helper
function updateWaveAnimation(isPlaying) {
  const waves = document.querySelectorAll('.music-wave-bar');
  waves.forEach(bar => {
    if (isPlaying) {
      bar.style.animationPlayState = 'running';
    } else {
      bar.style.animationPlayState = 'paused';
    }
  });
}
