var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  res.render('create_group', {
    title: 'relaynovel',
    session: req.session
  });
});

module.exports = router;
