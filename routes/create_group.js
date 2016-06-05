var express = require('express');
var router = express.Router();
var db = require('../database.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    if (!req.session.logined)
        res.redirect('/');
    res.render('create_group', { session: req.session });
});

router.post('/', function(req, res, next) {
})

module.exports = router;
