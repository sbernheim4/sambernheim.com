import React from 'react';
import { Link } from 'react-router-dom';

export const BlogLink = (props) => {

	return (
		<div className='article-list__link'>
			<Link to={'/blog/' + props.to}>{props.title}</Link>
		</div>
	);

}
