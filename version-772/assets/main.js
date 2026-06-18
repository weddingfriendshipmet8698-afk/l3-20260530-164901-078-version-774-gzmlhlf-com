(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5800);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var keywordInput = document.querySelector("[data-filter-keyword]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var categorySelect = document.querySelector("[data-filter-category]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

  function applyFilters() {
    var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value : "all";
    var category = categorySelect ? categorySelect.value : "all";

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-title") || "").toLowerCase();
      var cardYear = card.getAttribute("data-year") || "";
      var cardCategory = card.getAttribute("data-category") || "";
      var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      var yearMatch = year === "all" || cardYear === year;
      var categoryMatch = category === "all" || cardCategory === category;

      card.classList.toggle("is-hidden", !(keywordMatch && yearMatch && categoryMatch));
    });
  }

  if (keywordInput) {
    keywordInput.addEventListener("input", applyFilters);
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", applyFilters);
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", applyFilters);
  }
})();

function setupMoviePlayer(source) {
  var video = document.getElementById("movie-player");
  var cover = document.querySelector("[data-play-cover]");
  var button = document.querySelector("[data-play-button]");
  var attached = false;

  if (!video || !source) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function start() {
    attach();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    var playback = video.play();

    if (playback && typeof playback.catch === "function") {
      playback.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
}
