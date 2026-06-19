document.addEventListener("DOMContentLoaded", function () {
    bindMobileMenu();
    bindSearchForms();
    bindHeroCarousel();
    bindCatalogFilters();
    bindBackToTop();
});

function bindMobileMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");

    if (!button || !menu) {
        return;
    }

    button.addEventListener("click", function () {
        menu.classList.toggle("is-open");
        button.classList.toggle("is-active");
    });
}

function bindSearchForms() {
    var forms = document.querySelectorAll(".site-search");

    forms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            var input = form.querySelector("input[type='search'], input[type='text']");
            var value = input ? input.value.trim() : "";
            var target = "search.html";

            if (value.length > 0) {
                target += "?q=" + encodeURIComponent(value);
            }

            window.location.href = target;
        });
    });
}

function bindHeroCarousel() {
    var hero = document.querySelector(".hero-carousel");

    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    }

    function startTimer() {
        stopTimer();
        timer = window.setInterval(function () {
            showSlide(index + 1);
        }, 5600);
    }

    function stopTimer() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            showSlide(dotIndex);
            startTimer();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(index - 1);
            startTimer();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(index + 1);
            startTimer();
        });
    }

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);

    showSlide(0);
    startTimer();
}

function bindCatalogFilters() {
    var catalogs = document.querySelectorAll(".catalog-tools");

    catalogs.forEach(function (tools) {
        var scope = tools.getAttribute("data-scope") || "body";
        var root = document.querySelector(scope) || document;
        var search = tools.querySelector(".catalog-search");
        var type = tools.querySelector(".filter-type");
        var region = tools.querySelector(".filter-region");
        var year = tools.querySelector(".filter-year");
        var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
        var empty = root.querySelector(".empty-result");

        function readValue(element) {
            return element ? element.value.trim().toLowerCase() : "";
        }

        function update() {
            var keyword = readValue(search);
            var typeValue = readValue(type);
            var regionValue = readValue(region);
            var yearValue = readValue(year);
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year")
                ].join(" ").toLowerCase();

                var matchKeyword = keyword.length === 0 || text.indexOf(keyword) !== -1;
                var matchType = typeValue.length === 0 || (card.getAttribute("data-type") || "").toLowerCase().indexOf(typeValue) !== -1;
                var matchRegion = regionValue.length === 0 || (card.getAttribute("data-region") || "").toLowerCase().indexOf(regionValue) !== -1;
                var matchYear = yearValue.length === 0 || (card.getAttribute("data-year") || "").toLowerCase() === yearValue;
                var show = matchKeyword && matchType && matchRegion && matchYear;

                card.classList.toggle("is-hidden", !show);

                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [search, type, region, year].forEach(function (element) {
            if (element) {
                element.addEventListener("input", update);
                element.addEventListener("change", update);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (query && search && search.value.length === 0) {
            search.value = query;
        }

        update();
    });
}

function bindBackToTop() {
    var button = document.querySelector(".back-to-top");

    if (!button) {
        return;
    }

    window.addEventListener("scroll", function () {
        button.classList.toggle("is-visible", window.scrollY > 600);
    });

    button.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}
