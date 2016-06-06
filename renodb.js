var db = require('./database.js');
var moment = require('moment');

//cberror : function(err)
//cbsuccess : function()
function beWriter(groupname, userid, cberror, cbsuccess) {
    db.connection.query('update JoinGroup set isWriter = true where Groupname = '
        + db.mysql.escape(groupname)
        + ' and userid = '
        + db.mysql.escape(userid),
        function (err) {
            if (err) cberror(err);
            else setWritersReaders(groupname, '+1', '-1',
                function (err) {
                    cberror(err);
                }, function () {
                    cbsuccess();
                });
        });
}
function beReader(groupname, userid, cberror, cbsuccess) {
    db.connection.query('update JoinGroup set isWriter = false where Groupname = '
        + db.mysql.escape(groupname)
        + ' and userid = '
        + db.mysql.escape(userid),
        function (err) {
            if (err) cberror(err);
            else setWritersReaders(groupname, '-1', '+1',
                function (err) {
                    cberror(err);
                }, function () {
                    cbsuccess();
                });
        });
}

function setWritersReaders(groupname, deltawriters, deltareaders, cberror, cbsuccess) {
    db.connection.query('update RenoGroup '
        + 'set writers = writers' + deltawriters
        + ', readers = readers' + deltareaders
        + ' where Groupname = '
        + db.mysql.escape(groupname),
        function (err) {
            if (err) cberror(err);
            else cbsuccess();
        });
}

function getCurrentNode(groupname, cberror, cbsuccess) {
    db.connection.query('select CurrentNode from RenoGroup where Groupname=' + db.mysql.escape(groupname),
        function (err, curr_node) {
            if (err) cberror(err);
            else if (curr_node[0] == null) cbsuccess(null);
            else cbsuccess(curr_node[0].CurrentNode);
        });    
}

function getRevision(groupname, cberror, cbsuccess) {
    db.connection.query('select count(Groupname) AS revision from Node where Groupname = ' + db.mysql.escape(groupname),
        function (err, revision_number) {
            if (err) cberror(err);            
            else cbsuccess(revision_number[0].revision);
        });    
}

function submitContent(content, writer, groupname, cberror, cbsuccess) {
    getCurrentNode(groupname,
    function (err) {
      console.log('nonexistent group')
    }, function (curr_node) {
        getRevision(groupname,
            function (err) {
            console.log('nonexistent group')
            }, function (revision_number) {
                var nodevalues = {
                    NodeID : groupname + revision_number,
                    Groupname : groupname,
                    ParentNode : curr_node,
                    Content : content,
                    vote_status : 'wait',
                    TimeWritten : moment().format('YYYY-MM-DD HH:mm:ss'),
                    writer : writer 
                };
                db.connection.query('insert into Node set ?', nodevalues,
                function (err) {
                    if (err) cberror(err);
                    else {
                        setNewWriter(groupname,
                            function (err) {
                                cberror(err);
                            }, function () {
                                cbsuccess();
                            });                        
                    }                    
                });
        })
    })    
}

function setNewWriter (groupname, cberror, cbsuccess) {
    db.connection.query("select writer, VoteLimit from RenoGroup where Groupname = " + db.mysql.escape(groupname),
        function (err, group_query) {
            if (err) cberror(err);            
            else {
                db.connection.query("SELECT userid FROM JoinGroup WHERE Groupname=" + db.mysql.escape(groupname)+
                " AND isWriter=1 AND userid != " + db.mysql.escape(group_query[0].writer) + " order by rand() limit 1",
                function (err, writer_2) {
                    if (err) cberror(err);            
                    else {
                        var new_writer;
                        if (writer_2[0] == null) new_writer = group_query[0].writer;
                        else new_writer = writer_2[0].userid;
                        var votelimit = group_query[0].VoteLimit.split(":");
                        for (var i = 0; i < votelimit.length; i++) votelimit[i] = parseInt(votelimit[i], 10);
                        var timeafter = moment().add({ hours: votelimit[0], minutes: votelimit[1], seconds: votelimit[2] }).format('YYYY-MM-DD HH:mm:ss');                        
                        update_groupinfo = {
                            writer : new_writer,
                            writerchanged : 1,
                            writerchangetime :timeafter  
                        };
                        db.connection.query('update RenoGroup set ? where Groupname = '+ db.mysql.escape(groupname), update_groupinfo,
                        function (err) {
                            if (err) cberror(err);
                            else cbsuccess();
                        });
                    }
                });                    
            }
        });        
}

function setWriterTimer(timername, groupcreationtime, writelimit, groupname, cberror, cbsuccess) {
    // writer가 중간에 글을 제출하는 경우, writer 를 다른 멤버로, writerchanged=1,
    // writerchangetime=now()+VoteLimit 으로 바꿔줘야됨
    //timername : string
    //groupcreationtime : datetime
    //writelimit : string (format = '00:00:00')
    //groupname : string
    db.connection.query("CREATE EVENT " + timername +" ON SCHEDULE AT "+
    "(ADDTIME('"+ groupcreationtime + "', '" + writelimit + "')) ON COMPLETION PRESERVE " +
    "DO	BEGIN " +
			"DECLARE writer1 varchar(45);"+
            "DECLARE writer2 varchar(45);"+
            "DECLARE changetime DATETIME;"+
            "DECLARE currenttime DATETIME;"+
            "DECLARE group_name varchar(45);"+
            "SET group_name = '" + groupname + "';"+
            "SET writer1 = (SELECT writer FROM RenoGroup WHERE Groupname=group_name);"+
			"IF ((SELECT writerchanged FROM RenoGroup WHERE Groupname=group_name) = 1) "+
			"THEN "+
				"SET changetime = ADDTIME((SELECT writerchangetime FROM RenoGroup WHERE Groupname=group_name),(SELECT WriteLimit FROM RenoGroup WHERE Groupname=group_name));"+
                "ALTER EVENT " + timername + " ON SCHEDULE AT changetime ENABLE;"+
				"UPDATE RenoGroup SET writerchanged=0 WHERE Groupname=group_name;"+
			"ELSE "+
				"SET currenttime = NOW();"+
				"SET changetime = ADDTIME(currenttime,(SELECT WriteLimit FROM RenoGroup WHERE Groupname=group_name));"+
                "ALTER EVENT " + timername + " ON SCHEDULE AT changetime ENABLE;"+
                "UPDATE RenoGroup SET writerchangetime=currenttime WHERE Groupname=group_name;"+
                "IF ((SELECT count(userid) FROM JoinGroup WHERE Groupname=group_name AND isWriter=1) != 1) "+
                "THEN "+
                    "SET writer2 = (SELECT userid FROM JoinGroup WHERE Groupname=group_name AND isWriter=1 AND userid != writer1 order by rand() limit 1);"+
                "ELSE "+    
                    "SET writer2 = writer1;"+
                "END IF;"+
                "UPDATE RenoGroup SET writer=writer2 WHERE Groupname=group_name;"+
            "END IF;"+
		"END",
        function (err) {
            if (err) cberror(err);
            else cbsuccess();
        }); 
}


module.exports = {
    beReader: beReader,
    beWriter: beWriter,
    setWriterTimer : setWriterTimer,
    submitContent : submitContent,
    setNewWriter : setNewWriter
}