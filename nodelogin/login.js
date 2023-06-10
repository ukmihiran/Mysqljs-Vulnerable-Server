const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

// Create connection
const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'admin123',
	database : 'nodelogin'
});

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/static')));

// Path: nodelogin/login.html
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});

// Path: nodelogin/auth.js
app.post('/auth', function(request, response) {
    const username = request.body.username;
    const password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/home');
            } else {
                response.send('Incorrect Username and/or Password!');
            }           
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

// Path: nodelogin/home.js
app.get('/home', function(request, response) {
    if (request.session.loggedin) {
        response.send('Welcome back, ' + request.session.username + '!');
    } else {
        response.send('Please login to view this page!');
    }
    response.end();
});

// Path: nodelogin/logout.js
app.get('/logout', function(request, response) {
    request.session.loggedin = false;
    response.redirect('/');
});

app.listen(3000);

