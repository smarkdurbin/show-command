'use strict';

var fs = require('fs'),
    request = require('request');

var http = require('http');
var fs = require('fs');

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
      console.log('true');
      return true;
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
    return false;
  });
};

module.exports = function(viewer) {
    // return download('http://placehold.it/1920x1080/?text='+viewer.name, __dirname +'/../../public/_cached/_images/_viewer_screenshots/' + viewer.name + '.png');
    return download(viewer.live_screenshot_url, __dirname +'/../../public/_cached/_images/_viewer_screenshots/' + viewer.name + '.png');
    // return true;
};