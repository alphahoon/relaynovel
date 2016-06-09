var db_connection 
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'renodb.cza7cgqsf7zv.ap-northeast-2.rds.amazonaws.com',
    user: 'renodb',
    password: 'cs350reno',
    port: '3306',
    database: 'ebdb'
});
connection.connect();
function db_query(query, callback) {
    connection.query(query, function (err, fields) {
        callback(fields);
    });
}

function get_recentupdate(callback) {
    connection.query('SELECT * FROM RenoGroup ORDER BY createtime DESC LIMIT 4;', function (err, groups) {
        if (groups) {
            var recent_groups = [];
            for (var i = 0; i < 4; i++){
                if (groups[i]) recent_groups.push(groups[i].Groupname);
                else recent_groups.push("");
            }
            callback(recent_groups);
        }
        else {
            callback("    ");
        }
    });
}
function get_best (recent_groups, callback) {
    connection.query('SELECT Groupname, COUNT(Groupname) FROM JoinGroup GROUP BY Groupname LIMIT 4;', function (err, groups) {
        if (groups) {
            var best_groups = [];
            for (var i = 0; i < 4; i++){
                if (groups[i]) best_groups.push(groups[i].Groupname);
                else best_groups.push("");
            }
            var combined = recent_groups.concat(best_groups);
            callback(combined);
        }
        else {
            callback(recent_groups);
        }
    });
}
function get_layout_links (callback) {
    get_recentupdate(function (recent_callback) {
       if (recent_callback) {
           get_best(recent_callback, function (callback_joined) {
               if (callback_joined) {
                   callback(callback_joined);
               }
           });
       } 
    });
}
module.exports = {
    mysql : mysql,
    connection : connection,
    get_layout_links : get_layout_links,
    db_query : db_query
}
