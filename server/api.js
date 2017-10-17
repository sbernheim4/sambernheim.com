require('dotenv').config();

const express = require('express');
const router = express.Router();
const path = require('path');
const MongoClient = require('mongodb').MongoClient

const session = require('client-sessions');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const url = process.env.DB_URI;

router.use(session ({
	cookieName: 'session',
	secret: process.env.SESSION_SECRET,
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000
}));

//-------------------------------LOGIN----------------------------------------\\

router.post('/login', (req, res, next) => {
	let db;

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

				let hashedPassword = bcrypt.hashSync(req.body.password, dbRes.salt);

				// TODO: Use bcrypt's builtin compare method to compare db and hash
				// bcrypt.compareSync(dbRes.password, hashedPassword)
				// if the hashed password is the same as the password in the DB set the user
				if (hashedPassword === dbRes.password) {
					req.session.user = dbRes;
					res.redirect('/submit-article');
				} else {
					res.redirect('../');
				}

			}
		});
	});
});

//----------------------------------------------------------------------------\\




//----------------------------SUBMIT ARTICLE----------------------------------\\

// For any type of request to /submit-article ensure the user is logged in
router.all('/submit-article', (req, res, next) => {
	if (req.session && req.session.user) {
		const collection = db.collection('users');
		collection.findOne({ email: req.session.user.email}, (err, user) => {
			if (!user){
				req.session.reset();
				res.redirect('../login');
			} else {
				res.locals.user = user;
				next();
			}
		})
	} else {
		res.redirect('../login');
	}
});

router.post('/submit-article', (req, res) => {
	const text = req.body;

	let db;

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


//----------------------------------------------------------------------------\\

let salt = ``;

router.post('/salt', (req, res) => {
	const collection = db.collection('users');
	collection.findOne({ email: req.body.email }, (err, user) => {
		if (!user){
			req.session.reset();
			res.redirect('../');
		} else {
			salt = user.salt;
			res.send(salt);
		}
	})
});


module.exports = router;
