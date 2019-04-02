import React, { Component } from "react";
import './home.scss';
import LandingPage from "../../LandingPage/LandingPage.jsx";
import About from "../../About/About.jsx";
import Projects from "../../Projects/Projects.jsx";

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {

		};
	}

	render() {
		return (
			<section className="home">

				<LandingPage />

				<About />

				<Projects />

			</section>
		);
	}
}

export default Home;
