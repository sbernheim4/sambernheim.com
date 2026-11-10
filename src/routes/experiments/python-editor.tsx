import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PythonEditor } from "@features/PythonEditor";
import "./python-editor.css";

const examples = {
  basics: {
    label: "A couple of type errors",
    description: "Two simple errors to fix",
    prelude: "",
    definitions: [
      {
        signature: "def greeting(name: str) -> str:",
        initialBody: `    # A string was promised, but this returns a number.
    return 42`,
      },
      {
        signature: "def total_price(price: float, quantity: int) -> float:",
        initialBody: `    # Try replacing "two" with 2.
    count: int = "two"
    return price * count * quantity`,
      },
    ],
  },
  fibonacci: {
    label: "Fibonacci sequence",
    description: "Build a Fibonacci sequence",
    prelude: "",
    definitions: [
      {
        signature: "def fibonacci(n: int) -> list[int]:",
        initialBody: `    # Return the first n numbers in the sequence.\n    return [0, 1, "two"]`,
      },
    ],
  },
  factorial: {
    label: "Factorial",
    description: "Implement a recursive factorial",
    prelude: "",
    definitions: [
      {
        signature: "def factorial(n: int) -> int:",
        initialBody: `    if n <= 1:\n        return "1"\n    return n * factorial(n - 1)`,
      },
    ],
  },
  prime: {
    label: "Prime number check",
    description: "Check whether a number is prime",
    prelude: "",
    definitions: [
      {
        signature: "def is_prime(n: int) -> bool:",
        initialBody: `    if n < 2:\n        return False\n    for divisor in range(2, n):\n        if n % divisor == 0:\n            return 1\n    return True`,
      },
    ],
  },
  word_count: {
    label: "Word frequency counter",
    description: "Count words in a string",
    prelude: "",
    definitions: [
      {
        signature: "def word_frequencies(text: str) -> dict[str, int]:",
        initialBody: `    counts: dict[str, int] = {}\n    for word in text.lower().split():\n        counts[word] = counts.get(word, 0) + 1\n    return list(counts)`,
      },
    ],
  },
  order: {
    label: "Implement an order summary",
    description: "Explore typed objects and implement the function",
    prelude: `from dataclasses import dataclass

@dataclass
class Customer:
    name: str
    email: str

@dataclass
class OrderLine:
    sku: str
    quantity: int
    unit_price: float

@dataclass
class Order:
    customer: Customer
    lines: list[OrderLine]
    discount: float

@dataclass
class OrderSummary:
    customer_name: str
    item_count: int
    subtotal: float
    total: float
`,
    definitions: [
      {
        signature: "def summarize_order(order: Order) -> OrderSummary:",
        initialBody: `    # Inspect order.customer and order.lines, then build an OrderSummary.
    return order.customer.name`,
      },
    ],
  },
} as const;

const PythonEditorPlayground = () => {
  const [selected, setSelected] = useState<keyof typeof examples>("basics");
  const example = examples[selected];
  return (
    <section className="playground-page python-playground">
      <header className="playground-heading">
        <h1>Python editor</h1>
        <p>
          Run Ty, Astral's python type checker and LSP fully in the browser with the Monaco editor.
          View diagnostics, type definitions, and receive completion suggestions as you edit. Pick
          an example below; no backend required.
        </p>
        <br />
        <p>
          Diagnostics are clickable and navigate your cursor to the error. Hover over errors and
          arguments to view more information.
        </p>
      </header>
      <label className="python-example-picker">
        Example
        <select
          value={selected}
          onChange={(event) => {
            return setSelected(event.target.value as keyof typeof examples);
          }}
        >
          {Object.entries(examples).map(([value, item]) => {
            return (
              <option value={value} key={value}>
                {item.label}
              </option>
            );
          })}
        </select>
      </label>
      <div className="python-playground-hint">
        <strong>{example.description}.</strong>{" "}
        {selected === "basics" ? (
          <>
            Return <code>"Hello, " + name</code> from <code>greeting</code> and change{" "}
            <code>"two"</code> to <code>2</code>.
          </>
        ) : (
          <>
            The signature is fixed; implement its body. Hover over <code>order</code>,{" "}
            <code>customer</code>, or a line item to inspect their types and available properties.
          </>
        )}{" "}
        Click a diagnostic to jump to it, or Reset to restore this example. The editor checks types;
        it doesn’t run your code.
      </div>
      <PythonEditor
        key={selected}
        title="main.py"
        description={example.description}
        predefinedPython={example.prelude}
        editableDefinitions={example.definitions}
        filePath="/experiments/main.py"
      />
    </section>
  );
};

export const Route = createFileRoute("/experiments/python-editor")({
  ssr: false,
  head: () => {
    return { meta: [{ title: "Python editor playground — Samuel Bernheim" }] };
  },
  component: PythonEditorPlayground,
});
