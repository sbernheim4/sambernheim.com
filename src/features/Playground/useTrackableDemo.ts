import { useState } from "react";
import { Trackable, type TrackingEvent } from "./Trackable";

const start = () => {
  return Trackable.of(2);
};

export const useTrackableDemo = () => {
  const [current, setCurrent] = useState(start);
  const [steps, setSteps] = useState<readonly string[]>(["Trackable.of(2)"]);
  const [emitted, setEmitted] = useState<readonly TrackingEvent[]>([]);
  const [lastResult, setLastResult] = useState<number | null>(null);

  const mapAddThree = () => {
    setCurrent((trackable) => {
      return trackable.map((value) => {
        return value + 3;
      });
    });
    setSteps((previous) => {
      return [...previous, ".map(addThree)"];
    });
  };
  const mapDouble = () => {
    setCurrent((trackable) => {
      return trackable.map((value) => {
        return value * 2;
      });
    });
    setSteps((previous) => {
      return [...previous, ".map(double)"];
    });
  };
  const flatMapAddFive = (eventData: TrackingEvent) => {
    setCurrent((trackable) => {
      return trackable.flatMap((value) => {
        const result = value + 5;
        return new Trackable(result, [
          {
            functionName: "addFiveAndTrack",
            arguments: [value],
            result,
            data: eventData,
          },
        ]);
      });
    });
    setSteps((previous) => {
      return [...previous, ".flatMap(addFiveAndTrack)"];
    });
  };
  const flatMapAddRandom = (eventData: TrackingEvent) => {
    const random = Math.round(Math.random() * 100) / 100;
    setCurrent((trackable) => {
      return trackable.flatMap((value) => {
        const result = value + random;
        return new Trackable(result, [
          {
            functionName: "addRandomAndTrack",
            arguments: [value],
            result,
            info: { random },
            data: eventData,
          },
        ]);
      });
    });
    setSteps((previous) => {
      return [...previous, ".flatMap(addRandomAndTrack)"];
    });
  };
  const execute = () => {
    const sent: TrackingEvent[] = [];
    const result = current.execute((event) => {
      sent.push(event);
    });
    setEmitted((previous) => {
      return [...previous, ...sent];
    });
    setLastResult(result);
  };
  const reset = () => {
    setCurrent(start());
    setSteps(["Trackable.of(2)"]);
    setEmitted([]);
    setLastResult(null);
  };

  return {
    current,
    steps,
    emitted,
    lastResult,
    mapAddThree,
    mapDouble,
    flatMapAddFive,
    flatMapAddRandom,
    execute,
    reset,
  };
};
