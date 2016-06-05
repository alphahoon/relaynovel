var express = require('express');
var router = express.Router();
var db = require('../database.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    if (!req.session.logined)
        res.redirect('/');
    res.render('dashboard', { session: req.session });
});

router.post('/moregroup', function (req, res, next) {
    db.connection.query(
        'SELECT * from RenoGroup where Groupname in (SELECT Groupname from JoinGroup where userid= '
        + db.mysql.escape(req.session.user_id) + ') Limit ' + req.body.start + ', ' + req.body.num,
        function (err, rows) {
            //console.log(rows);
            if (rows) {
                res.send(rows);
            }
        });
})

module.exports = router;
