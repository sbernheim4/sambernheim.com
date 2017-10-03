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
	let html = `
		<!DOCTYPE html>
		<html>
			<head>
				<title>Welcome to my Blog</title>
			</head>

			<body>
	`;

	records.forEach( record => {
		html += `
				<div class='article'>
					<h2 class='article__title' >${record.title}</h2>
					<p class='article__text'>${record.text}</p>
				</div>
				`
	})


	html += `
			</body>
		</html>
	`
	return html;
}

module.exports = router;
