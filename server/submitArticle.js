const express = require('express');
const router = express.Router();
const path = require('path');

var bodyParser = require('body-parser');

router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../minihtml/submit.html'));
});

router.post('/', (req, res) => {
	console.log("POST request sent");
	console.log(req.body);
})

module.exports = router;
