var btn = document.querySelector('#submit-article-btn');

function btnClick(e) {
	console.log("MAKING POST REQUEST TO SEREVR");
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://sambernheim.tech/submit-article', false);
	xhr.send('This is a test of making a post request');
	console.log("POST REQUEST MADE TO SERVER");
};

btn.addEventListener('click', btnClick);
