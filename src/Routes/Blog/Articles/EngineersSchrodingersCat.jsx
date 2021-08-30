import React from 'react';

import ReactMarkdown from 'react-markdown'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ghcolors, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism/';

import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

const markdown = `
# The Engineer's Schrodinger's Cat
Options are a powerful functional programming construct, commonly introduced along with pure functions and referential transparency.

> One nice way to think of Options is as the programmer’s version of Schrodinger’s cat. There’s a box, and inside the box, there may be a value. Or maybe there isn’t. In either case, it’s impossible to know until the box is opened.

To bring the Option object to JavaScript and TypeScript, I [wrote and published a fully typed, zero-dependency implementation of the functional programming Option object to NPM called excoptional.](https://www.npmjs.com/package/excoptional)

The [\`README\`](https://github.com/sbernheim4/excoptional/blob/main/README.md) also reviews Options and their capabilities and contains more information on various methods and capabilities.

Formally, Options are an abstraction that work well with functions that may or may not return a value. Options often obviate the need for null and undefined checks and provide mechanisms to safely and declaratively transform the value they may contain.

## Using Options

Options naturally remove repetitive null and undefined checks that might otherwise be necessary when working with functions that may or may not return a value (instead of always returning an Option).

Below is a quick example with two versions of an uppercasing function. One takes a string and returns either a string or undefined. The other takes an \`Option<string>\` and returns an \`Option<string>\`.

~~~ts
const { Some, None } = require('excoptional');

// Without Options
const uppercaseStr = (value) => {

    if (value !== undefined) {
        return value.toUpperCase();
    }

    return undefined;
}

const valOne = uppercaseStr("hello world"); // => string
const valTwo = uppercaseStr(undefined); // => undefined

// With Options
const valThree = Some("hello world") // An option containing "hello world"
    .map(str => str.toUpperCase()); // => Option<string>

const valFour = None() // An option with no underlying value
    .map(str => str.toUpperCase()); // => Option<string>
~~~

In the first example, the argument is checked to make sure it’s not undefined.

TypeScript’s strict mode helps in these circumstances, but only in validating that when calling the function, a string is always passed (instead of undefined). The function can still return undefined and the callers of \`uppercaseStrOne\` will have the burden of checking that the return value is again not undefined before passing the result to the next function (or implement these undefined checks in every function).

In the second example, we use the \`map\` method on the Option passing in a function that transforms the underlying value (by uppercasing it). No undefined check is needed in the function passed to \`map\`.

This works regardless if the Option contains an underlying value or not like with \`valFour\`.

The result remains an \`Option<string>\` allowing for it to be chained again with map (and other methods). No more undefined or null checks needed. Since the type remains an \`Option<string>\`, the context that there may not be a value here is maintained.

Options provide the ability to remove errors (like the one below) by wrapping values that may be undefined in an Option.

~~~ts
Uncaught TypeError: Cannot read property 'foo' of undefined at myIncrediblyImportantFunction (index.js:8)
~~~

## Constructing Instances of Options

Using Options necessitates constructing instances. The example above uses the npm package \`excoptional\` which exposes functions Some and None which, when invoked, return Options.

\`Some()\` takes one argument and is used to create an instance of an Option with that argument as the underlying value. \`None()\` is used when there is no underlying value and so takes no arguments.

Depending on the library, creating instances may be slightly different but they all have similar semantics.

## Working with Options

Working with functions that return Options instead of direct values (along with null and undefined) leads to a new set of semantics and usage patterns, but Options provide solutions for all scenarios.

Validation functions are a natural fit for functions that return Options.

~~~ts
const { Some, None } = require('excoptional');

const getIfValid = (val) => {
   if (val.length > 2) {
        return Some(val);
    } else {
        return None();
    }
};

Some("hi!")
    .flatMap(getIfValid)
    .log(); // Log the result

~~~

The \`map\` method on an Option works for a transformation function that returns a value that is not an Option. Transformation functions that do return an Option - like the above - need \`flatMap\`.

If \`map\` were used, the result would be a nested Option. To see this, copy the above snippet into [runkit](https://npm.runkit.com/excoptional) and swap \`flatMap\` to \`map\`. Try also shortening the string to 2 characters or fewer.

You can also npm install the module (\`excoptional\`) locally to run examples and test out its various methods. It is production ready.

The TLDR here is:
* use map when the function does not return an Option
* use flatMap when the function does return an Option

> ⚠️ The And Then… section shows an even better solution

## Getting the Value

Eventually the underlying value is needed and we must leave the world of Options. One goal though is to avoid extracting the underlying value for as long as possible preferring to instead pass around the Option instance. In doing so, the context that there may or may not be a value is maintained, and the ability to define a fallback value (if it’s a None) is left up to whoever finally needs it.

This is to avoid retrieving the underlying value from the Option, working with it, putting it back into an Option later on, retrieving it again, putting it back into an Option again etc. Doing this is an anti-pattern where the methods - \`map\`, \`flatMap\`, \`then\` and others - should be used instead.

At some point though, the value is needed and are retrieved by calling \`getOrElse\`.

~~~ts
const { Some, None } = require('excoptional');

const getAnOption = () => Math.random() > .5 ?
    Some("jackpot") :
    None();

const myOpt = getAnOption();

const value = myOpt.getOrElse("no jackpot"); // => “jackpot” | “no jackpot”
~~~

When the Option is a None, the argument is returned.

## And Then…

The \`excoptional\` implementation of Option also exposes a \`then\` method which has similar behavior to \`Promise.then\` and removes having to ask and answer the question, to map or to flatMap.

A \`then\` method is a unique benefit and improvement of this package over others. Not all implementations expose one.

> Since this implementation exposes a then method with the described behavior, this Option implementation is also a thenable.

Regardless of whether the function used to transform the underlying value returns an Option or a different value, \`then\` will work as expected and avoid creating a nested Option.

~~~ts
const { Some, None } = require('excoptional');

// Returns a string
const appendWorld = (str) => str + " world";

// Returns an Option<string>
const maybeAppendExclamationPoint = (str) => {

  return Math.random() > .5 ?
    Some(str + "!") :
    None();

};

// ~~then~~ works regardless of the type that the function passed to it returns
const myOpt = Some("hello")
    .then(appendWorld)
    .then(maybeAppendExclamationPoint)
    .log();
~~~

then will always return an Option just as \`map\` and \`flatMap\` do.

Promise.then always returns a promise for the same reason

## Helper Methods

This library exposes several additional methods to provide more capability and an exceptional development experience. Some of these are standard in other languages that support options natively and implementations but there are a few unique and beneficial ones

Above the \`log\` method is used to conveniently log the Option to see its value (and is simpler than doing \`console.log(myOption))\`.

Similarly, there’s \`logAndContinue\` which logs the instance and returns it; extremely useful when there is a chain of map or then method calls and you want to inspect the value at any point in that chain without breaking it apart just for debugging.

Several other methods exist that are common to several Option libraries and Options in other languages. These include \`isSome\`, \`isNone\`, \`filter\`, etc.

Take a look at the [GitHub repo](https://www.github.com/sbernheim4/excoptional) or [NPM package](https://www.npmjs.com/package/excoptional) for a complete listing of the available methods. Many of these methods have extensive documentation and examples demonstrating how they can be used.

## Conclusion

Options make it easy to continually and safely manipulate a value (even when it doesn't exist) in a declarative and transparent way while preserving the context that the value may (or may not) exist as it moves throughout your system.

This library, \`excoptional\`, provides the best JavaScript and TypeScript support possible along with detailed documentation, examples and an exceptional developer experience.

It is a standalone package with 0 dependencies and 100% test coverage.

I hope you find it (and more broadly, Options) useful.
`
export const EngineersSchrodingersCat = () => {
	return <ReactMarkdown
		rehypePlugins={[rehypeRaw]}
		remarkPlugins={[remarkGfm]}
		children={markdown}
		components={{
			code({node, inline, className, children, ...props}) {

				return !inline ?
					(
						<SyntaxHighlighter
							showLineNumbers
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
