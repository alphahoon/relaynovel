var express = require('express');
var router = express.Router();
var db = require('../database.js');
var bcrypt = require('bcrypt-nodejs');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.logined)
    res.redirect('/');
  res.render('login', { title: 'relaynovel' });
});

/* Log in */
router.post('/', function (req, res, next) {
  var query = db.connection.query('select * from User where userid=' + db.mysql.escape(req.body.id),
    function (err, rows) {
      //console.log(rows);
      if (rows && rows[0] && req.body.id == rows[0].userid) {
        bcrypt.compare(String(req.body.pswd), rows[0].Password,
          function(err, hashres) {
            if (err)
              console.log(err);
            if (hashres)
            {
              req.session.regenerate(function () {
                req.session.logined = true;
                req.session.user_id = req.body.id;
                if (req.body.rememberme) {
                  req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; //  Rememeber for 30 days
                } else {
                  req.session.cookie.expires = false;
                }
                res.redirect('/home');
              })
            }
            else
            {
              res.render('login', { message: "잘못된 로그인 입니다." });
            }
          });
      }
      else {
        res.render('login', { message: "잘못된 로그인 입니다." });
      }
    });
});

module.exports = router;
