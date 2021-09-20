import { withStyling } from './../withStyling.jsx';

const markdown = `
# Building a Monad

We're going to build a new monad. To get there, we'll explore creating a means of tracking analytics events and start with some simple solutions that will eventually coalesce into a class that will become a monad.

Let's assume we have a function \`track\` that fires off analytics event to some backend service. The exact implementation is fairly arbitrary. Consider the below example:

~~~ts
const track = ({ functionName, functionArguments }) => {

    // An extremely naive approach. This could be replaced by firing off a network
    // request to a backend service with a payload containing this data.

    console.log(functionName, functionArguments);
};


const addThree = (val) => {

    // Using the above track function
    track({
        functionName: 'addThree',
        functionArguments: val
    });

    return val + 3;
};
~~~

This implementation allows us to track what function was called and with what argument(s). We aren't however able to include the result of the function call. We also are mixing application code and logic with analytics code and logic. This works well for simple cases but can quickly grow to contain cluttered conditionals as requirements change.

We should aim to decouple these two concerns - application and analytics code - and build a loosely coupled but cohesive implementation. We can do so with a simple improvement that also exposes the return value to \`track\`.

~~~ts
// Update our track function to accept a 3rd value - the result of the
// function call
const track = ({ functionName, functionArguments, result }) => {

  console.log(functionName, functionArguments, result);

};

const withTracking = (originalFunction) => {

    return (...args) => {

        const result = originalFunction(...args);

        track({
            functionName: originalFunction.name,
            functionArguments: args,
            result
        });

        return result

    };

};


// Application code remains pure with no embeded analytics code
const addThree = (val) => {
    return val + 3;
};

// Construct a tracked version of our application code
const trackedAddThree = withTracking(addThree);

// invoke it just like normal
trackedAddThree(3) // => returns 6 and logs "addThree, 3, 6"
~~~

We create a higher order function - \`withTracking\` - that consumes a function, and returns a function. The function it returns calls the original function along with the \`track\` function, and returns the result.

With this approach we no longer mix analytics and application code. \`track\` can also leverage the return value to replicate logic in the original function or outline distinct code paths.

For example, when calling \`addThree\` with a number less than 10, we may want to use one message in the analytics event from when \`addThree\` is called for a value greater than 10. We can encode these rules in a function and pass that function to \`withTracking\` to invoke on our behalf.

~~~ts
// A function that implements custom logic for addThree.
// It constructs a track event based on the argument to addThree.
const createTrackingEvent = (functionName, args, returnValue) => {
    return {
        functionName: functionName,
        // We rename the property functionArguments to info
        info: args[0] < 10 ? 'less than 10' : '10 or more',
        result: returnValue
    };
};
~~~

We can update \`withTracking\` to accept a 2nd parameter which will be the event creating function and pass in \`createTrackingEvent\`.

~~~ts
const withTracking = (originalFunction, createTrackingEvent) => {

    return (...args) => {

        const returnValue = originalFunction(...args);

        track(
            createTrackingEvent(
                originalFunction.name,
                args,
                returnValue
            )
        );

        return returnValue;

    };

};
~~~

Using our updated implementaionts we get the following.

~~~ts
const addThree = val => val + 3

const trackedAddThree = withTracking(addThree, createTrackingEvent);

trackedAddThree(10) // => { functionName: addThree, info: '10 or more', result: 13 }
trackedAddThree(5) // => { functionName: addThree, info: 'less than 10', result: 8 }
~~~

We can see the event payload differs based on the argument to our function! More broadly, this allows us to incorporate any custom logic to the analytics code without any changes to withTracking or the underlying application code. These 2 concerns remain decoupled.

The only piece that will need updating is the implementation of \`createTrackingEvent\`. Of course, a different implementation of \`createTrackingEvent\` may be needed for each application code related function, but each of these functions replaces logic that would otherwise be embeded directly in that same application code. Should the requirements around how events should be recorded change, only the event creation function will need to be updated.

In this solution, every domain specific function becomes pure, vastly simplifying tests and future updates. Invocations of \`track\` are isolated to the higher order function leaving all the remaining code pure.

We've come pretty far. This solution works well for most use cases but there is one major limitation. Consider the following function:

~~~ts
const addThreeAndRandom = (val) => {
    const randomNumber = Math.random();

    return val + 3 + randomNumber;
};
~~~

With our existing implementations, we would not be able to capture and track the value for \`randomNumber\` and include it in the analytics event payload. More broadly, data constructed in the body of the application code is not available to the tracking function and cannot be included in the track event object.

The only way to include the value for \`randomNumber\` would be to include it on the return type of \`addThreeAndRandom\` by updating the function to return not a number but an object. Since \`withTracking\` has access to the return value, \`withTracking\` can pull off the value and pass it to \`createTrackingEvent\`.

~~~ts

// Update addThreeAndRandom to return an object that also contains the private data:
const addThreeAndRandom = (val) => {
    const randomNumber = Math.random();

    return {
        result: val + 3 + randomNumber,
        __trackingInfo: { randomNumber }
    };
};

// Update \`createTrackingEvent\` to pull the randomNumber value off
const createTrackingEvent = (functionName, args, returnValue) => {
    return {
        name: functionName,
        info: args[0] < 10 ? 'less than 10' : '10 or more',
        privateData: returnValue.__trackingInfo
        result: returnValue.result
    };
};

// Update withTracking to return just the actual result and not the object.
const withTracking = (originalFunction, createTrackingEvent) => {

  return (...args) => {

    const returnValue = originalFunction(...args);

    track(
      createTrackingEvent(
        originalFunction.name,
        args,
        returnValue
      )
    );

    return returnValue.result

  };

};
~~~

That's a lot we just did. And it's starting to get gnarly. All of a sudden, we have to begin returning objects instead of values, include a \`__trackingInfo\` property on the returned object, and now our application code is littered with analytics code - exactly what we wanted to avoid.

We also care about preserving composition. How can compose \`addThree\` with another similar function that should also fire off an analytics event.

~~~ts
// Application code
const multiplyBy5AndRandom = (val) => {
    const random = Math.random();

    return {
        result: val * 5 * random
        __trackingInfo: { random }
    };
};

// Create the analytics event for multiplyBy5AndRandom
const createMultiplyBy5Event = (functionName, args, returnValue) => {
    return {
        name: functionName,
        info: args[0] < 3 ? 'called with a number less than 3' : 'more than 3',
        returnValue
    }:
};
~~~

Tracking calls to \`createMultiplyBy5Event\` is trivial just as before.

~~~ts
const trackedMultiplyBy5AndRandom = withTracking(multiplyBy5AndRandom, createMultiplyBy5Event);
~~~

Composing our two functions - \`addThreeAndRandom\` and \`createMultiplyBy5Event\` - is not directly possible. Trying to do so will throw an error.

~~~ts
const myNum = multiplyBy5AndRandom(addThreeAndRandom(3))
~~~

The result of \`addThreeAndRandom\` is an object and \`multiplyBy5AndRandom\` expects a number. The tracked versions of these functions however are composable:

~~~ts
const trackedMultiplyBy5AndRandom = withTracking(multiplyBy5AndRandom, createMultiplyBy5Event);
const trackedAddThree = withTracking(addThreeAndRandom, createTrackingEvent);

const myNum = trackedMultiplyBy5AndRandom(trackedAddThree(3))
~~~

This all works, but like when we added the \`__trackingInfo\` property, feels clunky.

It'd be nicer to imagine something like:

~~~ts
const number = addThreeAndRandom(3)
    .then(multiplyBy5AndRandom)
    .then(addThreeAndRandom);
~~~

But there's no reference to withTracking in the above. The \`randomNumber\` that we wanted to track also has no presence.

To enable this behavior requires a more formal abstratction than functions - higher ordered or otherwise.

## Building a Trackable Class

To enable similar behavior we need a better abstraction beyond \`withTracking\`. We already have a pseudo special type - objects with a \`__trackingInfo\` property - and we want to add this \`.map\` or \`.then\` method, even if we're not quire sure how it should work yet.  We're also storing some stateful information, the number returned by these functions and their associated tracking data. Let's formalize these relationships into a class that binds all this together.

~~~ts
class Trackable {

    constructor(returnValue, trackingData) {
        this.value = returnValue;

        // We'll review why this is necessary further on.
        const tData = Array.isArray(trackingData) ?
            trackingData :
            [trackingData]

        this.trackingData = tData;
    }

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

With our new class, we can update the initial application functions to return instances of Trackable rather than plain objects:

~~~ts
const addThreeAndRandom = (val) => {
    const random = Math.random();

    return new Trackable(val + 3 + random, { random });
}

const multiplyBy5AndRandom = (val) => {
    const random = Math.random();

    return new Trackable(val * 5 * random, { random });
}
~~~

Now let's add our \`map\` method

~~~ts
class Trackable {

    // Methods from above ...

    map(fn) {

        if (this.containsValue()) {

            const transformedValue = fn(this.getValue());

            // Return a Track instance with the transformed value
            // while preserving the existing tracking data

            return new Trackable (
                transformedValue,
                this.getTrackingData()
             );

        } else {

            // If we have no underlying value, fn can't be applied
            // to nothing so just return the current instance for continued safe
            // chaining

            return this;

        }
    }
}
~~~
This allows us to begin applying functions to the underlying value while preserving all the tracking data we've built up.

~~~ts
const addThreeAndRandom = (val) => {
    const random = Math.random();

    return new Trackable(val + 3 + random, { random });
}

const val = addThreeAndRandom(7).map(val => val + 12).map(val => val * 2);
~~~

But what if the function passed to \`map\` also returns a trackable?

~~~ts
const val = addThreeAndRandom(7).map(val => {
    const randomNum2 = Math.random();
    return new Trackable(val * randomNum2, { randomNum2 });
});
~~~

Now we have an issue, since we'd end up with a nested Trackable. To avoid this, we add a method for specifically the case where the function passed to the method itself returns a \`Trackable\`. We'll call it \`flatMap\`.

> \`map\` only works when the function passed to it does not return a Trackable instance. More generally, \`map\` only works when the function passed to it does not return an instance of the thing being mapped over.

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

Using \`flatMap\` for functions that return a Trackable is simple.

~~~ts
const val = addThreeAndRandom(7).map(val => {
    const randomNum2 = Math.random();
    return new Trackable(val * randomNum2, { randomNum2 });
});
~~~

The final step is a method that actually fires off all the built up analytics events!

~~~ts
class Trackable {

    // Methods from above ...

    run() {

        const trackingData = this.getTrackingData();

        // For every tracking object we have, invoke our track
        // function

        trackingData.forEach(analyticsEvent => {
            track(analyticsEvent);
        });

        return this.getValue();

    }
}
~~~

Calling \`run\` fires off all the analytics events that have been built up, and returns the underlying value. In this system, Trackables wrap our values in a context with their ssociated analytics events.

The \`map\` and \`flatMap\` methods provide mechanisms to continuously and safely transform the underlying value. Analytics events are safely built up and stored until they are ready to be emitted via \`run\`.

Finally we have a complete solution. What's left is an abstraction that should feel clean and familiar.

~~~ts
const subtractSeven = val => val - 7;

const res = addThreeAndRandom(2)    // number -> Trackable
    .flatMap(multiplyByARandomNumber)  // number -> Trackable
    .flatMap(addThreeAndRandom)        // number -> Trackable
    .map(subtractSeven)                // number -> number
    .run(); // Fire all queued track events, returning the wrapped value

console.log(res); // 13.585 (or some other number - its random!)
~~~

Almost by accident, the \`Trackable\` class is also a monad.
`

export const BuildingAMonad = withStyling(markdown)
