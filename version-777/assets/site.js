(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      menuButton.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 420) {
        backTop.classList.add('show');
      } else {
        backTop.classList.remove('show');
      }
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
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
    };

    var start = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      });
    });

    showSlide(0);
    start();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var list = panel.parentElement.querySelector('[data-search-list]');
    if (!list) {
      return;
    }

    var input = panel.querySelector('[data-filter-input]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();

        var keep = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          keep = false;
        }
        if (regionValue && (card.getAttribute('data-region') || '').indexOf(regionValue) === -1) {
          keep = false;
        }
        if (typeValue && (card.getAttribute('data-type') || '').indexOf(typeValue) === -1) {
          keep = false;
        }
        if (yearValue && (card.getAttribute('data-year') || '') !== yearValue) {
          keep = false;
        }
        card.classList.toggle('hidden-card', !keep);
      });
    };

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
      apply();
    }
  });
}());

function startPlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var playLayer = document.querySelector('[data-play-layer]');
  if (!video || !streamUrl) {
    return;
  }

  var ready = false;
  var hlsInstance = null;

  var prepare = function () {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      ready = true;
    }
  };

  var play = function () {
    prepare();
    if (playLayer) {
      playLayer.classList.add('hide');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  };

  if (playLayer) {
    playLayer.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (playLayer) {
      playLayer.classList.add('hide');
    }
  });

  video.addEventListener('ended', function () {
    if (playLayer) {
      playLayer.classList.remove('hide');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
