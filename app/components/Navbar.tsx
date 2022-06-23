import { LinksFunction } from "@remix-run/node";
import { Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useProgress } from "~/hooks/useProgress";
import navbarStyles from './../styles/navbar.css';

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: navbarStyles }
	]
};

export const Navbar = () => {

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

