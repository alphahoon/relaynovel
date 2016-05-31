var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'aa1srt9g8p7y84.cza7cgqsf7zv.ap-northeast-2.rds.amazonaws.com',
  user     : 'renodb',
  password : 'cs350reno',
  port     : '3306',
  database : 'ebdb'
});
connection.connect(function(err ) {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
});

exports.connection = connection;
exports.mysql = mysql;