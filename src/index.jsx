/* Here we are binding React (and the client side routing via react-router-dom) to the HTML file to an
 * element with an ID of `root` and setting up
 */

import React from "react";
import ReactDOM from "react-dom";

import { HashRouter } from 'react-router-dom'

import "./styles/reset.css";

/* App is the entry point to the React code.*/
import Routes from './Routes/index.jsx';

ReactDOM.render(
	<HashRouter basename="/">
		<Routes />
	</HashRouter>
	,document.getElementById("root")
);
