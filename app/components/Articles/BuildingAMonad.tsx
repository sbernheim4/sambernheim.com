import { Remarkable } from 'remarkable';
import hljs from 'highlight.js';

const markdown = `
# Building a Monad

We're going to build a new monad. To get there, we'll explore creating a means of tracking analytics events and start with some simple solutions that will eventually coalesce into our monad.

Let's assume we have a function \`track\` that fires off analytics event to some backend service. The exact implementation is fairly arbitrary. Consider the below example:

~~~ts
const track = ({ functionName, args }) => {

    // An extremely naive approach. This would really consist of firing off a
    // network request to a backend service with a payload containing this data.

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

This implementation allows us to track what function was called and with what argument(s). We aren't however able to include the result of the function call. We're also mixing application code with analytics code.

This works well for simple cases but can quickly grow out of hand, containing cluttered conditionals as requirements change and eventually becoming a tangled mess as the two concerns grow and deviate in different ways.

## With Higher Ordered Functions

We should aim to decouple these two concerns - application and analytics code - and build a loosely coupled but cohesive system that can easily handle new requirements. We can do so with a simple improvement that also exposes the return value of the original function to \`track\`, providing more capability to our analytics suite.

~~~ts
// Update our track function to accept a 3rd parameter - the result of the
// function call
const track = ({ functionName, args, result }) => {

  console.log(functionName, args, result);

};

// Write a higher order function that wraps an arbitrary function and invokes
// the \`track\` function.
const withTracking = (originalFunction) => {

    // Create a new function
    const wrappedOriginalFunction = (...args) => {

        // That invokes the original function
        const result = originalFunction(...args);

        // And that invokes the track function
        track({
            functionName: originalFunction.name,
            args,
            result
        });

        // And returns the result of the original function
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

// Invoke it just like normal
trackedAddThree(3) // => returns 6 and logs "addThree, [ 3 ], 6"
~~~

With this approach we better isolate the analytics and application code. \`track\` can also leverage the arguments and return value to replicate logic in the original function or outline distinct code paths. Changes to one can be made without affecting the other.

When calling \`addThree\` with a number less than 10, we may want to pass one message to the analytics event versus when \`addThree\` is called with a value greater than 10. We can further encode this business logic in a function and pass that function to \`withTracking\`  that constructs the analytics event to pass to track.

~~~ts
// A function that constructs a custom analytics event payload for when addThree
// is invoked. It will have access to the function name, arguments, and return
// value.
const createAdd3AnalyticsEvent = (functionName, args, result) => {
    return {
        functionName: functionName,
        // We rename the property args to info
        info: args[0] < 10 ? 'less than 10' : '10 or more',
        result
    };
};
~~~

We update \`withTracking\` to accept a 2nd parameter which will be a function that constructs the analytics event to pass to \`track\`.

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

Using these updated implementations is simple.

~~~ts
// Application function to be tracked
const addThree = val => val + 3

// Construct a tracked version of the application code.
const trackedAddThree = withTracking(addThree, createAdd3AnalyticsEvent);

// Invoke the tracked version of our application code function
trackedAddThree(10)
// => returns 13 and calls track with
// { functionName: addThree, info: '10 or more', result: 13 }

trackedAddThree(5) // => { functionName: addThree, info: 'less than 10', result: 8 }
// => returns 8 and calls track with
// { functionName: addThree, info: '10 or more', result: 8 }

// Or invoke the original function when no analytics are needed:
addThree(12) // => 15
~~~

We can see the event payload differs based on the argument to our function! More broadly, this allows us to incorporate custom logic to the analytics code without any changes to the \`withTracking\` implementation or the underlying application code. These 2 concerns remain decoupled. The only function that would need to be updated is \`createAdd3AnalyticsEvent\`.

Of course, a different implementation of \`createAdd3AnalyticsEvent\` may be needed for each application code function, but each of these functions replace logic that would otherwise be embeded directly in that same application code.

In this solution, every domain specific function becomes pure, vastly simplifying tests and future updates. Invocations of \`track\` are isolated to the higher order function leaving all the remaining code pure.

We've come a long way. This solution works well for most use cases but there is one major limitation. Consider the following function

~~~ts
const addThreeAndRandom = (val) => {
    const randomNumber = Math.random();

    return val + 3 + randomNumber;
};
~~~

With our existing implementations, we would not be able to capture the value for \`randomNumber\` to include in the analytics event passed to \`track\`. More broadly, data constructed in the body of the application code is not available to the \`track\` function and cannot be included in the track event.

To get this data in the analytics event (instead of a random number it could be the result of another function call, a network request, reorganized data etc) some changes are needed. Since \`withTracking\` has access to the return value of the function it's calling, we can sneak the internal data (\`randomNumber\` in this case) onto the return value by changing the return type from a number to an object.

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

// Update createAdd3AnalyticsEvent to pull randomNumber off the return type of
// the original function and use it to construct the analytics event object.
const createAdd3AnalyticsEvent = (functionName, args, returnValue) => {
    return {
        name: functionName,
        info: args[0] < 10 ? 'less than 10' : '10 or more',
        privateData: returnValue.__trackingInfo
        result: returnValue.result
    };
};

// Update withTracking to return just the actual result and not the object with
// the __trackingInfo property
const withTracking = (originalFunction, constructAnalyticsEvent) => {

    return (...args) => {

        const returnValue = originalFunction(...args);

        track(
            constructAnalyticsEvent(
                originalFunction.name,
                args,
                returnValue.__trackingInfo
            )
        );

        // Return just the actual value and not the object so callers of tracked
        // verions of the function work as expected.
        return returnValue.result

    };

};
~~~

This has a lot of changes. And it's starting to get gnarly. All of a sudden we have to return objects instead of values, include a \`__trackingInfo\` property on that returned object, and now our application code is once again littered with analytics code - exactly what we wanted to avoid. This approach has the distinct advantage however of working and solving our problem.

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
const trackedMultiplyBy5AndRandom = withTracking(
    multiplyBy5AndRandom,
    createMultiplyBy5Event
);
~~~

We also should aim to preserve composition. By changing the return type of \`addThree\` to an object instead of a number, it can no longer be composed with other functions expecting to receive a number as an argument.

Composing our two functions - \`addThreeAndRandom\` and \`createMultiplyBy5Event\` - is not directly possible. Trying to do so would throw an error.

~~~ts
const myNum = multiplyBy5AndRandom(addThreeAndRandom(3)) // => Throws an error
~~~

The result of \`addThreeAndRandom\` is an object and \`multiplyBy5AndRandom\` expects a number. The tracked versions of these functions however are composable:

~~~ts
const trackedMultiplyBy5AndRandom = withTracking(
    multiplyBy5AndRandom,
    createMultiplyBy5Event
);

const trackedAddThree = withTracking(
    addThreeAndRandom,
    createAdd3AnalyticsEvent
);

const myNum = trackedMultiplyBy5AndRandom(trackedAddThree(3)) // => 30.34325
~~~

This all works, but like when we added the \`__trackingInfo\` property, feels clunky.

It'd be nicer to imagine something like:

~~~ts
const number = addThreeAndRandom(3)
    .then(multiplyBy5AndRandom)
    .then(addThreeAndRandom);
~~~

But in this example. there's no reference to \`withTracking\`. The \`randomNumber\` that we wanted to track is nowhere to be seen. And there's no call to the \`track\` function.

To enable this behavior requires a more formal abstratction than the functions we've been working with - higher ordered or otherwise.

## Building a Trackable Class

To enable the described behavior we need a better abstraction beyond \`withTracking\`.

We already have a pseudo special type - objects with a \`__trackingInfo\` property - and we want to add something like this \`.then\` method, even if we're not quire sure how it should work yet. We're also storing some stateful information, the value returned by these functions and their associated analytics events from each additional function invocation. We can formalize these relationships and capabilties in a class.

~~~ts
class Trackable {

    constructor(value, analyticsEvents) {
        this.value = value;

        // We'll review why this conditional is necessary further on.
        const data = Array.isArray(analyticsEvents) ?
            analyticsEvents :
            [analyticsEvents]

        this.analyticsEvents = data;
    }

    // Some simple helper methods

    getValue() {
        return this.value;
    }

    getAnalyticsEvents() {
        return this.analyticsEvents;
    }

    containsValue() {
        return !!this.getValue();
    }

    toString() {
        return     "value: " + this.getValue() + "\\n" +
            "analyticsEvents: " + this.getAnalyticsEvents()
        ;
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

    const newValue = val * 5 * random;

    return new Trackable(
        newValue,
        // The analytics event for this function call
        {
            functionName: 'multiplyBy5AndRandom',
            arguments: [val],
            result: newValue,
            info: { random }
        }
    );
}
~~~

In the above example, we wanted to create a method called \`then\`, similar to how promises work. We can get that eventually, but it will be much easier to use the method names \`map\` and \`flatMap\`, equivalent to the methods of the same name on Arrays.

Let's add the \`map\` method.

~~~ts
class Trackable {

    // Methods from above ...

    // Just like Array.map, our map method will take a function as an argument,
    // and apply the function to the underlying value.
    map(fn) {

        if (this.containsValue()) {

            // Apply the function to the underlying value
            const transformedValue = fn(this.getValue());

            // Return a Track instance with the transformed value
            // while preserving the existing analytics events.

            return new Trackable (
                transformedValue,
                this.getAnalyticsEvents()
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
Instances of \`Trackables\` can have their underlying value arbitrarily manipulated with our \`map\` method while all the built up analytics events are stored and maintained.

~~~ts
const addThreeAndRandom = (val) => {
    const random = Math.random();

    const newValue = val + 3 + random,

    return new Trackable(
        newValue,
        // The analytics event for this function call
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
// val is still of type Trackable and still contains all the analytics events
~~~

But what if the function passed to \`map\` also returns a \`Trackable\` and it itself should create an analytics event:

~~~ts
const val = addThreeAndRandom(7)
    .map(val => {
        const randomNum2 = Math.random();

        const newValue = val + randomNum2

        return new Trackable(
            newValue,
            // The analytics event for this function call
            {
                functionName: 'addThreeAndRandom',
                arguments: [val],
                result: newValue,
                info: { randomNum2 }
            }
        );
    });
~~~

This would cause an issue where we'd end up with a nested \`Trackable\`. The return value of the function passed to \`map\` (which is a \`Trackable\`) is itself placed into a \`Trackable\` by \`map\` leading to a nested \`Trackable\`.

To avoid this, we need a separate method for specifically this case where the function passed to the method itself returns a \`Trackable\`. We'll call this method \`flatMap\`.

~~~ts
class Trackable {

    // Methods from above ...

    flatMap(fn) {

        if (this.containsValue()) {

            // Get the new Trackable by applying fn to the underlying value (fn
            // returns a Trackable in this case unlike map where fn returns a
            // non Trackable value).
            const newTrackableInstance = fn(this.getValue());

            // Get the new underlying value
            const newUnderlyingValue = newTrackableInstance.getValue();

            // From the note in the constructor before, since we're passing in
            // an array of analytics events, we want to avoid creating a nested
            // array which is why the conditional in the constructor is
            // necessary. We combine the existing analytics events with the new
            // analytics event into a new array.
            const mergedTrackingData = [
                ...this.getAnalyticsEvents(),
                ...newTrackableInstance.getAnalyticsEvents()

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


Using \`flatMap\` for functions that return a \`Trackable\` is simple.

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
        const analyticsEvents = this.getAnalyticsEvents();

        // For every analytics event, invoke the track function
        analyticsEvents.forEach(analyticsEvent => {
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
        // The analytics event for this function call
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
* Implement a \`then\` method that removes the need to distinguish when to call \`map\` vs \`flatMap\`.
* \`run\` could be invoked automatically after each \`map\` or \`flatMap\` call - to avoid building up an array of analytics events. This approach however would go against the idea of doing things lazily that is common in functional programming systems.
* Build up the list of function calls when \`map\` and \`flatMap\` are called so that they are only actually applied once \`run\` is called.

Each of these would lead to slightly different semantics in how instances of the class are used.

The key point is, we've developed a new Monad that doesn't already exist that solves a specific problem. Doing so may not always be necessary, but it's certainly possible to run into situations where creating a monad is beneficial.

## Wrapping Up
In the above example, we're still embedding analytics code - the analytics event payload - in our application payload. This can't be fully avoided, but it can be reduced. To avoid hardcoding the analytics event object (and any surrounding logic), we can move the object construction into its own function like from above:

~~~ts
const constructAddThreeAndRandomAnalyticsEvent = (
    functionName,
    args,
    result,
    info
) => {

    // We can add conditional logic based on the arguments to the original
    // function so this logic doesn't have to go in the application code
    const info = args[0] < 10 ?
        "called with a number less than 10" :
        "called with a number greather than or equal to 10";

    // We can also add conditional logic based on data constructed in
    // the body of the function
    const analyticsEventMessage = info.randomNum > .5 ?
        "Heads" :
        "Tails";

    return {
        functionName,
        args,
        message: analyticsEventMessage
        info,
    }

};

const addThreeAndRandom = (val) => {
    const randomNum = Math.random();

    const newValue = val + 3 + random;

    return new Trackable(
        newValue,
        constructAddThreeAndRandomAnalyticsEvent(
            'addThreeAndRandom',
            args: arguments,
            result: newValue,
            info: { randomNum }
        )
    );
};
~~~

With this final improvement, we've achieved a complete solution for our goal. The analytics code and application code are decoupled. At the same time, we have an easy means for capturing analytics events that expose both the return value and internally constructed data to our analytics code. Our class provides various mechanisms to easily manipulate the underlying value while maintaining list of analytics events. This approcah also enables the ability to drop all the captured analytics events should we need if something goes wrong or should the requirements do so - perhaps through a method like \`forgetAndReturn\`:

~~~ts
class Trackable {

    // Methods from above ...

    forgetAndReturn() {
        // Drop all the built up analytics events
        this.analyticsEvents = [];

        // Return the underlying value
        return this.value;
    }
}
~~~
This method may be useful for when a given flow should only report all the built up analytics events once a specific point in a user flow is reached. If that point is never reached (or bypassed or not relevant) there's no need to fire off the events. It provides a transactional like approach to our system.
`

const md = new Remarkable({
	langPrefix: 'hljs language-',
	highlight: function (str: string, lang: string) {

		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (err) { }
		}

		try {
			return hljs.highlightAuto(str).value;
		} catch (err) { }

		return '';
	}
});

export const BuildingAMonad = md.render(markdown);
