var FFT = require('fft');
var windowing = require('fft-windowing');
var synaptic = require('synaptic');
var outputter = require('./lib/outputter.js');
var audio_loader = require('./lib/audio_loader.js');

var FFT_SIZE = 1024;


var stream = audio_loader.mp3ToPcmStream('hold_you_tight.mp3');

stream.on('readable', function () {

    var bytes
    while (bytes = stream.read(4 * FFT_SIZE)) {
        if (bytes.length == 4 * FFT_SIZE) {
            var mono = audio_loader.getLeftChannelFloatArray(bytes);

            var energies = fftFloatArray(mono);
        }
    }
});



var fft = new FFT.complex(FFT_SIZE, false);
    
function fftFloatArray(inBuffer) {
    
    windowing.hann(inBuffer);
    
    var outBuffer = new Float32Array(2 * FFT_SIZE);

    fft.simple(outBuffer, inBuffer, 'real');

    return outBuffer;
}





var audioData = {
  sampleRate: 44100,
  channelData: [
    new Float32Array(100),
    new Float32Array(100),
  ]
};
outputter.output(audioData, "test.wav");

