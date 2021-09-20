import { EngineersSchrodingersCat } from './Articles/EngineersSchrodingersCat.jsx';
import { MonadsAreMonoidsInTheCategoryOfEndofunctors } from './Articles/MonadsAreMonoidsInTheCategoryOfEndofunctors.jsx';
import { BuildingAMonad } from './Articles/BuildingAMonad.jsx';

export const articles = [
	{
		title: "Building a Monad",
		to: "building-a-monad",
		Component: BuildingAMonad,
		id: 3
	},
	{
		title: "Monads are Monoids in the Category of Endofunctors",
		to: "monads-are-monoids-in-the-category-of-endofunctors",
		Component: MonadsAreMonoidsInTheCategoryOfEndofunctors,
		id: 2
	},
	{
		title: "The Engineer's Schrodinger's Cat",
		to: "the-engineers-schrodingers-cat",
		Component: EngineersSchrodingersCat,
		id: 1
	}
]
