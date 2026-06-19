(function () {
  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function updateCount(container) {
    var countNode = container.querySelector("[data-visible-count]");
    var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
    var visible = cards.filter(function (card) {
      return !card.classList.contains("hidden-card");
    }).length;
    if (countNode) {
      countNode.textContent = "当前显示 " + visible + " 部";
    }
  }

  function sortCards(container, sortValue) {
    var list = container.querySelector("[data-card-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    cards.sort(function (a, b) {
      if (sortValue === "views") {
        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
      }
      if (sortValue === "rating") {
        return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
      }
      return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
    });
    cards.forEach(function (card) {
      list.appendChild(card);
    });
  }

  function filterCards(container) {
    var localInput = container.querySelector("[data-card-filter]");
    var searchInput = container.querySelector("[data-search-input]");
    var typeFilter = container.querySelector("[data-type-filter]");
    var sortSelect = container.querySelector("[data-card-sort]");
    var keyword = normalize(localInput ? localInput.value : searchInput ? searchInput.value : "");
    var selectedType = typeFilter ? typeFilter.value : "全部";
    var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));
      var typeOk = selectedType === "全部" || card.dataset.type === selectedType;
      var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
      card.classList.toggle("hidden-card", !(typeOk && keywordOk));
    });
    sortCards(container, sortSelect ? sortSelect.value : "year");
    updateCount(container);
  }

  document.querySelectorAll("[data-mobile-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      var nav = document.querySelector("[data-mobile-nav]");
      if (nav) {
        nav.classList.toggle("open");
      }
    });
  });

  document.querySelectorAll(".site-search").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      var base = form.getAttribute("data-search-base") || form.getAttribute("action") || "search.html";
      if (input && input.value.trim()) {
        event.preventDefault();
        window.location.href = base + "?q=" + encodeURIComponent(input.value.trim());
      }
    });
  });

  var hero = document.querySelector("[data-hero-slider]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var show = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("hero-slide-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  document.querySelectorAll("[data-card-list]").forEach(function (list) {
    var container = list.closest("main") || document;
    var localInput = container.querySelector("[data-card-filter]");
    var searchInput = container.querySelector("[data-search-input]");
    var typeFilter = container.querySelector("[data-type-filter]");
    var sortSelect = container.querySelector("[data-card-sort]");
    [localInput, searchInput, typeFilter, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", function () {
          filterCards(container);
        });
        control.addEventListener("change", function () {
          filterCards(container);
        });
      }
    });
    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      var sort = params.get("sort");
      if (query) {
        searchInput.value = query;
      }
      if (sort && sortSelect) {
        sortSelect.value = sort;
      }
    }
    filterCards(container);
  });
})();
