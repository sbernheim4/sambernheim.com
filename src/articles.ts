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
  publishedAt: string;
  Component: ComponentType;
};

export const sitePosts: readonly SitePost[] = [
  {
    slug: "how-i-engineer-software",
    title: "How I Engineer Software",
    description: "Concrete examples for abstract advice",
    publishedAt: "2025-06-01",
    Component: HowIEngineerSoftware,
  },
  {
    slug: "react-patterns",
    title: "A React Component and Hook Design Pattern",
    description: "A Powerful Composition in React between Components and Hooks",
    publishedAt: "2025-01-14",
    Component: ReactPatterns,
  },
  {
    slug: "rerender-with-router",
    title: "ReRender With Router",
    description: "Simpler Integration Testing for React and Testing Library",
    publishedAt: "2024-02-16",
    Component: ReRenderWithRoute,
  },
  {
    slug: "log-and-continue",
    title: "Log and Continue",
    description: "The Missing JavaScript Array Method",
    publishedAt: "2021-06-15",
    Component: LogAndContinue,
  },
  {
    slug: "debug-driven-development",
    title: "Debug Driven Development",
    description: "Write Debuggable Code",
    publishedAt: "2022-06-14",
    Component: DebugDrivenDevelopment,
  },
  {
    slug: "the-party-math-trick",
    title: "The Party Math Trick",
    description: "A Math Trick with Some Interesting Properties",
    publishedAt: "2020-09-12",
    Component: ThePartyMathTrick,
  },
  {
    slug: "building-a-monad",
    title: "Building a Monad",
    description: "An Intuitive way to Understand Monads",
    publishedAt: "2021-02-20",
    Component: BuildingAMonad,
  },
  {
    slug: "monads-are-monoids-in-the-category-of-endofunctors",
    title: "Monads are Monoids in the Category of Endofunctors",
    description: "What Makes a Monad Monadic",
    publishedAt: "2021-01-20",
    Component: MonadsAreMonoids,
  },
  {
    slug: "the-engineers-schrodingers-cat",
    title: "The Engineers Schrodingers Cat",
    description: "Excoptional The Option Object for JavaScript and TypeScript",
    publishedAt: "2020-06-20",
    Component: EngineersSchrodingersCat,
  },
];

export const findSitePost = (slug: string) => {
  return sitePosts.find((post) => {
    return post.slug === slug;
  });
};
