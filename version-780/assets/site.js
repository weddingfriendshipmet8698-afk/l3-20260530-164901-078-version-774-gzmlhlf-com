(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function movieCard(item) {
    return [
      '<a class="movie-card" href="' + escapeHtml(item.url) + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="movie-badge">' + escapeHtml(item.category) + '</span>',
      '  </span>',
      '  <span class="movie-info">',
      '    <strong>' + escapeHtml(item.title) + '</strong>',
      '    <em>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</em>',
      '    <span>' + escapeHtml(item.description) + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobile = document.querySelector('[data-mobile-menu]');

    if (toggle && mobile) {
      toggle.addEventListener('click', function () {
        mobile.classList.toggle('is-open');
      });
    }

    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    selectAll('[data-local-filter]').forEach(function (input) {
      var scope = input.closest('section').querySelector('[data-filter-scope]');
      if (!scope) {
        return;
      }
      var items = selectAll('[data-title]', scope);
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          var haystack = [
            item.getAttribute('data-title'),
            item.getAttribute('data-tags'),
            item.getAttribute('data-year')
          ].join(' ').toLowerCase();
          item.style.display = !query || haystack.indexOf(query) !== -1 ? '' : 'none';
        });
      });
    });

    var resultBox = document.querySelector('[data-search-results]');
    if (resultBox && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get('q') || '';
      var pageInput = document.querySelector('.search-page-form input[name="q"]');
      if (pageInput) {
        pageInput.value = queryValue;
      }
      var query = queryValue.trim().toLowerCase();
      var results = window.SEARCH_MOVIES.filter(function (item) {
        var haystack = [
          item.title,
          item.description,
          item.year,
          item.region,
          item.genre,
          item.category,
          (item.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 120);

      if (!results.length) {
        resultBox.innerHTML = '<div class="no-results">没有找到匹配影片</div>';
      } else {
        resultBox.innerHTML = results.map(movieCard).join('');
      }
    }
  });
})();
