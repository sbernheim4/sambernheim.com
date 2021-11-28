import { md } from './highlightingHelpers';

const markdown = `
# The Party Math Trick

You're bored talking to someone at a party and thinking about what to discuss next. This is the party trick for that moment.

The trick goes like this:

Ask someone to pick a 3, 4, 5 or however many digit number randomly (and to keep it to themselves). 3 or 4 digits is usually a good balance.

Ask the person to then scramble the digits to make a new number with the same digits and to then subtract the smaller number from the bigger one. Again they should keep all this to themselves. They'll only need to remember the result of the subtraction.

Once they have the result, they should select a digit from the result that is not a 0 or a 9. Again, they should keep this digit secret. Finally they should tell you the remaining digits.

A quick example.

I pick the number 7834, scrambling the digits I pick 4837. Subtracting the bigger from the smaller (7834 - 4837) - subtracting the smaller from the bigger is also fine, you just drop the negative sign - yields 2997. I pick a digit that's not 0 or 9 (so either 2 or 7) and say the remaining digits.

If I pick 2 I'll say 9, 9 and 7. Then the person performing the trick should be able to figure out that I picked a 2.

This relies on some fun math but it's also easy to program. [Go ahead and try it out](https://www.sambernheim.com/the-math-trick). Come back to learn the secret behind the trick.

I promise that the page is doing the trick and not just showing the number you click on. Feel free to inspect the client side JS and the data sent to the server if you don't believe me. You'll see it's the same

## How This works

This trick can be done fully without any computers with some easy mental (or frantically back of the napkin math) - like at a party.

Like many math tricks, it relies on some properties of numbers, also known as number theory.

The key lies in the curious truth that the result of the subtraction of two numbers that have the same digits where one is a scrambled version of the other is always going to be a multiple of 9. When you take one of the digits out, I only need to find the first multiple of 9 that's bigger than the sum of the remaining digits, and take the difference between that value and the sum of the remaining digits.

It's also why you can't select a 0 or a 9. If you did, then the sum of the remaining digits would be a multiple of a 9 already and so I'll know you tried to trick me by secretly picking a 0 or a 9.

That or someone screwed up their subtraction.

## Casting Of Nines

The curious piece in all this is why the subtraction of these two numbers yields a result that is always a multiple of 9.

To start, any number can be represted by its digits times 10 to a power. For example 743 can be written as \`(7 * 10^2 + 4 * 10^1 + 3 * 10^0) = 743\`.

More broadly we can say any number N can be written as the sum of its digits times 10 to a power. Abstracting the concrete digits in 7, 4, and 3 for variables a, b, and c, and N for the result we get:

\`N = (c * 100) + (b * 10) + (a * 1)\`

> For numbers with more than 3 digits we would tack on a \`d * 1000\` and so on and so forth for more digits.

This is equivalent to

\`N = (c + 99c) + (b + 9b) + (a)\`

If we remove all the parentheses we see it becomes

\`N = c + 99c + b + 9b + a\`

With some regrouping this is

\`N = (c + b + a + 99c + 9b)\`

Which is equivalent to

\`N = c + b + a + (99c + 9b)\`

Which is equivalent to

\`N = (c + b + a) + [9 * (11c + 1b)]\`

Which is equivalent to

 \`N - (c + b + a) = 9 * (11c + 1b)\`

 Which finally is equivalent to

 \`N - (c + b + a) = 9 * k\` - where k = (11c + 1b)

This shows that for any number N, made up of digits a, b, and c, if you subtract the sum of the digits from N, the result is a number divisible by 9 - it doesn't matter what the value for \`k\` will be, it is always multipled by a factor of 9.

Try it, take any number, and subtract from it the sum of its digits and you'll be left with a number that is divisible by 9.

This is what gives us the quick test to determine if a number is divisible by 9, just see if the digits add up to a multiple of 9.

If they do, from the step where we had \`N = c + b + a + (99c + 9b)\`, \`(c + b + a)\` must also be a multiple of 9 and can be written as \`(9x)\` which is the same as \`N = 9x + 99c + 9b\` and a 9 can be divided on boths sides and we're left with \`N / 9 = x + 11c + b\` which shows that N is evenly divisible by 9 - x, c, and b are whole numbers.

More broadly, if we sum the digits of a number N, we know the remainder when we divide by 9 will be the same as the remainder when we divide the sum of the digits by N.

When we scramble the digits of the same number, we know that dividing this new number by 9 will yield the same remainder as the original number divided by 9. We're using the same digits and so get the same sum!

Subtracting two numbers from each other, where both numbers have the same remainder when divided by 9, means any remainder when dividing the result of the subtraction by 9 will be 0 - as in we're guarnateed to be left with a number divisible by 9. You can just subtract the remainders from each other like an equation. Both remainders are the same number, so we're always left with 0.

That is to say, when we do our subtraction, taking two numbers where one is a scrambled version of the other and subtracting it from the original is going to always yield a number that congruent to 0 % 9 which means the result of our subtraction is divisible by 9.

Knowing that the result of our subtraction must be divisible by 9, once given all but one digit of the result, the sum of the given digits plus some missing digit must be a multiple of 9. You simply find the first multiple of 9 bigger than the sum of the digits, subtract the sum from that multiple and you're left with the missing digit!
`

export const ThePartyMathTrick = md.render(markdown);

