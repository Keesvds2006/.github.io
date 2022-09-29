let audioContext;

let isPlaying = false;

let oscillators, amplifiers;
let harmonicsCount = 50;

//parameters
let frequency;
let ratio;
let damp;
let envdamp;
let release;
let numParts;
let partFreq;
let step;
let wait;

//slider displays
let freqDisplay =  document.getElementById('freq-display');
let ratioDisplay =  document.getElementById('ratio-display');
let partsDisplay =  document.getElementById('parts-display');
let dampDisplay =  document.getElementById('damp-display');
let tempoDisplay =  document.getElementById('tempo-display');
let releaseDisplay =  document.getElementById('release-display');
let envdampDisplay =  document.getElementById('envdamp-display');

//sliders
let freqSlider = document.getElementById('freq-slider');
freqSlider.addEventListener('input', update);
let ratioSlider = document.getElementById('ratio-slider');
ratioSlider.addEventListener('input', update);
let partsSlider = document.getElementById('parts-slider');
partsSlider.addEventListener('input', update);
let dampSlider = document.getElementById('damp-slider');
dampSlider.addEventListener('input', update);
let tempoSlider = document.getElementById('tempo-slider');
tempoSlider.addEventListener('input', update);
let releaseSlider = document.getElementById('release-slider');
releaseSlider.addEventListener('input', update);
let envdampSlider = document.getElementById('envdamp-slider');
envdampSlider.addEventListener('input', update);

//random integer
function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

//init audiocontext
function init() {
  if(!audioContext) {
    console.log(' Init! ');
    audioContext = new AudioContext();
  }
}

//plays one note
function play() {

  init();
  if (!oscillators) {
    let frequency = parseFloat(freqSlider.value);
    let ratio = parseFloat(ratioSlider.value);
    let damp = parseFloat(dampSlider.value);
    let envdamp = parseFloat(envdampSlider.value);
    let release = parseFloat(releaseSlider.value);
    let numParts = parseFloat(partsSlider.value);

    oscillators = [];
    amplifiers = [];

    //Just intonated
    step = [1,2,4,3/2,3/1,5/4,5/2,7/2,9/4,11/4][randInt(0,10)];

    //linear to exponential
    frequency = Math.pow(frequency,2)*(500-20)+20
    release = Math.pow(release,2)*(5-0.1)+0.1;

    for (var i = 0; i < harmonicsCount; i++) {
      //Calculate partial frequency
      partFreq = frequency * Math.pow(ratio,Math.log2(step)) * Math.pow(ratio,Math.log2(i + 1));

      //Create unit generators
      oscillators[i] = audioContext.createOscillator();
      amplifiers[i] = audioContext.createGain();

      //Set their values
      oscillators[i].frequency.value = partFreq;
      //start gain at 0
      amplifiers[i].gain.value = 0;

      //mute partials above 2 kHz to avoic aliasing
      //and mute partials higher than the number of partials set with the slider
      if ((partFreq < 20000)&&((i+1)<=numParts)) {
        //short attack to remove clicks
        amplifiers[i].gain.linearRampToValueAtTime(Math.pow(0.5,damp*i)*Math.pow(0.999,harmonicsCount)*0.06,
        audioContext.currentTime + 0.01);
      };

      //Connect them
      oscillators[i].connect(amplifiers[i]);
      amplifiers[i].connect(audioContext.destination);

      //Play them
      oscillators[i].start();

      //Stop them
      amplifiers[i].gain.linearRampToValueAtTime(0, audioContext.currentTime +  0.01 + Math.pow((1-envdamp/2),i)*release);
      oscillators[i].stop(audioContext.currentTime + release);
    }
  }
}

//same as wait in supercollider
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//start sequence
async function start() {
  isPlaying = true;
  while (isPlaying == true) {
    oscillators = undefined;
    amplifiers = undefined;
    play();
    await sleep(wait);
  }
}

//stop sequence
function stop() {
  isPlaying = false;
}

//update parameters
function update() {
  for (let i = 0; i < harmonicsCount; i++) {
    frequency = parseFloat(freqSlider.value);
    frequency = Math.pow(frequency,2)*(500-20)+20;
    freqDisplay.textContent = Math.round(frequency) + 'hz';

    ratio = parseFloat(ratioSlider.value);
    ratioDisplay.textContent = Math.round((ratio-1)*100)/100;

    damp = parseFloat(dampSlider.value);
    dampDisplay.textContent = damp;

    wait = parseFloat(tempoSlider.value);
    tempoDisplay.textContent = wait;
    wait = 60000 / wait;

    release = parseFloat(releaseSlider.value);
    release = Math.pow(release,2)*(5-0.1)+0.1;
    releaseDisplay.textContent = Math.round((release)*100)/100;

    envdamp = parseFloat(envdampSlider.value);
    envdampDisplay.textContent = envdamp;

    numParts = parseFloat(partsSlider.value);
    partsDisplay.textContent = numParts;

    partFreq = frequency * Math.pow(ratio,Math.log2(step)) * Math.pow(ratio,Math.log2(i + 1));

    if (oscillators) {
      //update frequency
      oscillators[i].frequency.value = partFreq;
    }
  }
}

//initialize sliders
update();

document.getElementById('start').addEventListener("click", start);
document.getElementById('stop').addEventListener("click", stop);
