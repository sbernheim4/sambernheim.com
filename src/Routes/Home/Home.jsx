import React from "react";
import './home.scss';

import LandingPage from "../../LandingPage/LandingPage.jsx";
import About from "../../About/About.jsx";

export default function() {

	return (

		<section className="home">

			<LandingPage />

			<About />

		</section>

	);
}
