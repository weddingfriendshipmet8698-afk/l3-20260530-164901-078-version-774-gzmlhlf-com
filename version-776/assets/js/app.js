document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  initHero();
  initFilters();
  initPlayer();
  initBackTop();
  initHeroSearch();
});

function initHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

  if (!slides.length) {
    return;
  }

  var current = 0;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      show(index);
    });
  });

  show(0);

  if (slides.length > 1) {
    window.setInterval(function () {
      show(current + 1);
    }, 5800);
  }
}

function normalizeText(value) {
  return (value || "").toString().trim().toLowerCase();
}

function initFilters() {
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

  panels.forEach(function (panel) {
    var input = panel.querySelector("[data-search-input]");
    var region = panel.querySelector("[data-region-filter]");
    var type = panel.querySelector("[data-type-filter]");
    var year = panel.querySelector("[data-year-filter]");
    var scope = panel.getAttribute("data-filter-scope") || "document";
    var root = scope === "panel" ? panel.parentElement : document;
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));

    function apply() {
      var query = normalizeText(input && input.value);
      var regionValue = normalizeText(region && region.value);
      var typeValue = normalizeText(type && type.value);
      var yearValue = normalizeText(year && year.value);

      cards.forEach(function (card) {
        var text = normalizeText([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var visible = true;

        if (query && text.indexOf(query) === -1) {
          visible = false;
        }
        if (regionValue && normalizeText(card.getAttribute("data-region")) !== regionValue) {
          visible = false;
        }
        if (typeValue && normalizeText(card.getAttribute("data-type")) !== typeValue) {
          visible = false;
        }
        if (yearValue && normalizeText(card.getAttribute("data-year")) !== yearValue) {
          visible = false;
        }

        card.classList.toggle("is-hidden", !visible);
      });
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }
    apply();
  });
}

function initPlayer() {
  var video = document.querySelector("[data-player]");
  if (!video) {
    return;
  }

  var overlay = document.querySelector("[data-player-overlay]");
  var button = document.querySelector("[data-player-button]");
  var source = video.getAttribute("data-video") || "";
  var ready = false;
  var hls = null;

  function attach() {
    if (ready || !source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        maxBufferLength: 30
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = source;
    ready = true;
  }

  function start() {
    attach();
    video.controls = true;

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var play = video.play();
    if (play && play.catch) {
      play.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", start);
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

function initBackTop() {
  var button = document.querySelector("[data-back-top]");
  if (!button) {
    return;
  }

  function update() {
    button.classList.toggle("is-visible", window.scrollY > 420);
  }

  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", update, { passive: true });
  update();
}

function initHeroSearch() {
  var form = document.querySelector("[data-hero-search]");
  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var input = form.querySelector("input");
    var query = input ? input.value.trim() : "";
    var target = "./search.html";

    if (query) {
      target += "?q=" + encodeURIComponent(query);
    }

    window.location.href = target;
  });
}
