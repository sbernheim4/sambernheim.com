'use strict'

var express = require('express');
var app = express();
var path = require('path');

var port = process.env.PORT || 1337;

// serve static files
app.use(express.static(path.join(__dirname, '../minifiedCSS')));
app.use(express.static(path.join(__dirname, '../images')));

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../views/home.html'));
});

app.get('/resume', function(req, res) {
	res.sendFile(path.join(__dirname, '../views/resume.html'));
});

app.get('/manifest.json', function(req, res) {
	res.sendFile(path.join(__dirname, '../manifest.json'));
})


// listen on port
app.listen(port, function() {
	console.log('Listening to port ', port);
});

