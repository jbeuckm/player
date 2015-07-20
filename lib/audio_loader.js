var fs = require('fs');
var lame = require('lame');


module.exports = {

    mp3ToPcmStream: function (filename) {

        var input = fs.createReadStream(filename);

        var decoder = new lame.Decoder();

        function onFormat(format) {
            console.error('MP3 format: %j', format);
        }

        decoder.on('format', onFormat);

        input.pipe(decoder);

        return decoder;
    },


    getLeftChannelFloatArray: function (bytes) {
        console.log("read " + bytes.length + " bytes using " + bytes.length / 4);
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

};