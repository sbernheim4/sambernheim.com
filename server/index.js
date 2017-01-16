'use strict';

var compression = require('compression');
var express = require('express');
var app = express();
var path = require('path');

var port = process.env.PORT || 1337;
var cacheTime = 86400000;

app.use(compression());

// serve static files
app.use(express.static(path.join(__dirname, 'public'), {maxAge: cacheTime})); //css
app.use(express.static(path.join(__dirname, '../images'), {maxAge: cacheTime})); //images

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
