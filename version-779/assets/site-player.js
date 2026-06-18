import { H as Hls } from './hls-dru42stk.js';

const players = document.querySelectorAll('[data-player]');

players.forEach(function (player) {
  const video = player.querySelector('video[data-src]');
  const button = player.querySelector('[data-player-button]');
  const status = player.querySelector('[data-player-status]');

  if (!video || !button) {
    return;
  }

  let hlsInstance = null;
  let sourceAttached = false;

  const setStatus = function (message) {
    if (status) {
      status.textContent = message;
    }
  };

  const attachSource = function () {
    if (sourceAttached) {
      return;
    }

    const source = video.dataset.src;
    sourceAttached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('正在使用浏览器原生 HLS 播放能力。');
      return;
    }

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('HLS 视频流已加载，可以播放。');
      });
      hlsInstance.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus('播放源加载遇到问题，请稍后重试。');
        }
      });
      return;
    }

    setStatus('当前浏览器不支持 HLS 播放。');
  };

  const playVideo = async function () {
    attachSource();
    video.controls = true;
    button.classList.add('is-hidden');

    try {
      await video.play();
    } catch (error) {
      button.classList.remove('is-hidden');
      setStatus('浏览器需要再次点击视频控件才能开始播放。');
    }
  };

  button.addEventListener('click', playVideo);

  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
});
