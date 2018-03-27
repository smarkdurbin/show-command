var express = require('express');
var router = express.Router();

var client_controller = require('../controllers/clientController')

// GET admin home page.
router.get('/', client_controller.index);

// GET request for one Viewer.
router.get('/viewers/~/:id', client_controller.client_viewer_detail);

// GET request for list of all Viewer items.
router.get('/viewers/', client_controller.client_viewer_list);

module.exports = router;
