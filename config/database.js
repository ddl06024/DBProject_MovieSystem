var mysql_db ={};
var mysql = require('mysql');
var db_info = {
  host     : '34.64.71.225',
  user     : 'root',
  password : 'mineminecs328',
  database : 'minhedb',
  multipleStatements: true,
  dateStrings: 'date'
}
// db와 서버간의 객체 반환
mysql_db.init = function(){
    return mysql.createConnection(db_info);
}

//실제 데이터 교환을 위한 connection
mysql_db.connect = function(conn){
    conn.connect(function(err){
        if(err) console.error('mysql connection fail'+ err);
        else console.log('my sql connection success');
    });

}

module.exports = mysql_db;