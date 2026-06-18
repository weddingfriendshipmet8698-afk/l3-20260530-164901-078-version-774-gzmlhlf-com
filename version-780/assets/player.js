(function () {
  window.initMoviePlayer = function (src, videoId, coverId) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);

    if (!video || !src) {
      return;
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function playVideo() {
      hideCover();
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    function bindSource() {
      if (video.getAttribute('data-ready') === '1') {
        playVideo();
        return;
      }

      video.setAttribute('data-ready', '1');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.load();
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        video._hls = hls;
        return;
      }

      video.src = src;
      video.load();
      playVideo();
    }

    if (cover) {
      cover.addEventListener('click', bindSource);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        bindSource();
      }
    });

    video.addEventListener('play', hideCover);
  };
})();
