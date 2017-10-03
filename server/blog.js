require('dotenv').config()

const express = require('express');
const router = express.Router();
const path = require('path');
const MongoClient = require('mongodb').MongoClient

var bodyParser = require('body-parser');

router.get('/', (req, res) => {
	htmlResponse = generateHTML();
	res.send(htmlResponse);
});

function generateHTML() {
	const dogs = [
		{ name: 'Snickers', age: 2 },
		{ name: 'Hugo', age: 8 },
		{ name: 'Sunny', age: 1 }
	];

	let res = `
	<!DOCTYPE html>
	<html>
		<head>
			<title>Welcome to Sam's Blog</title>
		</head>

		<body>
			<ul class='dogs'>
				${dogs.map(dog => `<li>${dog.name} is ${dog.age * 7}</li>`)}
			</ul>
		</body>

	</html>
	`
	return res;
}

module.exports = router;
