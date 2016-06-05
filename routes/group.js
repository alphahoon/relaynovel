var express = require('express');
var router = express.Router();
var db = require('../database.js');
var moment = require('moment');

/* GET home page. */
router.get('/', function (req, res, next) {
    if (!req.session.logined)
        res.redirect('/');
    else{
        showpage(req, res, null);
    }
});

router.post('/', function (req, res, next) {
  res.redirect('/joinable')
});

function showpage(req, res, pageerror) {
  var query = db.connection.query(
    'select * from RenoGroup where Groupname = ' + db.mysql.escape(req.query.groupname),
    function (err, rows) {
      if (rows && rows[0]) {
        var changetime = moment(rows[0].writerchangetime);
        var writelimit = rows[0].WriteLimit.split(":");
        for (var i = 0; i<writelimit.length; i++) writelimit[i] = parseInt(writelimit[i],10);
        var timeafter = changetime.add({hours:writelimit[0],minutes:writelimit[1],seconds:writelimit[2]});
        var remain_time = moment.utc(timeafter.diff(moment())).format("hh:mm:ss");
          if (pageerror)
            res.render('group', {
              session: req.session,
              groupdata: rows[0],
              message: pageerror,
              remain_time : remain_time
            });
          else
            res.render('group', {
              session: req.session,
              groupdata: rows[0],
              remain_time : remain_time
            });
      }
      else {
        res.redirect('/');
      }

    });
}

module.exports = router;
