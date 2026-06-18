(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showHero(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showHero(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showHero((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterList = document.querySelector("[data-filter-list]");
  if (filterInput && filterList) {
    var filterCards = Array.prototype.slice.call(filterList.querySelectorAll("[data-card]"));
    filterInput.addEventListener("input", function () {
      var query = filterInput.value.trim().toLowerCase();
      filterCards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region")
        ].join(" ").toLowerCase();
        card.style.display = haystack.indexOf(query) >= 0 ? "" : "none";
      });
    });
  }

  var searchInput = document.querySelector("[data-search-input]");
  var searchButton = document.querySelector("[data-search-button]");
  var searchResults = document.querySelector("[data-search-results]");
  var searchStatus = document.querySelector("[data-search-status]");

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function cardTemplate(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\" data-card>",
      "  <a class=\"poster-link\" href=\"" + movie.href + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"score-pill\">" + movie.score + "</span>",
      "  </a>",
      "  <div class=\"movie-info\">",
      "    <h3><a href=\"" + movie.href + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p class=\"movie-meta\">" + escapeHtml(movie.year + " · " + movie.region + " · " + movie.type) + "</p>",
      "    <p class=\"movie-one-line\">" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function runSearch(value) {
    if (!searchResults || !window.MoviesIndex) {
      return;
    }

    var query = value.trim().toLowerCase();
    var list = window.MoviesIndex;
    var matches = query ? list.filter(function (movie) {
      return [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.category,
        movie.tags.join(" ")
      ].join(" ").toLowerCase().indexOf(query) >= 0;
    }) : list.slice(0, 36);

    searchResults.innerHTML = matches.slice(0, 120).map(cardTemplate).join("");
    if (searchStatus) {
      searchStatus.textContent = query ? "搜索结果" : "热门搜索片单";
    }
  }

  if (searchInput && searchResults) {
    var initialQuery = getQuery();
    if (initialQuery) {
      searchInput.value = initialQuery;
    }
    runSearch(searchInput.value);
    searchInput.addEventListener("input", function () {
      runSearch(searchInput.value);
    });
    if (searchButton) {
      searchButton.addEventListener("click", function () {
        runSearch(searchInput.value);
      });
    }
  }
})();

function initMoviePlayer(videoId, buttonId, layerId, mediaUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var layer = document.getElementById(layerId);
  var hls = null;
  var ready = false;

  if (!video || !button || !layer || !mediaUrl) {
    return;
  }

  function attachMedia() {
    if (ready) {
      return;
    }

    ready = true;
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(mediaUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = mediaUrl;
    } else {
      video.src = mediaUrl;
    }

    video.setAttribute("controls", "controls");
  }

  function playMovie() {
    attachMedia();
    layer.classList.add("is-hidden");
    video.play().catch(function () {
      layer.classList.remove("is-hidden");
    });
  }

  layer.addEventListener("click", playMovie);
  button.addEventListener("click", playMovie);

  video.addEventListener("click", function () {
    if (!ready || video.paused) {
      playMovie();
    } else {
      video.pause();
    }
  });

  video.addEventListener("pause", function () {
    if (!video.ended) {
      layer.classList.remove("is-hidden");
    }
  });

  video.addEventListener("play", function () {
    layer.classList.add("is-hidden");
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
