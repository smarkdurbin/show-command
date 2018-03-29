var express = require('express');
var router = express.Router();

var passport = require('passport');
var Account = require('../models/account');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home', cur_user: req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { title: "Register" });
});

router.post('/register', function(req, res, next) {
    Account.register(new Account({ username : req.body.username, access_level: "Client", date_created: new Date(Date.now()), date_last_edited: new Date(Date.now()), isActive: false }), req.body.password, function(err, account) {
        if (err) {
          return res.render('register', { title: "Register", error : err.message });
        }

        passport.authenticate('local')(req, res, function () {
            req.session.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
});

router.get('/login', isAlreadyLoggedIn, function(req, res) {
    res.render('login', { title: "Login", cur_user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    if(req.user.access_level=="Administrator") {
        res.redirect('/admin');
    } else {
        if(req.user.access_level=="Client") {
            res.redirect('/client');
        } else {
            res.redirect('/');
        } 
    }
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;

function isLoggedIn(req, res, next) {  
  if (req.isAuthenticated())
      return next();
  res.redirect('/');
  // return next();
}

function isAlreadyLoggedIn(req, res, next) {  
    if (req.isAuthenticated())
        res.redirect('/');
    return next();
}

function needsGroup(access) {
  return function(req, res, next) {
    if (req.user && req.user.access_level === access)
      next();
    else
      res.send(401, 'Unauthorized');
  };
};