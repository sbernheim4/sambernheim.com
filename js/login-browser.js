var btn = document.querySelector('#login-submit');
btn.addEventListener('click', btnClick);

function btnClick(e) {
	const userEmail = document.querySelector('#login-email').value;

	//TODO: The password should be encrypted eventually here on the browser before being sent to the server
	const userPassword = document.querySelector('#login-password').value;

	const obj = {
		email: userEmail,
		password: userPassword,
	};

	// URL for post request
	var url = 'http://sambernheim.tech/login';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	// Ensure the article has at least a title and  text
	if (obj.email === "" || obj.password === "") {
		alert('Missing email and or password');
	} else {
		xhr.send(JSON.stringify(obj));
	}
}
