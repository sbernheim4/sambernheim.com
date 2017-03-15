'use strict';

var express = require('express');
var app = express();
var path = require('path');
var compression = require('compression');

var port = process.env.PORT || 1337;
var cacheTime = 31536000000; // One year

app.use(compression());

// serve static files
app.use(express.static(path.join(__dirname, 'public'), {maxAge: cacheTime})); //css and js
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

app.get('/manifest.json', function(req, res) {
	res.sendFile(path.join(__dirname, '../manifest.json'));
})

// listen on port
app.listen(port, function() {
	console.log('Listening to port ', port);
});
