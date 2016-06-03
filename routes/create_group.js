var express = require('express');
var router = express.Router();
var db = require('../database.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    if (!req.session.logined)
        res.redirect('/');
    db.get_layout_links(function (callback) {
        res.render('create_group', { session: req.session, links : callback });
    });
});

module.exports = router;
