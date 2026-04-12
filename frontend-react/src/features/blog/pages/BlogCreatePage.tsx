import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Globe,
  Lock,
} from "lucide-react";
import { useCreateBlogMutation } from "@/features/blog/api/blogService";
import ROUTES from "@/shared/lib/routes";
import Breadcrumb from "@/shared/components/Breadcrumb";

// ──────────────────────────────────────────────
// Toolbar button helper
// ──────────────────────────────────────────────
function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`rounded p-1.5 transition-colors hover:bg-muted ${active ? "bg-muted text-primary" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}

// ──────────────────────────────────────────────
// Editor toolbar
// ──────────────────────────────────────────────
function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const addLink = () => {
    const url = prompt("Nhập URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = prompt("Nhập URL ảnh:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl border border-b-0 bg-muted/30 px-2 py-1.5">
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="In đậm"
      >
        <Bold size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="In nghiêng"
      >
        <Italic size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Gạch chân"
      >
        <UnderlineIcon size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Gạch ngang"
      >
        <Strikethrough size={15} />
      </ToolbarBtn>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Tiêu đề 1"
      >
        <Heading1 size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Tiêu đề 2"
      >
        <Heading2 size={15} />
      </ToolbarBtn>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Danh sách"
      >
        <List size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Danh sách đánh số"
      >
        <ListOrdered size={15} />
      </ToolbarBtn>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarBtn
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Căn trái"
      >
        <AlignLeft size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Căn giữa"
      >
        <AlignCenter size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Căn phải"
      >
        <AlignRight size={15} />
      </ToolbarBtn>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarBtn
        onClick={addLink}
        active={editor.isActive("link")}
        title="Chèn liên kết"
      >
        <LinkIcon size={15} />
      </ToolbarBtn>
      <ToolbarBtn onClick={addImage} title="Chèn ảnh">
        <ImageIcon size={15} />
      </ToolbarBtn>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────
export default function BlogCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const createBlog = useCreateBlogMutation();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      LinkExt.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Bắt đầu viết nội dung bài viết của bạn...",
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[300px] outline-none py-4 px-4",
      },
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!editor) return;
      const content = editor.getHTML();
      if (!title.trim() || !content || content === "<p></p>") return;

      createBlog.mutate(
        {
          title: title.trim(),
          content,
          excerpt: excerpt.trim() || undefined,
          coverImage: coverImage.trim() || undefined,
          isPublic,
        },
        {
          onSuccess: () => navigate(ROUTES.BLOG.url),
        },
      );
    },
    [editor, title, excerpt, coverImage, isPublic, createBlog, navigate],
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Breadcrumb 
        items={[
          { label: "Blog", href: ROUTES.BLOG.url },
          { label: editId ? "Chỉnh sửa bài viết" : "Viết bài mới" }
        ]} 
      />

      <h1 className="mb-6 text-2xl font-bold">
        {editId ? "Chỉnh sửa bài viết" : "Viết bài mới"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Tiêu đề <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề bài viết..."
            required
            className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Mô tả ngắn</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Mô tả ngắn về bài viết (tùy chọn)..."
            rows={2}
            className="w-full resize-none rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Cover image */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            URL ảnh bìa
          </label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg (tùy chọn)"
            className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {coverImage && (
            <img
              src={coverImage}
              alt="cover preview"
              className="mt-2 h-36 w-full rounded-xl object-cover"
            />
          )}
        </div>

        {/* Visibility */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Hiển thị</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors ${
                isPublic
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              <Globe size={15} />
              Công khai
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors ${
                !isPublic
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              <Lock size={15} />
              Riêng tư
            </button>
          </div>
        </div>

        {/* Content editor */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Nội dung <span className="text-destructive">*</span>
          </label>
          <div className="overflow-hidden rounded-xl border focus-within:ring-2 focus-within:ring-primary/50">
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border px-6 py-2.5 text-sm hover:bg-muted"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={createBlog.isPending || !title.trim()}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {createBlog.isPending ? "Đang đăng..." : "Đăng bài"}
          </button>
        </div>
      </form>
    </div>
  );
}
