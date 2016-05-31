var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {
  req.session.destroy();
  res.redirect('/');
})

module.exports = router;
