/* =====================================================
   ROMANTIC GAME – script.js
   Lógica completa do jogo interativo romântico
   Bem comentado para fácil edição ✦
   ===================================================== */

// ── ESTADO DO JOGO ────────────────────────────────────
const state = {
  currentScreen: 1,          // tela atual (1–8 + 'final' + 'celebrate')
  totalScreens: 8,           // número de telas antes do final
  heartsCollected: 0,        // corações coletados no mini-game
  heartsNeeded: 7,           // total de corações para completar
  musicPlaying: false,       // música ligada?
  btnNoEscapes: 0,           // quantas vezes o botão "não" fugiu
};

// ── REFERÊNCIAS DOM ───────────────────────────────────
const musicBtn  = document.getElementById('music-btn');
const musicIcon = document.getElementById('music-icon');
const bgMusic   = document.getElementById('bg-music');
const sfxClick  = document.getElementById('sfx-click');

// ── INICIALIZAÇÃO ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  createBackgroundParticles();
  positionBtnNo();           // posiciona o botão "não" inicialmente
  setupSfx();                // prepara efeito sonoro via Web Audio API
  setupMusicButton();

  // Mostra a primeira tela com pequeno delay para entrada suave
  setTimeout(() => showScreen('screen-1'), 100);
});

// ── NAVEGAÇÃO ENTRE TELAS ─────────────────────────────

/**
 * Avança para a próxima tela em sequência.
 * Chamada pelos botões de cada tela.
 */
function nextScreen() {
  playClick();

  const current = state.currentScreen;

  if (current <= state.totalScreens) {
    state.currentScreen++;
    const nextId = state.currentScreen <= state.totalScreens
      ? `screen-${state.currentScreen}`
      : 'screen-final';
    showScreen(nextId);

    // Lógica especial para a tela 4 (mini-game de corações)
    if (state.currentScreen === 4) {
      initHeartGame();
    }

    // Lógica especial para a tela final
    if (nextId === 'screen-final') {
      initFinalHearts();
    }
  }
}

/**
 * Exibe uma tela específica pelo seu ID e esconde as demais.
 * @param {string} screenId - ID da seção a exibir
 */
function showScreen(screenId) {
  // Esconde todas as telas
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  // Exibe a tela desejada
  const target = document.getElementById(screenId);
  if (target) {
    target.style.display = 'flex';
    // Pequeno delay para garantir que o display flex foi aplicado antes da animação
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        target.classList.add('active');
      });
    });
  }

  // Rola para o topo (útil em mobile)
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── MINI-GAME DE CORAÇÕES (Tela 4) ───────────────────

/**
 * Cria os corações clicáveis do mini-game.
 */
function initHeartGame() {
  state.heartsCollected = 0;
  updateHeartCount();

  const container = document.getElementById('hearts-container');
  container.innerHTML = ''; // limpa caso reinicie

  const emojis = ['💛', '🩷', '🫶', '💕', '✨', '💗', '🌸'];

  for (let i = 0; i < state.heartsNeeded; i++) {
    const heart = document.createElement('span');
    heart.classList.add('heart-clickable');
    heart.textContent = emojis[i % emojis.length];
    heart.setAttribute('aria-label', 'Coração para clicar');
    heart.setAttribute('role', 'button');
    heart.setAttribute('tabindex', '0');

    // Posição aleatória dentro do container
    heart.style.left  = `${8 + Math.random() * 80}%`;
    heart.style.top   = `${10 + Math.random() * 70}%`;

    // Animação de balanço com delay e duração variáveis
    heart.style.setProperty('--bob-dur',   `${1.5 + Math.random() * 1.5}s`);
    heart.style.setProperty('--bob-delay', `${Math.random() * 1.2}s`);

    // Evento de clique
    heart.addEventListener('click', () => collectHeart(heart));
    heart.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') collectHeart(heart);
    });

    container.appendChild(heart);
  }
}

/**
 * Marca um coração como coletado e verifica conclusão.
 * @param {HTMLElement} heartEl - elemento do coração clicado
 */
function collectHeart(heartEl) {
  if (heartEl.classList.contains('clicked')) return;

  playClick();
  heartEl.classList.add('clicked');
  state.heartsCollected++;
  updateHeartCount();

  // Partícula de coleta
  spawnCollectParticle(heartEl);

  // Verifica se todos foram coletados
  if (state.heartsCollected >= state.heartsNeeded) {
    setTimeout(revealAfterHearts, 600);
  }
}

/**
 * Atualiza o contador de corações coletados.
 */
function updateHeartCount() {
  const el = document.getElementById('heart-count');
  if (el) el.textContent = state.heartsCollected;
}

/**
 * Revela a mensagem após completar o mini-game.
 */
function revealAfterHearts() {
  const game    = document.getElementById('heart-game');
  const after   = document.getElementById('after-hearts');

  if (game)  game.style.opacity  = '0';
  setTimeout(() => {
    if (game)  game.style.display = 'none';
    if (after) {
      after.classList.remove('hidden');
      after.style.animation = 'fadeSlideIn 0.6s ease forwards';
    }
  }, 400);
}

