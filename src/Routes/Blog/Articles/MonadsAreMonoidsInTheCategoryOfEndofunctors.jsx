import { withStyling } from './../withStyling.jsx';

const markdown = `
# Monads are Monoids in the Category of Endofunctors

What's the big deal?

This phrase is the cheeky line to (somewhat) formally define the monad;  While a fun line, it begs a couple of questions.

1. What's a monoid?
2. What's an endofunctor?

## What's a Monoid

Monoids are types under an operation that follow 3 rules. For the provided operation, the type must:

* Have an identity
* Produce a value of the same type when two of those values are combined (this may require defining how o combine two values of this type)
* Be associative

An example. Let's use \`string\` as our type and \`concatenation\` as the definition for combining.

Does it obey the 3 rules?

That is, for any given string, is there another string that when combined with the original string (via concatenation) - returns the original string?

To concatenate two strings, we can just use \`+\` operator available in most languages. Of course, we could also create a method on our string class called \`concat\` (and in JavaScript, this method does actually exist).

~~~ts
const myStr = "hello world!";
const stillMyStr = myStr + "";

console.log(stillMyStr); // => "hello world!"
~~~

For point 2, the result of combing two (or more) strings, yields yet another string.

That's requirements 1 and 2. What about point 3?

Associativity means \`(a + b) + c\` is equivalent to \`a + (b + c)\`.

~~~ts
const myStr = "hello";
const myOtherStr = " world";
const myFinalStr = "!";

const result = (myStr + myOtherStr) + myFinalStr;
const sameResult = myStr + (myOtherStr + myFinalStr);
~~~

> Associativity is distinct from the commutative property. The order of the values matters, but for a given order, executing one operation before the other is arbitrary and holds over an arbitrary number of values. The end result is the same.

Take the following operation
~~~ts
("he" + "l") + ("l" + "o" + " wor" + "ld") + ("!")

// The above is just as valid as

("he" + "l" + "l" + "o") + (" wor" + "ld") + ("!")

// And produces the same result.
// => "hello world!"
~~~
We've show strings *under concatenation* are monoids, but strings, under other operations, may not be monoids.

Since strings under concatenation are monoids - and so are associative - each joining operation can be parallelized and performed independent of the other. Which joinings are performed first is irrelevant. They can occur on separate threads, across separate services etc with each incremental result delivered to a different machine to carry on the computation. This capability generalizes to all monoids.

Anything that is a monoid is naturally parallelizable.

### When a Thing is not a Monoid
An example of where a type under an operation is not a monoid is easily found in numbers under subtraction.

> We could demonstrate this with strings under subtraction too, but defining 'subtraction' for a string isn't quite as natural or intuitive.

~~~ts
// Numbers under subtraction have an identity: 0 ✅
const stillFive = 5 - 0;

// but numbers under subtraction are not associative ❌
const someNum = (12 - 4) - 2 // => 6
const stillSomeNum? = 12 - (4 - 2) // => 10

someNum === stillSomeNum? // => false
~~~

Numbers under subtraction are not monoids since subtraction of numbers is not associative.

If you are designing your own types and classes, and create them in such a way that for a defined joining operation, they obey the 3 points, your class, under that operation, is a monoid!

## What's an Endofunctor

Functors should be familiar. They are types that support a mapping transformation that allow us to map values of one type (aka category) to values of another type.

~~~ts
// converts any number (our starting category) to a string (our ending category)
const numToStr = (num) => {
    return "" + num;
};

const threeAsAString = numToStr(3); // => "3"
~~

Endofunctors are related but are just a bit more strict. An endofunctor is a functor where the result of the transformation has the same type as the starting type (and continues to obey all the other rules around functors like functional composition).

~~~ts
const vals = [1, 2, 3];

const myOtherVals = vals.map(x => x * 2); // => [2, 4, 6]
~~~
The result of the \`map\` call is an Array, and the function passed to the map method maps strings to numbers (our two categories). The end result is the same type that we started with while the containing values have changed and been mapped from one cateogry to another.
~~~ts
const vals = [1, 2, 3];

const numToStr = (num) => {
    return "" + num;
};

const myOtherVals = vals.map(numToStr); // => ["2", "4", "6"]
~~~

Another example to demonstrate this from a different angle.

~~~ts
const double = (val) => val + val;

const ten = double(5);
~~~
\`double\` is a function that maps numbers to numbers making it an endofunctor. The return value has the same type as the input value.

Another interesting note is that the mapping function can only accept one argument. If it accepted more than one argument, the type of the function wouldn't be \`number => number\` but rather \`(number, number) => number\`.

A function like \`numToStr\` is *not* an endofucntor. The return type differs from the consumed type. It instead is a plain 'ol functor.

## Coming Together
Repeating the mantra again. Monads are monoids in the category of endofunctors.

We know what monoids are and the benefits they bring, and we know what endofunctors are. If we have a monoid, that also is an endofunctor, we have a monad.

That is, if we have a monoid and a means of transforming the monoid in a way where the result of the transformation is the same type continaing our monoid as we started with, that thing is a monoid in the category of endofunctors aka a monad!

Let's examine the Arrays example once more to demonstrate. We can conclude that Arrays, themselves, are monoids.
~~~ts
// The identity element exists
const myArr = [1, 2, 3, ...[]]; // => [1, 2, 3]

// Joining two arrays yields still an array
const myOtherArray = [...[1, 2], ...[3, 4]] // => [1, 2, 3, 4]

// The associative property holds
const a = [1, 2];
const b = [3, 4];
const c = [5];

const resultOne = [
    ...[...a, ...b], // combine the result of joining \`a\` and \`b\`
    ...c             // with \`c\`
]; // => [1, 2, 3, 4, 5]

const resultTwo = [
    ...a,           // combine \`a\` with
    ...[...b, ...c] // the result of first combining \`b\` and \`c\`
]; // => [1, 2, 3, 4, 5]
~~~
Of course, as we saw above, Arrays support a \`map\` method which allow us to transform the values of the array but do so in a way that returns an Array (the same type as the starting type), making them endofunctors.

~~~ts
const vals = [1, 2, 3];

const myOtherVals = vals.map(x => x * 2); // => [2, 4, 6]
~~~

Arrays are monoids in the category of endofunctors. More simply, they are monadic.

## Creating a new Monad

Understanding why an existing class is a monad can be simple. Implementing a class that adheres to all the rules however can be much more challenging.

Of course, to create a monad that doesn't already exist requires a use case for which the existing monads are unsuitable. It may also seem like every monad that is needed already exists. Some common ones are

* Array (sometimes called List or Sequence)
* Option (sometimes called Maybe)
* Future (sometimes called Promise)
* Either
* Try
* IO
* Random
* State
* Observable

And I'm sure there are more!

In the next article, we'll review a usecase that doesn't yet have a supporting Monad and write a new one to fit the specific needs.
`
export const MonadsAreMonoidsInTheCategoryOfEndofunctors = withStyling(markdown);
