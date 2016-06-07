var express = require('express');
var router = express.Router();
var db = require('../database.js');
var renodb = require('../renodb.js');
var moment = require('moment');
var fs = require('fs');

///////////////////////// Change Role ////////////////////////////////
router.get('/joinreader', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  renodb.joinGroup(req.query.groupname, req.session.user_id, false, function (err) {
    res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
  }, function () {
    renodb.updateReadersWriters(req.query.groupname,
      function (err) {
        console.log('updateReadersWriters failed from /joinreader' + err);
        res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
      },
      function () {
        res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
      });
  });
});
router.get('/joinwriter', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  renodb.joinGroup(req.query.groupname, req.session.user_id, true, function (err) {
    res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
  }, function () {
    renodb.updateReadersWriters(req.query.groupname,
      function (err) {
        console.log('updateReadersWriters failed from /joinwriter' + err);
        res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
      },
      function () {
        res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
      });
  });
});
router.get('/bereader', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  renodb.beReader(req.query.groupname, req.session.user_id,
    function (err) {
      res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
    }, function () {
      renodb.updateReadersWriters(req.query.groupname,
        function (err) {
          console.log('updateReadersWriters failed from /bereader' + err);
          res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
        },
        function () {
          res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
        });
    })
});
router.get('/bewriter', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  renodb.beWriter(req.query.groupname, req.session.user_id,
    function (err) {
      res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
    }, function () {
      renodb.updateReadersWriters(req.query.groupname,
        function (err) {
          console.log('updateReadersWriters failed from /bewriter' + err);
          res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
        },
        function () {
          res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
        });
    })
});
router.get('/exit', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  renodb.exitGroup(req.query.groupname, req.session.user_id, function (err) {
    res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
  }, function () {
    renodb.updateReadersWriters(req.query.groupname,
      function (err) {
        console.log('updateReadersWriters failed from /exit' + err);
        res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
      },
      function () {
        res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
      });
  });
});

///////////////////////// Post Write ////////////////////////////////
router.post('/write', function (req, res, next) {
  // req.body.writearea 이용
  // userid : req.session.user_id
  // Groupname : req.query.groupname
  renodb.submitContent(req.body.writearea, req.session.user_id, req.query.groupname, function (err) {
    res.redirect(encodeURI('/group?groupname=' + req.query.groupname));
  }, function (nodeid) {
    res.redirect(encodeURI('/group?groupname=' + req.query.groupname + '&nodeid=' + nodeid));
  });
});

///////////////////////// Reading Nodes ////////////////////////////////
function recursiveRead(curnode, callback) {
  if (curnode.ParentNode == null) {
    var result = new Array();
    callback(result);
  }
  else db.connection.query(
    'select Node.*, User.Nickname, User.Profilepic from Node left join User on User.userid = Node.writer where Node.NodeID = '
    + db.mysql.escape(curnode.ParentNode),
    function (err, rows) {
      if (rows && rows[0]) {
        recursiveRead(rows[0], function (result) {
          result.push(rows[0]);
          callback(result);
        });
      }
    });
}

router.post('/read', function (req, res, next) {
  var groupname = req.body.groupname;
  var curid = req.body.nodeid;
  if (curid == 'null') {
    db.connection.query(
      'select Node.*, User.Nickname, User.Profilepic from Node left join User on User.userid = Node.writer where Node.NodeID = (SELECT CurrentNode from RenoGroup where Groupname='
      + db.mysql.escape(groupname) + ')',
      function (err, rows) {
        if (rows && rows[0]) {
          recursiveRead(rows[0], function (result) {
            result.push(rows[0]);
            result = result.splice(req.body.start, req.body.num);
            for (var i = 0; i < result.length; i++) {
              result[i].TimeWritten = moment(result[i].TimeWritten).format('YYYY-MM-DD HH:mm:ss');
            }
            res.send(result);
          });
        }
      });
  }
  else {
    db.connection.query(
      'select Node.*, User.Nickname, User.Profilepic from Node left join User on User.userid = Node.writer where Node.NodeID='
      + db.mysql.escape(curid),
      function (err, rows) {
        if (rows && rows[0]) {
          if (rows[0].Groupname == groupname) {
            recursiveRead(rows[0], function (result) {
              result.push(rows[0]);
              result = result.splice(req.body.start, req.body.num);
              for (var i = 0; i < result.length; i++) {
                result[i].TimeWritten = moment(result[i].TimeWritten).format('YYYY-MM-DD HH:mm:ss');
              }
              res.send(result);
            });
          }
        }
      });
  }
});

