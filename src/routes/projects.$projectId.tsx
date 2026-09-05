import { createFileRoute } from '@tanstack/react-router'
import { ProjectPage } from '../features/workspace/components/WorkspacePages'

export const Route = createFileRoute('/projects/$projectId')({ ssr: false, component: Page })

function Page() {
  const { projectId } = Route.useParams()
  return <ProjectPage key={projectId} id={projectId} />
}
