var express = require('express');
var router = express.Router();
var db = require('../database.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  else {
    var query = db.connection.query(
      'select * from User where userid= ' + db.mysql.escape(req.session.user_id),
      function (err, rows) {
        if (rows && rows[0]) {
          combine (rows[0], function(callback) {
            res.render('myprofile', {
              session : req.session,
              userdata : callback.userdata,
              links : callback.links
            });
          });
          // res.render('myprofile', {
          //   title: 'relaynovel',
          //   session: req.session,
          //   userdata: rows[0] 
          // });
        }
        else {
          res.redirect('/');
        }

      });
  }
});

function combine (userprofile, callback) {
    db.get_layout_links(function (links) {
      var rendervars = {
        userdata : userprofile,
        links : links
      };
      callback(rendervars);
    });
}


module.exports = router;
