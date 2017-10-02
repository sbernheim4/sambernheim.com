'use strict';

require('dotenv').config()

const express = require('express');
const app = express();
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const port = process.env.PORT || 1337;
const cacheTime = 31536000000; // One year

const MongoClient = require('mongodb').MongoClient

app.use(compression());

// serve static files
app.use(express.static(path.join(__dirname, 'public'), {maxAge: cacheTime})); //css and js
app.use(express.static(path.join(__dirname, '../images'), {maxAge: cacheTime})); //images
app.use(express.static(path.join(__dirname, '../js'), {maxAge: cacheTime}));

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../minihtml/home.html'));
});

app.get('/resume', function(req, res) {
	res.sendFile(path.join(__dirname, '../minihtml/resume.html'));
});

const submitArticle = require('./submitArticle');
app.use('/submit-article', submitArticle);

app.get('/robots.txt', function(req, res) {
	res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', function(req, res) {
	res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

app.get('/manifest.json', function(req, res) {
	res.sendFile(path.join(__dirname, '../manifest.json'));
});

let db;
const url = process.env.DB_URI;

MongoClient.connect(url, (err, database) => {
	if (err) {
		console.log(err);
	} else {
		db = database;

		// listen on port
		app.listen(port, function() {
			console.log('Listening to port', port);
		});
	}

});

