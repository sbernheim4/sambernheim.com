import { createFileRoute } from '@tanstack/react-router'
import { OrganizationsPage } from '../features/workspace/components/WorkspacePages'

export const Route = createFileRoute('/organizations/')({ ssr: false, component: OrganizationsPage })
