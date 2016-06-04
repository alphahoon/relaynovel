var express = require('express');
var router = express.Router();
var db = require('../database.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    if (!req.session.logined)
        res.redirect('/');
    db.get_layout_links(function (callback) {
        res.render('create_group', { session: req.session, links : callback });
    });
});

router.post('/', function(req, res, next) {
        file.upload_file(req, function (entries) {
        if (!(entries.fields.id && entries.fields.name && entries.fields.pswd1 && entries.fields.pswd2)) res.render('register', { message: '필드를 다 채우세요.' });
        else if (entries.fields.pswd1 != entries.fields.pswd2) res.render('register', { message: '패스워드가 일치하지 않습니다.' });
        else if (entries.fields.id.length < 4 || entries.fields.id.length > 16) res.render('register', { message: 'ID는 4~16자 이내로 작성 바랍니다.' });
        else if (entries.fields.name.length < 4 || entries.fields.name.length > 16) res.render('register', { message: '닉네임은 4~16자 이내로 작성 바랍니다.' });
        else {
            check_duplicate(entries.fields.id, entries.fields.name, function (err) {
                res.render('register', { message: err });
            }, function () {
                var profile_pic;
                if (entries.file.profile.name) {
                    var new_path = __dirname + '/../public/userimages/' + entries.fields.id + path.extname(entries.file.profile.path);
                    fs.rename(entries.file.profile.path, new_path);
                    profile_pic = 'userimages/' + entries.fields.id + path.extname(entries.file.profile.path);
                }
                else profile_pic = "userimages/empty_user.jpg";
                var post = {
                    userid: entries.fields.id,
                    Nickname: entries.fields.name,
                    Password: entries.fields.pswd1,
                    Admin: false,
                    Blocked: false,
                    Profilepic: profile_pic
                }
                var query = db.connection.query('INSERT INTO User SET ?', post, function (err) {
                    if (err) res.render('register', { message: err });
                    else res.redirect('/');
                });
            });
        }
    });
})

module.exports = router;
