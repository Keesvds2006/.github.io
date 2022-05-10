let audioContext;

//FM
let oscillator, tremolo, vibrato, gain, vibratoGain;
let fmIsPlaying = false;

//ADDITIVE
let oscillators, amplifiers;

//PROCESSING
let audioBuffer;

function init() {

  if(!audioContext) {
    console.log(' Init! ');
    audioContext = new AudioContext();
  }

}

function fm() {

  init();

  if(fmIsPlaying) {
    oscillator.stop();
    tremolo.stop();
    vibrato.stop();
    fmIsPlaying = false;
  } else {
    // Audio Controls
   oscillator = audioContext.createOscillator();
   tremolo = audioContext.createOscillator();
   vibrato = audioContext.createOscillator();
   gain = audioContext.createGain();
   vibratoGain = audioContext.createGain();

   // Set their values
   oscillator.frequency.value = 200;
   tremolo.frequency.value = 20;
   vibrato.frequency.value = 500;
   vibratoGain.gain.value = 3000;
   gain.gain.value = 1.0;

   // Connect the Controls
   tremolo.connect(gain.gain);
   vibrato.connect(vibratoGain);
   vibratoGain.connect(oscillator.frequency);
   oscillator.connect(gain);
   gain.connect(audioContext.destination);

   // Start the oscillators
   oscillator.start();
   tremolo.start();
   vibrato.start();

   // Program Changes
   oscillator.frequency.linearRampToValueAtTime(5000, audioContext.currentTime + 12);
   tremolo.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 12);

   //Manage state
   fmIsPlaying = true;
  }

}

function additive() {

  init();

  oscillators = [];
  amplifiers = [];

  let times = 200;

  for (var i = 0; i < times; i++) {

    //Create unit generators
    oscillators[i] = audioContext.createOscillator();
    amplifiers[i] = audioContext.createGain();

    //Set their values
    oscillators[i].frequency.value = 100 * (i + 1 * Math.random()*0.4);
    amplifiers[i].gain.value = 1.0 / times;

    //Connect them
    oscillators[i].connect(amplifiers[i]);
    amplifiers[i].connect(audioContext.destination);

    //Play them
    oscillators[i].start();

    //Stop them
    oscillators[i].stop(audioContext.currentTime + (5 * Math.random() + 1))

  }

}

function processing() {

  init();

  if(!audioBuffer) {
    let request = new XMLHttpRequest();
    request.open('get', 'http://bjarnig.s3.eu-central-1.amazonaws.com/sounds/snd.mp3', true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      audioContext.decodeAudioData(request.response, function(buffer) {
        audioBuffer = buffer;
        console.log('Sample is loaded')
      })
    };

    request.send();

  } else {

    let sample = audioContext.createBufferSource();
    sample.buffer = audioBuffer;
    sample.playbackRate.value = 10 * (Math.random() + 0.0001);

    let delay = audioContext.createDelay();
    delay.delayTime.value = Math.random()*0.01;

    let feedback = audioContext.createGain();
    feedback.gain.value = 0.9;

    delay.connect(feedback);
    feedback.connect(delay);

    sample.connect(delay);
    sample.connect(audioContext.destination);
    delay.connect(audioContext.destination);

    sample.start(audioContext.currentTime);

  }
}

document.getElementById('fmbutton').addEventListener("click", fm);
document.getElementById('addbutton').addEventListener("click", additive);
document.getElementById('processbutton').addEventListener("click", processing);
