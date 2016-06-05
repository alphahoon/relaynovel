var express = require('express');
var router = express.Router();
var form = require('../postedform.js');
var db = require('../database.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  else {
    showpage(req, res, null);
  }
});

function showpage(req, res, pageerror) {
  var query = db.connection.query(
    'select * from User where userid= ' + db.mysql.escape(req.session.user_id),
    function (err, rows) {
      if (rows && rows[0]) {
        if (pageerror)
          res.render('profile', {
            session: req.session,
            userdata: rows[0],
            message: pageerror,
          });
        else
          res.render('profile', {
            session: req.session,
            userdata: rows[0],
          });
      }
      else {
        res.redirect('/');
      }

    });
}

module.exports = router;
