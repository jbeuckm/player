var FFT = require('fft');
var windowing = require('fft-windowing');
var synaptic = require('synaptic');
var loader = require('./lib/audio_loader.js');
var builder = require('./lib/audio_builder.js');
var outputter = require('./lib/outputter.js');


var FRAME_SIZE = 512;
var FRAME_INTERVAL = 256;


loader.loadMp3ToFloatArray("hold_you_tight.mp3").then(
    function (data) {
        
        processLoadedAudioArray(data);
        
    }
);


function processLoadedAudioArray(data) {

    console.log("loaded " + data.length);
    console.log(data[0] + " -->> " + data[data.length - 1]);
    
    builder.startBuilding(FRAME_SIZE, FRAME_INTERVAL);
    
    var numFrames = Math.floor(data.length / FRAME_INTERVAL);
    console.log("numFrames = "+numFrames);
    
    for (var i=0; i<numFrames; i++) {
        
        var frameData = new Float32Array(FRAME_SIZE);
        var pos = i * FRAME_INTERVAL;
        for (var j=0; j<FRAME_SIZE; j++) {
            frameData[j] = data[pos++];
        }

        var spectrum = fftFloatArray(frameData);
        
        builder.buildWithSpectrum(spectrum);
    }

    var rebuilt = builder.finishBuilding();
    
    for (var i=0; i<1024; i+=4) {
        console.log(rebuilt[i]);
    }
    
    var outArray = new Float32Array(rebuilt);
    
    var audioData = {
        sampleRate: 44100,
        channelData: [
            outArray,
            outArray,
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

