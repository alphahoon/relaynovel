var express = require('express');
var router = express.Router();
var db = require('../database.js');

/* Ajax */
router.post('/', function (req, res, next) {
    db.get_layout_links(function (callback) {
        res.send(callback);
    });    
});
module.exports = router;
