import * as BuildingAMonad from './routes/blog/building-a-monad.mdx';
import * as DebugDrivenDevelopment from './routes/blog/debug-driven-development.mdx';
import * as EngineersSchrodingersCat from './routes/blog/the-engineers-schrodingers-cat.mdx';
import * as MonadsAreMonoidsInTheCategoryOfEndofunctors from './routes/blog/monads-are-monoids-in-the-category-of-endofunctors.mdx';
import * as ThePartyMathTrick from './routes/blog/the-party-math-trick.mdx';

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
}


export const getPosts = (): Post[] => {

	const articles = [
		postFromModule(DebugDrivenDevelopment),
		postFromModule(ThePartyMathTrick),
		postFromModule(BuildingAMonad),
		postFromModule(MonadsAreMonoidsInTheCategoryOfEndofunctors),
		postFromModule(EngineersSchrodingersCat)
	];

	return articles;
};
