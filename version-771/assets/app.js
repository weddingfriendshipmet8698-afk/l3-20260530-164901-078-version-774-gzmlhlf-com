(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
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
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var section = form.parentElement;
      if (!section) {
        return;
      }
      var list = section.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-filter-card]"));
      var empty = section.querySelector("[data-filter-empty]");
      var search = form.querySelector("[data-filter-search]");
      var region = form.querySelector("[data-filter-region]");
      var year = form.querySelector("[data-filter-year]");
      var group = form.querySelector("[data-filter-group]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(search && search.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var groupValue = normalize(group && group.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var text = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-tags"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardGroup = normalize(card.getAttribute("data-group"));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          if (groupValue && cardGroup !== groupValue) {
            matched = false;
          }

          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      [search, region, year, group].forEach(function (field) {
        if (!field) {
          return;
        }
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      });
    });
  }

  window.initializeMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var overlay = document.getElementById(config.overlayId);
    var prepared = false;
    var hls = null;

    if (!video || !config.url) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(config.url);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.url;
      } else {
        video.src = config.url;
      }
    }

    function play() {
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
