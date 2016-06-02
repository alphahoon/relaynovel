var express = require('express');
var router = express.Router();
var db = require('../database.js');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session.logined)
        res.redirect('/');
    res.render('register');
});

router.post('/', function (req, res, next) {
    var form = new formidable.IncomingForm();
    // 파일 전송 시 첫번째 chunk가 전달되면 호출
    form.keepExtensions = true;
    form.on('fileBegin', function (name, file) {
        console.log('fileBegin - ' + name + ':' + JSON.stringify(file));
    })
        // 파일의 chunk가 전달될 때 마다 호출
        .on('progress', function (bytesReceived, bytesExpected) {
            console.log('progress: ' + bytesReceived + '/' + bytesExpected);
        })
        // 파일 전송도중 esc나 페이지 전환 등으로 중단될 때 호출
        .on('aborted', function () {
            console.log('aborted');
        })
        // error 발생 시 호출
        .on('error', function () {
            console.log('error');
        })
        // 파일 전송이 끝난 경우 호출
        .on('end', function () {
            console.log('end');
        });
    form.parse(req, function (err, fields, file) {
        if (!(fields.id && fields.name && fields.pswd1 && fields.pswd2)) res.render('register', { message: '필드를 다 채우세요.' });
        else if (fields.pswd1 != fields.pswd2) res.render('register', {message : '패스워드가 일치하지 않습니다.'});
        else if (fields.id.length < 4 || fields.id.length > 16) res.render('register', {message : 'ID는 4~16자 이내로 작성 바랍니다.'});
        else if (fields.name.length < 4 || fields.name.length > 16) res.render('register', {message : '닉네임은 4~16자 이내로 작성 바랍니다.'});
        else {
            check_duplicate(fields.id, fields.name, function (err) {
                if (err) {
                    res.render('register', { message: err });
                }
                else {
                    var profile_pic;
                    if (file.profile.name) {
                        var new_path = __dirname + '/../public/static/images/' + fields.id + path.extname(file.profile.path);
                        fs.rename(file.profile.path, new_path);
                        profile_pic = new_path;
                    }
                    else profile_pic = "http://naturalpod.com/wp-content/uploads/2012/07/Natural-Pod-Blank-Photo-Person.jpg";
                    var post = {
                        userid : fields.id,
                        Nickname : fields.name,
                        Password : fields.pswd1,
                        Admin : false,
                        Blocked : false,
                        Profilepic : profile_pic
                    }
                    var query = db.connection.query('INSERT INTO User SET ?', post, function (err) {
                        if (err) res.render('register', { message: err });
                        else res.redirect('/');
                    });                    
                }
            });
        }
    });
});

function check_duplicate(user_id, nickname, callback) {
    db.connection.query('select userid from User where userid=' + db.mysql.escape(user_id), function (err, db_id) {
        if (db_id && db_id[0]) {
            callback("아이디가 이미 존재합니다.");
        }
        else {
            db.connection.query('select Nickname from User where Nickname=' + db.mysql.escape(nickname),
                function (err, db_nickname) {
                    if (db_nickname && db_nickname[0]) {
                        callback("닉네임이 이미 존재합니다.");
                    }
                    else callback(null);
                });
        }
    });
};

module.exports = router;
