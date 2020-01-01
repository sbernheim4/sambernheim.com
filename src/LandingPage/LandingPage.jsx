
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
		const element = this.landingPageSection.current;
		const parallaxEffect = -.2
		const offset = 0;

		if (!isMobile.any()) {
			element.style.backgroundPositionY = `calc(${parallaxEffect * window.scrollY}px + ${offset}px)`;
		}

	}

	render() {
		return (
			<section ref={this.landingPageSection} className='landing'>
				<div className='landing--text'>
					<h1>Samuel Bernheim</h1>
					<p>Software Engineer at Disney Streaming Services</p>
				</div>
			</section>
		);
	}
}

export default LandingPage;
