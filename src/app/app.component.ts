import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import Recorder from './recorder';
import { AudioPlayer } from './audio-player';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('video', { static: false }) video: ElementRef;
  @ViewChild('audioTrack', { static: false }) audioTrack: ElementRef;
  @ViewChild('audioVoice', { static: false }) audioVoice: ElementRef;
  @ViewChild('audioVoiceRecord', { static: false })
  audioVoiceRecord: ElementRef;

  @ViewChild('recordingsList', { static: false }) recordingsList: ElementRef;
  title = 'audio-sync';
  recorder: Recorder;
  audioContext: AudioContext;
  input;

  gumStream: MediaStream;

  volume: { track: number; voice: number } = { track: 1, voice: 1 };

  audioPlayer: AudioPlayer;

  lastLatency = 0;

  ngOnInit() {
    window.onload = () => {
      this.audioContext = new AudioContext();
      this.audioPlayer = new AudioPlayer();
      this.audioPlayer.loadSound('../assets/playerFiles/aqui estoy yo.mp3');
    };
  }

  get audioTrackPlayer(): HTMLAudioElement {
    return this.audioTrack.nativeElement;
  }

  get audioVoicePlayer(): HTMLAudioElement {
    return this.audioVoice.nativeElement;
  }

  get audioVoiceRecordPlayer(): HTMLAudioElement {
    return this.audioVoiceRecord.nativeElement;
  }

  get videoPlayer(): HTMLAudioElement {
    return this.video.nativeElement;
  }
  playAll() {
    this.audioVoicePlayer.play();
    this.videoPlayer.play();
    setTimeout(() => {
      this.audioTrackPlayer.play();
    }, 240);
  }

  pauseAll() {
    this.audioTrackPlayer.pause();
    this.audioVoicePlayer.pause();
    this.videoPlayer.pause();
  }

  updateVolumeTrack(volume) {
    this.audioTrackPlayer.volume = volume;
  }

  updateVolumeVoice(volume) {
    this.audioVoicePlayer.volume = volume;
  }

  async record() {
    await this.audioContext.resume().then(async () => {
      console.log(this.recorder);
      const dateOfRecord= new Date().getTime();
      let dateOfPlay: number;
      const constraints = { audio: true, video: false };
      await navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        this.input = this.audioContext.createMediaStreamSource(stream);
        this.gumStream = stream;
        this.recorder = new Recorder(this.input, { numChannels: 1 });
        // dateOfRecord = new Date().getTime();
        this.recorder.record();
        console.log('empezo a grabar');
      });
      // this.audioTrackPlayer.play();
      await this.playContext();
      dateOfPlay = new Date().getTime();
      this.lastLatency = dateOfPlay - dateOfRecord;
      console.log(
        'emepezo a reproducir',
        dateOfPlay,
        dateOfRecord,
        this.lastLatency
      );

      console.log('Playback resumed successfully');
    });
  }

  stopRecord() {
    // //disable the stop button, enable the record too allow for new recordings
    // stopButton.disabled = true;
    // recordButton.disabled = false;
    // pauseButton.disabled = true;

    // //reset button just in case the recording is stopped while paused
    // pauseButton.innerHTML="Pause";

    // tell the recorder to stop the recording
    this.recorder.stop();
    this.audioPlayer.stop();

    // stop microphone access
    this.gumStream.getAudioTracks()[0].stop();

    // create the wav blob and pass it on to createDownloadLink
    this.recorder.exportWAV(this.createDownloadLink.bind(this));
  }

  createDownloadLink(blob) {
    console.log(blob);
    const url = URL.createObjectURL(blob);

    const au: HTMLAudioElement = document.createElement('audio');
    const li: HTMLElement = document.createElement('li');
    const link: any = document.createElement('a');

    // name of .wav file to use during upload and download (without extendion)
    const filename = new Date().toISOString();

    // add controls to the <audio> element
    au.controls = true;
    au.src = url;
    this.audioVoiceRecordPlayer.src = url;

    // save to disk link
    link.href = url;
    link.download = filename + '.wav'; // download forces the browser to donwload the file using the  filename
    link.innerHTML = 'Save to disk';

    // add the new audio element to li
    li.appendChild(au);

    // add the filename to the li
    li.appendChild(document.createTextNode(filename + '.wav '));

    // add the save to disk link to li
    li.appendChild(link);

    // upload link
    const upload = document.createElement('a');
    upload.href = '#';
    upload.innerHTML = 'Upload';
    upload.addEventListener('click', event => {
      const xhr = new XMLHttpRequest();
      xhr.onload = (e: any) => {
        if (e.readyState === 4) {
          console.log('Server returned: ', e.target.responseText);
        }
      };
      const fd = new FormData();
      fd.append('audio_data', blob, filename);
      xhr.open('POST', 'upload.php', true);
      xhr.send(fd);
    });
    li.appendChild(document.createTextNode(' ')); // add a space in between
    li.appendChild(upload); // add the upload link to li

    // add the li element to the ol
    this.recordingsList.nativeElement.appendChild(li);
  }

  playRecord() {
    this.audioVoiceRecordPlayer.play();
    // this.audioTrackPlayer.play();
    setTimeout(() => {
      this.audioPlayer.play();
    }, this.lastLatency);
  }

  stopPlayRecord() {
    this.audioVoiceRecordPlayer.pause();
    // this.audioTrackPlayer.pause();
    this.audioPlayer.stop();
  }

  playContext() {
    return this.audioPlayer.play();
  }

  stopContext() {
    this.audioPlayer.stop();
  }
}
