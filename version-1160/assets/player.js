function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var overlay = document.getElementById(options.overlayId);
    var stream = options.stream;
    var player = null;
    var loaded = false;

    if (!video || !stream) {
        return;
    }

    function loadStream() {
        if (loaded) {
            return Promise.resolve();
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            player = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            player.loadSource(stream);
            player.attachMedia(video);

            return new Promise(function (resolve) {
                player.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
            });
        }

        video.src = stream;
        return Promise.resolve();
    }

    function playVideo() {
        loadStream().then(function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            var request = video.play();

            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        });
    }

    if (button) {
        button.addEventListener("click", playVideo);
    }

    if (overlay) {
        overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    video.addEventListener("pause", function () {
        if (overlay && !video.ended) {
            overlay.classList.remove("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (player) {
            player.destroy();
        }
    });
}
