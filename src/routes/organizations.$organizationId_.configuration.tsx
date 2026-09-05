import { createFileRoute } from '@tanstack/react-router'
import { OrganizationConfiguration } from '../features/workspace/components/OrganizationConfiguration'

export const Route = createFileRoute(
  '/organizations/$organizationId_/configuration',
)({
  ssr: false,
  component: ConfigurationRoute,
})
function ConfigurationRoute() {
  const { organizationId } = Route.useParams()
  return <OrganizationConfiguration id={organizationId} />
}
