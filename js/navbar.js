// Desktop navbar
const desktopBtns = document.querySelector('.navbar').querySelectorAll('p');
desktopBtns.forEach(btns => {
	btns.addEventListener('click', scroll);
});

const mobileToggle = document.querySelector('.fa-bars');
mobileToggle.addEventListener('click', toggleMobileNavbar);

// Mobile navbar
const mobileBtns = document.querySelector('.mobile-navbar').querySelectorAll('p');
mobileBtns.forEach(btn => {
	btn.addEventListener('click', scroll);
});

function toggleMobileNavbar() {
	const text = document.querySelector('.mobile-navbar--text');
	text.classList.toggle('display');
}

// Scrolling function
function scroll() {
	let name = this.getAttribute('name');
	let section = document.querySelector("." + name);
	let amtToScroll = section.getBoundingClientRect().top;
	let offset = navbar.clientHeight;
	window.scrollBy(0, amtToScroll - offset);
}
