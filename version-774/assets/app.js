(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-dot]"));
    var prev = carousel.querySelector("[data-prev]");
    var next = carousel.querySelector("[data-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
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
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFiltering() {
    var searchInput = document.querySelector("[data-search-input]");
    var scope = document.querySelector("[data-search-scope]");
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var empty = document.querySelector("[data-empty]");
    var activeType = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function apply() {
      var keyword = normalize(searchInput ? searchInput.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta") + " " + card.getAttribute("data-tags"));
        var cardType = card.getAttribute("data-type") || "";
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesType = activeType === "all" || cardType === activeType;
        var shouldShow = matchesKeyword && matchesType;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeType = button.getAttribute("data-filter-button") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
    apply();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    if (!players.length) {
      return;
    }
    loadHls(function () {
      players.forEach(function (player) {
        var video = player.querySelector("video");
        var cover = player.querySelector(".player-cover");
        var button = player.querySelector(".play-trigger");
        var link = player.getAttribute("data-play") || "";
        var loaded = false;
        var hls = null;

        function attach() {
          if (loaded || !video || !link) {
            return;
          }
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = link;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(link);
            hls.attachMedia(video);
          } else {
            video.src = link;
          }
          video.controls = true;
          loaded = true;
        }

        function start(event) {
          if (event) {
            event.preventDefault();
            event.stopPropagation();
          }
          attach();
          if (cover) {
            cover.classList.add("is-hidden");
          }
          var attempt = video.play();
          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
          }
        }

        if (cover) {
          cover.addEventListener("click", start);
        }
        if (button) {
          button.addEventListener("click", start);
        }
        if (video) {
          video.addEventListener("click", function (event) {
            if (!loaded) {
              start(event);
            }
          });
        }
        player.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            start(event);
          }
        });
      });
    });
  }

  ready(function () {
    setupMenu();
    setupCarousel();
    setupFiltering();
    setupPlayers();
  });
})();
