import * as BuildingAMonad from './components/Articles/building-a-monad.mdx';
import * as DebugDrivenDevelopment from './components/Articles/debug-driven-development.mdx';
import * as EngineersSchrodingersCat from './components/Articles/the-engineers-schrodingers-cat.mdx';
import * as MonadsAreMonoidsInTheCategoryOfEndofunctors from './components/Articles/monads-are-monoids-in-the-category-of-endofunctors.mdx';
import * as ThePartyMathTrick from './components/Articles/the-party-math-trick.mdx';

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

const postFromModule = (mod) => {
	return {
		...mod.attributes.meta,
	};
};

const getArticleName = (x) => x.slug;

const mdxArticles = [
	DebugDrivenDevelopment,
	ThePartyMathTrick,
	BuildingAMonad,
	MonadsAreMonoidsInTheCategoryOfEndofunctors,
	EngineersSchrodingersCat
];

const articleData = mdxArticles.map((x) => postFromModule(x));
const articleMap = mdxArticles.reduce((acc, curr) => {
	return {
		...acc,
		[getArticleName(postFromModule(curr))]: curr
	};
}, {});

export const getPosts = (): Post[] => {
	return articleData;
};

export const getPost = (slug: string) => {
	// @ts-ignore
	const article = articleMap[slug];
	return article;
};
