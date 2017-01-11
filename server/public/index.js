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
window.addEventListener('load', debounce(slide, 15));
window.addEventListener('scroll', debounce(slide, 15));

var elements = document.querySelectorAll('.slideFromLeft');
var elements2 = document.querySelectorAll('.slideFromRight');

function slide() {
	console.log('SCROLLING');
	elements.forEach(element => {
		// Check to see if the window y position is greater than the top of the element
		if (window.scrollY % window.innerHeight / 2 + window.innerHeight * 0.6 > element.getBoundingClientRect().top) {
			// add the move class to the element
			element.classList.add('move');
		}
	});

	elements2.forEach(element => {
		// Check to see if the window y position is greater than the top of the element
		if (window.scrollY % window.innerHeight / 2 + window.innerHeight * 0.6 > element.getBoundingClientRect().top) {
			// add the move class to the element
			element.classList.add('move');
		}
	});
}

// Debounce function grabbed from the interweb so the scroll function doesn't fire so often 
// ruining performance 
function debounce(func, wait, immediate) {
	var timeout;
	return function () {
		var context = this,
		    args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}