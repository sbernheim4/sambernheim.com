import { BuildingAMonad } from "./components/Articles/BuildingAMonad";
import { DebugDrivenDevelopment } from "./components/Articles/DebugDrivenDevelopment";
import { EngineersSchrodingersCat } from "./components/Articles/EngineersSchrodingersCat";
import { MonadsAreMonoidsInTheCategoryOfEndofunctors } from './components/Articles/MonadsAreMonoidsInTheCategoryOfEndofunctors';
import { ThePartyMathTrick } from "./components/Articles/ThePartyMathTrick";

export type Post = {
	slug: string;
	title: string;
	id: number;
	html: string;
	description: string;
};

export type PostMarkdownAttributes = {
	title: string;
};

const articles: Array<Post> = [
	{
		title: "Debug Driven Development",
		slug: "debug-driven-development",
		html: DebugDrivenDevelopment,
		id: 5,
		description: "Optimizing for clarity and debugability"
	},
	{
		title: "The Party Math Trick",
		slug: "the-party-math-trick",
		html: ThePartyMathTrick,
		id: 4,
		description: "An Math Trick with Some Interesting Properties"
	},
	{
		title: "Building a Monad",
		slug: "building-a-monad",
		html: BuildingAMonad,
		id: 3,
		description: "An Intuitive way to Understand Monads"
	},
	{
		title: "Monads are Monoids in the Category of Endofunctors",
		slug: "monads-are-monoids-in-the-category-of-endofunctors",
		html: MonadsAreMonoidsInTheCategoryOfEndofunctors,
		id: 2,
		description: "What Makes a Monad Monadic"
	},
	{
		title: "The Engineer's Schrodinger's Cat",
		slug: "the-engineers-schrodingers-cat",
		html: EngineersSchrodingersCat,
		id: 1,
		description: "Excoptional: The Option Object for JavaScript and TypeScript"
	}

];

export function getPosts(): Array<Post> {
	return articles;
};

export function getPost(slug: string) {

	const article = articles.find(article => article.slug === slug);

	return article;
};
