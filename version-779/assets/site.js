(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const showSlide = function (targetIndex) {
      index = (targetIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const keywordInput = filterPanel.querySelector('[data-filter-input]');
    const typeSelect = filterPanel.querySelector('[data-filter-type]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const resetButton = filterPanel.querySelector('[data-filter-reset]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));

    const matchesYear = function (cardYear, selectedYear) {
      if (!selectedYear) {
        return true;
      }
      if (selectedYear === '1990') {
        const yearNumber = Number(cardYear);
        return yearNumber >= 1990 && yearNumber < 2000;
      }
      return cardYear === selectedYear;
    };

    const applyFilter = function () {
      const keyword = (keywordInput.value || '').trim().toLowerCase();
      const typeValue = typeSelect.value;
      const yearValue = yearSelect.value;

      cards.forEach(function (card) {
        const searchText = (card.dataset.search || '').toLowerCase();
        const typeText = card.dataset.type || '';
        const yearText = card.dataset.year || '';
        const visible = (!keyword || searchText.includes(keyword)) &&
          (!typeValue || typeText === typeValue) &&
          matchesYear(yearText, yearValue);

        card.classList.toggle('is-filter-hidden', !visible);
      });
    };

    [keywordInput, typeSelect, yearSelect].forEach(function (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    });

    resetButton.addEventListener('click', function () {
      keywordInput.value = '';
      typeSelect.value = '';
      yearSelect.value = '';
      applyFilter();
    });
  }

  const searchInput = document.getElementById('site-search-input');
  const searchButton = document.getElementById('site-search-button');
  const results = document.getElementById('search-results');

  if (searchInput && searchButton && results && Array.isArray(window.MOVIE_SEARCH_DATA)) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    const createCard = function (movie) {
      const tags = movie.tags.slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '' +
        '<article class="movie-card">' +
          '<a class="poster-frame" href="' + movie.url + '">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
            '<span class="poster-play">▶</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
            '<div class="card-meta"><a href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.year) + '</span></div>' +
            '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="chip-row">' + tags + '</div>' +
          '</div>' +
        '</article>';
    };

    const runSearch = function () {
      const query = searchInput.value.trim().toLowerCase();
      const source = query ? window.MOVIE_SEARCH_DATA.filter(function (movie) {
        return movie.search.includes(query);
      }) : window.MOVIE_SEARCH_DATA.slice(0, 30);

      const output = source.slice(0, 120).map(createCard).join('');
      results.innerHTML = output || '<p class="empty-result">没有找到匹配结果。</p>';
    };

    searchButton.addEventListener('click', runSearch);
    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        runSearch();
      }
    });

    runSearch();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
