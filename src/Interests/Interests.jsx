import React, { useState } from 'react';

import './interests.scss';

export default function Interests() {

	const [os] = useState(null);

	return (
		<section className='interests'>

			<svg className={os} viewBox="0 0 500 80">
				<polygon points="0, 80 500, 80 0, 0" />
				<text x="0" y="60" fontSize="24px" fill="black">Tools and Interests</text>
			</svg>

			<h1>Tools and Interests</h1>
			<p>I use iTerm2, Neovim, and Tmux. A powerhouse combination</p>
			<p>As an engineer I'm motivated to understand how systems work</p>
			<p>I enjoy learning design and architecture patterns</p>
		</section>
	);

}
