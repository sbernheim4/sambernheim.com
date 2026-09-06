import { test } from "node:test";
import assert from "node:assert/strict";
import { FormApi, FieldApi } from "@tanstack/form-core";
import { validateSnapshot, markFormSaved } from "../src/forms/hooks/formState.ts";

test("snapshot adapter awaits field and form validators, maps errors without submitting", async () => {
  let submits = 0;
  const form = new FormApi({
    defaultValues: { name: "" },
    validators: {
      onSubmitAsync: async ({ value }) => {
        await Promise.resolve();
        return value.name === "bad" ? "form error" : undefined;
      },
    },
    onSubmitMeta: undefined,
    onSubmit: () => {
      submits++;
    },
  });
  const dispose = form.mount();
  const field = new FieldApi({
    form,
    name: "name",
    validators: {
      onSubmitAsync: async ({ value }) => (!value ? "field error" : undefined),
    },
  });
  const disposeField = field.mount();
  assert.equal((await validateSnapshot(form, { name: "" })).valid, false);
  assert.deepEqual(field.state.meta.errors, ["field error"]);
  form.setFieldValue("name", "bad");
  assert.equal((await validateSnapshot(form, { name: "bad" })).valid, false);
  assert.deepEqual(form.state.errors, ["form error"]);
  form.setFieldValue("name", "good");
  assert.equal((await validateSnapshot(form, { name: "good" })).valid, true);
  assert.equal(submits, 0);
  disposeField();
  dispose();
});

test("validation observes detached values during asynchronous edits", async () => {
  const observations: string[] = [];
  const form = new FormApi({
    defaultValues: { name: "submitted" },
    onSubmitMeta: undefined,
    validators: {
      onSubmitAsync: async ({ value, formApi }) => {
        await new Promise((r) => setTimeout(r, 5));
        observations.push(value.name, formApi.state.values.name);
        return undefined;
      },
    },
  });
  const dispose = form.mount();
  const pending = validateSnapshot(form, { name: "submitted" });
  form.setFieldValue("name", "later");
  await pending;
  assert.deepEqual(observations, ["submitted", "submitted"]);
  assert.equal(form.state.values.name, "later");
  dispose();
});

test("marking a form saved retains form shape and subsequent dirty edits", () => {
  const form = new FormApi({
    defaultValues: { displayName: "old" },
    onSubmitMeta: undefined,
  });
  const dispose = form.mount();
  const field = new FieldApi({ form, name: "displayName" });
  const disposeField = field.mount();
  form.setFieldValue("displayName", "submitted");
  markFormSaved(form, { displayName: "submitted" });
  assert.equal(form.state.isDirty, false);
  assert.deepEqual(form.options.defaultValues, { displayName: "submitted" });
  form.setFieldValue("displayName", "later");
  markFormSaved(form, { displayName: "submitted" });
  assert.equal(form.state.values.displayName, "later");
  assert.equal(form.state.isDirty, true);
  assert.equal(form.state.isDefaultValue, false);
  form.reset();
  assert.equal(form.state.values.displayName, "submitted");
  disposeField();
  dispose();
});
