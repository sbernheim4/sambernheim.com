import { useState, useEffect } from "react";

export const useProgress = () => {

	const [currentHeight, setCurrentHeight] = useState();
	const totalHeight = document.documentElement.scrollHeight;

	useEffect(() => {
		const onScroll = () => {
			const newHeight = window.scrollY;

			setCurrentHeight(newHeight);
		};

		window.addEventListener('scroll', onScroll);

		return () => window.removeEventListener('scroll', onScroll);

	});

	const percentage = currentHeight / totalHeight + .14224446

	return percentage;

};
