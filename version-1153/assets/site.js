(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var isOpen = mobileNav.classList.toggle("open");
                menuButton.setAttribute("aria-expanded", String(isOpen));
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startSlider() {
            if (slides.length < 2) {
                return;
            }
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                startSlider();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startSlider();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startSlider();
            });
        }

        showSlide(0);
        startSlider();

        Array.prototype.slice.call(document.querySelectorAll(".toolbar-card")).forEach(function (toolbar) {
            var input = toolbar.querySelector(".site-search");
            var chips = Array.prototype.slice.call(toolbar.querySelectorAll(".filter-chip"));
            var grid = toolbar.nextElementSibling ? toolbar.nextElementSibling.querySelector(".searchable-grid") : null;
            if (!grid) {
                grid = document.querySelector(".searchable-grid");
            }
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var empty = document.createElement("div");
            empty.className = "search-empty";
            empty.textContent = "没有找到匹配的影片";
            grid.parentNode.insertBefore(empty, grid.nextSibling);
            var filterValue = "";

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesFilter = !filterValue || haystack.indexOf(filterValue.toLowerCase()) !== -1;
                    var visible = matchesQuery && matchesFilter;
                    card.classList.toggle("hidden-card", !visible);
                    if (visible) {
                        shown += 1;
                    }
                });
                empty.classList.toggle("visible", shown === 0);
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("active");
                    });
                    chip.classList.add("active");
                    filterValue = chip.getAttribute("data-filter") || "";
                    applyFilter();
                });
            });
        });

        Array.prototype.slice.call(document.querySelectorAll(".player-card")).forEach(function (playerCard) {
            var video = playerCard.querySelector("video");
            var overlay = playerCard.querySelector(".player-overlay");
            var source = playerCard.getAttribute("data-video-url");
            var hls = null;
            var attached = false;

            if (!video || !overlay || !source) {
                return;
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        overlay.classList.remove("is-hidden");
                    });
                }
            }

            function beginPlayback() {
                overlay.classList.add("is-hidden");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (video.getAttribute("src") !== source) {
                        video.setAttribute("src", source);
                    }
                    playVideo();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    if (!hls) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            attached = true;
                            playVideo();
                        });
                        hls.on(window.Hls.Events.ERROR, function () {
                            if (attached) {
                                return;
                            }
                            video.setAttribute("src", source);
                        });
                    } else {
                        playVideo();
                    }
                    return;
                }
                if (video.getAttribute("src") !== source) {
                    video.setAttribute("src", source);
                }
                playVideo();
            }

            overlay.addEventListener("click", beginPlayback);
            video.addEventListener("click", function () {
                if (video.paused) {
                    beginPlayback();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                overlay.classList.add("is-hidden");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    overlay.classList.remove("is-hidden");
                }
            });
        });
    });
})();
