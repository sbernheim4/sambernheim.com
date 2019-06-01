
import React, { Component } from "react";
import './landingPage.scss';

const isMobile = {
	Android: function() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function() {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any: function() {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	}
};


class LandingPage extends Component {
	constructor(props) {
		super(props);

		this.landingPageSection = React.createRef();
		this.updateBackgroundImage = this.updateBackgroundImage.bind(this);

	}

	componentDidMount() {
		window.addEventListener('scroll', this.updateBackgroundImage);
	}


	updateBackgroundImage() {
		// Get the landing page element
		const element = this.landingPageSection.current;

		// Must be between between 1 and -1 exclusive - 0 yields no effect,
		// negative values shift image up as the user scrolls down
		// positive values shift image down as the user scrolls down
		const parallaxEffect = -.5

		// Must be the same as css background-position-y value
		const offset = 0;

		// Update the background-position-y style property using the vertical scroll position only if on desktop
		if (!isMobile.any()) {
			element.style.backgroundPositionY = `calc(${parallaxEffect * window.scrollY}px + ${offset}px)`;
		}

	}

	render() {
		return (
			<section ref={this.landingPageSection} className='landing'>
				<h1>Samuel Bernheim</h1>
				<p>Software Engineer at Disney Streaming Services</p>
			</section>
		);
	}
}

export default LandingPage;
