import { useEffect, useState } from "react";

const getWindow = () => {
	try {
		return window
	} catch (err) {
		return {
			scrollY: 0,
			innerHeight: 0,
			addEventListener: () => {},
			removeEventListener: () => {}
		};
	}
}

const getDocument = () => {
	try {
		return document
	} catch (err) {
		return {
			documentElement: {
				scrollHeight: 0
			}
		}
	}
}

export const useProgress = () => {

	const shadowWindow = getWindow();
	const shadowDocument = getDocument();

	const initialHeight = !!shadowWindow ?
		shadowWindow.scrollY + shadowWindow.innerHeight :
		0;
	const [currentHeight, setCurrentHeight] = useState(initialHeight);
	const totalHeight = shadowDocument.documentElement.scrollHeight;

	useEffect(() => {

		const onScroll = () => {
			const newHeight = shadowWindow ? shadowWindow.scrollY + shadowWindow.innerHeight : 0;

			setCurrentHeight(newHeight);
		};

		shadowWindow ? shadowWindow.addEventListener('scroll', onScroll) : () => {};

		return () => shadowWindow.removeEventListener('scroll', onScroll);

	}, []);

	return currentHeight / totalHeight;

};
