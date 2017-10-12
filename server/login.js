require('dotenv').config();

const express = require('express');
const router = express.Router();
const path = require('path');
const MongoClient = require('mongodb').MongoClient
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
	res.sendFile(path.join(__dirname, `../html/login.html`));
});


router.post('/', (req, res, next) => {
	MongoClient.connect(url, (err, database) => {

		if (err) throw err;
		db = database;

		const collection = db.collection('users');
		collection.findOne( { email: req.body.email } , (err, dbRes) => {
			if (err) throw err;

			if (!dbRes){
				console.log(`--------------------------`);
				console.log('NO USER FOUND');
				console.log(req.body);
				console.log(`--------------------------`);

				req.session.reset();
				res.redirect('../');
			} else {
				console.log(`dbRes IS: ${dbRes}`);
				console.log(`--------------------------`);
				console.log('USER FOUND');
				console.log(req.body);
				console.log(`--------------------------`);

				req.session.user = dbRes;
				res.redirect('../submit-article');
			}
		});
	});
});

module.exports = router;
