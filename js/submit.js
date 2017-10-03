var btn = document.querySelector('#submit-article-btn');

function btnClick(e) {
	const articleTitle = document.querySelector('#article-title').value;
	const articleText = document.querySelector('#article-text').value;

	const obj = {
		title: articleTitle,
		text: articleText
	};

	//TODO: Change url to production URL when it goes live
	var url = 'http://localhost:5000/submit-article';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify(obj));

	// Hide the button after the post request is submitted
	btn.style.display = 'none';
}

btn.addEventListener('click', btnClick);
