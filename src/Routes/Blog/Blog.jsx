import React, { useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { ArticleList } from './ArticleList/ArticleList.jsx';
import { articles } from "./articles.config";
import { ArticleContainer } from './ArticleContainer/ArticleContainer.jsx';

import "./blog.scss"

export const Blog = () => {

	return (
		<div className='blog'>
			<h1>My Blog</h1>

			<ArticleList />

			<Switch>
				{
					articles.map(article => {
						console.log(article)
						const { to, Component, id } = article;
						const path = "/blog/" + to

						return (
							<Route key={id} exact path={path}> {<ArticleContainer> <Component /> </ArticleContainer>} </Route>
						)
					})
				}
			</Switch>


		</div>
	);
};
