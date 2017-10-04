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

	//TODO: uncomment lines below so that publishing is only possible from production mode
	MongoClient.connect(url, (err, database) => {
		if (err) {
			console.log(err);
		} else if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
			db = database;
			const collection = db.collection('blog');
			collection.insertOne(req.body, (err, res) => {
				if (err) throw err;
				console.log(`Article added to DB`);
			});
		} /*else if (process.env.NODE_ENV === 'development') {
			console.log(`Not in Production\nData that would be added is:\n${JSON.stringify(req.body)}`);
		}*/
	});
})

module.exports = router;
