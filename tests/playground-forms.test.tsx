import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { FormsPlayground } from "../src/features/Playground/FormsPlayground";
import { TooltipProvider } from "../src/features/UI/components/ui/tooltip";

const setup = () => {
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <TooltipProvider>
        <FormsPlayground />
      </TooltipProvider>
    </QueryClientProvider>,
  );
  return userEvent.setup();
};

test("playground validates before saving, saves dependent forms, and undoes saved values", async () => {
  const user = setup();
  const email = screen.getByLabelText("Email");
  await user.clear(email);
  await user.type(email, "invalid");
  await user.click(screen.getByRole("button", { name: "Save workshop and registration" }));
  await screen.findByText("Result: validation failed");
  expect(screen.getByLabelText("Endpoint activity")).not.toHaveTextContent("PUT");
  await user.clear(email);
  await user.type(email, "updated@example.com");
  await user.click(screen.getByRole("button", { name: "Save workshop and registration" }));
  await screen.findByText("Result: success", {}, { timeout: 10_000 });
  expect(screen.getByLabelText("Saved data")).toHaveTextContent("updated@example.com");
  expect(screen.getByLabelText("Endpoint activity").textContent).toMatch(
    /PUT \/demo\/workshop.*PUT \/demo\/registration/,
  );
  await user.click(screen.getByRole("button", { name: "Undo" }));
  await waitFor(() => {
    return expect(screen.getByLabelText("Saved data")).toHaveTextContent("alex@example.com");
  });
  expect(email).toHaveValue("alex@example.com");
}, 15_000);

test("playground preserves partial saves and supports retry", async () => {
  const user = setup();
  const name = screen.getByLabelText("Workshop name");
  await user.clear(name);
  await user.type(name, "New workshop");
  await user.click(screen.getByRole("checkbox", { name: "Fail the next registration save" }));
  await user.click(screen.getByRole("button", { name: "Save workshop and registration" }));
  await screen.findByText("Result: partial failure", {}, { timeout: 10_000 });
  expect(screen.getByLabelText("Saved data")).toHaveTextContent("New workshop");
  expect(screen.getByRole("alert")).toHaveTextContent("Save again to retry");
  await user.click(screen.getByRole("button", { name: "Save workshop and registration" }));
  await screen.findByText("Result: success", {}, { timeout: 10_000 });
}, 15_000);

test("changing the track derives session choices and reset restores both forms", async () => {
  const user = setup();
  const track = screen.getByRole("radio", { name: "Python" });
  await user.click(screen.getByRole("radio", { name: "Web engineering" }));
  await waitFor(() => {
    return expect(screen.getByRole("radio", { name: "Composable forms" })).toBeChecked();
  });
  expect(screen.getByLabelText("Saved data")).toHaveTextContent('"track": "python"');
  await user.click(screen.getByRole("button", { name: "Reset unsaved changes" }));
  await waitFor(() => {
    return expect(track).toBeChecked();
  });
  expect(screen.getByRole("radio", { name: "Practical Python typing" })).toBeChecked();
});
