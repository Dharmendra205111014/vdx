import pubsub from '../pubsub';

/**
 * Custom element class which override native video mechanism
 */
export class CustomVideo extends HTMLElement {

    /**
     * Define observable attributes, only these attributes changes will fire attributeChangedCallback
     */
    static get observedAttributes() {
        return ['title', 'type', 'muted', 'autoplay'];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});
        this.id = 'vdx_' + new Date().getTime();
        this.getVideo();

        // This is where Mute is share across the instance through `custom_video_volume_changed` event
        pubsub.subscribe('custom_video_volume_changed', this.volumeUpdate, this);
        pubsub.subscribe('custom_video_pause_changed', this.pauseChange, this);

        // Handle document full screen state change
        // @TODO: Could be at better place, keeping in constructor for now
        document.onfullscreenchange = function(e) {
            if (!document.fullscreenElement && e.target) {
                e.target.controls.fullscreen.innerHTML = `<span class="mdi mdi-fullscreen"></span>`;
            }
        }.bind(this);
    }

    /**
     * Create videos elements and keep the reference for modification
     * @param {object} param - video element parameters
     */
    getVideoElement({src, muted}) {
        this.video = document.createElement('video');
        this.video.setAttribute('src', src);
        this.video.setAttribute('muted', muted);
        this.video.setAttribute('volume', 1);
    }

    /**
     * Create title overlay in video
     * @param {object} param - Title params object
     */
    getTitleElement({title}) {
        this.videoTitle = document.createElement('h1');
        this.videoTitle.innerHTML = title
    }

    /**
     * Attatch custom control with customize behavior for video panal
     */
    getControls() {
        /**
         * Define video controls here
         */
        this.controls = {
            container: document.createElement('div'),
            mute: document.createElement('button'),
            play: document.createElement('button'),
            fullscreen: document.createElement('button'),
        }

        this.controls.container.setAttribute('class', 'video-controls');

        // Mute control
        this.controls.mute.innerHTML = `<span class="mdi mdi-volume-high"></span>`;
        this.controls.mute.addEventListener('click', this.volumeChanged.bind(this));

        // Play control
        this.controls.play.innerHTML = `<span class="mdi mdi-play"></span>`;
        this.controls.play.addEventListener('click', this.playChanged.bind(this));

        // Full screen control
        this.controls.fullscreen.innerHTML = `<span class="mdi mdi-fullscreen"></span>`;
        this.controls.fullscreen.addEventListener('click', this.changeScreen.bind(this));

        this.controls.container.appendChild(this.controls.play);
        this.controls.container.appendChild(this.controls.mute);
        this.controls.container.appendChild(this.controls.fullscreen);
    }

    /**
     *  Screen change callback from button click
     *  NOTE: Currently button template is replaced directly, could have been managed better
     * @param {object} e - event
     */
    changeScreen(e) {
        if (document.fullscreenElement) {
            this.controls.fullscreen.innerHTML = `<span class="mdi mdi-fullscreen"></span>`;
            document.exitFullscreen();
        } else {
            this.controls.fullscreen.innerHTML = `<span class="mdi mdi-fullscreen-exit"></span>`;
            this.container.requestFullscreen();
        }
    }

    pauseChange(id) {
        if(this.id !== id) {
            this.pause();
        }
    }

    /**
     * Play state change callback on button click
     * NOTE: Currently button template is replaced directly, could have been managed better
     * @param {object} e - event 
     */
    playChanged(e) {
        if (this.video.paused) {
            this.play();
        }
        else {
            this.pause();
        }
    }

    play() {
        this.video.play();
        pubsub.publish('custom_video_volume_changed', this, this.id);
        this.controls.play.innerHTML = `<span class="mdi mdi-pause"></span>`
    }

    pause() {
        this.video.pause();
        this.controls.play.innerHTML = `<span class="mdi mdi-play"></span>`
    }

    /**
     * Callback to handle volume update from same or other instances
     * NOTE: Currently button template is replaced directly, could have been managed better
     * @param {number} value - volume value between 0 to 1 
     */
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

    /**
     * Volume state change callback on button click
     * @param {object} e - event 
     */
    volumeChanged(e) {
        this.volumeUpdate();
        pubsub.publish('custom_video_volume_changed', this, this.video.volume);
    }

    /**
     * In web component css effet get inside :host property
     * - could have created a different css module and imported it, but keeping in same file to have single file component for complete feature
     * - colurs are managed using css vars
     */
    getCSS() {
        const style = document.createElement('style');
        style.innerHTML = `
            :host {
                --title-color: #FFF;
                --ctrl-btn-bg: #161a1c;
                --light-color: white;
                --ctrl-btn-radius: 5px;
                --ctrl-btn-margin: 0 10px 0 0;
                --ctrl-btn-height: 18px;
                --video-box-shadow-color: #00000054;
                font-family: 'Roboto', sans-serif;
            }
            .video-container {
                width: 400 px;
                display: flex;
                justify-content: center;
                flex-direction: column;
                position: relative;
            }
            .video-container h1 {
                color: var(--title-color, 'gray');
                margin: 5px 0;
                font-size: 24px;
                padding: 0;
                position: absolute;
                top: 5px;
                left: 5px;
                background: black;
                width: 100%;
                opacity: 0.5;
            }
            .video-controls {
                position: relative;
                left: 0;
                bottom: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
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
                box-shadow: 5px 5px 5px var(--video-box-shadow-color, lightgray);
            }
        `
        return style;
    }

    /**
     * Main function to compose complete Video container
     * - This read all attributes and fill them accordingly
     * - Create native html elements, same could have been done with ES6 template literals, but to have better control on each inner element and to hold all references used document.createElement
     */
    getVideo() {
        const title = this.getAttribute('title'); // Title to display on url
        const srcUrl = this.getAttribute('src-url'); // Start with MP4 only
        const type = this.getAttribute('type') || 'full'; // mini or full
        const muted = this.getAttribute('muted');

        // Create container
        this.container = document.createElement('div');
        this.container.setAttribute('class', `video-container ${type}`);

        // Add Title
        this.getTitleElement({title});
        this.container.appendChild(this.videoTitle);

        // Add video player
        if (type === 'mini') {
            this.container.style.width = "400px";
            this.getVideoElement({src: srcUrl, muted})
        }
        else {
            this.container.style.width = "1024px";
            this.getVideoElement({src: srcUrl, muted})
        }
        this.container.appendChild(this.video);

        // Add custom controls
        this.getControls();
        this.container.appendChild(this.controls.container);

        this.shadowRoot.appendChild(this.container);
        this.shadowRoot.appendChild(this.getCSS());
    }

    /**
     * Since webcomponent has CSS in its own scope, we will have to have external CSS resolve within them
     * This is mainly because the component is independent outside shadow root
     * 
     * Adding Material design CSS to use its icons in buttons
     */
    addExternalCSS() {
        const externalCSS = document.createElement('link');
        externalCSS.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/5.2.45/css/materialdesignicons.css');
        externalCSS.setAttribute('rel', 'stylesheet');
        this.shadowRoot.appendChild(externalCSS);
    }

    /**
     * Callback is fired when any of the observable attributes are changed
     * @param {string} name - attribute name
     * @param {string} oldVal - old value
     * @param {string} newVal - new Value
     */
    attributeChangedCallback(name, oldVal, newVal) {
        switch(name) {
            case 'muted':
            case 'type':
                this.shadowRoot.innerHTML = "";
                this.addExternalCSS();
                this.getVideo();
                break;
            case 'title':
                this.videoTitle.innerHTML = newVal;
                break;
            default:
                break;
        }
    }

    // No need to handle any object explecitely here in this use case
    disconnectedCallback() {
        console.log("Disconnected the element");
    }
}
