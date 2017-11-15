//'use strict';
var Response = require('./classes/response');

// express engine
var express = require('express');
var app = express();

// parsing request body support (to support JSON-encoded bodies)
var bodyParser = require('body-parser')
app.use(bodyParser.json());

// HTTP and HTTPS servers support
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('ssl/rootCA.key', 'utf8');
var certificate = fs.readFileSync('ssl/rootCA.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// database support
var mysql = require('mysql');
var DATABASE_SETTINGS = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "store_db"
};


// make ASSETS directory static
app.use('/assets', express.static('assets'));


app.get('/', function (req, res) {
  res.json(new Response(200, 'OK', null, null).getJSON());
});

app.get('/category', function(req,res){
  let con = mysql.createConnection(DATABASE_SETTINGS);

  con.connect( function (err) {
    if (err) { res.json(new Response(500, 'Database connection error', null, err).getJSON()); return; }
    con.query('SELECT * FROM product_types', function (err, result) {
      if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
      for (var i = 1;i<=parseInt(result[0].img_count);i++){
        console.log(str);
      }
      res.json(new Response(200, 'OK', result, null).getJSON());
    });
  });
});


app.get('/product', function(req,res){
  let con = mysql.createConnection(DATABASE_SETTINGS);

  con.connect( function (err) {
    if (err) { res.json(new Response(500, 'Database connection error', null, err).getJSON()); return; }
    con.query('SELECT * FROM products', function (err, result) {
      if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
      res.json(new Response(200, 'OK', result, null).getJSON());
    });
  });
});

app.get('/user', function(req,res){
  let con = mysql.createConnection(DATABASE_SETTINGS);

  con.connect( function (err) {
    if (err) { res.json(new Response(500, 'Database connection error', null, err).getJSON()); return; }
    con.query('SELECT * FROM users', function (err, result) {
      if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
      res.json(new Response(200, 'OK', result, null).getJSON());
    });
  });
});

app.get('/review', function (req, res) {
  let con = mysql.createConnection(DATABASE_SETTINGS);
  
  let login = req.query.login;
  let product_id = req.query.product_id;

  con.connect( function (err) {
    if (err) { res.json(new Response(500, 'Database connection error', null, err).getJSON()); return; }

    if (login) {
      con.query('SELECT user_id FROM users WHERE login = ?', [login], function (err, result) {
        let user_id = result[0].user_id;
        con.query('SELECT * FROM reviews WHERE user_id = ?', [user_id],  function (err, result) {
          if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
          res.json(new Response(200, 'OK', result, null).getJSON());
        });
      });
    } else if (product_id) {
      con.query('SELECT * FROM reviews WHERE product_id = ?', [product_id], function (err, result) {
        if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
        res.json(new Response(200, 'OK', result, null).getJSON());
      });
    } else {
      con.query('SELECT * FROM reviews', function (err, result) {
        if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
        res.json(new Response(200, 'OK', result, null).getJSON());
      });
    }
  });
});

app.post('/review', function (req, res) {
  let con = mysql.createConnection(DATABASE_SETTINGS);
  let sql = 'INSERT INTO reviews (user_id, product_id, review_text, rating) VALUES (?,?,?,?)';

  let login = req.body['login'];
  let product_id = req.body['product_id'];
  let review_text = req.body['review_text'] === undefined ? '' : req.body['review_text'];
  let rating = req.body['rating'] === undefined ? '' : req.body['rating'];

  con.connect( function (err) {
    if (err) { res.json(new Response(500, 'Database connection error', null, err).getJSON()); return; }
    if (login && product_id) {
      con.query('SELECT user_id FROM users WHERE login = ?', [login], function (err, result) {
        if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
        let user_id = result[0].user_id;
        con.query(sql, [user_id, product_id, review_text, rating],  function (err, result) {
          if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
          res.json(new Response(200, 'OK', result, null).getJSON());
        });
      });
    } else
    res.json(new Response(400, 'Specify both login both product_id', null, 'Not enough parameters').getJSON());
  });
});

