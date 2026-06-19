(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    if (slides.length > 1) {
      startTimer();
    }
  }

  function setupLocalFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
      var searchInput = scope.querySelector('[data-local-filter]');
      var yearSelect = scope.querySelector('[data-year-filter]');
      var status = scope.querySelector('[data-filter-status]');
      var grid = document.querySelector('[data-filter-grid]');

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

      function cardMatchesYear(card, selectedYear) {
        if (!selectedYear) {
          return true;
        }

        var cardYear = card.getAttribute('data-year') || '';

        if (selectedYear === '2015') {
          var match = cardYear.match(/\d{4}/);
          return match ? Number(match[0]) <= 2015 : false;
        }

        return cardYear.indexOf(selectedYear) !== -1;
      }

      function applyFilter() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var selectedYear = yearSelect ? yearSelect.value : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-category') || ''
          ].join(' ').toLowerCase();

          var match = (!query || haystack.indexOf(query) !== -1) && cardMatchesYear(card, selectedYear);
          card.classList.toggle('is-hidden', !match);

          if (match) {
            visibleCount += 1;
          }
        });

        if (status) {
          status.textContent = '当前显示 ' + visibleCount + ' 部，共 ' + cards.length + ' 部。';
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', applyFilter);
      }

      if (yearSelect) {
        yearSelect.addEventListener('change', applyFilter);
      }

      applyFilter();
    });
  }

  function setupGlobalSearch() {
    var input = document.querySelector('[data-global-search]');
    var panel = document.querySelector('[data-global-search-panel]');
    var index = window.MOVIE_SEARCH_INDEX || [];

    if (!input || !panel || !index.length) {
      return;
    }

    function closePanel() {
      panel.classList.remove('is-open');
    }

    function renderResults(query) {
      var normalized = query.trim().toLowerCase();

      if (normalized.length < 1) {
        panel.innerHTML = '';
        closePanel();
        return;
      }

      var results = index.filter(function (movie) {
        var haystack = [movie.title, movie.year, movie.region, movie.category, movie.tags].join(' ').toLowerCase();
        return haystack.indexOf(normalized) !== -1;
      }).slice(0, 18);

      if (!results.length) {
        panel.innerHTML = '<div class="search-result"><strong>没有找到匹配影片</strong><span>换个关键词再试试。</span></div>';
        panel.classList.add('is-open');
        return;
      }

      panel.innerHTML = results.map(function (movie) {
        var pathPrefix = location.pathname.indexOf('/movies/') !== -1 ? '../' : '';
        var href = pathPrefix + movie.url;
        return '<a class="search-result" href="' + href + '">' +
          '<strong>' + escapeHtml(movie.title) + '</strong>' +
          '<span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.category) + '</span>' +
          '</a>';
      }).join('');

      panel.classList.add('is-open');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[character];
      });
    }

    input.addEventListener('input', function () {
      renderResults(input.value);
    });

    input.addEventListener('focus', function () {
      renderResults(input.value);
    });

    document.addEventListener('click', function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        closePanel();
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-source]'));

    players.forEach(function (box) {
      var source = box.getAttribute('data-video-source');
      var video = box.querySelector('video');
      var button = box.querySelector('[data-play-button]');
      var message = box.querySelector('[data-player-message]');
      var hlsInstance = null;
      var initialized = false;

      if (!source || !video || !button) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      function initializePlayer() {
        if (initialized) {
          return Promise.resolve();
        }

        initialized = true;
        setMessage('正在初始化 HLS 播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setMessage('使用浏览器原生 HLS 播放。');
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('HLS 源已加载，可以播放。');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放源加载失败，请刷新页面或稍后重试。');
            }
          });
          return Promise.resolve();
        }

        video.src = source;
        setMessage('当前浏览器不支持 HLS.js，已尝试直接加载播放源。');
        return Promise.resolve();
      }

      button.addEventListener('click', function () {
        initializePlayer().then(function () {
          button.classList.add('is-hidden');
          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              button.classList.remove('is-hidden');
              setMessage('浏览器阻止了自动播放，请再次点击播放器。');
            });
          }
        });
      });

      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  setupHeroSlider();
  setupLocalFilters();
  setupGlobalSearch();
  setupPlayers();
})();
