var btn = document.querySelector('#login-submit');
btn.addEventListener('click', login);

function login(e) {
	const userEmail = document.querySelector('#login-email').value;

	// Consider hashing the password just so the plain text password isn't sent
	const userPassword = document.querySelector('#login-password').value;

	const obj = {
		email: userEmail,
		password: userPassword,
	};

	// URL for post request
	var url = 'http://sambernheim.tech/api/login';

	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", redirect);
	xhr.open("POST", url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	// Ensure the article has at least a title and  text
	if (obj.email === "" || obj.password === "") {
		alert('Missing email and or password');
	} else {
		xhr.send(JSON.stringify(obj));
	}
}

function redirect() {
	// After the request is sent, try sending the user to the submit-article page. They will just be redirected back to login if the login failed
	window.location.href = 'http://sambernheim.tech/submit-article'
}
