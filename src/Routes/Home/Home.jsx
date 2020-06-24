import React from "react";
import './home.scss';

import LandingPage from "../../LandingPage/LandingPage.jsx";
import About from "../../About/About.jsx";
import Projects from "../../Projects/Projects.jsx";

export default function() {

	return (

		<section className="home">

			<LandingPage />

			<About />

			<Projects />

		</section>

	);
}
