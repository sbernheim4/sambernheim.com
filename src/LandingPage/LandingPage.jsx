
import React, { Component } from "react";
import './landingPage.scss';

class LandingPage extends Component {
	constructor(props) {
		super(props);

		this.state = {

		};
	}

	render() {
        return (
            <section className='landing'>
                <h1>Samuel Bernheim</h1>
                <p>Software Engineer at Disney Streaming Services</p>
            </section>
        );
    }
}

export default LandingPage;
