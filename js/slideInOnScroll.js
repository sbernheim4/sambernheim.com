window.addEventListener('load', debounce(slide, 15));
window.addEventListener('scroll', debounce(slide, 15));

var elements = document.querySelectorAll('.slideFromLeft');
var elements2 = document.querySelectorAll('.slideFromRight');

function slide() {
	elements.forEach(element => {
	    // Check to see if the window y position is greater than the top of the element
	    if ((window.scrollY % window.innerHeight / 2) + window.innerHeight * 0.6 > element.getBoundingClientRect().top) {
	      // add the move class to the element
	      element.classList.add('move');
	  	}
	});

	elements2.forEach(element => {
	    // Check to see if the window y position is greater than the top of the element
	    if ((window.scrollY % window.innerHeight / 2) + window.innerHeight * 0.6 > element.getBoundingClientRect().top) {
	      // add the move class to the element
	      element.classList.add('move');
	  	}
	});
}

// Debounce function grabbed from the interweb so the scroll function doesn't fire so often
// ruining performance
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}
