require('dotenv').config();

const express = require('express');
const router = express.Router();
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const session = require('client-sessions');
const bodyParser = require('body-parser');
const url = process.env.DB_URI;

let db;

router.use(session ({
	cookieName: 'session',
	secret: process.env.SESSION_SECRET,
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000
}));

router.get('/', (req, res) => {
	if (req.session.user) {
		// If the user is already signed in redirect them to the submit-article page
		res.redirect('../submit-article');
	} else {
		// Otherwise send them to the login page
		res.sendFile(path.join(__dirname, `../html/login.html`));
	}
});

router.post('/', (req, res, next) => {
	MongoClient.connect(url, (err, database) => {

		if (err) throw err;
		db = database;

		const collection = db.collection('users');
		collection.findOne( { email: req.body.email } , (err, dbRes) => {
			if (err) throw err;

			if (!dbRes){
				req.session.reset();
				res.redirect('../');
			} else {
				if (req.body.password === dbRes.password) {
					req.session.user = dbRes;
					res.redirect('../submit-article');
				} else {
					res.redirect('../');
				}
			}
		});
	});
});

module.exports = router;
