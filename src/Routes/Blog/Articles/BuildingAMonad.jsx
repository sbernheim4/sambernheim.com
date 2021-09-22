import { withStyling } from './../withStyling.jsx';

const markdown = `
# Building a Monad

We're going to build a new monad. To get there, we'll explore creating a means of tracking analytics events and start with some simple solutions that will eventually coalesce into our monad.

Let's assume we have a function \`track\` that fires off analytics event to some backend service. The exact implementation is fairly arbitrary. Consider the below example:

~~~ts
const track = ({ functionName, args }) => {

    // An extremely naive approach. This could be replaced by firing off a network
    // request to a backend service with a payload containing this data.

    console.log(functionName, args);
};


const addThree = (val) => {

    // Using the above track function
    track({
        functionName: 'addThree',
        args: [ val ]
    });

    return val + 3;
};
~~~

This implementation allows us to track what function was called and with what argument(s). We aren't however able to include the result of the function call. We're also mixing application code with analytics code. This works well for simple cases but can quickly grow out of hand, containing cluttered conditionals as requirements change and eventually becoming a tangled mess as the two concerns grow and deviate in different ways.

## Using Higher Ordered Functions

We should aim to decouple these two concerns - application and analytics code - and build a loosely coupled but cohesive system that can easily handle and new requirements. We can do so with a simple improvement that also exposes the return value of the function to \`track\` providing more information to our analytics suite.

~~~ts
// Update our track function to accept a 3rd value - the result of the
// function call
const track = ({ functionName, args, result }) => {

  console.log(functionName, args, result);

};

// Write a higher order function that wraps an arbitrary function and invokes
// the \`track\` function.
const withTracking = (originalFunction) => {

	const wrappedOriginalFunction (...args) => {

		// Invoke the original function
		const result = originalFunction(...args);

		// Invoke the track function with all the data
		track({
			functionName: originalFunction.name,
			args,
			result
		});

		// Return the result of the original function
		return result

	};

	// Return the above function
	return wrappedOriginalFunction;

};

// Application code becomes pure with no embeded analytics code
const addThree = (val) => {
    return val + 3;
};

// Construct a tracked version of our application code using the higher order
// function
const trackedAddThree = withTracking(addThree);

// invoke it just like normal
trackedAddThree(3) // => returns 6 and logs "addThree, 3, 6"
~~~

We create a higher order function - \`withTracking\` - that consumes a function, and returns a function. The function it returns calls the original function along with the \`track\` function, and returns the result.

With this approach we no longer mix analytics and application code. \`track\` can also leverage the return value to replicate logic in the original function or outline distinct code paths.

When calling \`addThree\` with a number less than 10, we may want to pass one message to the analytics event versus when \`addThree\` is called for a value greater than 10. We can further encode this business logic in a function and pass that function to \`withTracking\`  that constructs the analytics event to pass to track.

~~~ts
// A function that constructs a custom analytics event payload for when addThree is invoked.
// It will have access to the function name, arguments, and return value.
const createTrack3AnalyticsEvent = (functionName, args, result) => {
    return {
        functionName: functionName,
        // We rename the property args to info
        info: args[0] < 10 ? 'less than 10' : '10 or more',
        result
    };
};
~~~

We can update \`withTracking\` to accept a 2nd parameter which will be a function that constructs the analytics event to pass to \`track\`.

~~~ts
const withTracking = (originalFunction, constructAnalyticsEvent) => {

	return (...args) => {

		const result = originalFunction(...args);

		track(
			// Call the passed in function to construct the analytics event
			// passing in the function name, arguments, and return value
			constructAnalyticsEvent(
				originalFunction.name,
				args,
				result
			)
		);

		return result;

	};

};
~~~

Using these updated implementations becomes fairly simple.

~~~ts
// Application code function to be tracked
const addThree = val => val + 3

// Construct a tracked version of the application code.
const trackedAddThree = withTracking(addThree, createTrack3AnalyticsEvent);

// Invoke the traced version of our application code function
//
trackedAddThree(10)
// => returns 13 and calls track with
// { functionName: addThree, info: '10 or more', result: 13 }

trackedAddThree(5) // => { functionName: addThree, info: 'less than 10', result: 8 }
// => returns 8 and calls track with
// { functionName: addThree, info: '10 or more', result: 8 }
~~~

We can see the event payload differs based on the argument to our function! More broadly, this allows us to incorporate any custom logic to the analytics code without any changes to the \`withTracking\` implementation or the underlying application code. These 2 concerns remain decoupled. The only function that would need to be updated is \`createTrack3AnalyticsEvent\`.

Of course, a different implementation of \`createTrack3AnalyticsEvent\` may be needed for each application code function, but each of these functions replaces logic that would otherwise be embeded directly in that same application code.

In this solution, every domain specific function becomes pure, vastly simplifying tests and future updates. Invocations of \`track\` are isolated to the higher order function leaving all the remaining code pure.

We've come a long way. This solution works well for most use cases but there is one major limitation. Consider the following function:

~~~ts
const addThreeAndRandom = (val) => {
    const randomNumber = Math.random();

    return val + 3 + randomNumber;
};
~~~

With our existing implementations, we would not be able to capture the value for \`randomNumber\` to include in the analytics event passed to \`track\`. More broadly, data constructed in the body of the application code is not available to the \`track\` function and cannot be included in the track event.

Since \`withTracking\` has access to the return value of the function it's calling, we can sneak the internally constructed data (\`randomNumber\`) onto the return type by changing the return type from a number to an object.

~~~ts

// Update addThreeAndRandom to return an object that also contains the
// internally constructed data:
const addThreeAndRandom = (val) => {
    const randomNumber = Math.random();

    return {
        result: val + 3 + randomNumber,
        __trackingInfo: { randomNumber }
    };
};

// Update createTrack3AnalyticsEvent to pull randomNumber off the return type of
// the original function and use it to construct the analytics event object.
const createTrack3AnalyticsEvent = (functionName, args, returnValue) => {
    return {
        name: functionName,
        info: args[0] < 10 ? 'less than 10' : '10 or more',
        privateData: returnValue.__trackingInfo
        result: returnValue.result
    };
};

// Update withTracking to return just the actual result and not the object
const withTracking = (originalFunction, constructAnalyticsEvent) => {

	return (...args) => {

		const result = originalFunction(...args);

		track(
			constructAnalyticsEvent(
				originalFunction.name,
				args,
				result
			)
		);

		// Return just the actual value and not the object so callers of tracked
		// verions of the function work as expected.
		return returnValue.result

	};

};
~~~

This has a lot of changes. And it's starting to get gnarly. All of a sudden we have to return objects instead of values, include a \`__trackingInfo\` property on that returned object, and now our application code is once again littered with analytics code - exactly what we wanted to avoid.

~~~ts
// Application code now returns an object instead of just a number
const multiplyBy5AndRandom = (val) => {
    const random = Math.random();

    return {
        result: val * 5 * random
        __trackingInfo: { random }
    };
};

// Create the analytics event for multiplyBy5AndRandom
const createMultiplyBy5Event = (functionName, args, result) => {
    return {
        name: functionName,
        info: args[0] < 3 ? 'called with a number less than 3' : 'more than 3',
        result
    }:
};
~~~

Tracking calls to \`createMultiplyBy5Event\` is trivial just as before.

~~~ts
const trackedMultiplyBy5AndRandom = withTracking(multiplyBy5AndRandom, createMultiplyBy5Event);
~~~

We also want to care about preserving composition. By changing the return type of \`addThree\` to an object instead of a number, it can no longer be composed with other functions expecting to receive a number as an argument.

Composing our two functions - \`addThreeAndRandom\` and \`createMultiplyBy5Event\` - is not directly possible. Trying to do so would throw an error.

~~~ts
const myNum = multiplyBy5AndRandom(addThreeAndRandom(3)) // => Throws an error
~~~

The result of \`addThreeAndRandom\` is an object and \`multiplyBy5AndRandom\` expects a number. The tracked versions of these functions however are composable:

~~~ts
const trackedMultiplyBy5AndRandom = withTracking(multiplyBy5AndRandom, createMultiplyBy5Event);
const trackedAddThree = withTracking(addThreeAndRandom, createTrack3AnalyticsEvent);

const myNum = trackedMultiplyBy5AndRandom(trackedAddThree(3)) // => 30.34325
~~~

This all works, but like when we added the \`__trackingInfo\` property, feels clunky.

It'd be nicer to imagine something like:

~~~ts
const number = addThreeAndRandom(3)
    .then(multiplyBy5AndRandom)
    .then(addThreeAndRandom);
~~~

But in the above example. there's no reference to \`withTracking\`. The \`randomNumber\` that we wanted to track is nowhere to be seen.

To enable this behavior requires a more formal abstratction than the functions we've been working with - higher ordered or otherwise.

## Building a Trackable Class

To enable the described behavior we need a better abstraction beyond \`withTracking\`.

We already have a pseudo special type - objects with a \`__trackingInfo\` property - and we want to add something like this \`.then\` method, even if we're not quire sure how it should work yet. We're also storing some stateful information, the value returned by these functions and their associated analytics events from each additional function invocation. We can formalize these relationships and capabilties in a class.

~~~ts
class Trackable {

	constructor(value, trackingData) {
		this.value = value;

		// We'll review why this conditional is necessary further on.
			const tData = Array.isArray(trackingData) ?
			trackingData :
			[trackingData]

		this.trackingData = tData;
	}

	// Some simple helper methods

	getValue() {
		return this.value;
	}

	getTrackingData() {
		return this.trackingData;
	}

	containsValue() {
		return !!this.getValue();
	}

	toString() {
		return { value: this.getValue(), trackingData: this.getTrackingData() };
	}
}
~~~

With our new class, we can update the initial application functions to return instances of \`Trackable\` rather than objects with a \`__trackingInfo\` property.

~~~ts
const addThreeAndRandom = (val) => {
	const random = Math.random();

	const newValue = val + 3 + random;

	return new Trackable(
		newValue,
		// The analytics event for this function call
		{
			functionName: 'addThreeAndRandom',
			arguments: [val],
			result: newValue,
			info: { random }
		}
	);
}

const multiplyBy5AndRandom = (val) => {
	const random = Math.random();

	const newValue = val + 5 + random;

	return new Trackable(
		newValue,
		{
			functionName: 'multiplyBy5AndRandom',
			arguments: [val],
			result: newValue,
			info: { random }
		}
	);
}
~~~

In the above example, we wanted to create a method called \`then\`, similar to how promises work. We can get that eventually, but it will be easier to use the method names \`map\` and \`flatMap\`, equivalent to the methods of the same name on Arrays.

Let's add the \`map\` method

~~~ts
class Trackable {

    // Methods from above ...

	// Just like Array.map, our map method will take a function as an argument,
	// and apply the function to the underlying value

	map(fn) {

		if (this.containsValue()) {

			// Apply the function to the underlying value
			const transformedValue = fn(this.getValue());

			// Return a Track instance with the transformed value
			// while preserving the existing tracking data.

			return new Trackable (
				transformedValue,
				this.getTrackingData()
			);

		} else {

			// If we have no underlying value, fn can't be applied
			// to nothing so just return the current instance for continued safe
			// chaining and to preserve any existing analytics data.

			return this;

		}
	}
}
~~~
This allows us to begin applying functions to the underlying value while preserving all the tracking data we've built up.

~~~ts
const addThreeAndRandom = (val) => {
    const random = Math.random();

	const newValue = val + 3 + random,

    return new Trackable(
		newValue,
		{
			functionName: 'addThreeAndRandom',
			arguments: [val],
			result: NewValue,
			info: { random }
		}
    );
}

const val = addThreeAndRandom(7)
	.map(val => val + 12) // Add 12 to the underlying value
	.map(val => val * 2); // Multiple the underlying value by 2
// val is still of type Trackable
~~~

But what if the function passed to \`map\` also returns a trackable?

~~~ts
const val = addThreeAndRandom(7)
	.map(val => {
		const randomNum2 = Math.random();

		const newValue = val + randomNum2

		return new Trackable(
			newValue,
			{
				functionName: 'addThreeAndRandom',
				arguments: [val],
				result: newValue,
				info: { randomNum2 }
			}
		);
	});
~~~

Now we have an issue, since we'd end up with a nested Trackable. The return value of the function passed to \`map\` (which is a Trackable) is itself placed into a \`Trackable\` by \`map\` leading to a nested Trackable.

To avoid this, we add a method for specifically this case where the function passed to the method itself returns a \`Trackable\`. We'll call this method \`flatMap\`.

~~~ts
class Trackable {

    // Methods from above ...

    flatMap(fn) {

        if (this.containsValue()) {

            const newTrackInstance = fn(this.getValue());

            const newUnderlyingValue = newTrackInstance.getValue();

            const newTrackingData = newTrackInstance.getTrackingData();
            const oldTrackingData = this.getTrackingData();

            // From before, since we're passing in an array of tracking data,
            // we want to avoid creating a nested array which is why the
            // conditional in the constructor above is necessary

            const mergedTrackingData = [
                ...oldTrackingData,
                ...newTrackingData
            ];

            return new Trackable(
                newUnderlyingValue,
                mergedTrackingData
            );

        } else {

            // If we have no underlying value then we can't apply fn
            // to nothing so we just return the current instance

            return this;

        }

    }

}
~~~

> \`map\` only works when the function passed to it *does not* return a Trackable instance. More generally, \`map\` only works when the function passed to it does not return an instance of the thing being mapped over. Use \`flatMap\` in those cases.


Using \`flatMap\` for functions that return a Trackable is simple.

~~~ts
const val = addThreeAndRandom(7)
	.flatMap(val => {
		const randomNum2 = Math.random();
		return new Trackable(val * randomNum2, { randomNum2 });
	});
~~~

\`map\` and \`flatMap\` provide mechanisms to easily transform the underlying value while preserving any built up analytics payloads. But we still need a way to send the built up analytics events to our service.

The final step in achieving this is a method that does just that. Let's call it \`run\`.

~~~ts
class Trackable {

    // Methods from above ...

	run() {

		// Get all the built up analytics events
		const trackingData = this.getTrackingData();

		// For every analytics event, invoke the track function

		trackingData.forEach(analyticsEvent => {
			track(analyticsEvent);
		});

		// Finally return the underlying value

		return this.getValue();

	}
}
~~~

Calling \`run\` fires off all the analytics events that have been built up and returns the underlying value. In this system, \`Trackables\` wrap our values in a context with their associated analytics events.

The \`map\` and \`flatMap\` methods provide mechanisms to continuously and safely transform the underlying value while preserving existing analytics events. The analytics events can be fired off at any time by simply calling \`run\` and the underlying value extracted from the \`Trackable\` context.

Finally we have a complete solution. What's left is an abstraction that should feel clean and familiar.

~~~ts
// Normal application code
const subtractSeven = val => val - 7;

const addThreeAndRandom = (val) => {
	const randomNum = Math.random();

	const newValue = val + 3 + random;

	return new Trackable(
		newValue,
		{
			functionName: 'addThreeAndRandom',
			arguments: [val],
			result: newValue,
			info: { randomNum }
		}
	);
};

const res = addThreeAndRandom(2) // addThreeAndRandom: number -> Trackable
    .map(subtractSeven)          // subtractSevent:    number -> number
    .flatMap(addThreeAndRandom)  // addThreeAndRandom: number -> Trackable
    .run(); // Fire all queued track events, returning the wrapped value

console.log(res); // => 13.585 (or some other number - it's partially random!)
~~~

Almost by accident, the \`Trackable\` class is also a monad.

There are some further improvements we could make.

* \`run\` could be updated to accept a custom track function (or default to a standard implementation) so callers have even more control over how any given set of analytics events are handled (sent to different backends or implement different business logic).
* Implement a \`then\` method that automatically and correctly calls \`map\` or \`flatMap\` as appropriate depending on the return type of applying the provided function to the underlying argument.

The key point is, we've developed a new custom Monad that doesn't already exist. Doing so may not always be necessary, but it's certainly possible to run into situations where it's beneficial.
`

export const BuildingAMonad = withStyling(markdown)
