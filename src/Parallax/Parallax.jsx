import React from "react";
import './parallax.scss';

export default function Parallax(props) {

	const { url: backgroundImageUrl } = props;
	const style = { background: `url(${backgroundImageUrl}`, }

	return (
		<section style={style} className='parallax'></section>
	);

}
