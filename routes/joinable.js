var express = require('express');
var router = express.Router();
var db = require('../database.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    // if (!req.session.logined)
    //     res.redirect('/');

    var query = db.connection.query(
        'select * from RenoGroup',
        function (err, rows) {
            console.log(rows);
            if (rows) {
                res.render('joinable', {
                    groups: rows,
                    session: req.session
                });
            }
            else {
                console.log("dberror");
                res.redirect('/');
            }
        });

});

module.exports = router;
