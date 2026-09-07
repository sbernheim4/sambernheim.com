import type { ComponentType } from "react";
import HowIEngineerSoftware from "./articles/how-i-engineer-software.mdx";
import ReactPatterns from "./articles/react-patterns.mdx";
import ReRenderWithRoute from "./articles/rerender-with-route.mdx";
import LogAndContinue from "./articles/log-and-continue.mdx";
import DebugDrivenDevelopment from "./articles/debug-driven-development.mdx";
import ThePartyMathTrick from "./articles/the-party-math-trick.mdx";
import BuildingAMonad from "./articles/building-a-monad.mdx";
import MonadsAreMonoids from "./articles/monads-are-monoids-in-the-category-of-endofunctors.mdx";
import EngineersSchrodingersCat from "./articles/the-engineers-schrodingers-cat.mdx";

export type SitePost = {
  slug: string;
  title: string;
  description: string;
  Component: ComponentType;
};

export const sitePosts: readonly SitePost[] = [
  {
    slug: "how-i-engineer-software",
    title: "How I Engineer Software",
    description: "Concrete examples for abstract advice",
    Component: HowIEngineerSoftware,
  },
  {
    slug: "react-patterns",
    title: "A React Component and Hook Design Pattern",
    description: "A powerful composition in React between components and hooks",
    Component: ReactPatterns,
  },
  {
    slug: "rerender-with-route",
    title: "Re-render with Route",
    description: "Thoughts on route-driven rendering",
    Component: ReRenderWithRoute,
  },
  {
    slug: "log-and-continue",
    title: "Log and Continue",
    description: "A practical debugging habit",
    Component: LogAndContinue,
  },
  {
    slug: "debug-driven-development",
    title: "Debug Driven Development",
    description: "Use debugging to guide development",
    Component: DebugDrivenDevelopment,
  },
  {
    slug: "the-party-math-trick",
    title: "The Party Math Trick",
    description: "A mathematical party trick",
    Component: ThePartyMathTrick,
  },
  {
    slug: "building-a-monad",
    title: "Building a Monad",
    description: "An exploration of monads",
    Component: BuildingAMonad,
  },
  {
    slug: "monads-are-monoids-in-the-category-of-endofunctors",
    title: "Monads are Monoids in the Category of Endofunctors",
    description: "A practical explanation",
    Component: MonadsAreMonoids,
  },
  {
    slug: "the-engineers-schrodingers-cat",
    title: "The Engineer's Schrodinger's Cat",
    description: "Software engineering observations",
    Component: EngineersSchrodingersCat,
  },
];

export const findSitePost = (slug: string) => {
  return sitePosts.find((post) => {
    return post.slug === slug;
  });
};
