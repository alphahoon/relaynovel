var db = require('./database.js');

//cberror : function(err)
//cbsuccess : function()
function beWriter(groupname, userid, cberror, cbsuccess) {
    console.log('update JoinGroup set isWriter = true where Groupname = '
        + db.mysql.escape(groupname)
        + ' and userid = '
        + db.mysql.escape(userid));
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
        + 'set writers = writers ' + deltawriters
        + ', readers = readers ' + deltareaders
        + ' where Groupname = '
        + db.mysql.escape(groupname),
        function (err) {
            if (err) cberror(err);
            else cbsuccess();
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
                "ALTER EVENT writer_group1 ON SCHEDULE AT changetime ENABLE;"+
				"UPDATE RenoGroup SET writerchanged=0 WHERE Groupname=group_name;"+
			"ELSE "+
				"SET currenttime = NOW();"+
				"SET changetime = ADDTIME(currenttime,(SELECT WriteLimit FROM RenoGroup WHERE Groupname=group_name));"+
                "ALTER EVENT writer_group1 ON SCHEDULE AT changetime ENABLE;"+
                "UPDATE RenoGroup SET writerchangetime=currenttime WHERE Groupname=group_name;"+
				"SET writer2 = (SELECT userid FROM JoinGroup WHERE Groupname=group_name AND isWriter=1 order by rand() limit 1);"+
                "IF ((SELECT count(userid) FROM JoinGroup WHERE Groupname=group_name AND isWriter=1) != 1) "+
                "THEN "+
					"WHILE writer1 = writer2 DO "+
						"SET writer2 = (SELECT userid FROM JoinGroup WHERE Groupname=group_name AND isWriter=1 order by rand() limit 1);"+
					"END WHILE;"+
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
    setWriterTimer : setWriterTimer
}