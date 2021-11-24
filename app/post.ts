import path from "path";
import { BuildingAMonad } from "./components/Articles/BuildingAMonad";
import { EngineersSchrodingersCat } from "./components/Articles/EngineersSchrodingersCat";
import { MonadsAreMonoidsInTheCategoryOfEndofunctors } from './components/Articles/MonadsAreMonoidsInTheCategoryOfEndofunctors';

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
		title: "Building a Monad",
		slug: "building-a-monad",
		html: BuildingAMonad,
		id: 3,
		description: "Learn about monads by building a new monad that doesn't exist"
	},
	{
		title: "Monads are Monoids in the Category of Endofunctors",
		slug: "monads-are-monoids-in-the-category-of-endofunctors",
		html: MonadsAreMonoidsInTheCategoryOfEndofunctors,
		id: 2,
		description: "Finally understand what monads are"
	},
	{
		title: "The Engineer's Schrodinger's Cat",
		slug: "the-engineers-schrodingers-cat",
		html: EngineersSchrodingersCat,
		id: 1,
		description: "The Option Monad for Javascript and Typescript"
	}

];

export function getPosts(): Array<Post> {
	return articles;
};

export function getPost(slug: string) {

	const article = articles.find(article => article.slug === slug);
	
	return article;
};