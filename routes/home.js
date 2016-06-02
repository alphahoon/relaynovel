var express = require('express');
var router = express.Router();
var db = require('../database.js');
 
/* GET home page. */
router.get('/', function (req, res, next) {
    if (!req.session.logined)
        res.redirect('/');
    console.log(req.session.user_id);
    db.get_recentupdate(function (callback) {
        console.log(callback);
    });
    res.render('home', { session: req.session });
});

module.exports = router;
