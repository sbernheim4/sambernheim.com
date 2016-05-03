var screenWidth = window.innerWidth;

console.log(screenWidth);

if (screenWidth <= 768) {
	console.log("MOBILE");
	document.getElementById("nav-bar").innerHTML = "<div id='mobile-list' class='dropdown'><button class='btn btn-default dropdown-toggle' type='button' id='dropdownMenu1' data-toggle='dropdown' aria-haspopup='true' aria-expanded='true'>Dropdown<span class='caret'></span></button><ul class='dropdown-menu' aria-labelledby='dropdownMenu1'><li><a class='smoothScroll' href='#about'>About</a></li><li><a class='smoothScroll' href='#'>Education</a></li><li><a class='smoothScroll' href='#'>Interests</a></li></ul></div>";
} else {
	console.log("DESKTOP");
	document.getElementById("nav-bar").innerHTML = "<nav id='browser-list' class='navbar navbar-collapse navbar-default navbar-static-top custom-nav'><div class='container'><ul class='nav navbar-nav'><li><a class='smoothScroll' href='#about'>About</a></li><li><a class='smoothScroll' href='#'>Education</a></li><li><a class='smoothScroll' href='#'>Interests</a></li></ul></div></nav>";
}
