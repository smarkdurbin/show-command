var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fs = require('fs');

var ViewerSchema = new Schema({
    name: { type: String, required: true, max: 100 },
    display_name: { type: String, required: true, max: 100 },
    published: { type: Boolean, required: true },
    date_created: { type: Date },
    date_last_edited: { type: Date },
    screenshot_last_updated: { type: Date },
    screen_orientation: { type: String, enum: ['Portrait', 'Landscape'] },
    type: { type: String, enum: ['Room Sign', 'Custom Sign', 'Agenda Wall Sign'] },
    notes: { type: String, max: 500 }
});

// Virtual for viewer's URL
ViewerSchema
    .virtual('url')
    .get(function() {
        return '/admin/viewers/~/' + this._id;
    });
    
// Virtual for viewer's cached screenshot
ViewerSchema
    .virtual('cached_screenshot_url')
    .get(function() {
        return '/_cached/_images/_viewer_screenshots/' + this.name + '.jpg';
    });
    
// Virtual for viewer's live screenshot
ViewerSchema
    .virtual('live_screenshot_url')
    .get(function() {
        return 'http://192.168.0.12:8080/SampleService/api/screenshot/' + this.name;
    });

//Export model
module.exports = mongoose.model('Viewer', ViewerSchema);