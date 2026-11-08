import { publishedArticleFiles } from "./features/Site/articleCatalog";
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
import HigherLevelPrimitives, {
  meta as higherLevelPrimitivesMeta,
} from "./articles/higher-level-primitives.mdx";

export type SitePost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  Component: ComponentType;
};

const postsByFile = {
  "how-i-engineer-software": {
    ...howIEngineerSoftwareMeta.meta,
    Component: HowIEngineerSoftware,
  },
  "react-patterns": {
    ...reactPatternsMeta.meta,
    Component: ReactPatterns,
  },
  "rerender-with-route": {
    ...reRenderWithRouteMeta.meta,
    Component: ReRenderWithRoute,
  },
  "log-and-continue": {
    ...logAndContinueMeta.meta,
    Component: LogAndContinue,
  },
  "debug-driven-development": {
    ...debugDrivenDevelopmentMeta.meta,
    Component: DebugDrivenDevelopment,
  },
  "the-party-math-trick": {
    ...partyMathTrickMeta.meta,
    Component: ThePartyMathTrick,
  },
  "building-a-monad": {
    ...buildingAMonadMeta.meta,
    Component: BuildingAMonad,
  },
  "monads-are-monoids-in-the-category-of-endofunctors": {
    ...monadsAreMonoidsMeta.meta,
    Component: MonadsAreMonoids,
  },
  "the-engineers-schrodingers-cat": {
    ...engineersSchrodingersCatMeta.meta,
    Component: EngineersSchrodingersCat,
  },
  "ux-design-patterns": {
    ...uxDesignPatternsMeta.meta,
    Component: UxDesignPatterns,
  },
  "higher-level-primitives": {
    ...higherLevelPrimitivesMeta.meta,
    Component: HigherLevelPrimitives,
  },
} satisfies Record<string, SitePost>;

export const sitePosts = publishedArticleFiles.map((file) => {
  return postsByFile[file];
});

export const findSitePost = (slug: string) => {
  return sitePosts.find((post) => {
    return post.slug === slug;
  });
};
