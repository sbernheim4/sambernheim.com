
import { useEffect, useRef } from "react";

const isMobile = {
	Android: () => navigator.userAgent.match(/Android/i),
	BlackBerry: () => navigator.userAgent.match(/BlackBerry/i),
	iOS: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),
	Opera: () => navigator.userAgent.match(/Opera Mini/i),
	Windows: () => navigator.userAgent.match(/IEMobile/i),
	any: () => (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows())
};

export const LandingPage = () => {

	const landingPageSection = useRef<HTMLElement>(null);

	const updateBackgroundImage = () => {
		const element = landingPageSection.current;
		const parallaxEffect = -.2
		const offset = 0;

		if (!isMobile.any() && element) {
			element.style.backgroundPositionY = `calc(${parallaxEffect * window.scrollY}px + ${offset}px)`;
		}

	}

	useEffect(() => {
		window.addEventListener('scroll', updateBackgroundImage);

		return () => window.removeEventListener('scroll', updateBackgroundImage);
	}, []);


	return (
		<section ref={landingPageSection} className='landing'>
			<div className='landing--text'>
				<h1>Samuel Bernheim</h1>
				<p>Software Engineer @ Balyasny</p>
			</div>
		</section>
	);
};