router.get('/readnode', function (req, res, next) {
  fs.readFile(__dirname + '/../public/fakehtmls/readnode.html', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    res.send(data);
  });
});

///////////////////////// Vote ////////////////////////////////

router.post('/votedata', function (req, res, next) {
  var startidx = req.body.start;
  var nodenum = req.body.num;
  var groupname = req.body.groupname;

  var nodes = new Array();
  db.connection.query('select * from Vote where Group_GroupId = ' + db.mysql.escape(groupname)
    , function (err, rows) {
      if (err || !rows) return;
      var count = 0;
      rows.forEach(function (element) {
        renodb.countVote(element.VoteID, function (err) { },
          function (agree, disagree) {
            var agp, dgp;
            var adtotal = (agree + disagree).toFixed(2);
            if (adtotal == 0)
            { agp = 50; dgp = 50; }
            else
            { agp = (agree).toFixed(2) / adtotal * 100.00; dgp = (disagree).toFixed(2) / adtotal * 100.00; }
            nodes.push({
              Votetype: element.Votetype,
              agree: agree,
              agreePercent: agp,
              disagree: disagree,
              disagreePercent: dgp,
              StartTime: moment(element.StartTime).format('YYYY-MM-DD HH:mm:ss'),
              EndTime: moment(element.EndTime).format('YYYY-MM-DD HH:mm:ss'),
              nodehref: encodeURI('/group?groupname=' + groupname + '&nodeid=' + element.NodeId)
            });
            count++;
            if (count == rows.length)
              res.send(nodes.splice(startidx, nodenum));
          });
      }, this);
    });

  // var data = {
  //   Votetype: '타입',
  //   agree: '2',
  //   agreePercent: '10',
  //   disagree: '18',
  //   disagreePercent: '90',
  //   StartTime: 'YYYY-MM-DD HH:mm:ss',
  //   EndTime: 'YYYY-MM-DD HH:mm:ss',
  //   nodehref: '/home'
  // }
  // var result = [data, data];
  // res.send(result);
});

router.get('/votenode', function (req, res, next) {
  fs.readFile(__dirname + '/../public/fakehtmls/votenode.html', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    res.send(data);
  });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  if (!req.session.logined)
    res.redirect('/');
  else {
    if (req.query && req.query.error)
      showpage(req, res, req.query.error);
    else
      showpage(req, res, null);
  }
});

function showpage(req, res, pageerror) {
  var nodeid;
  if (req.query.nodeid)
    nodeid = req.query.nodeid;
  else
    nodeid = 'null';
  renodb.isUserinGroup(req.session.user_id, req.query.groupname, function (isjoin, iswriter) {
    renodb.getReaders(req.query.groupname, null, function (err, numReaders) {
      var readersCount = numReaders;
      renodb.getWriters(req.query.groupname, null, function (err, numWriters) {
        var writersCount = numWriters;

        db.connection.query(
          'select * from RenoGroup where Groupname = ' + db.mysql.escape(req.query.groupname),
          function (err, rows) {
            if (rows && rows[0]) {
              var changetime = moment(rows[0].writerchangetime);
              var writelimit = rows[0].WriteLimit.split(":");
              for (var i = 0; i < writelimit.length; i++) writelimit[i] = parseInt(writelimit[i], 10);
              var timeafter = changetime.add({ hours: writelimit[0], minutes: writelimit[1], seconds: writelimit[2] });
              var remain_time = moment.utc(timeafter.diff(moment())).format("hh:mm:ss");
              if (pageerror)
                res.render('group', {
                  session: req.session,
                  groupdata: rows[0],
                  message: pageerror,
                  remain_time: remain_time,
                  isjoin: isjoin,
                  iswriter: iswriter,
                  nodeid: nodeid,
                  readersCount: readersCount,
                  writersCount: writersCount
                });
              else
                res.render('group', {
                  session: req.session,
                  groupdata: rows[0],
                  remain_time: remain_time,
                  isjoin: isjoin,
                  iswriter: iswriter,
                  nodeid: nodeid,
                  readersCount: readersCount,
                  writersCount: writersCount
                });
            }
            else {
              res.redirect('/');
            }
          });
      });
    });
  });
}


module.exports = router;
