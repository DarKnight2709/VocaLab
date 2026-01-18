export default function BlogPage() {
  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Blogs</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Đây là khu vực Blog (placeholder). Bạn có thể render danh sách bài viết ở đây.
      </p>

      <div className="mt-6 rounded-xl border bg-card p-4">
        <div className="text-sm font-medium">Bài viết mẫu</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Chưa có nội dung. Hãy kết nối API /posts hoặc tạo mock data.
        </div>
      </div>
    </div>
  )
}
