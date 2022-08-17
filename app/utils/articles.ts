import * as BuildingAMonad from './../components/Articles/building-a-monad.mdx';
import * as DebugDrivenDevelopment from './../components/Articles/debug-driven-development.mdx';
import * as EngineersSchrodingersCat from './../components/Articles/the-engineers-schrodingers-cat.mdx';
import * as MonadsAreMonoidsInTheCategoryOfEndofunctors from './../components/Articles/monads-are-monoids-in-the-category-of-endofunctors.mdx';
import * as ThePartyMathTrick from './../components/Articles/the-party-math-trick.mdx';
import * as LogAndContinue from './../components/Articles/log-and-continue.mdx';
import type { MDX, Post } from '~/post';

// ts-ignore
export const getArticles: () => MDX[] = () => {

	return [
		LogAndContinue,
		DebugDrivenDevelopment,
		ThePartyMathTrick,
		BuildingAMonad,
		MonadsAreMonoidsInTheCategoryOfEndofunctors,
		EngineersSchrodingersCat
	];
};

export const getPostMetadata = (mod: MDX): Post => {
	return {
		...mod.attributes.meta,
	};
};

export const getArticleData = () => {
	const mdxArticles = getArticles();
	const articleData = mdxArticles.map((x) => getPostMetadata(x));

	return articleData;
};

