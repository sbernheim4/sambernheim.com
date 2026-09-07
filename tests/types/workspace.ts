import type { ComponentProps } from "react";
import type { EntityList } from "../../src/features/workspace/components/EntityList";
import type { Organization, Project, Task } from "../../src/features/workspace/types";

type ListProps = ComponentProps<typeof EntityList>;
const checkEntityListTypes = (organization: Organization, project: Project, task: Task) => {
  const common = {
    title: "Resources",
    create: () => {
      return null;
    },
  };
  const organizations: ListProps = {
    ...common,
    kind: "organizations",
    items: [organization],
    projects: [project],
  };
  const projects: ListProps = {
    ...common,
    kind: "projects",
    items: [project],
    tasks: [task],
  };
  const tasks: ListProps = { ...common, kind: "tasks", items: [task] };
  // @ts-expect-error Organization lists cannot contain tasks.
  const wrongOrganizations: ListProps = {
    ...common,
    kind: "organizations",
    items: [task],
    projects: [project],
  };
  // @ts-expect-error Project lists cannot contain organizations.
  const wrongProjects: ListProps = {
    ...common,
    kind: "projects",
    items: [organization],
    tasks: [task],
  };
  // @ts-expect-error Task lists cannot contain projects.
  const wrongTasks: ListProps = { ...common, kind: "tasks", items: [project] };
  // @ts-expect-error Organization lists require projects for their child counts.
  const missingProjects: ListProps = {
    ...common,
    kind: "organizations",
    items: [organization],
  };
  // @ts-expect-error Project lists require tasks for their child counts.
  const missingTasks: ListProps = { ...common, kind: "projects", items: [project] };
  return {
    organizations,
    projects,
    tasks,
    wrongOrganizations,
    wrongProjects,
    wrongTasks,
    missingProjects,
    missingTasks,
  };
};
void checkEntityListTypes;
