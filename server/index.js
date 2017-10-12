'use strict';

require('dotenv').config()

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

/******************* SERVE STATIC FILES  *****************************/
app.use(express.static(path.join(__dirname, 'public'), {maxAge: cacheTime})); //css and js
app.use(express.static(path.join(__dirname, '../images'), {maxAge: cacheTime})); //images
app.use(express.static(path.join(__dirname, '../js'), {maxAge: cacheTime})); // used for /submit-article

app.all('*', (req, res, next) => {
	console.log(chalk.blue(`New ${req.method} request for ${req.path}`));
	next();
});

/******************* SPECIAL PATHS FOR WEBSITE *****************************/

// Hand off routing for /submit-article and /blog to separate sub components
app.use('/submit-article', require(`./submitArticle`));
app.use('/blog', require('./blog'));
app.use('/login', require('./login'));

// SEO and other simple files
app.get('/robots.txt', (req, res) => {
	res.sendFile(path.join(__dirname, './public/robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
	res.sendFile(path.join(__dirname, './public/sitemap.xml'));
});

app.get('/manifest.json', (req, res) => {
	res.sendFile(path.join(__dirname, './public/manifest.json'));
});

/******************* Smart-Routing FOR ALL OTHER PATHS *********************/
app.get(`/*`, (req, res) => {
	res.sendFile(fileFinder(req.path));
});

function fileFinder (urlPath) {
	if (urlPath === '/'){
		return path.join(__dirname, `../minihtml/home.html`);
	} else {
		urlPath = urlPath.substring(1, urlPath.length);
		return path.join(__dirname,`../minihtml/${urlPath}.html`);
	}
};

app.listen(port, () => {
	console.log(chalk.yellow('Listening to port:', port));
});
