'use strict'

var express = require('express');
var app = express();
var path = require('path');

var port = process.env.PORT || 1337;
var oneDay = 86400000;

// enable g-zip compression
app.use(express.compress());

// serve static files
app.use(express.static(path.join(__dirname, 'public'), {maxAge: oneDay})); //css
app.use(express.static(path.join(__dirname, '../images'), {maxAge: oneDay})); // images

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../minihtml/home.html'));
});

app.get('/resume', function(req, res) {
	res.sendFile(path.join(__dirname, '../minihtml/resume.html'));
});

app.get('/robots.txt', function(req, res) {
	res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', function(req, res) {
	res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// listen on port
app.listen(port, function() {
	console.log('Listening to port ', port);
});
