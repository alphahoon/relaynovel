var express = require('express');
var router = express.Router();
// var db = require('../database.js');
// var file = require('../file.js');
// var fs = require('fs');
// var path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
});
//   if (!req.session.logined)
//     res.redirect('/');
//   else {
//     var query = db.connection.query(
//       'select * from User where userid= ' + db.mysql.escape(req.session.user_id),
//       function (err, rows) {
//         if (rows && rows[0]) {
//           combine (function(callback) {
//             res.render('myprofile', {
//               session : req.session,
//               userdata : rows[0],
//               links : callback
//             });
//           });
//           // res.render('myprofile', {
//           //   title: 'relaynovel',
//           //   session: req.session,
//           //   userdata: rows[0] 
//           // });
//         }
//         else {
//           res.redirect('/');
//         }

//       });
//   }
// });

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
//               if (rows[0].Profilepic != 'userimages/empty_user.jpg') fs.unlinkSync(__dirname + '/../public/'+rows[0].Profilepic);
//               if (entries.file.profile.name) {
//                 console.log(rows[0].userid);
//                 console.log(entries.file.profile.path);
//                   var new_path = __dirname + '/../public/userimages/' + rows[0].userid + path.extname(entries.file.profile.path);
//                   fs.rename(entries.file.profile.path, new_path);
//                   profile_pic = 'userimages/' + rows[0].userid + path.extname(entries.file.profile.path);
//               }
//               else profile_pic = "userimages/empty_user.jpg";
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

// function combine (callback) {
//     db.get_layout_links(function (links) {
//       callback(links);
//     });
// }


module.exports = router;
