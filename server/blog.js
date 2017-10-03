require('dotenv').config()

const express = require('express');
const router = express.Router();
const path = require('path');
const MongoClient = require('mongodb').MongoClient

var bodyParser = require('body-parser');

const url = process.env.DB_URI;

MongoClient.connect(url, (err, database) => {
	if (err) {
		console.log(err);
	} else {
		db = database;
		db.collection('blog').find({}).toArray(function (err, result) {
			if (err) throw err;
			router.get('/', (req, res) => {
				const html = generateHTML(result)
				res.send(html);
			});
		});
	}
});


function generateHTML(records) {
	// Beginning of HTML response that will be sent
	let html = `
		<!DOCTYPE html>
		<html>
			<head>
				<title>Welcome to my Blog</title>
				<link rel="stylesheet" href="index.css">
			</head>

			<body class='blog'>
				<div class='blog__landing-page'>
					<h1>Welcome to my Blog</h1>
				</div>
				<div class='articles'>
					${records.map( r =>
					`<div class='article'>
						<h2 class='article__title'>${r.title}</h2>
						<p class='article__text'>${r.text}</p>
					</div>`).join(``)}
				</div>
			</body>
		</html>
		`;

	return html;
}

module.exports = router;
