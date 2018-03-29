var express = require('express');
var router = express.Router();

var admin_controller = require('../controllers/adminController')

// GET admin home page.
router.get('/', needsAccessLevel('Administrator'), admin_controller.index);

// GET request for creating a Viewer. NOTE This must come before routes that display Viewer (uses id).
router.get('/viewers/~/create', needsAccessLevel('Administrator'), admin_controller.admin_viewer_create_get);

// POST request for creating Viewer.
router.post('/viewers/~/create', needsAccessLevel('Administrator'), admin_controller.admin_viewer_create_post);

// GET request for caching viewer screenshots
router.get('/viewers/cache', needsAccessLevel('Administrator'), admin_controller.admin_viewer_cache_get);

// POST request for creating Viewer.
router.post('/viewers/cache', needsAccessLevel('Administrator'), admin_controller.admin_viewer_cache_post);

// GET request to delete Viewer.
router.get('/viewers/~/:id/delete', needsAccessLevel('Administrator'), admin_controller.admin_viewer_delete_get);

// POST request to delete Viewer.
router.post('/viewers/~/:id/delete', needsAccessLevel('Administrator'), admin_controller.admin_viewer_delete_post);

// GET request to update Viewer.
router.get('/viewers/~/:id/update', needsAccessLevel('Administrator'), admin_controller.admin_viewer_update_get);

// POST request to update Viewer.
router.post('/viewers/~/:id/update', needsAccessLevel('Administrator'), admin_controller.admin_viewer_update_post);

// GET request for one Viewer.
router.get('/viewers/~/:id', needsAccessLevel('Administrator'), admin_controller.admin_viewer_detail);

// GET request for list of all Viewer items.
router.get('/viewers/', needsAccessLevel('Administrator'), admin_controller.admin_viewer_list);

// ========================================================================== //

// GET request for creating a User. NOTE This must come before routes that display User (uses id).
router.get('/users/~/create', needsAccessLevel('Administrator'), admin_controller.admin_user_create_get);

// POST request for creating User.
router.post('/users/~/create', needsAccessLevel('Administrator'), admin_controller.admin_user_create_post);

// GET request to delete User.
router.get('/users/~/:id/delete', needsAccessLevel('Administrator'), admin_controller.admin_user_delete_get);

// POST request to delete User.
router.post('/users/~/:id/delete', needsAccessLevel('Administrator'), admin_controller.admin_user_delete_post);

// GET request to update User.
router.get('/users/~/:id/update', needsAccessLevel('Administrator'), admin_controller.admin_user_update_get);

// POST request to update User.
router.post('/users/~/:id/update', needsAccessLevel('Administrator'), admin_controller.admin_user_update_post);

// GET request for one User.
router.get('/users/~/:id', needsAccessLevel('Administrator'), admin_controller.admin_user_detail);

// GET request for list of all User items.
router.get('/users/', needsAccessLevel('Administrator'), admin_controller.admin_user_list);

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
    // return next();
}

function needsAccessLevel(access) {
    return function(req, res, next) {
        if (req.user && req.user.access_level == access) {
            next();
        }
        else {
            if (req.user && req.user.access_level == 'Administrator') {
                next();
            }
            else {
                var err = new Error('Unauthorized Access');
                err.status = 401;
                return next(err);
            }
        }
    };
};
