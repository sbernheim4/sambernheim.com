import React from 'react';

import "./article-container.scss";

export const ArticleContainer = (props) => {
	console.log(props)
	return (

		<div className='article-container'>
			{props.children}
		</div>

	);
};
