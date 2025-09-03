import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/untagged')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/untagged"!</div>
}
