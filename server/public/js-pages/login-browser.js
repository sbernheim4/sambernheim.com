var btn = document.querySelector('#login-submit');
btn.addEventListener('click', getUserData);

function getUserData(e) {
	const userEmail = document.querySelector('#login-email').value;
	// Consider hashing the password just so the plain text password isn't sent
	const userPassword = document.querySelector('#login-password').value;

	// URL for post request
	var url = 'http://sambernheim.tech/api/login';

	// Credentials the user entered
	const credentials = {
		email: userEmail,
		password: userPassword,
	};

	login(url, credentials)
	.then( function (response) {
		console.log("Successfully logged in");
	}).catch( function(error) {
		showError();
	});

}

function login(url, credentials) {
	return new Promise((resolve, reject) => {

		var xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');

		xhr.onload = function() {
			if (xhr.status == 200) {
				resolve(xhr.response);
			} else {
				reject(Error(xhr.statusText));
			}
		};

		xhr.onerror = function() {
			reject(Error("Network Error"));
		};
		//
		// Ensure the article has at least a title and  text
		if (credentials.email === "" || credentials.password === "") {
			alert('Missing email and or password');
		} else {
			xhr.send(JSON.stringify(credentials));
		}

	})
}

function showError() {
	const error = document.querySelector('.login__error');
	error.classList.add('error-show');

	setTimeout(function() {error.classList.remove('error-show')}, 3500)
}
