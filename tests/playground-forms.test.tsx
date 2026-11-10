import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { FormsPlayground } from "../src/features/Playground/FormsPlayground";

const setup = () => {
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <FormsPlayground />
    </QueryClientProvider>,
  );
  return userEvent.setup();
};

test("playground validates before saving, saves dependent forms, and undoes saved values", async () => {
  const user = setup();
  const email = screen.getByLabelText("Email");
  await user.clear(email);
  await user.type(email, "invalid");
  await user.click(screen.getByRole("button", { name: "Save both forms" }));
  await screen.findByText("Result: validation failed");
  expect(screen.getByLabelText("Endpoint activity")).not.toHaveTextContent("PUT");
  await user.clear(email);
  await user.type(email, "updated@example.com");
  await user.click(screen.getByRole("button", { name: "Save both forms" }));
  await screen.findByText("Result: success");
  expect(screen.getByLabelText("Saved data")).toHaveTextContent("updated@example.com");
  expect(screen.getByLabelText("Endpoint activity").textContent).toMatch(
    /PUT \/demo\/workshop.*PUT \/demo\/registration/,
  );
  await user.click(screen.getByRole("button", { name: "Undo" }));
  await waitFor(() => {
    return expect(screen.getByLabelText("Saved data")).toHaveTextContent("alex@example.com");
  });
  expect(email).toHaveValue("alex@example.com");
});

test("playground preserves partial saves and supports retry", async () => {
  const user = setup();
  const name = screen.getByLabelText("Workshop name");
  await user.clear(name);
  await user.type(name, "New workshop");
  await user.click(screen.getByRole("checkbox", { name: "Fail the next registration save" }));
  await user.click(screen.getByRole("button", { name: "Save both forms" }));
  await screen.findByText("Result: partial failure");
  expect(screen.getByLabelText("Saved data")).toHaveTextContent("New workshop");
  expect(screen.getByRole("alert")).toHaveTextContent("Save again to retry");
  await user.click(screen.getByRole("button", { name: "Save both forms" }));
  await screen.findByText("Result: success");
});

test("changing the track derives session choices and reset restores both forms", async () => {
  const user = setup();
  const track = screen.getByRole("combobox", { name: "Track" });
  // Radix's native select is its form integration; changing it drives the same onValueChange.
  const nativeSelect = track.parentElement!.querySelector("select")!;
  fireEvent.change(nativeSelect, { target: { value: "web" } });
  await waitFor(() => {
    return expect(screen.getByRole("combobox", { name: "Session" })).toHaveTextContent(
      "Composable forms",
    );
  });
  expect(screen.getByLabelText("Saved data")).toHaveTextContent('"track": "python"');
  await user.click(screen.getByRole("button", { name: "Reset unsaved changes" }));
  await waitFor(() => {
    return expect(track).toHaveTextContent("Python");
  });
  expect(screen.getByRole("combobox", { name: "Session" })).toHaveTextContent(
    "Practical Python typing",
  );
});
