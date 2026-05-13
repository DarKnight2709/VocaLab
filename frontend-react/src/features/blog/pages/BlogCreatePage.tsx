import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExt from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  Globe,
  Lock,
  UploadCloud,
} from "lucide-react";
import { 
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useBlogDetailQuery
} from "@/features/blog/api/blogService";
import { useUploadImageMutation } from "@/shared/hooks/useUpload";
import ROUTES from "@/shared/lib/routes";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { EditorToolbar } from "@/features/blog/components/EditorToolbar";
import { CustomImage } from "../components/CustomImage";
import { useTranslation } from "@/shared/hooks/useTranslation";

// ──────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────
export default function BlogCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const createBlog = useCreateBlogMutation();
  const updateBlog = useUpdateBlogMutation();
  const uploadImage = useUploadImageMutation();
  const { data: detailData, isLoading } = useBlogDetailQuery(editId || "");
  const existingBlog = detailData?.data?.blog;

  const editor = useEditor({
    extensions: [
StarterKit.configure({
  heading: {
    levels: [1, 2],
  },
}),      Underline,
      CustomImage,
      LinkExt.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: t("blog.contentPlaceholder"),
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[300px] outline-none py-4 px-4 " +
          "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:my-3 " +
          "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:my-3 " +
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 " +
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 " +
          "[&_li]:my-1",
      },
    },
  });

  useEffect(() => {
    if (existingBlog && editor && !editor.isDestroyed && !title) {
      setTitle(existingBlog.title || "");
      setExcerpt(existingBlog.excerpt || "");
      setCoverImage(existingBlog.coverImage || "");
      setIsPublic(existingBlog.isPublic ?? true);
      
      queueMicrotask(() => {
        editor.commands.setContent(existingBlog.content);
      });
    }
  }, [existingBlog, editor]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadImage.mutate(file, {
      onSuccess: (data) => {
        if (data && data.url) {
          setCoverImage(data.url);
        }
      },
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!editor) return;
      const content = editor.getHTML();
      if (!title.trim() || !content || content === "<p></p>") return;

      const payload = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        isPublic,
      };

      if (editId) {
        updateBlog.mutate({ id: editId, data: payload }, {
          onSuccess: () => navigate(ROUTES.BLOG_DETAIL.url.replace(":id", editId)),
        });
      } else {
        createBlog.mutate(payload, {
          onSuccess: () => navigate(ROUTES.BLOG.url),
        });
      }
    },
    [editor, title, excerpt, coverImage, isPublic, createBlog, updateBlog, navigate, editId],
  );

  if (editId && isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="text-center text-muted-foreground">{t("blog.loadingPostData")}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Breadcrumb 
        items={[
          { label: t("common.blog"), href: ROUTES.BLOG.url },
          { label: editId ? t("blog.editPost") : t("blog.createPost") }
        ]} 
      />

      <h1 className="mb-6 text-2xl font-bold">
        {editId ? t("blog.editPost") : t("blog.createPost")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("blog.titleLabel")} <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("blog.titlePlaceholder")}
            required
            className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("blog.excerptLabel")}</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder={t("blog.excerptPlaceholder")}
            rows={2}
            className="w-full resize-none rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Cover image */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("blog.coverImageLabel")}</label>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder={t("blog.coverImagePlaceholder")}
                className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
                <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadImage.isPending}
                className="flex items-center gap-2 rounded-xl border bg-muted/50 px-4 py-2.5 text-sm transition-colors hover:bg-muted disabled:opacity-50"
              >
                <UploadCloud size={16} />
                <span className="hidden sm:inline">{t("blog.uploadImage")}</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            {uploadImage.isPending && (
              <p className="text-xs text-muted-foreground animate-pulse">{t("blog.uploadingImage")}</p>
            )}
            {coverImage && (
              <div className="mt-2 flex justify-center rounded-xl border bg-muted/30 p-2">
                <img
                  src={coverImage}
                  alt={t("blog.coverPreviewAlt")}
                  className="max-h-40 w-auto rounded-lg object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("blog.visibilityLabel")}</label>
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
              {t("blog.public")}
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
              {t("blog.private")}
            </button>
          </div>
        </div>

        {/* Content editor */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("blog.contentLabel")} <span className="text-destructive">*</span>
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
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={createBlog.isPending || updateBlog.isPending || !title.trim()}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {createBlog.isPending || updateBlog.isPending ? t("blog.saving") : (editId ? t("blog.saveChanges") : t("blog.publish"))}
          </button>
        </div>
      </form>
    </div>
  );
}
