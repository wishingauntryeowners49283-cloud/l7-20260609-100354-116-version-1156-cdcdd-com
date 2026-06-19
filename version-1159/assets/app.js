(function () {
  const navButton = document.querySelector('.menu-toggle');
  const navPanel = document.querySelector('.nav-panel');

  if (navButton && navPanel) {
    navButton.addEventListener('click', function () {
      const isOpen = navPanel.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, idx) {
      slide.classList.toggle('is-active', idx === activeSlide);
    });

    dots.forEach(function (dot, idx) {
      dot.classList.toggle('is-active', idx === activeSlide);
    });
  }

  function restartHeroTimer() {
    if (!slides.length) {
      return;
    }

    if (heroTimer) {
      clearInterval(heroTimer);
    }

    heroTimer = setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  if (slides.length) {
    const prev = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        restartHeroTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeSlide - 1);
        restartHeroTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeSlide + 1);
        restartHeroTimer();
      });
    }

    restartHeroTimer();
  }

  const filterInput = document.querySelector('.list-filter');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const sortableGrid = document.querySelector('[data-sortable-grid]');

  function filterCards(value) {
    const keyword = String(value || '').trim().toLowerCase();

    cards.forEach(function (card) {
      const haystack = String(card.dataset.search || '').toLowerCase();
      const visible = !keyword || haystack.indexOf(keyword) !== -1;
      card.style.display = visible ? '' : 'none';
    });
  }

  if (filterInput) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');

    if (q) {
      filterInput.value = q;
      filterCards(q);
    }

    filterInput.addEventListener('input', function () {
      filterCards(filterInput.value);
    });
  }

  document.querySelectorAll('[data-sort]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (!sortableGrid) {
        return;
      }

      const mode = button.dataset.sort;
      const sorted = cards.slice().sort(function (a, b) {
        return Number(b.dataset[mode] || 0) - Number(a.dataset[mode] || 0);
      });

      sorted.forEach(function (card) {
        sortableGrid.appendChild(card);
      });
    });
  });
})();

function setupPlayer(streamUrl) {
  const video = document.getElementById('movieVideo');
  const cover = document.getElementById('playerCover');

  if (!video || !streamUrl) {
    return;
  }

  let prepared = false;

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function startPlayback() {
    prepare();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    const attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });
}
