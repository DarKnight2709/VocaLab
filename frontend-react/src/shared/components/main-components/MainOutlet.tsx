import { Outlet } from 'react-router'

export default function MainOutlet() {
  return (
    <main className="h-full min-h-0 overflow-auto overscroll-contain">
      <Outlet />
    </main>
  )
}
