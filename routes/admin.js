var express = require('express');
var router = express.Router();

var admin_controller = require('../controllers/adminController')

// GET admin home page.
router.get('/', admin_controller.index);

// GET request for creating a Viewer. NOTE This must come before routes that display Viewer (uses id).
router.get('/viewers/~/create', admin_controller.admin_viewer_create_get);

// POST request for creating Viewer.
router.post('/viewers/~/create', admin_controller.admin_viewer_create_post);

// GET request for caching viewer screenshots
router.get('/viewers/cache', admin_controller.admin_viewer_cache_get);

// POST request for creating Viewer.
router.post('/viewers/cache', admin_controller.admin_viewer_cache_post);

// GET request to delete Viewer.
router.get('/viewers/~/:id/delete', admin_controller.admin_viewer_delete_get);

// POST request to delete Viewer.
router.post('/viewers/~/:id/delete', admin_controller.admin_viewer_delete_post);

// GET request to update Viewer.
router.get('/viewers/~/:id/update', admin_controller.admin_viewer_update_get);

// POST request to update Viewer.
router.post('/viewers/~/:id/update', admin_controller.admin_viewer_update_post);

// GET request for one Viewer.
router.get('/viewers/~/:id', admin_controller.admin_viewer_detail);

// GET request for list of all Viewer items.
router.get('/viewers/', admin_controller.admin_viewer_list);

module.exports = router;
