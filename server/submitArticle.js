require('dotenv').config();

const express = require('express');
const router = express.Router();
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const session = require('client-sessions');

const bodyParser = require('body-parser');

router.use(session ({
	cookieName: 'session',
	secret: process.env.SESSION_SECRET,
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000
}));

router.all('/*', (req, res, next) => {
	if (req.session && req.session.user) {
		const collection = db.collection('users');
		collection.findOne({ email: req.session.user.email}, (err, user) => {
			if (!user){
				req.session.reset();
				res.redirect('../login');
			}
		})
	} else {
		res.redirect('../login');
	}
});

router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../minihtml/submit.html'));
});

router.post('/', (req, res) => {

	const text = req.body;

	let db;
	const url = process.env.DB_URI;

	MongoClient.connect(url, (err, database) => {
		if (err) throw err;

		if (process.env.NODE_ENV === 'production') {
			db = database;
			const collection = db.collection('blog');
			collection.insertOne(req.body, (err, res) => {
				if (err) throw err;
				console.log(`Article added to DB`);
			});
		} else if (process.env.NODE_ENV === 'development') {
			console.log(`Not in Production\nData that would be added is:\n${JSON.stringify(req.body)}`);
		}
	});
});

module.exports = router;
