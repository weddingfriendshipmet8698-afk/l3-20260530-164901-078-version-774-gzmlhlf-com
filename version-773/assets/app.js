(function () {
  var navButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-arrow.prev');
  var next = document.querySelector('.hero-arrow.next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function restartHeroTimer() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-target') || 0));
        restartHeroTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartHeroTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartHeroTimer();
      });
    }

    restartHeroTimer();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('.movie-filter'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    var query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).join(' '));
    var selected = filterSelects.length ? filterSelects[0].value : 'all';

    cards.forEach(function (card) {
      var meta = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-meta')
      ].join(' '));
      var category = card.getAttribute('data-category') || 'all';
      var textMatch = !query || meta.indexOf(query) !== -1;
      var categoryMatch = selected === 'all' || selected === category;

      card.classList.toggle('is-hidden', !(textMatch && categoryMatch));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', filterCards);
  });

  filterSelects.forEach(function (select) {
    select.addEventListener('change', filterCards);
  });

  function bindPlayer(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function attachStream() {
      var stream = video.getAttribute('data-stream');

      if (!stream) {
        return;
      }

      if (video.getAttribute('data-ready') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', 'true');
    }

    function playVideo() {
      attachStream();
      shell.classList.add('is-playing');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(bindPlayer);
})();
