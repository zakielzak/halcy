import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/uncategorized')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/uncategorized"!</div>
}
