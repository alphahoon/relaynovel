var express = require('express');
var router = express.Router();
var form = require('../postedform.js');
var db = require('../database.js');
var renodb = require('../renodb.js');

/* GET home page. */
router.get('/quit', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  renodb.quitForever(req.session.user_id, 
    function (err) {
      console.log('quitForever err!' + err);
    },
    function () {
      console.log('quitForever!');
      req.session.destroy();
      res.redirect('/');
  });
});
router.get('/', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  else {
    showpage(req, res, null);
  }
});
function showpage(req, res, pageerror) {
  var query = db.connection.query(
    'select * from User where userid= ' + db.mysql.escape(req.session.user_id),
    function (err, rows) {
      if (rows && rows[0]) {
        if (pageerror)
          res.render('myprofile', {
            session: req.session,
            userdata: rows[0],
            message: pageerror,
          });
        else
          res.render('myprofile', {
            session: req.session,
            userdata: rows[0],
          });
      }
      else {
        res.redirect('/dashboard');
      }

    });
}

router.post('/', function (req, res, next) {
    if (!req.session.logined)
        res.redirect('/');
  form.handle_req(req, checkfield,
    'userimages/',
    req.session.user_id,
    'userimages/empty_user.gif',
    setpostdata,
    'update User set ? where userid=' + db.mysql.escape(req.session.user_id),
    function (err) {
      showpage(req, res, err);
    },
    function (req, entries) {
      res.redirect('/');
    });
});

function checkfield(req, entries, cberror, cbsuccess) {
  if (entries.fields.pswd1) {
    if (!entries.fields.pswd2 || entries.fields.pswd1 != entries.fields.pswd2) {
      cberror('패스워드가 일치하지 않습니다.');
      return;
    }
  }
  if (entries.fields.name.length < 4 || entries.fields.name.length > 16) {
    cberror('닉네임은 4~16자 이내로 작성 바랍니다.');
    return;
  }
  db.connection.query('select Nickname from User where Nickname=' + db.mysql.escape(entries.fields.nickname),
    function (err, db_nickname) {
      if (db_nickname && db_nickname[0]) {
        cberror("닉네임이 이미 존재합니다.");
      }
      else cbsuccess(req, entries);
    });
}

function setpostdata(req, entries, imagepath, callback) {
  var post;
  if (!entries.fields.pswd1) {
    post = 'Nickname = ' + db.mysql.escape(entries.fields.name) + ', Profilepic = ' + db.mysql.escape(imagepath);
  }
  else {
    post = 'Nickname = ' + db.mysql.escape(entries.fields.name) + ', Password = ' + db.mysql.escape(entries.fields.pswd1) + ', Profilepic = ' + db.mysql.escape(imagepath);
  }
  callback(req, entries, post);
}



// router.post('/', function (req, res, next) {
//     file.upload_file (req, function (entries) {
//       if (entries.fields.pswd1 != entries.fields.pswd2) {
//       var query = db.connection.query(
//         'select * from User where userid= ' + db.mysql.escape(req.session.user_id),
//         function (err, rows) {        
//           combine(function(callback) {
//               res.render('myprofile', {
//                 session : req.session,
//                 userdata : rows[0],
//                 message :'패스워드가 일치하지 않습니다.',
//                 links : callback
//               });
//           });
//         });
//       }
//       else if (!entries.fields.name) {
//       var query = db.connection.query(
//         'select * from User where userid= ' + db.mysql.escape(req.session.user_id),
//         function (err, rows)   {           
//           combine(function(callback) {
//               res.render('myprofile', {
//                 session : req.session,
//                 userdata : rows[0],
//                 message :'닉네임을 입력 바랍니다.',
//                 links : callback
//               });
//           });
//         });        
//       }
//       else {
//         var query = db.connection.query(
//           'select * from User where userid= ' + db.mysql.escape(req.session.user_id),
//           function (err, rows) {
//             if (rows && rows[0]) {
//               if (entries.fields.pswd1=="") password = rows[0].Password;
//               else password = entries.fields.pswd1;
//               var profile_pic;
//               if (rows[0].Profilepic != 'userimages/empty_user.gif') fs.unlinkSync(__dirname + '/../public/'+rows[0].Profilepic);
//               if (entries.file.profile.name) {
//                 console.log(rows[0].userid);
//                 console.log(entries.file.profile.path);
//                   var new_path = __dirname + '/../public/userimages/' + rows[0].userid + path.extname(entries.file.profile.path);
//                   fs.rename(entries.file.profile.path, new_path);
//                   profile_pic = 'userimages/' + rows[0].userid + path.extname(entries.file.profile.path);
//               }
//               else profile_pic = "userimages/empty_user.gif";
//               console.log(profile_pic);
//               var query = db.connection.query(
//                 'update User set Nickname = ' + db.mysql.escape(entries.fields.name) + ', Password = ' + db.mysql.escape(password) + ', Profilepic = ' + db.mysql.escape(profile_pic) + 'where userid= ' + db.mysql.escape(rows[0].userid),
//                 function (err, result) {
//                     console.log(result);
//                     combine(function(callback) {
//                         rows[0].Password = password;
//                         rows[0].Profilepic = profile_pic;
//                         rows[0].Nickname = entries.fields.name;
//                         res.render('myprofile', {
//                           session : req.session,
//                           userdata : rows[0],
//                           message :'성공적으로 변경하였습니다.',
//                           links : callback
//                         });
//                     });                    
//                 });     
//             };
//           });
//       }
//     });
// });




module.exports = router;
