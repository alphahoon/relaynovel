var express = require('express');
var router = express.Router();
var db = require('../database.js');
 
/* GET home page. */
router.get('/', function (req, res, next) {
    if (!req.session.logined)
        res.redirect('/');
    else{    
        res.render('group', { session: req.session });
    }
});

module.exports = router;
