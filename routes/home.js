var express = require('express');
var router = express.Router();
var db = require('../database.js');
 
/* GET home page. */
router.get('/', function (req, res, next) {
    if (!req.session.logined)
        res.redirect('/');
<<<<<<< HEAD
    console.log(req.session.user_id);
    db.get_recentupdate(function (callback) {
        console.log(callback);
    });
=======
    // console.log(req.session.user_id);
>>>>>>> 192f294e24fa3aad0e7703cc3ec7315818e8dd22
    res.render('home', { session: req.session });
});

module.exports = router;
