import { useState, useEffect } from "react";

export const useProgress = () => {

	const [currentHeight, setCurrentHeight] = useState(window.scrollY);
	const totalHeight = document.documentElement.scrollHeight;

	useEffect(() => {

		const onScroll = () => {
			const newHeight = window.scrollY;

			setCurrentHeight(newHeight);
		};

		window.addEventListener('scroll', onScroll);

		return () => window.removeEventListener('scroll', onScroll);

	});

	const percentageScrolled = currentHeight / totalHeight + .14224446

	return percentageScrolled;

};
