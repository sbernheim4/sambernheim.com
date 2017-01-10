console.log('1 2 3');

var about = document.querySelector('.about-nav');
var edu = document.querySelector('.edu-exp-nav');
var interests = document.querySelector('.interests-nav');
var navbar = document.querySelector('.navbar');

import jump from '../node_modules/jump.js/dist/jump.js';

var btns = [about, edu, interests];

btns.forEach(btns => {
	btns.addEventListener('click', scroll);
});

function scroll() {
	let name = this.getAttribute('name');

	let section = document.querySelector("." + name);
	let amtToScroll = section.getBoundingClientRect().top;
	let offset = navbar.clientHeight;
}