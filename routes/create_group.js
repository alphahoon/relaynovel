var express = require('express');
var router = express.Router();
var form = require('../postedform.js');
var db = require('../database.js');
var renodb = require('../renodb.js');
var moment = require('moment');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
}, function (req, res, next) {
    res.render('create_group', { session: req.session });
});

router.post('/', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
}, function (req, res, next) {
    form.handle_req(req, checkfield,
        'groupimages/',
        null,
        'groupimages/empty_group.png',
        setpostdata,
        'INSERT INTO RenoGroup SET ?',
        function (err) {
            res.render('create_group', { session: req.session, message: err });
        },
        function (req, entries, postdata) {
            db.connection.query('insert into JoinGroup set Groupname = '
                + db.mysql.escape(entries.fields.id)
                + ', isWriter = true, userid = '
                + db.mysql.escape(req.session.user_id),
                function (err) {
                    if (err) console.log(err);
                    else renodb.setWriterTimer(postdata.Groupname + "TurnEvent", postdata.createtime,
                        postdata.WriteLimit, postdata.Groupname,
                        function (err) {
                            console.log(err);
                        }, function () {
                            res.redirect(encodeURI('/group?groupname=' + postdata.Groupname));
                        })
                });
        });
})

function checkfield(req, entries, cberror, cbsuccess) {
    if (!(entries.fields.id && entries.fields.genre && entries.fields.writetimelimit &&
        entries.fields.votetimelimit && entries.fields.writerlimit &&
        entries.fields.lenmin && entries.fields.lenmax && entries.fields.allowrollback &&
        entries.fields.lenmax))
        cberror('필드를 다 채우세요.');
    else if (entries.fields.id.match(/[^ㄱ-ㅎ가-힣a-zA-Z0-9]+$/g))
        cberror('그룹이름에는 특수문자와 공백을 사용할 수 없습니다');
    else if (entries.fields.id.length < 4 || entries.fields.id.length > 20)
        cberror('그룹이름은 4~20자 이내로 작성 바랍니다.');
    else if (parseInt(entries.fields.lenmin) > parseInt(entries.fields.lenmax))
        cberror('최소 글자수 제한보다 최대 글자수 제한이 작습니다');
    else {
        db.connection.query('select Groupname from RenoGroup where Groupname=' + db.mysql.escape(entries.fields.id),
            function (err, db_id) {
                if (db_id && db_id[0]) {
                    cberror("동일 그룹이름이 존재합니다.");
                }
                else cbsuccess(req, entries);
            });
    }
}

function setpostdata(req, entries, image, callback) {
    var timenow = moment().format("YYYY-MM-DD HH:mm:ss");
    var rollback = entries.fields.allowrollback == 'on';
    var post = {
        Groupname: entries.fields.id,
        Genre: entries.fields.genre,
        VoteLimit: entries.fields.votetimelimit,
        WriteLimit: entries.fields.writetimelimit,
        readers: 1,
        writers: 1,
        WriterLimit: entries.fields.writerlimit,
        CurrentNode: null,
        Finished: false,
        AllowRollback: rollback,
        GroupImageURL: image,
        createtime: timenow,
        writerchanged: false,
        writerchangetime: timenow,
        writer: req.session.user_id,
        creator: req.session.user_id,
        minwrite: parseInt(entries.fields.lenmin),
        maxwrite: parseInt(entries.fields.lenmax)
    }
    callback(req, entries, post);
}
module.exports = router;
