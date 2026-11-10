import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CommandButton, CommandLink } from "@/features";
import type { TrackingEvent } from "@features/Playground/Trackable";
import { useTrackableDemo } from "@features/Playground/useTrackableDemo";
import "./trackable.css";

const TrackableExperiment = () => {
  const demo = useTrackableDemo();
  const [customEvent, setCustomEvent] = useState(
    '{\n  "type": "button_click",\n  "source": "trackable_demo",\n  "details": { "label": "Try it" }\n}',
  );
  const [eventError, setEventError] = useState("");
  const runFlatMap = (operation: (eventData: TrackingEvent) => void) => {
    try {
      operation(JSON.parse(customEvent));
      setEventError("");
    } catch {
      setEventError("Enter valid JSON to add this event.");
    }
  };
  return (
    <section className="playground-page trackable-experiment">
      <header className="playground-heading">
        <h1>Using the Trackable Monad</h1>
        <p>
          This is the <code>Trackable</code> class from my{" "}
          <CommandLink to="/blog/$slug" params={{ slug: "building-a-monad" }}>
            article on building a monad
          </CommandLink>
          . Use
          <code> map</code> to change its value while keeping the queued analytics events. Use
          <code> flatMap</code> when the next function returns another Trackable, then execute the
          chain to emit its events to the log and return the value.
        </p>
      </header>

      <div className="trackable-grid">
        <section className="trackable-panel" aria-labelledby="trackable-steps-heading">
          <h2 id="trackable-steps-heading">Build a chain</h2>
          <div className="trackable-steps" aria-label="Current chain">
            {demo.steps.map((step, index) => {
              return <code key={`${index}-${step}`}>{step}</code>;
            })}
          </div>
          <h3>Transform the value</h3>
          <div className="trackable-actions">
            <CommandButton
              type="button"
              command={{ group: "Trackable demo" }}
              onClick={demo.mapAddThree}
            >
              map: add 3
            </CommandButton>
            <CommandButton
              type="button"
              command={{ group: "Trackable demo" }}
              onClick={demo.mapDouble}
            >
              map: double
            </CommandButton>
          </div>
          <h3>Add an event with flatMap</h3>
          <div className="trackable-custom-event">
            <label htmlFor="trackable-event-json">Event data for flatMap (JSON)</label>
            <textarea
              id="trackable-event-json"
              value={customEvent}
              rows={6}
              spellCheck={false}
              aria-invalid={Boolean(eventError)}
              aria-describedby={eventError ? "trackable-event-error" : undefined}
              onChange={(event) => {
                setCustomEvent(event.target.value);
                setEventError("");
              }}
            />
            {eventError && (
              <small id="trackable-event-error" role="alert">
                {eventError}
              </small>
            )}
            <small>Both flatMap actions include this JSON in the event they create.</small>
          </div>
          <div className="trackable-actions">
            <CommandButton
              type="button"
              command={{ group: "Trackable demo" }}
              onClick={() => {
                runFlatMap(demo.flatMapAddFive);
              }}
            >
              flatMap: add 5 + event
            </CommandButton>
            <CommandButton
              type="button"
              command={{ group: "Trackable demo" }}
              onClick={() => {
                runFlatMap(demo.flatMapAddRandom);
              }}
            >
              flatMap: add random + event
            </CommandButton>
          </div>
          <div className="trackable-actions trackable-finish-actions">
            <CommandButton
              type="button"
              className="trackable-execute"
              command={{ group: "Trackable demo" }}
              onClick={demo.execute}
            >
              Execute chain
            </CommandButton>
            <CommandButton type="button" command={{ group: "Trackable demo" }} onClick={demo.reset}>
              Reset
            </CommandButton>
          </div>
        </section>

        <section className="trackable-panel" aria-labelledby="trackable-value-heading">
          <h2 id="trackable-value-heading">Trackable state</h2>
          <div className="trackable-value" aria-live="polite">
            <span>Wrapped value</span>
            <strong>{demo.current.getValue()}</strong>
          </div>
          {demo.lastResult !== null && (
            <p className="trackable-execute-result" role="status">
              Execute returned {demo.lastResult} and emitted {demo.emitted.length} event
              {demo.emitted.length === 1 ? "" : "s"}.
            </p>
          )}
          <h3>Queued events ({demo.current.getAnalyticsEvents().length})</h3>
          <ol className="trackable-event-list">
            {demo.current.getAnalyticsEvents().map((event, index) => {
              return (
                <li key={index}>
                  <pre>{JSON.stringify(event, null, 2)}</pre>
                </li>
              );
            })}
          </ol>
          {demo.current.getAnalyticsEvents().length === 0 && (
            <p>No events queued yet. Try a flatMap action.</p>
          )}
          <h3>Emitted events ({demo.emitted.length})</h3>
          {demo.emitted.length ? (
            <ol className="trackable-event-list" aria-live="polite">
              {demo.emitted.map((event, index) => {
                return (
                  <li key={index}>
                    <pre>{JSON.stringify(event, null, 2)}</pre>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p>No events emitted yet.</p>
          )}
        </section>
      </div>
    </section>
  );
};

export const Route = createFileRoute("/experiments/trackable")({
  head: () => {
    return { meta: [{ title: "Trackable experiment — Samuel Bernheim" }] };
  },
  component: TrackableExperiment,
});
