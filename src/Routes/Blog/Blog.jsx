import React from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { Helmet } from "react-helmet";

import { ArticleList } from './ArticleList/ArticleList.jsx';
import { articles } from "./articles.config";
import { ArticleContainer } from './ArticleContainer/ArticleContainer.jsx';

import "./blog.scss"

export default () => {

	const location = useLocation();
	const isViewingArticle = location.pathname !== "/blog"

	return (
		<div className='blog'>

			{
				/* Only show when not viewing a specific article */
				isViewingArticle ? null : <h1>My Blog</h1>
			}

			{
				/* Hide article list when viewing a specific post */
				isViewingArticle ? null : <ArticleList />
			}

			<Switch>
				{
					articles.map(article => {
						const { to, Component, id } = article;
						const path = "/blog/" + to

						return (
							<Route key={id} exact path={path}>
								<Helmet>
									<title>{article.title}</title>
									<link rel="cannonical" href={`https://sambernheim.com/#/blog/${article.to}`} />
								</Helmet>

								<ArticleContainer>
									<Component />
								</ArticleContainer>
							</Route>
						)
					})
				}
			</Switch>
		</div>
	);
};
