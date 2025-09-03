import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/random')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/random"!</div>
}
