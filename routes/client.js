var express = require('express');
var router = express.Router();

var client_controller = require('../controllers/clientController')

// GET admin home page.
router.get('/', needsAccessLevel('Client'), client_controller.index);

// GET request for one Viewer.
router.get('/viewers/~/:id', needsAccessLevel('Client'), client_controller.client_viewer_detail);

// GET request for list of all Viewer items.
router.get('/viewers/', needsAccessLevel('Client'), client_controller.client_viewer_list);

module.exports = router;

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