import trackableSource from "./Trackable.ts?raw";

export type TrackableExample = {
  id: string;
  label: string;
  description: string;
  chain: readonly string[];
  startExpression: string;
  resultType: string;
  helpers: string;
};

const numericHelpers = `function addThree(value: number): number {
  return value + 3;
}

function double(value: number): number {
  return value * 2;
}

function addFiveAndTrack(value: number): Trackable<number> {
  const result = value + 5;
  return new Trackable(result, [{
    functionName: "addFiveAndTrack",
    arguments: [value],
    result,
    data: eventData,
  }]);
}`;

const longNumericHelpers = `${numericHelpers}

function subtractOne(value: number): number {
  return value - 1;
}

function halve(value: number): number {
  return value / 2;
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function addTenAndTrack(value: number): Trackable<number> {
  const result = value + 10;
  return new Trackable(result, [{
    functionName: "addTenAndTrack",
    arguments: [value],
    result,
    data: eventData,
  }]);
}

function addRandomAndTrack(value: number): Trackable<number> {
  const random = Math.round(Math.random() * 100) / 100;
  const result = value + random;
  return new Trackable(result, [{
    functionName: "addRandomAndTrack",
    arguments: [value],
    result,
    info: { random },
    data: eventData,
  }]);
}`;

const stringHelpers = `function trimText(value: string): string {
  return value.trim();
}

function uppercase(value: string): string {
  return value.toUpperCase();
}

function recordTextLength(value: string): Trackable<string> {
  return new Trackable(value, [{
    functionName: "recordTextLength",
    arguments: [value],
    length: value.length,
    data: eventData,
  }]);
}`;

const objectHelpers = `type Task = {
  id: number;
  title: string;
  completed: boolean;
};

function renameTask(task: Task): Task {
  return { ...task, title: task.title + " today" };
}

function completeAndTrack(task: Task): Trackable<Task> {
  const completed = { ...task, completed: true };
  return new Trackable(completed, [{
    functionName: "completeAndTrack",
    arguments: [task.id],
    result: completed,
    data: eventData,
  }]);
}`;

export const trackableExamples: readonly TrackableExample[] = [
  {
    id: "number-basic",
    label: "A number",
    description: "Change a number and queue one event.",
    startExpression: "Trackable.of(2)",
    resultType: "number",
    helpers: numericHelpers,
    chain: [".map(addThree)", ".flatMap(addFiveAndTrack)", ".map(double)"],
  },
  {
    id: "number-long",
    label: "A longer chain",
    description: "Combine more transforms and tracked steps without losing the events.",
    startExpression: "Trackable.of(2)",
    resultType: "number",
    helpers: longNumericHelpers,
    chain: [
      ".flatMap(addRandomAndTrack)",
      ".map(double)",
      ".flatMap(addFiveAndTrack)",
      ".map(subtractOne)",
      ".flatMap(addTenAndTrack)",
      ".map(halve)",
      ".flatMap(addRandomAndTrack)",
      ".map(addThree)",
      ".map(double)",
      ".flatMap(addFiveAndTrack)",
      ".map(roundToTwo)",
      ".flatMap(addTenAndTrack)",
      ".map(halve)",
      ".map(double)",
      ".flatMap(addRandomAndTrack)",
      ".map(subtractOne)",
      ".map(roundToTwo)",
    ],
  },
  {
    id: "string",
    label: "A string",
    description: "Transform text and track its final length.",
    startExpression: 'Trackable.of("  hello, monads  ")',
    resultType: "string",
    helpers: stringHelpers,
    chain: [".map(trimText)", ".map(uppercase)", ".flatMap(recordTextLength)"],
  },
  {
    id: "object",
    label: "An object",
    description: "Change a task object and record its completed state.",
    startExpression: 'Trackable.of<Task>({ id: 17, title: "Ship the demo", completed: false })',
    resultType: "Task",
    helpers: objectHelpers,
    chain: [".map(renameTask)", ".flatMap(completeAndTrack)"],
  },
];

// Monaco receives this as a separate in-memory TypeScript file so the example
// stays focused on the chain while retaining hover, completion, and diagnostics.
export const trackableTypeSource = trackableSource.replace(/^export /gm, "");

export const buildTrackableSource = (example: TrackableExample): string => {
  const chain = example.chain
    .map((step) => {
      return `    ${step}`;
    })
    .join("\n");
  return `// Trackable is provided by the experiment. Edit this example and run it.
const eventData: TrackingEvent = {
  "type": "button_click",
  "source": "trackable_demo",
  "details": { "label": "Try it" }
};

${example.helpers}

function createChain(): Trackable<${example.resultType}> {
  return ${example.startExpression}
${chain};
}
`;
};
