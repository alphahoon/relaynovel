var express = require('express');
var router = express.Router();
var db = require('../db.js');

/* GET home page. */

router.get('/', function(req, res, next) {
  if(req.session.logined)
    res.render('index', {session: req.session})
  else {
    res.redirect('/login');
  }
});

router.post('/logout', function(req,res,next){
  req.session.destroy();
  res.redirect('/')
})

module.exports = router;
