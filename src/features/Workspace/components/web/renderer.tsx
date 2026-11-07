import { CycleableDateTime, Number as FormattedNumber } from "@/features";
import type { WorkspaceRenderer } from "../renderer";
import { Section } from "./Primitives/Section";
import { Span } from "./Primitives/Span";
import { Link } from "./Primitives/Link";
import { EntityList } from "./EntityList/EntityList";
import { DetailLayout, Loading, Missing, Status } from "./Layout/Layout";
import { DetailView } from "./DetailView/DetailView";
import { ChildList, DetailProperties, ProfileSummary } from "./DetailHelpers/DetailHelpers";
export const webWorkspaceRenderer: WorkspaceRenderer = {
  Section,
  Span,
  Link,
  DetailLayout,
  DetailView,
  DetailProperties,
  ChildList,
  ProfileSummary,
  Status,
  Loading,
  Missing,
  DateTime: CycleableDateTime,
  Number: FormattedNumber,
  EntityList,
};
