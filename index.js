var FFT = require('fft');
var windowing = require('fft-windowing');
var synaptic = require('synaptic');
var loader = require('./lib/audio_loader.js');
var builder = require('./lib/audio_builder.js');
var outputter = require('./lib/outputter.js');


var FRAME_SIZE = 1024;
var FRAME_INTERVAL = 512;


loader.loadMp3ToFloatArray("hold_you_tight.mp3").then(
    function (data) {
        
        processLoadedAudioArray(data);
        
    }
);


function processLoadedAudioArray(data) {

    console.log("loaded " + data.length);
    console.log(data[0] + " -->> " + data[data.length - 1]);
    
    var numFrames = Math.floor(data.length / FRAME_INTERVAL);
    for (var i=0; i<numFrames; i++) {
        var frameData = data.slice(i*FRAME_INTERVAL, i*FRAME_INTERVAL + FRAME_SIZE);
        var spectrum = fftFloatArray(frameData);
    }

    var audioData = {
        sampleRate: 44100,
        channelData: [
            data,
            data,
          ]
    };

    outputter.output(audioData, "test.wav");
}



var fft = new FFT.complex(FRAME_SIZE, false);

function fftFloatArray(inBuffer) {

    windowing.hann(inBuffer);

    var outBuffer = new Float32Array(2 * FRAME_SIZE);

    fft.simple(outBuffer, inBuffer, 'real');

    return outBuffer;
}

