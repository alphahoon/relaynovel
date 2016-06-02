var db_connection 
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'aa1srt9g8p7y84.cza7cgqsf7zv.ap-northeast-2.rds.amazonaws.com',
    user: 'renodb',
    password: 'cs350reno',
    port: '3306',
    database: 'ebdb'
});
connection.connect();
function get_recentupdate(callback) {
    connection.query('SELECT * FROM RenoGroup ORDER BY createtime DESC LIMIT 4;', function (err, groups) {
        if (groups) {
            var recent_groups = {
                'group1' : groups[0].Groupname,
                'group2' : groups[1].Groupname,
                'group3' : groups[2].Groupname,
                'group4' : groups[3].Groupname
            };
            callback(recent_groups);
        }
        else {
            callback("no group");
        }
    });
}

module.exports = {
    mysql : mysql,
    connection : connection,
    get_recentupdate : get_recentupdate
}