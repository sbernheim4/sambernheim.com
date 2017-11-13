require(`dotenv`).config();

const express = require(`express`);
const router = express.Router();
const path = require(`path`);
const MongoClient = require(`mongodb`).MongoClient

const session = require(`client-sessions`);
const bodyParser = require(`body-parser`);
const bcrypt = require(`bcryptjs`);
const errors = require(`./errors.js`);

const url = process.env.DB_URI;

router.use(session ({
	cookieName: `session`,
	secret: process.env.SESSION_SECRET,
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000
}));

let db;

// For any request, first connect to the database
router.all(`/*`, (req, res, next) => {
	MongoClient.connect(url)
	.then( database => {
		db = database;
		next();
	}).catch( err => {
		throw err;
	})
});

// TODO: Is this necessary, if db was never set above then wouldn't it throw the error in the .catch??
router.all(`/*`, (req, res, next) => {
	if (!db) throw Error(errors.DB_CONNECTION);
	next();
});

//-------------------------------LOGIN----------------------------------------\\

router.post(`/login`, (req, res, next) => {

	const collection = db.collection(`users`);

	collection.findOne( { email: req.body.email } )
	.then( dbRes => {
		const hashedPassword = bcrypt.hashSync(req.body.password, dbRes.salt);

		if (hashedPassword === dbRes.password) {
			// if a user with that email was found and the password they entered
			// matches that user`s password, send them forward to /submit-article
			req.session.user = dbRes;
			res.redirect(`/submit-article`);
		} else if (hashedPassword !== dbRes.password) {
			// if the password entered does not match the password associated with
			// the given username send a 401 error
			req.session.reset();
			res.sendStatus(401);
		}
	}).catch(err => {
		// The username entered does not exist so send backa 401 error code
		req.session.reset();
		res.sendStatus(401);
	})
});

//----------------------------------------------------------------------------\\




//----------------------------SUBMIT ARTICLE----------------------------------\\

// For any type of request to /submit-article ensure the user is logged in
router.all(`/submit-article`, (req, res, next) => {
	if (req.session && req.session.user) {

		const collection = db.collection(`users`);

		collection.findOne( { email: req.session.user.email } )
		.then( user => {
			if (!user) {
				req.session.reset();
				res.redirect(`/login`);
			} else {
				res.locals.user = user;
				next();
			}
		}).catch( err => {
			throw err;
		});

	} else {
		res.redirect(`/login`);
	}
});

router.post(`/submit-article`, (req, res) => {
	const text = req.body;

	if (process.env.NODE_ENV !== `production`) {
		console.log(`Not in Production. Data that would be added is:`);
		console.log(JSON.stringify(req.body));
	} else {
		const collection = db.collection(`blog`);

		collection.insertOne(req.body)
		.then(res => {
			console.log(`Article added to DB`);
			console.log(res);
		}).catch( err => {
			throw err;
		});
	}

});


//----------------------------------------------------------------------------\\

module.exports = router;
