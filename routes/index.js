var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'aa1srt9g8p7y84.cza7cgqsf7zv.ap-northeast-2.rds.amazonaws.com',
  user     : 'renodb',
  password : 'cs350reno',
  port     : '3306',
  database : 'ebdb'
});
connection.connect(function(err) {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'relaynovel' });
});

router.get('/login', function(req, res, next){
  if(req.session.logined)
    res.render('logout', {session: req.session})
  else {
    res.render('login', {session: req.session})
  }
 
})
 
router.post('/login', function(req, res, next){
  var query = connection.query('select * from User where userid='+mysql.escape(req.body.id),function(err,rows){
    if(req.body.id == rows[0].userid && req.body.pswd === rows[0].Password)
    req.session.regenerate(function(){
      req.session.logined = true;
      req.session.user_id = req.body.id;
  
      res.render('logout', {session: req.session})
    })
    else res.render('login', {session: req.session})
  });
});
 
router.post('/logout', function(req,res,next){
  req.session.destroy();
  res.redirect('/login')
})

module.exports = router;
