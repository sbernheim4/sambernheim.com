`use strict`;

require(`dotenv`).config();

const express = require(`express`);
const app = express();
const path = require(`path`);
const compression = require(`compression`);
const bodyParser = require(`body-parser`);
const chalk = require(`chalk`);
const errors = require(`./errors.js`);

app.use(bodyParser.urlencoded( { extended: false } ));
app.use(bodyParser.json());
app.use(compression());

const port = process.env.PORT;
const cacheTime = 31536000000; // One year


/******************* SERVE STATIC FILES  *****************************/

app.use(express.static(path.join(__dirname, `public`), {maxAge: cacheTime})); // css and js
app.use(express.static(path.join(__dirname, `../images`), {maxAge: cacheTime})); // images
app.use(express.static(path.join(__dirname, `./public/js-pages`), {maxAge: cacheTime})); // used for /submit-article
app.use(express.static(path.join(__dirname, `./public/images`), {maxAge: cacheTime})); // images


/******************* LOG REQUESTS  *****************************/

app.all(`*`, (req, res, next) => {
	console.log(chalk.blue(`New ${req.method} request for ${req.path} on ${new Date().toLocaleString()}`));
	next();
});

/******************* VALID PATHS FOR WEBSITE *****************************/

// Hand off routing to separate sub components where appropriate
app.use(`/submit-article`, require(`./submitArticle`));
app.use(`/blog`, require(`./blog`));
app.use(`/login`, require(`./login`));
app.use(`/api`, require(`./api`));

app.get(`/`, (req, res) => {
	res.sendFile(path.resolve(`./minihtml/home.html`));
});

app.get(`/resume`, (req, res) => {
	res.sendFile(path.resolve(`./minihtml/resume.html`));
});

// SEO and other simple files
app.get(`/robots.txt`, (req, res) => {
	res.sendFile(path.join(__dirname, `./public/robots.txt`));
});

app.get(`/sitemap.xml`, (req, res) => {
	res.sendFile(path.join(__dirname, `./public/sitemap.xml`));
});

app.get(`/manifest.json`, (req, res) => {
	res.sendFile(path.join(__dirname, `./public/manifest.json`));
});

/******************* RETURN A 404 FOR ALL OTHER ROUTES *********************/

app.get(`/*`, (req, res) => {
	res.sendStatus(404);
});

/******************* START THE SERVER *******************/

app.listen(port, () => {
	console.log(chalk.yellow(`Listening to port:`, port));
});
