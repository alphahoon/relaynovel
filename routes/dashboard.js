var express = require('express');
var router = express.Router();
var db = require('../database.js');
var fs = require('fs');

/* GET home page. */

router.post('/moregroup', function (req, res, next) {
    if (!req.session.logined)
    { res.redirect('/'); next('router'); }
    else next();
}, function (req, res, next) {
    db.connection.query(
        'SELECT RenoGroup.* from RenoGroup where Groupname in (SELECT Groupname from JoinGroup where userid= '
        + db.mysql.escape(req.session.user_id) + ') Limit ' + req.body.start + ', ' + req.body.num,
        function (err, rows) {
            req.groupinfo = rows;
            if (err && rows.length == 0) next('router');
            else next();
        });
}, function (req, res, next) {
    var idx = 0;
    req.groupinfo.forEach(function(group) {
        db.connection.query('SELECT * from Vote where Vote.VoteStatus = true and Vote.Group_GroupId = ' 
        + db.mysql.escape(group.Groupname) ,function(err, votes) {
            if(votes.length>0)
                group.votestat = true;
            else
                group.votestat = false;
            idx++;
            if(idx == req.groupinfo.length)
                next();
        });
    }, this);
}, function(req, res, next) {    
    for (var i = 0; i < req.groupinfo.length; i++) {
        req.groupinfo[i].dispvote = req.groupinfo[i].votestat ? 'block' : 'none';
        req.groupinfo[i].dispwrite = req.groupinfo[i].writer == req.session.user_id?'block':'none';
        req.groupinfo[i].dispupdate = 'none';
    }
    res.send(req.groupinfo);
}
)

router.get('/dashboardcard', function (req, res, next) {
    fs.readFile(__dirname + '/../public/fakehtmls/dashboardcard.html', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        res.send(data);
    });
});

router.get('/', function (req, res, next) {
    if (!req.session.logined)
    { res.redirect('/'); next('router'); }
    else next();
}, function (req, res, next) {
    res.render('dashboard', { session: req.session });
});
module.exports = router;
