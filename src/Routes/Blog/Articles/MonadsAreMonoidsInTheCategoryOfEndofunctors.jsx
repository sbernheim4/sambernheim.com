import React from 'react';

import ReactMarkdown from 'react-markdown'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism/';

import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

const markdown = `
# Monads are Monoids in the Category of Endofunctors

What's the big deal?

This phrase is the cheeky line to (somewhat) formally define the monad;  While a fun line, it begs a couple of questions.

1. What's a monoid?
2. What's an endofucntor.

## What's in a Monoid

Monoids are types under an operation that follow 2 rules. For the provided operation, the type must:

* Have an identity
* Be associative

An example. Let's use \`string\` as our type and \`concatenation\` as our operation.

Does it obey the 2 rules?

That is, for any given string, is there another string that when combined with the original string - under the specified operation (concatenation in this case) - returns the original string?

To concatenate two strings, we can just use \`+\` operator available in most langauges. Of course, we could also create a method on our string class called \`concat\` (and in JavaScript, this method does actually exist).

~~~ts
const myStr = "hello world!";
const stillMyStr = myStr + "";

console.log(stillMyStr); // => "hello world!"
~~~

That's point 1. What about point 2?

Associativity means \`(a + b) + c\` is equivalent to \`a + (b + c)\`.

> Associativity is distinct from the commutative property. The order of the values does matter, but for a given order, doing one operation before the other should be arbitrary.

~~~ts
const myStr = "hello";
const myOtherStr = " world";
const myFinalStr = "!";

const result = (myStr + myOtherStr) + myFinalStr;
const sameResult = myStr + (myOtherStr + myFinalStr);
~~~
We've show strings *under concatenation* are monoids. Strings, under other operations, may not be monoids.

### When a Thing is not a Monoid
An example of where a type under an operation is not a monoid is easily found in numbers under subtraction.

~~~ts
// Numbers under subtraction have an identity of 0 ✅
const stillFive = 5 - 0;

// Numbers under subtraction are not associative ❌
const someNum = (12 - 4) - 2 // => 6
const stillSomeNum = 12 - (4 - 2) // => 10

someNum === stillSomeNum // => false
~~~

Numbers under subtraction are not monoids since subtraction of numbers is not associative.

If you are desiging your own types (or classes really) and create them in such a way that for some operations, there is an identity element, and the operation is associative, your class, under that operation, is a monoid!

We'll explore an example of this later on.

## What's an Endofunctor

Functors should seem familiar. Functors are types that support a mapping transformation that allow us to map values of one type (aka category) to values of another type.

~~~ts
// numbers -> string
const numToStr = (num) => {
    return "" + num;
};

const 3AsString = numToStr(3); // => "3"
~~~

Endofunctors are related but are just a bit more strict. An endofunctor is a functor where the result of the transformation has the same type as the starting type.

~~~ts
const vals = [1, 2, 3];

const myOtherVals = vals.map(x => x * 2); // => [2, 4, 6]
~~~
The result in the above \`map\` call is an Array, the same type that we started with. In fact, it doesn't even matter if the type of values in the Array changes.
~~~ts
const vals = [1, 2, 3];

const numToStr = (num) => {
    return "" + num;
};

const myOtherVals = vals.map(numToStr); // => ["2", "4", "6"]
~~~

In this case, we still end up with an Array of values. The type of those values though is different but the result of \`map\` is an Array. The same type we started with.

Another example to demonstrate this from a different angle

~~~ts
const double = (val) => val + val;

const ten = double(5);
~~~
\`double\` is a transformation function on values of type number and returns a number; it is an endofunctor since it transforms a value, and returns a new value whose type is the same as the consumed value.

A function like \`numToStr\` however is *not* an endofucntor. The return type differs from the consumed type. It is instead a regular ol functor.

## Come Together
So, repeating the mantra again. Monads are monoids in the category of endofunctors.

Well we know what monoids are, and we know what endofunctors are. If we have a monoid, that also is an endofunctor, we have a monad.

That is, if we have a monoid and a transformation function for that monoid, whose return value has the same type as the input value, that monoid is in the category of endofunctors and is therefore a monad.

Let's examine the Arrays example once more. We can conclude that Arrays, themselves, are monoids.
~~~ts
// The identity element exists
const myArr = [1, 2, 3, ...[]]; // => [1, 2, 3]

// The associative property holds
const a = [1, 2];
const b = [3, 4];
const c = [5];

const resultOne = [
    ...(...a, ...b),
    ...c
]; // => [1, 2, 3, 4, 5]

const resultTwo = [
    ...a,
    ...(...b, ...c)
]; // => [1, 2, 3, 4, 5]
~~~
Of course, as we saw above, Arrays support a \`map\` method whose return value is still an Array, making them endofunctors.

~~~ts
const vals = [1, 2, 3];

const myOtherVals = vals.map(x => x * 2); // => [2, 4, 6]
~~~

Arrays under concatenation are monoids in the category of endofunctors. More simply, they are monadic.

## Creating a new Monad

Understanding why an existing class is a monad can be simple. Implementing a class that is a monad can be much more challenging.

Of course, to create a monad that doesn't already exist requires a usecase for which the existing ones are unsuitable. It may also seem like every Mondad that is needed already exists. See the following (unexhaustive) list.

* Array (sometimes called List or Sequence)
* Option (sometimes called Maybe)
* Future (sometimes called Promise)
* Either
* Try
* IO
* Random
* State
* Observable

In the next article, we'll review a usecase that doesn't yet have a supporting Monad and write a new one to fit the specific needs.
`
export const MonadsAreMonoidsInTheCategoryOfEndofunctors = () => {
	return <ReactMarkdown
		rehypePlugins={[rehypeRaw]}
		remarkPlugins={[remarkGfm]}
		children={markdown}
		components={{
			code({node, inline, className, children, ...props}) {

				return !inline ?
					(
						<SyntaxHighlighter
							children={String(children).replace(/\n$/, '')}
							style={vscDarkPlus}
							language={"typescript"}
							PreTag="div"
							{...props}
						/>
					) :
					(
						<SyntaxHighlighter
							useInlineStyles={false}
							children={String(children).replace(/\n$/, '')}
							language={"typescript"}
							PreTag="span"
							{...props}
						/>
					)
			}
		}}
	/>
}
