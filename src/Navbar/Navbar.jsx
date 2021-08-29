import React from "react";
import { Link } from 'react-router-dom';

import "./navbar.css";

export default function Navbar() {

	return (
		<nav className='navbar'>
			<Link id="main" to='/'>Home</Link>

			<hr/>

			<Link to='/blog'>Blog</Link>
		</nav>
	);
}