/**
 * Cria uma pequena partícula animada no local do clique.
 * @param {HTMLElement} el - elemento clicado
 */
function spawnCollectParticle(el) {
  const rect   = el.getBoundingClientRect();
  const p      = document.createElement('span');
  p.textContent = '+💛';
  p.style.cssText = `
    position: fixed;
    left: ${rect.left + rect.width / 2}px;
    top:  ${rect.top}px;
    font-size: 0.85rem;
    color: #c9a96e;
    pointer-events: none;
    z-index: 200;
    animation: particleRise 0.8s ease-out forwards;
  `;
  document.body.appendChild(p);

  // Remove após a animação
  setTimeout(() => p.remove(), 900);
}

// Injetar keyframe particleRise dinamicamente
(function injectParticleAnim() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleRise {
      0%   { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-40px) scale(0.7); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

// ── TELA FINAL – CORAÇÕES FLUTUANTES ─────────────────

/**
 * Cria corações flutuantes no fundo da tela final.
 */
function initFinalHearts() {
  const container = document.getElementById('final-hearts');
  if (!container) return;
  container.innerHTML = '';

  const emojis = ['💛', '🩷', '💕', '✨', '🌸', '💗', '🫶'];

  for (let i = 0; i < 14; i++) {
    const h = document.createElement('span');
    h.classList.add('floating-heart-final');
    h.textContent = emojis[i % emojis.length];
    h.style.left  = `${Math.random() * 90}%`;
    h.style.setProperty('--dur',   `${4 + Math.random() * 5}s`);
    h.style.setProperty('--delay', `${Math.random() * 4}s`);
    container.appendChild(h);
  }
}

// ── BOTÃO "NÃO" QUE FOGE ─────────────────────────────

/**
 * Posiciona o botão "não" em coordenadas fixas na tela.
 */
function positionBtnNo() {
  const btn = document.getElementById('btn-no');
  if (!btn) return;

  // Posição inicial: canto inferior direito visível
  btn.style.position = 'fixed';
  btn.style.bottom   = '6rem';
  btn.style.right    = '1.5rem';
  btn.style.top      = 'auto';
  btn.style.left     = 'auto';
}

/**
 * Faz o botão "não" fugir para uma posição aleatória na tela.
 * @param {HTMLElement} btn - o botão que está tentando ser clicado
 */
function runAway(btn) {
  state.btnNoEscapes++;
  playClick();

  const padding = 80; // margem das bordas
  const maxX    = window.innerWidth  - btn.offsetWidth  - padding;
  const maxY    = window.innerHeight - btn.offsetHeight - padding;

  const newX = padding + Math.random() * maxX;
  const newY = padding + Math.random() * maxY;

  btn.style.transition = 'left 0.25s ease, top 0.25s ease';
  btn.style.left   = `${newX}px`;
  btn.style.top    = `${newY}px`;
  btn.style.bottom = 'auto';
  btn.style.right  = 'auto';

  // Após 5 fugas, esconde o botão completamente (com mensagem divertida no console)
  if (state.btnNoEscapes >= 5) {
    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';
    console.log('👀 O botão "não" desistiu de existir.');
  }
}

// ── CELEBRAÇÃO (resposta sim / com certeza) ───────────

/**
 * Exibe a tela de celebração com animações especiais.
 * @param {string} answer - 'sim' ou 'certeza'
 */
function celebrate(answer) {
  playClick();

  // Oculta o botão "não" para sempre
  const btnNo = document.getElementById('btn-no');
  if (btnNo) { btnNo.style.display = 'none'; }

  // Atualiza a mensagem de acordo com a resposta
  const msg = document.getElementById('celebrate-msg');
  if (msg) {
    msg.textContent = answer === 'sim' ? 'sim ❤️' : 'com certeza ❤️';
  }

  showScreen('screen-celebrate');

  // Dispara confetti e corações de celebração
  setTimeout(() => {
    launchConfetti();
    launchCelebrateHearts();
  }, 400);
}

/**
 * Lança peças de confetti colorido.
 */
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;

  const colors = [
    'var(--pink)', 'var(--lilac)', 'var(--gold-light)',
    '#fce4ec', '#f3e8ff', '#fff9c4'
  ];

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');
    piece.style.left            = `${Math.random() * 100}%`;
    piece.style.background      = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width           = `${5 + Math.random() * 7}px`;
    piece.style.height          = `${5 + Math.random() * 7}px`;
    piece.style.borderRadius    = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.setProperty('--dur',   `${1.5 + Math.random() * 2}s`);
    piece.style.setProperty('--delay', `${Math.random() * 1.2}s`);
    container.appendChild(piece);
  }

  // Remove após animação para não acumular no DOM
  setTimeout(() => { container.innerHTML = ''; }, 5000);
}

