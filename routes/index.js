var express = require('express');
var router = express.Router();
var form = require('../postedform.js');
var db = require('../database.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.logined)
    res.redirect('/home');
  else {
    res.redirect('/login');
  }
});

module.exports = router;
