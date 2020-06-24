import React, { useState, useEffect } from "react";

import './about.scss';

export default function About() {

	const [os, setOs] = useState('none');

	useEffect(() => {
		getMobileOperatingSystem()
	}, []);

	const getMobileOperatingSystem = () => {
		const userAgent = navigator.userAgent || navigator.vendor || window.opera;

		// Windows Phone must come first because its UA also contains "Android"
		if (/windows phone/i.test(userAgent)) {
			setOs('windows');
		}

		if (/android/i.test(userAgent)) {
			setOs("android");
		}

		// iOS detection from: http://stackoverflow.com/a/9039885/177710
		if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
			setOs('ios');
		}
	}

	return (
		<section className='about'>
			<svg className={os} viewBox="0 0 500 80">
				<polygon points="40, 80 500, 80 500, 0" />
				<text x="380" y="60" fontSize="24px" fill="black">About Me</text>
			</svg>

			<div>
				<h1>About Me</h1>
				<h2>Hi, I'm Sam</h2>
				<p>I live in New York City and work at Disney Streaming Services</p>
				<p>I enjoy lifting and working out, reading fantasy novels, cooking great meals, and watching excellant TV shows</p>
				<p>I also love to build things</p>
			</div>
		</section>

	);

}
