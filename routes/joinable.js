var express = require('express');
var router = express.Router();
var db = require('../database.js');

/* GET Joinable page */
router.get('/', function (req, res, next) {
    if (!req.session.logined)
        res.redirect('/');
    db.get_layout_links(function (callback) {
        res.render('joinable', { session: req.session, links : callback });
    });
});

/* Ajax */
router.post('/', function (req, res, next) {
    var query = db.connection.query(
        'SELECT * from RenoGroup where Groupname not in (SELECT Groupname from JoinGroup where userid= '
        +db.mysql.escape(req.session.user_id) +') Limit '+ req.body.start + ', '+ req.body.num,
        function (err, rows) {
            //console.log(rows);
            if (rows) {
                res.send(rows);
            }
        });
});
module.exports = router;
