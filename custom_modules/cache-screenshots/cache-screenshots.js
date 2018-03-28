'use strict';

var http = require('http');
var fs = require('fs');

const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');

var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb); // close() is async, call cb after close completes.
            console.log('true');
            imagemin([__dirname + '/../../public/_cached/_images/_viewer_screenshots/*.{jpg,png}'], __dirname + '/../../public/_cached/_images/_viewer_screenshots/', {
                plugins: [
                    imageminPngquant({ quality: '65-80' })
                ]
            }).then(files => {
                console.log(files);
                //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …] 
            });
            return true;
        });
    }).on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
        return false;
    });
};

module.exports = function(viewer) {
    return download('http://placehold.it/1920x1080/?text=' + viewer.name, __dirname + '/../../public/_cached/_images/_viewer_screenshots/' + viewer.name + '.png');
    // return download(viewer.live_screenshot_url, __dirname +'/../../public/_cached/_images/_viewer_screenshots/' + viewer.name + '.png');
    // return true;
};