var express = require('express');
var router = express.Router();
var db = require('../database.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { title: 'relaynovel' });
});

/* Log in */
router.post('/', function (req, res, next) {
  var query = db.connection.query('select * from User where userid=' + db.mysql.escape(req.body.id), function (err, rows) {
    console.log(rows);
    if (rows[0] && req.body.id == rows[0].userid && req.body.pswd === rows[0].Password)
      req.session.regenerate(function () {
        req.session.logined = true;
        req.session.user_id = req.body.id;
        
        res.redirect('/home');
      })
    else {
      console.log("error");
      res.render('login', { session: req.session });
    }
  });
});

module.exports = router;
