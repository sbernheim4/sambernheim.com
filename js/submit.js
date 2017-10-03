var btn = document.querySelector('#submit-article-btn');

function btnClick(e) {
	const articleTitle = document.querySelector('#article-title').value;
	const articleText = document.querySelector('#article-text').value;

	const obj = {
		title: articleTitle,
		text: articleText
	}

	//TODO: Change url to production URL when it goes live
	$.ajax({
		type: "POST",
		url: "http://localhost:5000/submit-article",
		data: obj
	});
};

btn.addEventListener('click', btnClick);
