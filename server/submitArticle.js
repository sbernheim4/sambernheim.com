require('dotenv').config()

const express = require('express');
const router = express.Router();
const path = require('path');
const MongoClient = require('mongodb').MongoClient

var bodyParser = require('body-parser');

router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../minihtml/submit.html'));
});

router.post('/', (req, res) => {

	const text = req.body;

	let db;
	const url = process.env.DB_URI;

	MongoClient.connect(url, (err, database) => {
		if (err) {
			console.log(err);
		} else {
			db = database;
			const collection = db.collection('blog');
			collection.insert({ article: req.body});
		}
	});
})

module.exports = router;
