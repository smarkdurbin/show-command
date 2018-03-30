// require async
var async = require('async');

// set variables for server paths
const screenshotsAPIPath = 'http://192.168.0.12:8080/SampleService/api/screenshot/';
const screenshotsCachePath = 'public/_cached/_images/_viewer_screenshots/';

const download = require('image-downloader')

const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');

function cacheOne(viewerObj, callback) {
    // console.log(viewerObj);
    // Download to a directory and save with an another filename
    // Download to a directory and save with an another filename
    const options = {
        //   url: 'http://placehold.it/1920x1080/?text=' + viewerObj.name,
        url: screenshotsAPIPath + viewerObj.name,
        dest: screenshotsCachePath + viewerObj.name + '.png'
    }
    download.image(options)
        .then(({ filename, image }) => {
            imagemin([filename], screenshotsCachePath, {
                plugins: [
                    imageminPngquant({ quality: '65-80' })
                ]
            }).then(files => {
                console.log(files);
            });
            console.log('File saved to', filename);
        }).catch((err) => {
            throw err
        });
    if(typeof callback == 'function'){
        callback(viewerObj);
    };
};

function cacheAll(viewersObj, callback) {
    // console.log(viewersObj);
    viewersObj.forEach(function(viewer) {
        cacheOne(viewer, callback);
    });
};

// export the module
module.exports = {
    cacheOne: cacheOne,
    cacheAll: cacheAll
};
