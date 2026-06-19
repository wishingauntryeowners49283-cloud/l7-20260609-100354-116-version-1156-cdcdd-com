import { H as Hls } from "./hls-vendor-dru42stk.js";

var instances = new WeakMap();

function attachSource(player) {
  var video = player.querySelector("video");
  var url = player.getAttribute("data-hls-src");
  if (!video || !url || instances.has(video)) {
    return;
  }
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    instances.set(video, true);
    return;
  }
  if (Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
        instances.delete(video);
      }
    });
    instances.set(video, hls);
  } else {
    video.src = url;
    instances.set(video, true);
  }
}

function startPlayer(player) {
  var video = player.querySelector("video");
  if (!video) {
    return;
  }
  attachSource(player);
  player.classList.add("playing");
  var playResult = video.play();
  if (playResult && typeof playResult.catch === "function") {
    playResult.catch(function () {
      video.controls = true;
    });
  }
}

document.querySelectorAll("[data-player]").forEach(function (player) {
  var button = player.querySelector(".player-start");
  var video = player.querySelector("video");
  if (button) {
    button.addEventListener("click", function () {
      startPlayer(player);
    });
  }
  if (video) {
    video.addEventListener("click", function () {
      if (!player.classList.contains("playing")) {
        startPlayer(player);
      }
    });
    video.addEventListener("play", function () {
      player.classList.add("playing");
    });
  }
});
