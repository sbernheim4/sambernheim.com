import { getArticles } from './utils/articles';

export type Post = {
	description: string;
	slug: string;
	title: string;
};

export type MDX = {
	attributes: {
		meta: Post;
		headers: Headers;
	};
	default: () => JSX.Element;
	filename: string;
	headers: Headers
	links: Record<string, string>;
	meta: Post
};

export const getPostMetadata = (mod: MDX): Post => {
	return {
		...mod.attributes.meta,
	};
};

const getArticleSlug = (x: Post) => x.slug;

const articleData = getArticles().map((x) => getPostMetadata(x));

export const articleMap = getArticles().reduce((acc, curr) => {
	return {
		...acc,
		[getArticleSlug(getPostMetadata(curr))]: curr
	};
}, {} as Record<string, MDX | undefined>);

export const getPosts = (): Post[] => {
	return articleData;
};

export const getPost = (slug: string | undefined): undefined | MDX => {
	if (!slug) {
		return undefined;
	}

	const article = articleMap[slug]

	return article;
};
