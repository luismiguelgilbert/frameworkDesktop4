<template>
<div style="height: 405px; overflow-y: hidden;">
    <q-select filled square v-model="selectedCamera" :options="cameras" @input="cameraSelected" label="Seleccione la cámara"/>
    <q-toolbar class="no-padding">
        <q-btn v-if="selectedCamera" icon="fas fa-camera" color="primary" flat label="Tomar Foto" stretch class="full-width"  @click="takePicture" />
    </q-toolbar>
    <q-separator />
    
    <!-- :width="width" :height="height"   -->
    <video ref="video" :src="source" :autoplay="autoplay" :playsinline="playsinline" height="298px" />
</div>
</template>

<script>
export default {
  name: "VueWebCam",
  props: {
    /*
    width: { type: [Number, String], default: "100%" },
    height: { type: [Number, String], default: "100px" },
    autoplay: { type: Boolean, default: true },
    screenshotFormat: { type: String, default: "image/jpeg" },
    selectFirstDevice: { type: Boolean, default: false },
    deviceId: { type: String, default: null },
    playsinline: { type: Boolean, default: true },
    resolution: {
      type: Object,
      default: null,
      validator: value => {
        return value.height && value.width;
      }
    }
    */
  },
  data() {
    return {
      source: null,
      canvas: null,
      camerasListEmitted: false,
      cameras: [],
      selectedCamera: null,
      playsinline: true,
      deviceId: null,
      selectFirstDevice: false,
      autoplay: true,
      screenshotFormat: "image/jpeg",
    };
  },
  watch: {
    deviceId: function(id) {
      console.dir('deviceId change')
      this.changeCamera(id);
    }
  },
  mounted() {
    this.setupMedia();
  },
  beforeDestroy() {
    this.stop();
  },
  methods: {
    cameraSelected(){
        this.changeCamera(this.selectedCamera.deviceId)
    },
    takePicture(){
        let picture = this.capture()
        this.$emit('pictureclicked', picture)
    },
    //get user media
    legacyGetUserMediaSupport() {
      return constraints => {
        // First get ahold of the legacy getUserMedia, if present
        let getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia ||
          navigator.oGetUserMedia;
        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          return Promise.reject(
            new Error("getUserMedia is not implemented in this browser")
          );
        }
        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    },
    //setup media
    setupMedia() {
        console.dir('setupMedia')
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
        console.dir('setupMedia 1')
      }
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = this.legacyGetUserMediaSupport();
         console.dir('setupMedia 2')
      }
      this.testMediaAccess();
    },
    //load available cameras
    loadCameras() {
        navigator.mediaDevices
            .enumerateDevices()
            .then(deviceInfos => {
            for (let i = 0; i !== deviceInfos.length; ++i) {
                let deviceInfo = deviceInfos[i];
                if (deviceInfo.kind === "videoinput") {
                this.cameras.push(deviceInfo);
                }
            }
            })
            .then(() => {
            if (!this.camerasListEmitted) {
                if (this.selectFirstDevice && this.cameras.length > 0) {
                this.deviceId = this.cameras[0].deviceId;
                }
                this.$emit("cameras", this.cameras);
                this.camerasListEmitted = true;
            }
            })
            .catch(error => this.$emit("notsupported", error));
    },
    //changeCamera
    changeCamera(deviceId) {
      this.stop();
      this.$emit("camera-change", deviceId);
      this.loadCamera(deviceId);
    },
    //load the stream to the
    loadSrcStream(stream) {
      if ("srcObject" in this.$refs.video) {
        // new browsers api
        this.$refs.video.srcObject = stream;
      } else {
        // old broswers
        this.source = window.HTMLMediaElement.srcObject(stream);
      }
      // Emit video start/live event
      this.$refs.video.onloadedmetadata = () => {
        this.$emit("video-live", stream);
      };
      this.$emit("started", stream);
    },
    //stop the selected streamed video to change camera
    stopStreamedVideo(videoElem) {
      let stream = videoElem.srcObject;
      let tracks = stream.getTracks();
      tracks.forEach(track => {
        // stops the video track
        track.stop();
        this.$emit("stopped", stream);
        this.$refs.video.srcObject = null;
        this.source = null;
      });
    },
    // stop the video
    stop() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.stopStreamedVideo(this.$refs.video);
      }
    },
    // start the video
    start() {
      if (this.deviceId) {
        this.loadCamera(this.deviceId);
      }
    },
    // pause the video
    pause() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.$refs.video.pause();
      }
    },
    // resume the video
    resume() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.$refs.video.play();
      }
    },
    //test access
    testMediaAccess() {
      let constraints = { video: true };
      if (this.resolution) {
        constraints.video = {};
        constraints.video.height = this.resolution.height;
        constraints.video.width = this.resolution.width;
      }
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          //Make sure to stop this MediaStream
          let tracks = stream.getTracks();
          tracks.forEach(track => {
            track.stop();
          });
          this.loadCameras();
        })
        .catch(error => this.$emit("error", error));
    },
    //load the camera passed as index!
    loadCamera(device) {
      let constraints = { video: { deviceId: { exact: device } } };
      if (this.resolution) {
        constraints.video.height = this.resolution.height;
        constraints.video.width = this.resolution.width;
      }
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => this.loadSrcStream(stream))
        .catch(error => this.$emit("error", error));
    },
    //capture screenshot
    capture() {
      return this.getCanvas().toDataURL(this.screenshotFormat);
    },
    //get canvas
    getCanvas() {
      let video = this.$refs.video;
      if (!this.ctx) {
        let canvas = document.createElement("canvas");
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
      }
      const { ctx, canvas } = this;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas;
    }
  }
};
</script>