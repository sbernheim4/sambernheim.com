import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import { useProgress } from './../hooks/useProgress.js';

import "./navbar.scss";

export default function Navbar() {

	const { pathname } = useLocation();
	const progress = useProgress();
	const [ overrideStyle, setOverrideStyle ] = useState({});

	useEffect(() => {

		if (pathname.includes("blog/")) {

			const maximumNavbarLineWidth = .6;

			setOverrideStyle({
				width: progress * maximumNavbarLineWidth * 100 + "%"
			});

		} else {

			setOverrideStyle({});

		}

	}, [progress, pathname]);

	console.log(overrideStyle);

	return (
		<nav className='navbar'>
			<Link id="main" to='/'>Home</Link>

			<hr style={overrideStyle}/>

			<Link to='/blog'>Blog</Link>
		</nav>
	);
}
