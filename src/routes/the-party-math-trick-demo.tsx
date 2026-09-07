import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNavbar } from "../components/site/SiteNavbar";

const MathTrickDemo = () => {
  const [initial, setInitial] = useState(0);
  const [scrambled, setScrambled] = useState(0);
  const [answer, setAnswer] = useState<number>();
  const difference = Math.abs(initial - scrambled);
  const digits = Array.from(String(difference), Number);

  const chooseDigit = (digit: number) => {
    const remaining = digits.filter((value, index) => {
      return value !== digit || digits.indexOf(value) !== index;
    });
    const sum = remaining.reduce((total, value) => {
      return total + value;
    }, 0);
    setAnswer((Math.floor(sum / 9) + 1) * 9 - sum);
  };

  return (
    <>
      <SiteNavbar />
      <main className="site-demo">
        <h1>The Party Math Trick</h1>
        <label>
          Enter a number{" "}
          <input
            type="number"
            value={initial}
            onChange={(event) => {
              return setInitial(Number(event.target.value));
            }}
          />
        </label>
        <label>
          Enter a scrambled version{" "}
          <input
            type="number"
            value={scrambled}
            onChange={(event) => {
              return setScrambled(Number(event.target.value));
            }}
          />
        </label>
        <p>The result of the subtraction is {difference}.</p>
        <p>Select a digit that is not 0 or 9:</p>
        <div className="site-demo-actions">
          {digits
            .filter((digit) => {
              return digit !== 0 && digit !== 9;
            })
            .map((digit, index) => {
              return (
                <button
                  type="button"
                  key={`${digit}-${index}`}
                  onClick={() => {
                    return chooseDigit(digit);
                  }}
                >
                  {digit}
                </button>
              );
            })}
        </div>
        {answer !== undefined && <p>You picked {answer}.</p>}
      </main>
    </>
  );
};

export const Route = createFileRoute("/the-party-math-trick-demo")({ component: MathTrickDemo });
