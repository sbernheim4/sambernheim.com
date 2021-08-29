import React from 'react';
import { BlogLink } from './BlogLink.jsx';
import { articles } from "./../articles.config";

import "./article-list.scss";

export const ArticleList = () => {

	return (
		<div className='article-list'>
			<h3>Articles</h3>
			{
				articles.map(article => {
					const { title, to, id } = article;
					return <BlogLink key={id} title={title} to={to} />
				})
			}
		</div>
	)
};
