var fs = require("fs");
var WavEncoder = require("wav-encoder");


module.exports = {

    output: function(audioData, filename) { 
      
        WavEncoder.encode(audioData).then(function(buffer) {
          // buffer is an instanceof Buffer 
          fs.writeFileSync(filename, buffer);
        });
      
    }
};
      
