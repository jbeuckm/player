var FFT = require('fft');
var windowing = require('fft-windowing');
var Q = require('q');


var ifft;
var lastFrame, currentFrame, frameSize, frameStartInterval;
var scale;
var accumulator;

/*
 * Stitch together audio signal by performing IFFT on spectrumStream and adding overlapped outputs.
 */
function generateAudioFromSpectrumStream(spectrumStream, _frameSize, _frameStartInterval) {

    var def = Q.defer();

    startBuilding(_frameSize, _frameStartInterval);                  
                  
    spectrumStream.on('readable', function(){
        
        var spectrum;
        while (spectrum = spectrumStream.read(frameSize)) {
            
            buildWithSpectrum(spectrum);
            
        }

    });

    spectrumStream.on('end', function(){
        
        finishBuilding();
        
        def.resolve(accumulator);
    });

    return def.promise;
}



function startBuilding(_frameSize, _frameStartInterval) {
    frameSize = _frameSize;
    frameStartInterval = _frameStartInterval;

    ifft = new FFT.complex(frameSize, true);
    accumulator = [];
    
    // feather in with zeroes
    currentFrame = [];
    for (var i=0; i<2*frameSize; i++){
        currentFrame[i] = 0;
    }

    scale = 1/frameSize;
}


function buildWithSpectrum(spectrum) {
    if (spectrum.length != frameSize * 2) return;

    lastFrame = currentFrame;
    currentFrame = new Float32Array(2 * frameSize);

    windowing.hann(currentFrame);

    ifft.simple(currentFrame, spectrum);

    for (var i=0; i<frameStartInterval; ++i) {
        accumulator.push(scale * (lastFrame[frameStartInterval+2*i] + currentFrame[2*i]));
    }
}

function finishBuilding() {
    // finish current frame output
    for (var i=0; i<frameStartInterval; ++i) {
        accumulator.push(currentFrame[frameStartInterval+2*i]);
    }
    return accumulator;
}

module.exports = {
    generateAudioFromSpectrumStream: generateAudioFromSpectrumStream,
    startBuilding: startBuilding,
    buildWithSpectrum: buildWithSpectrum,
    finishBuilding: finishBuilding
};
