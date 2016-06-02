var express = require('express');
var router = express.Router();
var db = require('../database.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');

  console.log('select * from User where userid = "' + req.session.user_id + '"');
  var query = db.connection.query(
    'select * from User where userid= ' + db.mysql.escape(req.session.user_id),
    function (err, rows) {
      console.log(rows);
      if (rows && rows[0]) {
        res.render('myprofile', {
          title: 'relaynovel',
          session: req.session,
          userdata: rows[0]
        });
      }
      else {
        res.redirect('/');
      }

    });

});

module.exports = router;
