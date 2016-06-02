var express = require('express');
var router = express.Router();
var db = require('../database.js');

/* GET Joinable page */
router.get('/', function (req, res, next) {
    // if (!req.session.logined)
    //     res.redirect('/');

    res.render('joinable', {
        session: req.session
    });
});

/* Ajax */
router.post('/', function (req, res, next) {
    var query = db.connection.query(
        'select * from RenoGroup Limit '+ req.body.start + ', '+ req.body.num,
        function (err, rows) {
            console.log(rows);
            if (rows) {
                res.send(rows);
            }
        });

});
module.exports = router;
