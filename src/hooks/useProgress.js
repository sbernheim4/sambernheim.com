import { useState, useEffect } from "react";

export const useProgress = () => {

	const [currentHeight, setCurrentHeight] = useState(window.scrollY + window.innerHeight);
	const totalHeight = document.documentElement.scrollHeight;

	useEffect(() => {

		const onScroll = () => {
			const newHeight = window.scrollY + window.innerHeight;

			setCurrentHeight(newHeight);
		};

		window.addEventListener('scroll', onScroll);

		return () => window.removeEventListener('scroll', onScroll);

	}, []);

	return currentHeight / totalHeight;

};
