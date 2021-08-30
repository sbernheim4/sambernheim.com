import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import { useProgress } from './../hooks/useProgress.js';

import "./navbar.scss";

export default function Navbar() {

	const [ overrideStyle, setOverrideStyle ] = useState({});
	const { pathname } = useLocation();
	const progress = useProgress();

	useEffect(() => {

		const style = pathname.includes("blog/") ?
			{ width: progress * 100 + "%" } :
			{};

		setOverrideStyle(style);

	}, [progress, pathname]);

	return (
		<nav className='navbar'>
			<Link id="main" to='/'>Home</Link>

			<div className='navbar__line-container'>
				<hr style={overrideStyle}/>
			</div>

			<Link to='/blog'>Blog</Link>
		</nav>
	);
}
