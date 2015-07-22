var FFT = require('fft');
var windowing = require('fft-windowing');
var Q = require('q');


var ifft;

var lastFrame, currentFrame, frameSize, frameStartInterval;

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
    
    currentFrame = Array(frameSize); // feather in with zeroes
}
function buildWithSpectrum(spectrum) {
//    if (spectrum.length != frameSize * 2) return;

    lastFrame = currentFrame;
    currentFrame = new Float32Array(2 * frameSize);
 
    ifft.simple(currentFrame, spectrum);
/*
    console.log('process frame...');
    for (var i=0; i<10; i++)
    console.log(currentFrame[i]);
*/    
    var scale = 1/1024;
    for (var i=0; i<frameStartInterval; ++i) {
        accumulator.push(scale * (lastFrame[frameStartInterval+i] + currentFrame[i]));
    }
}
function finishBuilding() {
    // finish current frame output
    for (var i=0; i<frameStartInterval; ++i) {
        accumulator.push(currentFrame[frameStartInterval+i]);
    }
    return accumulator;
}

module.exports = {
    generateAudioFromSpectrumStream: generateAudioFromSpectrumStream,
    startBuilding: startBuilding,
    buildWithSpectrum: buildWithSpectrum,
    finishBuilding: finishBuilding
};
