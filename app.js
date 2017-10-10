var express = require('express');
var app = express();

var mysql = require('mysql');

app.use('/assets', express.static('assets'));

app.get('/', function (req, res) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "store_db"
  });

  var str = "<h1>Картинки</h1>\n";

  con.connect( function (err) {
    if (err) res.send('DB error...');
    con.query('SELECT * FROM products', function (err, result) {
      if (err) res.send('SELECT error');
      for (var i = 1;i<=parseInt(result[0].img_count);i++){
       str += '<img src="'+result[0].img_src+'/'+i+'.jpg">\n';
       console.log(str);
      }
      res.send(str);
    });
  });
});

app.get('/admin', function (req, res) {
  res.send('This is admin page.');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

