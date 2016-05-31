var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'aa1srt9g8p7y84.cza7cgqsf7zv.ap-northeast-2.rds.amazonaws.com',
  user     : 'renodb',
  password : 'cs350reno',
  port     : '3306',
  database : 'ebdb'
});
connection.connect();

exports.mysql = mysql;
exports.connection = connection;

// SQL Test Codes
/*
var sql_test = 'SELECT * FROM ebdb.User';
database.query(sql_test, function(err, rows, fields) {
    if(err)
    {
        console.log(err);
    }
    else
    {
        console.log('rows', rows);
        console.log('fields', fields);
    }
})
*/