var Viewer = require('../models/viewer');
var User = require('../models/account');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// require async
var async = require('async');

// require screenshot cache-er
var cacheScreenshots = require('../custom_modules/cache-screenshots/cache-screenshots.js');

//require passport
var passport = require('passport');

// Display Admin Home Page
exports.index = function(req, res, next) {
    res.render('admin', { title: 'Administration Dashboard', cur_user: req.user });
};

// Display list of all Viewers.
exports.admin_viewer_list = function(req, res, next) {
    Viewer.find({})
        .exec(function(err, list_viewers) {
            if (err) { return next(err); }
            // res.io.emit("socketToMe", list_viewers); 
            //Successful, so render
            res.render('admin-viewers', { title: 'Viewer Record List', viewer_list: list_viewers, cur_user: req.user });
        });
};

// Display a list of all viewers and options to cache their screenshots.
exports.admin_viewer_cache_get = function(req, res, next) {
    Viewer.find({})
        .exec(function(err, list_viewers) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('admin-cache-viewers', { title: 'Viewer Cache Logs', viewer_list: list_viewers, cur_user: req.user });
        });
};

// Handle Viewer create on POST.
exports.admin_viewer_cache_post = [
    // Process request
    (req, res, next) => {
        async.waterfall([
            function(callback) {
                Viewer.find({})
                .exec(function(err, results) {
                    if (err) {
                        var err = new Error('Viewer Record not found');
                        err.status = 404;
                        return next(err);
                    }
                    callback(null,results);
                });
            },
            function(results, callback) {
                cacheScreenshots.cacheAll(results, function(viewer){
                    Viewer.update({_id: viewer._id}, {
                        screenshot_last_updated: new Date(Date.now())
                    }).exec(function(err){
                        if(err) {
                            console.log(err);
                        }
                    });
                });
                callback(null,results);
            }
        ], function(err, results) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('admin-cache-viewers', { title: 'Viewer Cache Logs', viewer_list: results, cur_user: req.user });
        });
    }
];

// Display detail page for a specific Viewer.
exports.admin_viewer_detail = function(req, res, next) {
    async.waterfall([
        function(callback) {
            var results = new Array();
            Viewer.findById(req.params.id).exec(function(err, doc){
                if (err) { return next(err); }
                // don't remove the callback
                results.viewer = doc;
                callback(null, results);
            });
        },
        function(results, callback) {
            cacheScreenshots.cacheOne(results.viewer, function(viewer){
                Viewer.update({_id: viewer._id}, {
                    screenshot_last_updated: new Date(Date.now())
                }).exec(function(err){
                    if(err) {
                        console.log(err);
                    }
                    results.viewer.screenshot_last_updated = new Date(Date.now());
                });
                callback(null,results);
            });
        }
    ], function(err, results) {
        if (err) { return next(err); }
        if (results.viewer == null) { // No results.
            var err = new Error('Viewer Record not found');
            err.status = 404;
            return next(err);
        }
        // results.viewer.screenshot_last_updated = new Date(Date.now());
        // Successful, so render.
        res.render('admin-viewer', { title: 'Viewer Record: ' + results.viewer.display_name, viewer: results.viewer, cur_user: req.user });
    });

};

// Display Author create form on GET.
exports.admin_viewer_create_get = function(req, res, next) {
    res.render('admin-viewer-form', { title: 'Create Viewer Record', cur_user: req.user });
};

// Handle Viewer create on POST.
exports.admin_viewer_create_post = [

    // Validate fields.
    body('name').isLength({ min: 1 }).trim().withMessage('Viewer Name must be specified.')
    .matches(/^([0-9A-z\_]+)$/, 'g').withMessage('<strong>Viewer Name</strong> contains invalid characters<br>&nbsp; &#x21B3; upper/lower case letters, numbers, and underscores only'),
    body('display_name').isLength({ min: 1 }).trim().withMessage('Display Name must be specified.')
    .matches(/^([0-9A-z\ \_\(\)]+)$/, 'g').withMessage('<strong>Display Name</strong> contains invalid characters<br>&nbsp; &#x21B3; upper/lower case letters, spaces, and numbers only'),

    // Sanitize fields.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('display_name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('admin-viewer-form', { title: 'Create Viewer Record', viewer: req.body, errors: errors.array(), cur_user: req.user });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Viewer object with escaped and trimmed data.
            var viewer = new Viewer({
                name: req.body.name,
                display_name: req.body.display_name,
                published: req.body.published,
                date_created: new Date(Date.now()),
                date_last_edited: new Date(Date.now()),
                screenshot_last_updated: new Date(Date.now()),
                screen_orientation: req.body.screen_orientation,
                type: req.body.type,
                notes: req.body.notes
            });
            viewer.save(function(err) {
                if (err) { return next(err); }
                // Success -- now cache that screenshot
                cacheScreenshots.cacheOne(viewer, null);
                // Successful - redirect to new viewer record.
                res.redirect(viewer.url);
            });
        }
    }
];

