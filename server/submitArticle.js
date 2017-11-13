require(`dotenv`).config();

const express = require(`express`);
const router = express.Router();
const path = require(`path`);
const MongoClient = require(`mongodb`).MongoClient;
const session = require(`client-sessions`);

const bodyParser = require(`body-parser`);

router.use(session ({
	cookieName: `session`,
	secret: process.env.SESSION_SECRET,
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000
}));


router.all(`/*`, (req, res, next) => {
	if (req.session && req.session.user) {
		const collection = db.collection(`users`);

		collection.findOne({ email: req.session.user.email })
		.then( user => {
			if (!user){
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

router.get(`/`, (req, res) => {
	res.sendFile(path.join(__dirname, `../minihtml/submit.html`));
});

module.exports = router;
