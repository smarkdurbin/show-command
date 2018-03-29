var Viewer = require('../models/viewer');

// Display Client Home Page
exports.index = function(req, res, next) {   
    res.render('client', { title: 'Client Dashboard', cur_user: req.user });
};

// Display list of all Viewers.
exports.client_viewer_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Viewer List');
};

// Display detail page for a specific Viewer.
exports.client_viewer_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Viewer Details: ' + req.params.id);
};