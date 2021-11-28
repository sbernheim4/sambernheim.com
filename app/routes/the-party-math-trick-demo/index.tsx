import { useState } from "react";
import {
    ActionFunction,
    Form,
    json,
    useActionData,
    useFormAction,
    useSubmit
} from "remix";

export const action: ActionFunction = async (args) => {

	return args.request.formData().then(body => {
		console.log("000000000000", body.get("remainingDigits"));

		console.log("--------");
		for (let x of body.values()){
			console.log(x)
		}
		console.log("--------");

		// @ts-ignore
		const remainingDigits = JSON.parse(body.get("remainingDigits")) as number[] || []

		// Sum the digits of the remaining value
		let sumOfRemainingDigits = 0;

		for (let i = 0; i < remainingDigits.length; i++) {
			sumOfRemainingDigits += remainingDigits[i];
		}

		// Find the first multiple of 9 larger than sumOfRemainingDigits
		let multiple = 0;
		while (multiple <= sumOfRemainingDigits) {
			multiple += 9;
		}

		const answer = multiple - sumOfRemainingDigits;

		return json({ answer });

	}).catch(err => {
		console.log("===========", err);
	})
}

const getEventValue = (e: React.ChangeEvent<HTMLInputElement>) => {
	return e.target.value
}

const MathTrick = () => {

	const [initalNumber, setInitialNumber] = useState<number>(0);
	const [scrambledNumber, setScrambledNumber] = useState<number>(0);
	const data = useActionData<{answer: number}>();
	const submit = useSubmit();
	const action = useFormAction();

	const handleInitialNumber = (
		e: React.ChangeEvent<HTMLInputElement>
	) => setInitialNumber(parseInt(getEventValue(e)) || 0);

	const handleScrambledNumber = (
		e: React.ChangeEvent<HTMLInputElement>
	) => setScrambledNumber(parseInt(getEventValue(e)) || 0);

	const subtractionResult = initalNumber > scrambledNumber ?
		initalNumber - scrambledNumber :
		scrambledNumber - initalNumber;

	const digits = Array.from(String(subtractionResult), Number);

	const [ digitsToSubmit, setDigitsToSubmit ] = useState<number[]>([]);

	const storeRemainingDigits = (digit: number) => {
		const indexOfDigitToExclue = digits.findIndex(val => val === digit);
		const copy = [...digits];
		copy.splice(indexOfDigitToExclue, 1);
		setDigitsToSubmit(copy);

		// const serializedData = JSON.stringify(copy);
		// const formData = new FormData();

		// formData.set("remainingDigits", serializedData);

		// for (let x of formData.values()){
		// 	console.log("!!!!!!!!!!!!!")
		// 	console.log(x)
		// 	console.log("!!!!!!!!!!!!!")
		// }

		// submit(formData, {
		// 	method: 'post'
		// 	// action: action + '?_data=routes%2Fthe-party-math-trick-demo%2Findex&index=',
		// })
	};

	const submitRequest = () => {
		const formData = new FormData();
		formData.set("remainingDigits", JSON.stringify(digitsToSubmit));
		submit(formData, { method: 'post', action, replace: true })
	};

	return (
		<>
			<label>Enter a number:</label>
			<input value={initalNumber} onChange={handleInitialNumber} />

			<br />

			<label>Enter a scrambled version of the same number</label>
			<input value={scrambledNumber} onChange={handleScrambledNumber} />

			<p>The result of the subtraction is {subtractionResult}</p>

			<br />

			<p>Select a digit that is not 0 or 9</p>
			<Form method="post" onSubmit={submitRequest}>
				{digits.filter(digit => digit !== 0 && digit !== 9).map((digit, index) => {
					return (
						<>
							<button onClick={() => storeRemainingDigits(digit)} key={index}>{digit}</button>
						</>
				   )
				})}
				<button type='submit'>Submit</button>
			</Form>

			{data?.answer ? <p>You picked {data.answer}</p> : <></>}
		</>
	);

};

export default MathTrick;
