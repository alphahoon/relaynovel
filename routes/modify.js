var express = require('express');
var router = express.Router();
var db = require('../database.js');
var renodb = require('../renodb.js');

/* GET Joinable page */
router.get('/', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  else {
    if (req.query && req.query.error)
      showpage(req, res, req.query.error);
    else
      showpage(req, res, null);
  }
});

function showpage(req, res, pageerror) {
  var nodeid;
  if (req.query.NodeID)
    nodeid = req.query.NodeID;
  else
    nodeid = 'null';
  renodb.isUserinGroup(req.session.user_id, req.query.groupname, function (isjoin, iswriter) {
    db.connection.query('select Node.*, User.Nickname, User.Profilepic from Node left join User on User.userid = Node.writer where Node.NodeID="'
    +nodeid+'"', function (err, nodeinfo) {
      if (nodeinfo && nodeinfo[0]) {
        db.connection.query(
          'select * from RenoGroup where Groupname = ' + db.mysql.escape(req.query.groupname),
          function (err, rows) {
            console.log(nodeinfo[0]); 
            if (rows && rows[0]) {
              if (pageerror)
                res.render('modify', {
                  session: req.session,
                  groupdata: rows[0],
                  message: pageerror,
                  nodeid: nodeid,
                  nodeinfo : nodeinfo[0]
                });
              else
                res.render('modify', {
                  session: req.session,
                  groupdata: rows[0],
                  nodeid: nodeid,
                  nodeinfo : nodeinfo[0]
                });
            }
            else {
              res.redirect('/');
            }
          });
      }
      else {
        console.log(err);
        res.redirect('/');
      }
    });
  });
}

/* Ajax */
router.post('/', function (req, res, next) {
    if (!req.session.logined)
        res.redirect('/');
    else {
        var content = req.body.writearea;
        var groupname = req.body.groupname;
        var nodeid = req.body.nodeid;
        var modifier = req.session.user_id;
        renodb.submitModification(content, nodeid, req.session.user_id, groupname,
        function (err) {
          res.redirect(encodeURI('/group?groupname=' + groupname));
        }, function () {
          res.redirect(encodeURI('/group?groupname=' + groupname));
        });
    }
});


module.exports = router;
