import React, { Component } from "react";
import './about.scss';

class About extends Component {
	constructor(props) {
		super(props);

		this.state = {
			os: "none"
		};

		this.getMobileOperatingSystem = this.getMobileOperatingSystem.bind(this);
	}

	getMobileOperatingSystem() {
		const userAgent = navigator.userAgent || navigator.vendor || window.opera;

		// Windows Phone must come first because its UA also contains "Android"
		if (/windows phone/i.test(userAgent)) {
			this.setState({
				os: "windows"
			});
		}

		if (/android/i.test(userAgent)) {
			this.setState({
				os: "android"
			});
		}

		// iOS detection from: http://stackoverflow.com/a/9039885/177710
		if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
			this.setState({
				os: "ios"
			});
		}
	}

	componentDidMount() {
		this.getMobileOperatingSystem();
	}

	render() {

		return (
			<section className='about'>
				<svg className={this.state.os} viewBox="0 0 500 80">
					<polygon points="40, 80 500, 80 500, 0" />
					<text x="380" y="60" fontSize="24px" fill="black">About Me</text>
				</svg>

				<div>
					<h1>About Me</h1>
					<h2>Hi, I'm Sam</h2>
					<br />
					<p>I live in New York City and work at Disney Streaming Services</p>
					<p>I enjoy lifting and working out, reading fantasy novels, cooking great meals, and watching excellant TV shows</p>
					<p>I also love to build things</p>
				</div>
			</section>

		);
	}
}

export default About;
