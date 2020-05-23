import pubsub from '../pubsub';
export class CustomVideo extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'type', 'muted', 'autoplay'];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});
        this.getVideo();
        pubsub.subscribe('custom_video_volume_changed', this.volumeUpdate, this);
        document.onfullscreenchange = function(e) {
            if (!document.fullscreenElement && e.target) {
                e.target.controls.fullscreen.innerHTML = `<span class="mdi mdi-fullscreen"></span>`;
            }
        }.bind(this);
    }

    getVideoElement({src, muted, autoPlay, height, width}) {
        this.video = document.createElement('video');
        this.video.setAttribute('src', src);
        // this.video.setAttribute('controls', false);
        this.video.setAttribute('muted', muted);
        this.video.setAttribute('autoplay', true);
        // this.video.setAttribute('height', height);
        // this.video.setAttribute('width', width);
        this.video.setAttribute('volume', 1);
    }

    getTitleElement({title}) {
        this.videoTitle = document.createElement('h1');
        this.videoTitle.innerHTML = title
    }

    getControls() {
        this.controls = {
            container: document.createElement('div'),
            mute: document.createElement('button'),
            play: document.createElement('button'),
            fullscreen: document.createElement('button'),
        }

        this.controls.container.setAttribute('class', 'video-controls');

        this.controls.mute.innerHTML = `<span class="mdi mdi-volume-high"></span>`;
        this.controls.mute.addEventListener('click', this.volumeChanged.bind(this));

        this.controls.play.innerHTML = `<span class="mdi mdi-play"></span>`;
        this.controls.play.addEventListener('click', this.playChanged.bind(this));

        this.controls.fullscreen.innerHTML = `<span class="mdi mdi-fullscreen"></span>`;
        this.controls.fullscreen.addEventListener('click', this.changeScreen.bind(this));

        this.controls.container.appendChild(this.controls.play);
        this.controls.container.appendChild(this.controls.mute);
        this.controls.container.appendChild(this.controls.fullscreen);
    }

    changeScreen(e) {
        if (document.fullscreenElement) {
            this.controls.fullscreen.innerHTML = `<span class="mdi mdi-fullscreen"></span>`;
            document.exitFullscreen();
        } else {
            this.controls.fullscreen.innerHTML = `<span class="mdi mdi-fullscreen-exit"></span>`;
            this.container.requestFullscreen();
        }
    }

    playChanged(e) {
        if (this.video.paused) {
            this.video.play();
            this.controls.play.innerHTML = `<span class="mdi mdi-pause"></span>`
        }
        else {
            this.video.pause();
            this.controls.play.innerHTML = `<span class="mdi mdi-play"></span>`
        }
    }

    volumeUpdate(value) {
        if (value !== undefined) {
            this.video.volume = value ? 0 : 1;
        }
        if (this.video.volume) {
            this.controls.mute.innerHTML = '<span class="mdi mdi-volume-mute"></span>'; //unmute
            this.video.volume = 0;
        } else {
            this.controls.mute.innerHTML = '<span class="mdi mdi-volume-high"></span>'; //mute
            this.video.volume = 1;
        }
    }


    volumeChanged(e) {
        this.volumeUpdate();
        pubsub.publish('custom_video_volume_changed', this, this.video.volume);
    }

    getCSS() {
        const style = document.createElement('style');
        style.innerHTML = `
            :host {
                --title-color: #110f12;
                --ctrl-btn-bg: #161a1c;
                --light-color: white;
                --ctrl-btn-radius: 5px;
                --ctrl-btn-margin: 0 10px 0 0;
                --ctrl-btn-height: 18px;
                // font-family: Verdana, Geneva, Tahoma, sans-serif;
                font-family: 'Roboto', sans-serif;
            }
            .video-container {
                width: 400 px;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            }
            .video-container h1 {
                color: var(--title-color, 'gray');
                margin: 5px 0;
                font-size: 24px;
                padding: 0 20px;
            }
            .video-controls {
                position: relative;
                left: 0;
                bottom: 30px;
            }
            .video-controls button {
                background: var(--ctrl-btn-bg, 'gray');
                height: var(--ctrl-btn-height, '30px');
                margin: var(--ctrl-btn-margin, '10px');
                border-radius: var(--ctrl-btn-radius, '5px');
                border: 1px solid;
                color: var(--light-color, white);
                cursor: pointer;
                opacity: 0.5;
                outline: none;
            }
            .video-controls button:hover {
                opacity: 1;
            }
            .video-container video {
                width: inherit;
                border: 5px solid white;
                box-shadow: 5px 5px 5px #00000054;
            }
        `
        return style;
    }

    getVideo() {
        const title = this.getAttribute('title'); // Title to display on url
        const srcUrl = this.getAttribute('src-url'); // Start with MP4 only
        const type = this.getAttribute('type') || 'full'; // mini or full
        const muted = this.getAttribute('muted');
        const autoPlay = this.getAttribute('autoplay') || false;

        this.container = document.createElement('div');
        this.container.setAttribute('class', `video-container ${type}`);

        // Add Title
        this.getTitleElement({title});
        this.container.appendChild(this.videoTitle);

        // Add video player
        if (type === 'mini') {
            this.container.style.width = "400px";
            this.getVideoElement({src: srcUrl, muted, autoPlay, height: 200, width: 200})
        }
        else {
            this.container.style.width = "1024px";
            this.getVideoElement({src: srcUrl, muted, autoPlay, height: 400, width: 400})
        }
        this.container.appendChild(this.video);

        // Add custom controls
        this.getControls();
        this.container.appendChild(this.controls.container);

        this.shadowRoot.appendChild(this.container);
        this.shadowRoot.appendChild(this.getCSS());
    }

    attributeChangedCallback(name, oldVal, newVal) {
        switch(name) {
            case 'muted':
            case 'type':
                this.shadowRoot.innerHTML = "";
                const externalCSS = document.createElement('link');
                externalCSS.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/5.2.45/css/materialdesignicons.css');
                externalCSS.setAttribute('rel', 'stylesheet');
                this.shadowRoot.appendChild(externalCSS);
                this.getVideo();
                break;
            case 'title':
                this.videoTitle.innerHTML = newVal;
                break;
            case 'autoplay':
                this.video.autoplay = newVal;
                break;
            default:
                break;
        }
    }
}