/**
 * Cria corações flutuantes na tela de celebração.
 */
function launchCelebrateHearts() {
  const container = document.getElementById('celebrate-hearts');
  if (!container) return;
  container.innerHTML = '';

  const emojis = ['❤️', '💛', '🩷', '💕', '✨', '🌸', '🎉', '🫶'];

  for (let i = 0; i < 18; i++) {
    const h = document.createElement('span');
    h.classList.add('floating-heart-final');
    h.textContent = emojis[i % emojis.length];
    h.style.left  = `${Math.random() * 90}%`;
    h.style.setProperty('--dur',   `${3 + Math.random() * 4}s`);
    h.style.setProperty('--delay', `${Math.random() * 3}s`);
    container.appendChild(h);
  }
}

// ── PARTÍCULAS DE FUNDO ───────────────────────────────

/**
 * Cria corações e estrelas flutuando sutilmente no fundo da página.
 */
function createBackgroundParticles() {
  const container = document.getElementById('particles-bg');
  if (!container) return;

  const symbols = ['💛', '✦', '·', '🌸', '✨'];

  for (let i = 0; i < 16; i++) {
    const p = document.createElement('span');
    p.classList.add('bg-particle');
    p.textContent = symbols[i % symbols.length];
    p.style.left  = `${Math.random() * 95}%`;
    p.style.setProperty('--dur',   `${10 + Math.random() * 10}s`);
    p.style.setProperty('--delay', `${Math.random() * 12}s`);
    container.appendChild(p);
  }
}

// ── MÚSICA DE FUNDO ───────────────────────────────────

/**
 * Configura o botão de controle de música.
 * Para usar: adicione um arquivo music.mp3 na mesma pasta e
 * descomente a tag <source> no index.html.
 */
function setupMusicButton() {
  musicBtn.addEventListener('click', () => {
    if (!bgMusic.src || bgMusic.src === window.location.href) {
      // Nenhum arquivo de música configurado
      musicIcon.textContent = '🎵';
      console.info('🎵 Para ativar a música: adicione music.mp3 e descomente a tag <source> no index.html');
      return;
    }

    if (state.musicPlaying) {
      bgMusic.pause();
      musicIcon.textContent = '🔇';
      state.musicPlaying = false;
    } else {
      bgMusic.play().catch(() => {
        console.warn('Autoplay bloqueado pelo navegador. Clique novamente.');
      });
      musicIcon.textContent = '🎶';
      state.musicPlaying = true;
    }
  });
}

// ── EFEITO SONORO DE CLIQUE ───────────────────────────

let audioCtx = null;

/**
 * Configura o Web Audio API para gerar um tom curto como SFX.
 * Não requer nenhum arquivo externo.
 */
function setupSfx() {
  // AudioContext criado apenas após interação do usuário (requisito do browser)
  document.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, { once: true });
}

/**
 * Reproduz um tom suave e curto como feedback de clique.
 */
function playClick() {
  if (!audioCtx) return;

  try {
    const oscillator = audioCtx.createOscillator();
    const gainNode   = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Tom leve e suave (C5 ~523Hz, onda senoidal)
    oscillator.type      = 'sine';
    oscillator.frequency.setValueAtTime(523, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    // Silenciosamente ignora erros de áudio
  }
}

// ── ATALHOS DE TECLADO ────────────────────────────────

/**
 * Permite navegar com Enter/Espaço (acessibilidade).
 */
document.addEventListener('keydown', (e) => {
  // Não interferir em campos de input (se houver)
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'Enter' || e.key === ' ') {
    // Clica no botão principal da tela atual, se houver
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) {
      const mainBtn = activeScreen.querySelector('.btn-main');
      if (mainBtn) {
        e.preventDefault();
        mainBtn.click();
      }
    }
  }
});

// ── REDIMENSIONAMENTO DA JANELA ───────────────────────

/**
 * Reposiciona o botão "não" quando a janela for redimensionada.
 */
window.addEventListener('resize', () => {
  const btn = document.getElementById('btn-no');
  const finalScreen = document.getElementById('screen-final');

  // Só reposiciona se a tela final estiver ativa e o botão ainda visível
  if (finalScreen && finalScreen.classList.contains('active') &&
      btn && btn.style.opacity !== '0') {
    positionBtnNo();
  }
});

/* =====================================================
   COMO PERSONALIZAR OS TEXTOS:
   – Todos os textos estão no index.html
   – Cada tela é uma <section class="screen" id="screen-N">
   – Edite o conteúdo das tags <p> e <h2> livremente
   – Os botões chamam nextScreen() ou celebrate()

   COMO ADICIONAR MÚSICA:
   1. Coloque um arquivo music.mp3 na pasta do projeto
   2. Abra index.html e descomente a linha:
      <source src="music.mp3" type="audio/mpeg" />
   3. A música vai tocar ao clicar no botão 🎵

   COMO PUBLICAR NO GITHUB PAGES:
   – Veja as instruções no README.md
   ===================================================== */
