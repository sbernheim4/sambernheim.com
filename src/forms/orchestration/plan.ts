import type { AnyForm, FormInput } from "./types";

export type SaveNode = {
  id: string;
  form: FormInput;
  dependencies: readonly string[];
  dependents: readonly string[];
};

export type SavePlan = {
  nodes: ReadonlyMap<string, SaveNode>;
  order: readonly string[];
};

export const compileSavePlan = <P extends readonly AnyForm[]>(forms: P) => {
  const errors: Error[] = [];
  const byId = new Map<string, FormInput>();
  const seen = new Set<string>();

  for (const form of forms) {
    if (seen.has(form.id)) {
      errors.push(new Error(`Duplicate form ID: ${form.id}`));
    }
    seen.add(form.id);
    byId.set(form.id, form);
  }

  for (const form of forms) {
    for (const dependency of form.dependencies ?? []) {
      if (!byId.has(dependency.id)) {
        errors.push(new Error(`Missing dependency ${dependency.id} for ${form.id}.`));
      }
      if (dependency.id === form.id) {
        errors.push(new Error(`Form ${form.id} cannot depend on itself.`));
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string, path: readonly string[]) => {
    if (visiting.has(id)) {
      errors.push(new Error(`Circular dependency detected: ${[...path, id].join(" -> ")}.`));
      return;
    }
    if (visited.has(id)) {
      return;
    }
    visiting.add(id);
    for (const dependency of byId.get(id)?.dependencies ?? []) {
      if (byId.has(dependency.id)) {
        visit(dependency.id, [...path, id]);
      }
    }
    visiting.delete(id);
    visited.add(id);
  };
  for (const form of forms) {
    visit(form.id, []);
  }

  const dependents = new Map<string, string[]>();
  for (const form of forms) {
    dependents.set(form.id, []);
  }
  for (const form of forms) {
    for (const dependency of form.dependencies ?? []) {
      dependents.get(dependency.id)?.push(form.id);
    }
  }

  const nodes = new Map<string, SaveNode>();
  for (const form of forms) {
    nodes.set(form.id, {
      id: form.id,
      form,
      dependencies: (form.dependencies ?? []).map(({ id }) => {
        return id;
      }),
      dependents: dependents.get(form.id) ?? [],
    });
  }

  return {
    plan: {
      nodes,
      order: forms.map(({ id }) => {
        return id;
      }),
    },
    errors,
  };
};
