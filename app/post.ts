import path from "path";
import { BuildingAMonad } from "./components/Articles/BuildingAMonad";

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
	}
];

export function getPosts(): Array<Post> {
	return articles;
};

export function getPost(slug: string) {

	const article = articles.find(article => article.slug === slug);
	
	return article;
};