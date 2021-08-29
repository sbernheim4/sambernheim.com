
const path = require('path');
const util = require('util');
const express = require('express');
const app = express();
const chalk = require('chalk');
const compression = require('compression');
const helmet = require('helmet');

const PORT = process.env.PORT || 3000;

/****************** Serve Static Files --> JS, CSS, IMAGES ETC ******************/
const cacheTime = 172800000; // 2 Days in ms - Tells clients to cache static files

/****************** Server Options ******************/
app.use(helmet()); // Sets some good default headers
app.use(compression()); // Enables gzip compression
app.use(express.json()) // Lets express handle JSON encoded data sent on the body of requests
app.use(express.urlencoded({ extended: true }));

/****************** Log Requests ******************/
app.use('*', (req, res, next) => {
	console.log('--------------------------------------------------------------------------');
	console.log(util.format(chalk.red('%s: %s %s'), 'REQUEST ', req.method, req.baseUrl));
	console.log(util.format(chalk.yellow('%s: %s'), 'QUERY   ', util.inspect(req.query)));
	console.log(util.format(chalk.cyan('%s: %s'), 'BODY    ', util.inspect(req.body)));

	next();
});

app.use(express.static(path.join(__dirname, '../public'), { maxAge: cacheTime } ));

/****************** Route Handling ******************/
app.use('/*', (req, res) => {
	res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Return a 404 page for all other requests - This should be the last get/put/post/delete/all/use call for app
app.use("*", (req, res) => {
	res.status(404).send(`<h1>404 Page Not Found</h1>`);
});

/****************** Start the Server and DB (if DB_URI env var is set) ******************/
app.listen(PORT, () => {
	console.log(chalk.green(`Listening on port ${PORT}`));
});
