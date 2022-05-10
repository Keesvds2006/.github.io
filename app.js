let audioContext;

function play(frequency, time) {

  const osc = audioContext.createOscillator();
  const volume = audioContext.createGain();

  osc.type = 'square';
  osc.frequency.value = frequency;

  osc.connect(volume);
  volume.connect(audioContext.destination);

  volume.gain.setValueAtTime(0, time);
  volume.gain.linearRampToValueAtTime(1, time + 1);
  volume.gain.linearRampToValueAtTime(0, time + 2);

  osc.start();
}

function sequence () {

  console.log('sequence');

  audioContext = new AudioContext();

  [100,200,80,60,150].forEach((item, index) => {
    play(item, audioContext.currentTime + (index * 2));
  });

}

function saw(frequencies, duration) {

  const osc = audioContext.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueCurveAtTime(frequencies, audioContext.currentTime, duration);

  osc.connect(audioContext.destination);
  osc.start();

}

function curve() {
  audioContext = new AudioContext();
  let list = [100,200,300].map(function(item) { return item * Math.random() });
  saw(list, 5 * Math.random());
}

document.getElementById('buttonSequence').addEventListener("click", sequence);

document.getElementById('buttonCurve').addEventListener("click", curve);
