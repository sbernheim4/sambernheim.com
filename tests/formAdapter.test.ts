import { test } from "node:test";
import assert from "node:assert/strict";
import { FormApi, FieldApi } from "@tanstack/form-core";
import { markFormSaved } from "../src/forms/hooks/formState";

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
