import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DetailView } from "@features/Workspace/components/web/DetailView/DetailView";

const ViewsPlayground = () => {
  const [notes, setNotes] = useState(
    "Try changing this note, then switch layouts. Your draft stays with you.",
  );
  return (
    <section className="playground-page views-playground">
      <header className="playground-heading">
        <h1>Choose how you want to view it.</h1>
        <p>
          Content and layout are separate here. That lets me offer tabs, a sidebar, or a full page
          without changing the content itself—and lets each person choose the view they prefer.
        </p>
      </header>
      <p className="views-playground-note">
        Switch views below. The content stays the same, your notes stay put, and your choice is
        remembered in this browser.
      </p>
      <DetailView
        tabs={[
          {
            value: "overview",
            label: "Overview",
            children: (
              <div className="views-demo-copy">
                <span className="playground-eyebrow">Workshop / 001</span>
                <h2>Building interfaces that adapt</h2>
                <p>
                  A short workshop about choosing how to move through a page. The details stay the
                  same as you switch layouts.
                </p>
                <dl className="views-demo-facts">
                  <div>
                    <dt>Format</dt>
                    <dd>Hands-on workshop</dd>
                  </div>
                  <div>
                    <dt>Duration</dt>
                    <dd>90 minutes</dd>
                  </div>
                  <div>
                    <dt>Audience</dt>
                    <dd>Curious builders</dd>
                  </div>
                </dl>
              </div>
            ),
          },
          {
            value: "agenda",
            label: "Agenda",
            children: (
              <div className="views-demo-copy">
                <h2>From focused to flexible</h2>
                <ol className="views-demo-list">
                  <li>
                    <strong>Explore · 15 min</strong>
                    <p>Navigate with tabs to focus on one section at a time.</p>
                  </li>
                  <li>
                    <strong>Connect · 30 min</strong>
                    <p>
                      Use the sidebar to jump between sections while keeping the whole page visible.
                    </p>
                  </li>
                  <li>
                    <strong>Make it yours · 45 min</strong>
                    <p>
                      Switch to the inline full page, collapse what you don’t need, and compare the
                      experience.
                    </p>
                  </li>
                </ol>
              </div>
            ),
          },
          {
            value: "resources",
            label: "Resources",
            children: (
              <div className="views-demo-copy">
                <h2>Small details, useful defaults</h2>
                <ul className="views-demo-list">
                  <li>Arrow-key navigation between tabs.</li>
                  <li>Section anchors in the sidebar for quick navigation.</li>
                  <li>Individual collapsible sections plus expand and collapse all.</li>
                  <li>A shared layout preference across the site’s multi-view pages.</li>
                </ul>
              </div>
            ),
          },
          {
            value: "notes",
            label: "Your notes",
            children: (
              <div className="views-demo-copy">
                <h2>A little room to experiment</h2>
                <label className="views-demo-label">
                  Workshop notes
                  <textarea
                    value={notes}
                    onChange={(event) => {
                      return setNotes(event.target.value);
                    }}
                  />
                </label>
                <p>
                  Your draft is kept while you switch layouts. It resets when you leave this demo or
                  reload.
                </p>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
};

export const Route = createFileRoute("/experiments/views")({
  head: () => {
    return { meta: [{ title: "Page views playground — Samuel Bernheim" }] };
  },
  component: ViewsPlayground,
});
