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

module.exports = {
    beReader: beReader,
    beWriter: beWriter
}