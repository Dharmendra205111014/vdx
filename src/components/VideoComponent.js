import pubsub from '../pubsub';
export class CustomVideo extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'type', 'muted', 'autoplay'];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});
        console.log('CustomVideo.elements', CustomVideo.elements);
        const id = CustomVideo.elements + 1;
        this.getVideo();
        pubsub.subscribe('custom_video_volume_changed', this.volumeUpdate, this);
    }

    getVideoElement({src, muted, autoPlay, height, width}) {
        this.video = document.createElement('video');
        this.video.setAttribute('src', src);
        // this.video.setAttribute('controls', false);
        this.video.setAttribute('muted', muted);
        this.video.setAttribute('autoplay', true);
        // this.video.setAttribute('height', height);
        this.video.setAttribute('width', width);
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
            play: document.createElement('button')
        }

        this.controls.container.setAttribute('class', 'video-controls');

        this.controls.mute.innerHTML = 'mute';
        this.controls.mute.addEventListener('click', this.volumeChanged.bind(this));

        this.controls.play.innerHTML = 'play';
        this.controls.play.addEventListener('click', this.playChanged.bind(this));

        this.controls.container.appendChild(this.controls.play);
        this.controls.container.appendChild(this.controls.mute);
    }

    playChanged(e) {
        if (this.video.paused) {
            this.video.play();
            this.controls.play.innerHTML = "Pause"
        }
        else {
            this.video.pause();
            this.controls.play.innerHTML = "Play"
        }
    }

    volumeUpdate(value) {
        if (value !== undefined) {
            this.video.volume = value ? 0 : 1;
            // return;
        }
        if (this.video.volume) {
            this.controls.mute.innerHTML = 'unmute';
            this.video.volume = 0;
        } else {
            this.controls.mute.innerHTML = 'mute';
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
                --ctrl-btn-radius: 3px;
                --ctrl-btn-margin: 0 10px 0 0;
                --ctrl-btn-height: 25px;
                font-family: Verdana, Geneva, Tahoma, sans-serif;
            }
            .video-container h1 {
                color: var(--title-color, 'gray');
                margin: 5px 0;
                font-size: 24px;
            }
            .video-controls button {
                background: var(--ctrl-btn-bg, 'gray');
                height: var(--ctrl-btn-height, '30px');
                margin: var(--ctrl-btn-margin, '10px');
                border-radius: var(--ctrl-btn-radius, '5px');
                border: 0px;
                color: var(--light-color, white);
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

        const container = document.createElement('div');
        container.setAttribute('class', `video-container ${type}`);

        // Add Title
        this.getTitleElement({title});
        container.appendChild(this.videoTitle);

        // Add video player
        if(type === 'mini')
            this.getVideoElement({src: srcUrl, muted, autoPlay, height: 200, width: 200})
        else
            this.getVideoElement({src: srcUrl, muted, autoPlay, height: 400, width: 400})
        container.appendChild(this.video);

        // Add custom controls
        this.getControls();
        container.appendChild(this.controls.container);

        this.shadowRoot.appendChild(container);
        this.shadowRoot.appendChild(this.getCSS());
    }

    attributeChangedCallback(name, oldVal, newVal) {
        switch(name) {
            case 'muted':
            case 'type':
                this.shadowRoot.innerHTML = "";
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
