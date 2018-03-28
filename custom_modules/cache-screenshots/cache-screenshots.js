// require async
var async = require('async');

// set variables for server paths
const screenshotsAPIPath = 'http://192.168.0.12:8080/SampleService/api/screenshot/';
const screenshotsCachePath = 'public/_cached/_images/_viewer_screenshots/';

const download = require('image-downloader')

const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');

 
// Download to a directory and save with an another filename
// const options = {
//   url: 'http://placehold.it/500x500/?text=500PX TEST IMAGE',
//   dest: __dirname + '/../../public/_cache/_images/_viewer_screenshots/'        // Save to /path/to/dest/photo.jpg
// }
 
// download.image(options)
//   .then(({ filename, image }) => {
//     console.log('File saved to', filename)
//   }).catch((err) => {
//     throw err
//   })

function cacheOne(viewerObj) {
    // console.log(viewerObj);
    return viewerObj;
};

function cacheAll(viewersObj) {
    // console.log(viewersObj);
    viewersObj.forEach(function(viewer) {
        // Download to a directory and save with an another filename
        const options = {
        //   url: 'http://placehold.it/1920x1080/?text=' + viewer.name,
          url: screenshotsAPIPath + viewer.name,
          dest: screenshotsCachePath + viewer.name + '.png'
        }
        download.image(options)
          .then(({ filename, image }) => {
            console.log('File saved to', filename)
          }).catch((err) => {
            throw err
          })
        console.log(viewer.name);
        console.log('\n');
    });
    imagemin([screenshotsCachePath], screenshotsCachePath, {
        plugins: [
            imageminPngquant({quality: '65-80'})
        ]
    }).then(files => {
        console.log(files);
        //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …] 
    });
    return viewersObj;
};

// export the module
module.exports = {
    cacheOne: cacheOne,
    cacheAll: cacheAll
};
