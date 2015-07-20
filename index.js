var FFT = require('fft');
var windowing = require('fft-windowing');
var synaptic = require('synaptic');
var outputter = require('./lib/outputter.js');
var loader = require('./lib/audio_loader.js');

var FFT_SIZE = 1024;



loader.loadMp3ToFloatArray("hold_you_tight.mp3").then(
    function (data) {
        var energies = fftFloatArray(data);      

        console.log("loaded " + data.length);
        console.log(data[0] + " -->> " + data[data.length - 1]);

        var audioData = {
            sampleRate: 44100,
            channelData: [
                data,
                data,
              ]
        };
        outputter.output(audioData, "test.wav");

    }
);




var fft = new FFT.complex(FFT_SIZE, false);

function fftFloatArray(inBuffer) {

    windowing.hann(inBuffer);

    var outBuffer = new Float32Array(2 * FFT_SIZE);

    fft.simple(outBuffer, inBuffer, 'real');

    return outBuffer;
}