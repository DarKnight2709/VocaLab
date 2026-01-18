export default function LeftSidebar() {
  return (
    <aside className="border-r bg-card h-full min-h-0 overflow-auto overscroll-contain">
      <div className="min-h-full flex flex-col items-center gap-3 py-4">
        <button
          type="button"
          className="h-10 w-10 rounded-xl bg-muted hover:bg-muted/70"
          title="Friends"
        />
        <button
          type="button"
          className="h-10 w-10 rounded-xl bg-muted hover:bg-muted/70"
          title="Groups"
        />
      </div>
    </aside>
  )
}
