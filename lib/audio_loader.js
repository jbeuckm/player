var fs = require('fs');
var lame = require('lame');
var Q = require('q');

function mp3ToPcmStream(filename) {

    var input = fs.createReadStream(filename);

    var decoder = new lame.Decoder();

    function onFormat(format) {
        console.error('MP3 format: %j', format);
    }

    decoder.on('format', onFormat);

    input.pipe(decoder);

    return decoder;
}

var accumulator;

function loadMp3ToFloatArray(filename) {

    var def = Q.defer();

    accumulator = [];

    var stream = mp3ToPcmStream(filename);

    stream.on('readable', function () {

        var bytes
        while (bytes = stream.read()) {
            var mono = getLeftChannel(bytes);
            accumulator.push.apply(accumulator, mono);
        }
    });
    
    stream.on('end', function(){
        console.log('read '+accumulator.length);            
        var out = new Float32Array(accumulator);

        def.resolve(out);
    });

    return def.promise;
}

function getLeftChannelFloatArray(bytes) {

    var out = new Float32Array(bytes.length / 4);

    var i = 0;
    while (i < bytes.length) {

        var val, msb = bytes[i + 1];

        val = (msb << 8) + bytes[i];

        if (val & 0x8000) {
            val = (0x7fff & val) - 0x8000;
        }

        out[i >> 2] = val / 0x8000;

        i += 4;
    }

    return out;
}

function getLeftChannel(bytes) {

    var out = [];

    var i = 0;
    while (i < bytes.length) {

        var val, msb = bytes[i + 1];

        val = (msb << 8) + bytes[i];

        if (val & 0x8000) {
            val = (0x7fff & val) - 0x8000;
        }

        out[i >> 2] = val / 0x8000;

        i += 4;
    }
console.log("read left channel "+out.length);
    return out;
}

module.exports = {
    mp3ToPcmStream: mp3ToPcmStream,
    loadMp3ToFloatArray: loadMp3ToFloatArray,
    getLeftChannelFloatArray: getLeftChannelFloatArray
};