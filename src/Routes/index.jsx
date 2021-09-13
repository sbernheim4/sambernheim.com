/* This is where you declare routes for client side routing and specify which component corresponds to which route */
/* The components for each route should be created in Routes/LazyLoadRoutes.jsx as this will enable lazy loading */
/* Routes or components (like navbar) which you don't want to be lazy loaded can be imported directly in this
 * file and SHOULD NOT be declared in LazyLoadRoutes.jsx
 */

import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import Navbar from './../Navbar/Navbar.jsx';

// Import lazy loaded route components
import { Home, ErrorPage, Blog } from './LazyLoadRoutes.jsx';

class Routes extends Component {
	constructor(props) {
		super(props);
		this.state = {

		}
	}

	render() {


		return (
			<div>
				<Navbar />

				<Switch className="main">
					<Route exact path='/'> <Home/> </Route>
					<Route path='/blog'> <Blog/> </Route>
					<Route> <ErrorPage/> </Route>
				</Switch>

			</div>
		);
	}
}

export default Routes;