// Display Viewer delete form on GET.
exports.admin_viewer_delete_get = function(req, res, next) {
    async.parallel({
        viewer: function(callback) {
            Viewer.findById(req.params.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.viewer==null) { // No results.
            res.redirect('/admin/viewers/');
        }
        // Successful, so render.
        res.render('admin-viewer-delete', { title: 'Delete Viewer', viewer: results.viewer, cur_user: req.user } );
    });
};

// Handle Viewer delete on POST.
exports.admin_viewer_delete_post = function(req, res, next) {
    async.parallel({
        viewer: function(callback) {
          Viewer.findById(req.body.viewerid).exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Author has no books. Delete object and redirect to the list of viewers.
        Viewer.findByIdAndRemove(req.body.viewerid, function deleteViewer(err) {
            if (err) { return next(err); }
            // Success - go to viewer list
            res.redirect('/admin/viewers/')
        })
    });
};

// Display Viewer update form on GET.
exports.admin_viewer_update_get = function(req, res, next) {

    // Get viewer, authors and genres for form.
    async.parallel({
        viewer: function(callback) {
            Viewer.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.viewer == null) { // No results.
            var err = new Error('Viewer Record not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('admin-viewer-form', { title: 'Update Viewer Record: ' + results.viewer.display_name, viewer: results.viewer, cur_user: req.user });
    });

};

// Handle Viewer update on POST.
exports.admin_viewer_update_post = [

    // Validate fields.
    body('name').isLength({ min: 1 }).trim().withMessage('Viewer Name must be specified.')
    .matches(/^([0-9A-z\_]+)$/, 'g').withMessage('<strong>Viewer Name</strong> contains invalid characters<br>&nbsp; &#x21B3; upper/lower case letters, numbers, and underscores only'),
    body('display_name').isLength({ min: 1 }).trim().withMessage('Display Name must be specified.')
    .matches(/^([0-9A-z\ \_\(\)]+)$/, 'g').withMessage('<strong>Display Name</strong> contains invalid characters<br>&nbsp; &#x21B3; upper/lower case letters, spaces, and numbers only'),

    // Sanitize fields.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('display_name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
    

        // Create a Viewer object with escaped/trimmed data and old id.
        var viewer = new Viewer({
            name: req.body.name,
            display_name: req.body.display_name,
            published: req.body.published,
            date_created: req.body.date_created,
            date_last_edited: new Date(Date.now()),
            screenshot_last_updated: req.body.screenshot_last_updated,
            screen_orientation: req.body.screen_orientation,
            type: req.body.type,
            notes: req.body.notes,
            _id: req.params.id //This is required, or a new ID will be assigned!
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('admin-viewer-form', { title: 'Update Viewer Record', viewer: viewer, errors: errors.array(), cur_user: req.user });
        }
        else {
            // Data from form is valid. Update the record.
            Viewer.findByIdAndUpdate(req.params.id, viewer, {}, function(err, theviewer) {
                if (err) { return next(err); }
                cacheScreenshots.cacheOne(viewer, null);
                // Successful - redirect to viewer detail page.
                res.redirect(theviewer.url);
            });
        }
    }
];

// ========================================================================== //

// Display list of all Users.
exports.admin_user_list = function(req, res, next) {
    User.find({})
        .exec(function(err, list_users) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('admin-users', { title: 'User Record List', user_list: list_users, cur_user: req.user });
        });
};

// Display detail page for a specific User.
exports.admin_user_detail = function(req, res, next) {
    async.waterfall([
        function(callback) {
            var results = new Array();
            User.findById(req.params.id).exec(function(err, doc){
                if (err) { return next(err); }
                // don't remove the callback
                results.user = doc;
                callback(null, results);
            });
        },
        function(results, callback) {
            cacheScreenshots.cacheOne(results.user, function(user){
                User.update({_id: user._id}, {
                    screenshot_last_updated: new Date(Date.now())
                }).exec(function(err){
                    if(err) {
                        console.log(err);
                    }
                    results.user.screenshot_last_updated = new Date(Date.now());
                });
                callback(null,results);
            });
        }
    ], function(err, results) {
        if (err) { return next(err); }
        if (results.user == null) { // No results.
            var err = new Error('User Record not found');
            err.status = 404;
            return next(err);
        }
        // results.user.screenshot_last_updated = new Date(Date.now());
        // Successful, so render.
        res.render('admin-user', { title: 'User Record: ' + results.user.username, user: results.user, cur_user: req.user });
    });

};

// Display Author create form on GET.
exports.admin_user_create_get = function(req, res, next) {
    res.render('admin-user-form', { title: 'Create User Record', cur_user: req.user });
};

// Handle User create on POST.
exports.admin_user_create_post = [

    body('username').isLength({ min: 1 }).trim().withMessage('User Name must be specified.')
    .matches(/^([A-z\ \\]+)$/, 'g').withMessage('<strong>Display Name</strong> contains invalid characters<br>&nbsp; &#x21B3; upper/lower case letters and spaces only.'),
    body('password').isLength({ min: 8 }).trim().withMessage('Password must be a minimum of 8 characters long'),

    // Sanitize fields.
    sanitizeBody('username').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('admin-user-form', { title: 'Create User Record', user: req.body, errors: errors.array(), cur_user: req.user });
            return;
        }
        else {
            // Data from form is valid.
            
            User.register(new User({ username : req.body.username, access_level: req.body.access_level, date_created: new Date(Date.now()), date_last_edited: new Date(Date.now()), isActive: req.body.isActive }), req.body.password, function(err, account) {
                if (err) {
                  return res.render('admin-user-form', { title: "Register", error : err.message });
                }
        
                passport.authenticate('local')(req, res, function () {
                    req.session.save(function (err) {
                        if (err) {
                            return next(err);
                        }
                        res.redirect('/admin/users/');
                    });
                });
            });
            
        }
    }
];

// Display User delete form on GET.
exports.admin_user_delete_get = function(req, res, next) {
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.user==null) { // No results.
            res.redirect('/admin/users/');
        }
        // Successful, so render.
        res.render('admin-user-delete', { title: 'Delete User', user: results.user, cur_user: req.user } );
    });
};

