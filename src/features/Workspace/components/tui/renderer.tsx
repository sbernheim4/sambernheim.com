import { Text } from "ink";
import type { WorkspaceRenderer } from "../renderer";
import { Section } from "./Primitives/Section";
import { Span } from "./Primitives/Span";
import { Link } from "./Primitives/Link";
import { TuiWorkspaceNavigation } from "./Primitives/Navigation";
import { EntityList } from "./EntityList/EntityList";
import { DetailLayout, Loading, Missing, Status } from "./Layout/Layout";
import { DetailView } from "./DetailView/DetailView";
import { ChildList, DetailProperties, ProfileSummary } from "./DetailHelpers/DetailHelpers";
export { TuiWorkspaceNavigation };
export const tuiWorkspaceRenderer: WorkspaceRenderer = {
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
  DateTime: ({ value }) => {
    return <Text>{value.toLocaleString()}</Text>;
  },
  Number: ({ value }) => {
    return <Text>{value.toLocaleString()}</Text>;
  },
  EntityList,
};
