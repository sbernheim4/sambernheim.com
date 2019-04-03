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
					<h2>Hi</h2>
					<h2>I'm Sam</h2>
					<br/>
					<p>I live in New York City and work at Disney Streaming Services</p>
					<p>I've been interested in computers and programming for as long as I can remember and love learning new technologies.</p>

					<p>Outside of work I love to play soccer, ultimate frisbee, and tennis, as well as ski and kyak.</p>
					<p>I love reading historical fiction and fantasy novels, and am an avid fan of science fiction and politcal TV shows</p>
					<p>I also greatly enjoy following political and economic events, cooking, baking, and of course eating.</p>
				</div>
			</section>

		);
	}
}

export default About;
