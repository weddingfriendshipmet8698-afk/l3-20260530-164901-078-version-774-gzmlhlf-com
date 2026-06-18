function initMoviePlayer(streamUrl) {
  var video = document.querySelector(".movie-video");
  var overlay = document.querySelector(".player-overlay");
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-player-action='play']"));
  var hls = null;
  var attached = false;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayer() {
    attachStream();
    video.setAttribute("controls", "controls");

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var result = video.play();

    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", startPlayer);
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayer();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
