import { hydrate } from "react-dom";
import { RemixBrowser } from "@remix-run/react";

const run = () => {
	fetch("https://www.googletagmanager.com/gtag/js?id=G-JTP26ECD1K").then((res) => {
		return res.text();
	}).then((blob) => {
		eval(blob)
		/* @ts-ignore */
		window.dataLayer = window.dataLayer || []
		/* @ts-ignore */
		window.gtag = () => window.dataLayer.push(arguments)
		/* @ts-ignore */
		window.gtag('js', new Date())
		/* @ts-ignore */
		window.gtag('config', 'G-JTP26ECD1K')
	})
};
hydrate(
	<RemixBrowser>
		{run()}
	</RemixBrowser>,
	document
);
