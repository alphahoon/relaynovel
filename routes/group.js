var express = require('express');
var router = express.Router();
var db = require('../database.js');
var moment = require('moment');

///////////////////////// Change Role ////////////////////////////////
router.get('/joinreader', function (req, res, next) {
  db.connection.query('insert into JoinGroup set Groupname = '
    + db.mysql.escape(req.query.groupname)
    + ', isWriter = false, userid = '
    + db.mysql.escape(req.session.user_id),
    function (err) {
      res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
    });
});
router.get('/joinwriter', function (req, res, next) {
  db.connection.query('insert into JoinGroup set Groupname = '
    + db.mysql.escape(req.query.groupname)
    + ', isWriter = true, userid = '
    + db.mysql.escape(req.session.user_id),
    function (err) {
      res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
    });
});
router.get('/bereader', function (req, res, next) {
  db.connection.query('update JoinGroup set isWriter = false where Groupname = '
    + db.mysql.escape(req.query.groupname)
    + ' and userid = '
    + db.mysql.escape(req.session.user_id),
    function (err) {
      res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
    });
});
router.get('/bewriter', function (req, res, next) {
  db.connection.query('update JoinGroup set isWriter = true where Groupname = '
    + db.mysql.escape(req.query.groupname)
    + ' and userid = '
    + db.mysql.escape(req.session.user_id),
    function (err) {
      res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
    });
});
router.get('/exit', function (req, res, next) {
  db.connection.query('delete from JoinGroup where Groupname = '
    + db.mysql.escape(req.query.groupname)
    + ' and userid = '
    + db.mysql.escape(req.session.user_id),
    function (err) {
      res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
    });
});

///////////////////////// Post Write ////////////////////////////////
router.post('/write', function (req, res, next) {
  // req.body.writearea 이용
  // userid : req.session.user_id
  // Groupname : req.query.groupname
  
  res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
});

///////////////////////// Reading Nodes ////////////////////////////////
router.post('/read', function (req, res, next) {
  // req.body.writearea 이용
  // userid : req.session.user_id
  // Groupname : req.query.groupname
  
});

/* GET home page. */
router.get('/', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  else {
    showpage(req, res, null);
  }
});

function showpage(req, res, pageerror) {
  db.connection.query(
    'select * from JoinGroup where Groupname = ' + db.mysql.escape(req.query.groupname)
    + ' and userid = ' + db.mysql.escape(req.session.user_id),
    function (err, rows) {
      var isjoin = false;
      var iswriter = false;

      if (rows && rows[0]) {
        isjoin = true;
        iswriter = rows[0].isWriter;
      }
      else {
        isjoin = false;
        iswriter = false;
      }

      db.connection.query(
        'select * from RenoGroup where Groupname = ' + db.mysql.escape(req.query.groupname),
        function (err, rows) {
          if (rows && rows[0]) {
            var changetime = moment(rows[0].writerchangetime);
            var writelimit = rows[0].WriteLimit.split(":");
            for (var i = 0; i < writelimit.length; i++) writelimit[i] = parseInt(writelimit[i], 10);
            var timeafter = changetime.add({ hours: writelimit[0], minutes: writelimit[1], seconds: writelimit[2] });
            var remain_time = moment.utc(timeafter.diff(moment())).format("hh:mm:ss");
            if (pageerror)
              res.render('group', {
                session: req.session,
                groupdata: rows[0],
                message: pageerror,
                remain_time: remain_time,
                isjoin: isjoin,
                iswriter: iswriter
              });
            else
              res.render('group', {
                session: req.session,
                groupdata: rows[0],
                remain_time: remain_time,
                isjoin: isjoin,
                iswriter: iswriter
              });
          }
          else {
            res.redirect('/');
          }

        });
    });


}


module.exports = router;