app.post('/remove_review', function (req, res) {
  let con = mysql.createConnection(DATABASE_SETTINGS);
  let sql = 'DELETE FROM reviews WHERE reviews_id = ?';

  let reviews_id = req.body['reviews_id'];
  if (!reviews_id) { res.json(new Response(400, 'Specify reviews_id', null, 'Not enough parameters').getJSON()); return; }

  con.connect( function (err) {
    if (err) { res.json(new Response(500, 'Database connection error', null, err).getJSON()); return; }
    con.query(sql, [reviews_id], function (err, result) {
      if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
      res.json(new Response(200, 'OK', result, null).getJSON());
    });
  });
});

app.post('/register', function(req, res) {
  let con = mysql.createConnection(DATABASE_SETTINGS);

  console.log(req);

  let user_name = req.body['name'];
  let number_phone = req.body['phone'];
  let address = req.body['address'];
  let bank_card = req.body['bank_card'];
  let visa_qiwi = req.body['visa_qiwi'];
  let webmoney = req.body['webmoney'];
  let yandex_money = req.body['yandex_money'];
  let e_mail = req.body['email'];
  let login = req.body['login'];
  let password = req.body['password'];

  let sql = "INSERT INTO users(user_name,number_phone,address,bank_card,visa_qiwi,webmoney,yandex_money,e_mail,login,password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  con.connect( function (err) {
    if (err) { res.json(new Response(500, 'Database connection error', null, err).getJSON()); return; }
    con.query("SELECT * FROM users WHERE login = ?", [login], function(err, result) {
      if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
      else if (result.length != 0) { res.json(new Response(500, 'User already exists', null, 'Duplicate table row').getJSON()); return; }
    });
    con.query(sql, [user_name, number_phone, address, bank_card, visa_qiwi, webmoney, yandex_money, e_mail, login, password], function (err, result) {
      if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
      else res.json(new Response(200, 'OK', result, null).getJSON());
    });
  });
});

app.post('/update_profile', function(req, res) {
  let con = mysql.createConnection(DATABASE_SETTINGS);

  let sql = 'UPDATE users SET user_name = ?, number_phone = ?, address = ?, bank_card = ?, visa_qiwi = ?, webmoney = ?, yandex_money = ?, e_mail = ? WHERE login = ?';

  let user_name = req.body['name'];
  let number_phone = req.body['phone'];
  let address = req.body['address'];
  let bank_card = req.body['bank_card'];
  let visa_qiwi = req.body['visa_qiwi'];
  let webmoney = req.body['webmoney'];
  let yandex_money = req.body['yandex_money'];
  let e_mail = req.body['email'];
  let login = req.body['login'];
  let password = req.body['password'];

  let callback = function (err, result) {
    if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
    else res.json(new Response(200, 'OK', null, null).getJSON());
  };

  con.connect( function (err) {
    if (err) { res.json(new Response(500, 'Database connection error', null, err).getJSON()); return; }
    con.query("SELECT * FROM users WHERE login = ? AND password = ?", [login, password], function(err, result) {
      if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
      else if (result.length == 0) { res.json(new Response(400, 'Invalid login and password', null, 'Invalid credentials').getJSON()); return; }
    });
    if (user_name) {
      con.query(sql, [user_name, number_phone, address, bank_card, visa_qiwi, webmoney, yandex_money, e_mail, login], callback); 
    } else {
      res.json(new Response(400, 'Please specify all the column', null, 'Not enough parameters').getJSON());
    }
  });

});

app.post('/login', function(req, res) {
  let con = mysql.createConnection(DATABASE_SETTINGS);

  let login = req.body['login'];
  let password = req.body['password'];

  con.connect( function (err) {
    if (err) { res.json(new Response(500, 'Database connection error', null, err).getJSON()); return; }
    con.query('SELECT * FROM users WHERE login = ? AND password = ?', [login, password], function (err, result) {
      if (err) { res.json(new Response(500, 'Database query error', null, err).getJSON()); return; }
      res.json(new Response(200, 'OK', result, null).getJSON());
    });
  });
});

httpServer.listen(3000, function () {
  console.log('HTTP server listening on port 3000!');
});
httpsServer.listen(8443, function () {
  console.log('HTTPS server listening on port 8443!');
});

