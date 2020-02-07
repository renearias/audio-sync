import { Spectrogram } from './spectrogram';
import {FFT} from './fft';

export class AudioPlayer {
  context: AudioContext = new AudioContext();
  soundBuffer: AudioBuffer;
  source: AudioBufferSourceNode;
  spectro: Spectrogram;

  constructor() {
    // this.spectro = new Spectrogram(document.getElementById('canvas'), {
    //   audio: {
    //     enable: false
    //   }
    // });
  }

  get duration() {
    return this.soundBuffer ? this.soundBuffer.duration : undefined;
  }
  loadSound(url) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = () => {
      this.context.decodeAudioData(
        request.response,
        buffer => {
          this.soundBuffer = buffer;
          const canvasDrawEl: HTMLCanvasElement = document.getElementById(
            'canvas'
          ) as HTMLCanvasElement;
          const canvasDrawElContext = canvasDrawEl.getContext('2d');
          const WIDTH = canvasDrawEl.width;
          const HEIGHT = canvasDrawEl.height;
          canvasDrawElContext.fillStyle = 'black';
          canvasDrawElContext.fillRect(
            0,
            0,
            canvasDrawEl.width,
            canvasDrawEl.height
          );
          console.log('ya cargo el sonido', this.soundBuffer);

          const analyser = this.context.createAnalyser();
          // analyser.fftSize = 256;
          const audioData = new Uint8Array(this.soundBuffer.getChannelData(0));
          // analyser.connect(this.context.createScriptProcessor(this.soundBuffer,))
          let fft = new FFT(audioData, 1024);
          console.log('fft' , fft);
          analyser.getByteFrequencyData(audioData);


          // analyser.connect(this.soundBuffer)
          // analyser.minDecibels = -90;
          // analyser.maxDecibels = -10;

          analyser.smoothingTimeConstant = 0;
          analyser.fftSize = 1024;

          // const scriptNode = this.context.createScriptProcessor(2048, 1, 1);
          //scriptNode.connect(this.context.destination);
          //analyser.connect(scriptNode);
          // sourceNode.connect(analyser);

          var bufferLength = analyser.frequencyBinCount;
          console.log('BUFFER LEEN', audioData, bufferLength);

          var dataArray = audioData;

          canvasDrawElContext.clearRect(0, 0, WIDTH, HEIGHT);
          let drawVisual;
          function draw() {
            drawVisual = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            // canvasDrawElContext.fillStyle = 'rgb(0, 0, 0)';
            canvasDrawElContext.fillRect(0, 0, WIDTH, HEIGHT);

            var barWidth = (WIDTH / bufferLength) * 2.5 - 1;
            var barHeight;
            var x = 0;

            for (var i = 0; i < bufferLength; i++) {
              barHeight = dataArray[i];

              canvasDrawElContext.fillStyle =
                'rgb(' + (barHeight + 100) + ',50,50)';
              canvasDrawElContext.fillRect(
                x,
                HEIGHT - barHeight / 2,
                barWidth,
                barHeight / 2
              );

              x += barWidth;
            }
          }

          draw();

          // let array = new Uint8Array(source.analyser.frequencyBinCount);
        },
        this.onError
      );
    };
    request.send();
  }

  play(buffer?, time?) {
    return new Promise(resolve => {
      this.source = this.context.createBufferSource();
      this.source.buffer = this.soundBuffer;
      this.source.connect(this.context.destination);
      this.source.start(0);
      resolve(true);
    });
  }

  seek(time) {
    this.source.start(time);
  }

  stop() {
    this.source.stop();
    this.source.disconnect();
  }
  onError(e) {
    console.log('error on load audio', e);
  }
}
