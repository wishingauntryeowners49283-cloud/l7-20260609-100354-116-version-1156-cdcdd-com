function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener('click', function () {
        toggle.classList.toggle('is-open');
        nav.classList.toggle('is-open');
    });
}

function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
        return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (slides.length < 2) {
        return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle('is-active', current === index);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle('is-active', current === index);
        });
    }

    function play() {
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            stop();
            show(dotIndex);
            play();
        });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    play();
}

function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
        var searchInput = panel.querySelector('[data-search-input]');
        var yearFilter = panel.querySelector('[data-year-filter]');
        var regionFilter = panel.querySelector('[data-region-filter]');
        var typeFilter = panel.querySelector('[data-type-filter]');
        var resetButton = panel.querySelector('[data-filter-reset]');
        var scope = panel.parentElement || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

        function matches(card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var year = yearFilter ? yearFilter.value : '';
            var region = regionFilter ? regionFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            var hasKeyword = !keyword || text.indexOf(keyword) !== -1;
            var hasYear = !year || (card.getAttribute('data-year') || '').indexOf(year) !== -1;
            var hasRegion = !region || (card.getAttribute('data-region') || '').indexOf(region) !== -1;
            var hasType = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1;
            return hasKeyword && hasYear && hasRegion && hasType;
        }

        function applyFilters() {
            cards.forEach(function (card) {
                card.classList.toggle('is-hidden', !matches(card));
            });
        }

        [searchInput, yearFilter, regionFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                [searchInput, yearFilter, regionFilter, typeFilter].forEach(function (control) {
                    if (control) {
                        control.value = '';
                    }
                });
                applyFilters();
            });
        }
    });
}

function initMoviePlayer(videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !sourceUrl) {
        return;
    }

    var attached = false;

    function attachSource() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function startPlayback() {
        attachSource();
        overlay.classList.add('is-hidden');
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });
    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });
}

ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
});
