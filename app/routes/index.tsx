import { LinksFunction, MetaFunction } from "remix";
import { About } from "~/components/About/About";
import { LandingPage } from "~/components/LandingPage/LandingPage";
import aboutStyles from './../components/About/styles/about.css';
import landingStyles from './../components/LandingPage/styles/landingPage.css';

export const meta: MetaFunction = () => {
	return {
		title: "Samuel Bernheim - Software Engineer @ Wunderkind",
		description: "Software engineer @ Wunderkind"
	};
};

export const links: LinksFunction = () => {
	return [
		{ rel: "stylesheet", href: landingStyles },
		{ rel: "stylesheet", href: aboutStyles }
	];
};

export default function Index() {
	return (

		<section className="home">

			<LandingPage />

			<About />

		</section>

	);
}
