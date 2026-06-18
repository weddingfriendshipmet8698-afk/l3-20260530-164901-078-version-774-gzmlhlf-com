document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      toggle.classList.toggle("is-open");
      mobileNav.classList.toggle("is-open");
    });
  }

  var backTop = document.querySelector(".back-top");

  if (backTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 420) {
        backTop.classList.add("is-visible");
      } else {
        backTop.classList.remove("is-visible");
      }
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var searchInput = document.querySelector(".js-search-input");
  var regionFilter = document.querySelector(".js-filter-region");
  var typeFilter = document.querySelector(".js-filter-type");
  var resetButton = document.querySelector(".js-reset-filters");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var empty = document.querySelector(".empty-message");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    var query = normalize(searchInput ? searchInput.value : "");
    var region = normalize(regionFilter ? regionFilter.value : "");
    var type = normalize(typeFilter ? typeFilter.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags")
      ].join(" "));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardType = normalize(card.getAttribute("data-type"));
      var matched = true;

      if (query && haystack.indexOf(query) === -1) {
        matched = false;
      }

      if (region && cardRegion !== region) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", cards.length > 0 && visible === 0);
    }
  }

  [searchInput, regionFilter, typeFilter].forEach(function (item) {
    if (item) {
      item.addEventListener("input", applyFilters);
      item.addEventListener("change", applyFilters);
    }
  });

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (searchInput) {
        searchInput.value = "";
      }
      if (regionFilter) {
        regionFilter.value = "";
      }
      if (typeFilter) {
        typeFilter.value = "";
      }
      applyFilters();
    });
  }
});
