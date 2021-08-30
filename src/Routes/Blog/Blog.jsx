import React from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';

import { ArticleList } from './ArticleList/ArticleList.jsx';
import { articles } from "./articles.config";
import { ArticleContainer } from './ArticleContainer/ArticleContainer.jsx';

import "./blog.scss"

export const Blog = () => {

	const location = useLocation();
	const isViewingArticle = location.pathname !== "/blog"

	return (
		<div className='blog'>

			{
				isViewingArticle ?
				null :
				<h1>My Blog</h1>
			}

			{
				/* Hide article list when viewing a specific post */
					isViewingArticle ?
					null :
					<ArticleList />
			}

			<Switch>
				{
					articles.map(article => {
						const { to, Component, id } = article;
						const path = "/blog/" + to

						return (
							<Route key={id} exact path={path}>
								{<ArticleContainer> <Component /> </ArticleContainer>}
							</Route>
						)
					})
				}
			</Switch>


		</div>
	);
};
