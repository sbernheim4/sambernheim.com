import { createFileRoute, notFound } from "@tanstack/react-router";
import { ComponentExample } from "@/routes/experiments/components/ComponentLibrary/ComponentExample";
import {
  catalog,
  type ComponentId,
} from "@/routes/experiments/components/ComponentLibrary/catalog";

const isComponentId = (value: string): value is ComponentId => {
  return catalog.some((entry) => {
    return entry.id === value;
  });
};

const ComponentExamplePage = () => {
  const { component } = Route.useParams();
  if (!isComponentId(component)) {
    throw notFound();
  }
  return <ComponentExample key={component} selected={component} />;
};

export const Route = createFileRoute("/experiments/components/$component")({
  beforeLoad: ({ params }) => {
    if (!isComponentId(params.component)) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const entry = catalog.find((item) => {
      return item.id === params.component;
    });
    return {
      meta: [
        {
          title: `${entry?.name ?? "Component"} — One component, two renderers`,
        },
      ],
    };
  },
  component: ComponentExamplePage,
});
