'use strict';

const express = require('express');
const app = express();
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const chalk = require('chalk');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(compression());

const port = process.env.PORT || 1337;
const cacheTime = 31536000000; // One year

// serve static files
app.use(express.static(path.join(__dirname, 'public'), {maxAge: cacheTime})); //css and js
app.use(express.static(path.join(__dirname, '../images'), {maxAge: cacheTime})); //images
app.use(express.static(path.join(__dirname, '../js'), {maxAge: cacheTime})); // used for /submit-article

app.all('*', (req, res, next) => {
	console.log(chalk.blue(`New ${req.method} request for ${req.path}`));
	next();
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../minihtml/home.html'));
});

app.get('/resume', (req, res) => {
	res.sendFile(path.join(__dirname, '../minihtml/resume.html'));
});

const submitArticle = require('./submitArticle');
app.use('/submit-article', submitArticle);

const blog = require('./blog');
app.use('/blog', blog);


app.get('/robots.txt', (req, res) => {
	res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
	res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

app.get('/manifest.json', (req, res) => {
	res.sendFile(path.join(__dirname, '../manifest.json'));
});

app.listen(port, () => {
	console.log(chalk.yellow('Listening to port:', port));
});
