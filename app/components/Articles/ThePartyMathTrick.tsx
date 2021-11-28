import { md } from './highlightingHelpers';

const markdown = `
# The Party Math Trick

The trick goes like this:

Ask someone to pick a 3, 4, 5 or however many digit number randomly. 3 or 4 digits is usually a good balance.

Ask the person to scramble the digits to make a new number with the same digits and to then subtract the smaller number from the bigger one.

Once they have the result, they should select a digit to keep secret from the result that is not a 0 or a 9 and say the remaining digits.

A quick example. I pick the number 7834, scrambling the digits I choose 4837. Subtracting the bigger from the smaller (7834 - 4837) yields 2997. I pick a digit that's not 0 or 9 (either 2 or 7) and say the remaining digits.

If I pick 2 I'll say 9, 9 and 7. Then the person should be able to figure out that I picked a 2.

This relies on some fun math but it's also easy to program. [Go ahead and try it out](https://www.sambernheim.com/the-math-trick). Come back to learn the secret behind the trick.

## How This works

While this could work on this site by the computer just finding the missing digit of the result I promise that's not what's being done. This trick can be done fully without any computers and some easy mental math - like at a party.

`

export const ThePartyMathTrick = md.render(markdown);

