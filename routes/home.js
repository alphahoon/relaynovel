var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log(req.session.user_id);
    res.render('home', { session: req.session });
});

module.exports = router;
