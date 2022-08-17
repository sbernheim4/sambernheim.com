import { useState } from "react";
import { useActionData, useSubmit } from "@remix-run/react";
import { ActionFunction, json } from "@remix-run/cloudflare";

export const action: ActionFunction = async (args) => {

	return args.request.formData().then(body => {

		// @ts-ignore
		const remainingDigits = JSON.parse(body.get("remainingDigits")) as number[] || []

		const sumOfRemainingDigits = remainingDigits.reduce((acc, curr) => acc + curr, 0);

		// Find the first multiple of 9 larger than sumOfRemainingDigits
		let multiple = 0;
		while (multiple <= sumOfRemainingDigits) {
			multiple += 9;
		}

		const answer = multiple - sumOfRemainingDigits;

		return json({ answer });

	}).catch(() => {
        return json({ answer: "Something went wrong" });
	});
}

const getEventValue = (e: React.ChangeEvent<HTMLInputElement>) => {
	return e.target.value
}

const MathTrick = () => {

	const [initalNumber, setInitialNumber] = useState<number>(0);
	const [scrambledNumber, setScrambledNumber] = useState<number>(0);
	const data = useActionData<{answer: number}>();
	const submit = useSubmit();

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


	const storeRemainingDigits = (digit: number) => {
		const indexOfDigitToExclue = digits.findIndex(val => val === digit);
		const copy = [...digits];
		copy.splice(indexOfDigitToExclue, 1);

		const serializedData = JSON.stringify(copy);
		const formData = new FormData();
		formData.set("remainingDigits", serializedData);
		submit(formData, { method: 'post' })
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
				{digits.filter(digit => digit !== 0 && digit !== 9).map((digit, index) => {
					return (
						<>
							<button onClick={() => storeRemainingDigits(digit)} key={index}>{digit}</button>
						</>
				   )
				})}

			{data?.answer ? <p>You picked {data.answer}</p> : <></>}
		</>
	);

};

export default MathTrick;
