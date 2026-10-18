import type { ComponentType } from "react";
import HowIEngineerSoftware, {
  meta as howIEngineerSoftwareMeta,
} from "./articles/how-i-engineer-software.mdx";
import ReactPatterns, { meta as reactPatternsMeta } from "./articles/react-patterns.mdx";
import ReRenderWithRoute, {
  meta as reRenderWithRouteMeta,
} from "./articles/rerender-with-route.mdx";
import LogAndContinue, { meta as logAndContinueMeta } from "./articles/log-and-continue.mdx";
import DebugDrivenDevelopment, {
  meta as debugDrivenDevelopmentMeta,
} from "./articles/debug-driven-development.mdx";
import ThePartyMathTrick, { meta as partyMathTrickMeta } from "./articles/the-party-math-trick.mdx";
import BuildingAMonad, { meta as buildingAMonadMeta } from "./articles/building-a-monad.mdx";
import MonadsAreMonoids, {
  meta as monadsAreMonoidsMeta,
} from "./articles/monads-are-monoids-in-the-category-of-endofunctors.mdx";
import EngineersSchrodingersCat, {
  meta as engineersSchrodingersCatMeta,
} from "./articles/the-engineers-schrodingers-cat.mdx";
import UxDesignPatterns, { meta as uxDesignPatternsMeta } from "./articles/ux-design-patterns.mdx";

export type SitePost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  Component: ComponentType;
};

export const sitePosts: readonly SitePost[] = [
  {
    ...howIEngineerSoftwareMeta.meta,
    Component: HowIEngineerSoftware,
  },
  {
    ...reactPatternsMeta.meta,
    Component: ReactPatterns,
  },
  {
    ...reRenderWithRouteMeta.meta,
    Component: ReRenderWithRoute,
  },
  {
    ...logAndContinueMeta.meta,
    Component: LogAndContinue,
  },
  {
    ...debugDrivenDevelopmentMeta.meta,
    Component: DebugDrivenDevelopment,
  },
  {
    ...partyMathTrickMeta.meta,
    Component: ThePartyMathTrick,
  },
  {
    ...buildingAMonadMeta.meta,
    Component: BuildingAMonad,
  },
  {
    ...monadsAreMonoidsMeta.meta,
    Component: MonadsAreMonoids,
  },
  {
    ...engineersSchrodingersCatMeta.meta,
    Component: EngineersSchrodingersCat,
  },
  {
    ...uxDesignPatternsMeta.meta,
    Component: UxDesignPatterns,
  },
];

export const findSitePost = (slug: string) => {
  return sitePosts.find((post) => {
    return post.slug === slug;
  });
};
