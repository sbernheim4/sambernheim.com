import * as React from "react";
import { useEffect, useState } from "react";
import {
  Links,
  Link,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  LinksFunction,
  useLocation
} from "remix";
import { useProgress } from "./hooks/useProgress";

import globalStyles from './styles/globals.css';
import navbarStyles from './styles/navbar.css';

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: globalStyles },
		{ rel: 'stylesheet', href: navbarStyles }
	]
};

/**
 * The root module's default export is a component that renders the current
 * route via the `<Outlet />` component. Think of this as the global layout
 * component for your app.
 */
export default function App () {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

const Document = ({
  children,
  title
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  return (
    <html lang="en">

      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>

      <body>
        <Navbar />
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export const Navbar = () => {

	const [ overrideStyle, setOverrideStyle ] = useState({});
	const { pathname } = useLocation();
	const progress = useProgress();
	// const progress = .5;

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

export const CatchBoundary = () => {
  const caught = useCatch();

  let message;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      );
      break;
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      );
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
    </Document>
  );
}

export const ErrorBoundary = ({ error }: { error: Error }) => {
  console.error(error);
  return (
    <Document title="Error!">
        <div>
          <h1>There was an error</h1>
          <p>{error.message}</p>
          <hr />
          <p>
            Hey, developer, you should replace this with what you want your
            users to see.
          </p>
        </div>
    </Document>
  );
}
