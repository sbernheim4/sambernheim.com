
import React, { useEffect } from "react";
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


export default function LandingPage() {

	const landingPageSection = React.createRef();

	const updateBackgroundImage = () => {
		const element = landingPageSection.current;
		const parallaxEffect = -.2
		const offset = 0;

		if (!isMobile.any()) {
			element.style.backgroundPositionY = `calc(${parallaxEffect * window.scrollY}px + ${offset}px)`;
		}

	}

	useEffect(() => {
		window.addEventListener('scroll', updateBackgroundImage);

		return window.removeEventListener('scroll', updateBackgroundImage);
	}, []);


	return (
		<section ref={landingPageSection} className='landing'>
			<div className='landing--text'>
				<h1>Samuel Bernheim</h1>
				<p>Software Engineer at Disney Streaming Services</p>
			</div>
		</section>
	);
}