// Handle User delete on POST.
exports.admin_user_delete_post = function(req, res, next) {
    async.parallel({
        user: function(callback) {
          User.findById(req.body.userid).exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Author has no books. Delete object and redirect to the list of users.
        User.findByIdAndRemove(req.body.userid, function deleteUser(err) {
            if (err) { return next(err); }
            // Success - go to user list
            res.redirect('/admin/users/')
        })
    });
};

// Display User update form on GET.
exports.admin_user_update_get = function(req, res, next) {

    // Get user, authors and genres for form.
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.user == null) { // No results.
            var err = new Error('User Record not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('admin-user-form', { title: 'Update User Record: ' + results.user.username, user: results.user, cur_user: req.user });
    });

};

// Handle User update on POST.
exports.admin_user_update_post = [

    // Validate fields.
    body('username').isLength({ min: 1 }).trim().withMessage('User Name must be specified.')
    .matches(/^([A-z\ \\]+)$/, 'g').withMessage('<strong>Display Name</strong> contains invalid characters<br>&nbsp; &#x21B3; upper/lower case letters and spaces only.'),

    // Sanitize fields.
    sanitizeBody('username').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a User object with escaped/trimmed data and old id.
        var user = new User({
            name: req.body.name,
            display_name: req.body.display_name,
            isActive: req.body.isActive,
            date_created: req.body.date_created,
            date_last_edited: new Date(Date.now()),
            access_level: req.body.access_level,
            _id: req.params.id //This is required, or a new ID will be assigned!
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('admin-user-form', { title: 'Update User Record', user: user, errors: errors.array(), cur_user: req.user });
        }
        else {
            // Data from form is valid. Update the record.
            User.findByIdAndUpdate(req.params.id, user, {}, function(err, theuser) {
                if (err) { return next(err); }
                
                if(req.body.password != "") {
                    theuser.setPassword(req.body.password, function(){
                        theuser.save();
                        console.log('done');
                    });
                } else {
                    // proceed without using passport to change the password
                }
                
                
                // Successful - redirect to user detail page.
                res.redirect(theuser.url);
            });
        }
    }
];
