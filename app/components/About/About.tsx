import { useState, useEffect } from "react";

export const About = () => {

	const [os, setOs] = useState('none');

	useEffect(() => {
		getMobileOperatingSystem()
	}, []);

	const getMobileOperatingSystem = () => {
		const userAgent = navigator.userAgent || navigator.vendor;

		// Windows Phone must come first because its UA also contains "Android"
		if (/windows phone/i.test(userAgent)) {
			setOs('windows');
		}

		if (/android/i.test(userAgent)) {
			setOs("android");
		}

		// iOS detection from: http://stackoverflow.com/a/9039885/177710
		if (/iPad|iPhone|iPod/.test(userAgent)) {
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
				<p>I live in New York City and work at Twitter</p>
				<p>Previously Disney Streaming </p>
			</div>
		</section>

	);

}
