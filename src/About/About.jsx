import React, { Component } from "react";
import './about.scss';

class About extends Component {
	constructor(props) {
		super(props);

		this.state = {

		};
	}

	render() {
		let css = '';

		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
			css = "mobile";
		}

		return (
			<section className='about'>
				<svg className={css} viewBox="0 0 500 80">
					<polygon points="40,80 500,80  500,0" />
					<text x="380" y="60" fontSize="24px" fill="black">About Me</text>
				</svg>

				<div>
					<h1>About Me</h1>
					<br/>
					<h2>Hi, I'm Sam</h2>
					<br />
					<p>I live in New York City and work at Disney Streaming Services</p>
					<p>I'm fairly active outside of work</p>
					<p>I enjoy playing soccer and ultimate frisbee, reading fantasy novels, cooking great meals, and watching TV</p>
					<p>I also love to build things</p>
				</div>
			</section>

		);
	}
}

export default About;
