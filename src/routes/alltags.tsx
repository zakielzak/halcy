import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/alltags')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/alltags"!</div>
}
