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
  const existingBlog = detailData?.data;

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
      <div className="h-full overflow-y-scroll p-6 md:p-8">
        <div className="w-full max-w-[1600px] mx-auto text-center text-muted-foreground">{t("blog.loadingPostData")}</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-scroll p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
        <Breadcrumb 
          items={[
            { label: t("common.blog"), href: ROUTES.BLOG.url },
            { label: editId ? t("blog.editPost") : t("blog.createPost") }
          ]} 
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              {editId ? t("blog.editPost") : t("blog.createPost")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("blog.description", { defaultValue: "Share your language learning experience, tips, and insights." })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-3xl bg-card border border-border/80 p-6 md:p-8 shadow-xs space-y-5">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-bold text-foreground">
                {t("blog.titleLabel")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("blog.titlePlaceholder")}
                required
                className="w-full h-11 rounded-2xl border border-border/80 bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 shadow-xs transition-all"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="mb-2 block text-sm font-bold text-foreground">{t("blog.excerptLabel")}</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder={t("blog.excerptPlaceholder")}
                rows={2}
                className="w-full resize-none rounded-2xl border border-border/80 bg-background p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 shadow-xs transition-all"
              />
            </div>

            {/* Cover image */}
            <div>
              <label className="mb-2 block text-sm font-bold text-foreground">{t("blog.coverImageLabel")}</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder={t("blog.coverImagePlaceholder")}
                    className="flex-1 h-11 rounded-2xl border border-border/80 bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 shadow-xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadImage.isPending}
                    className="flex items-center gap-2 rounded-2xl bg-muted/60 border border-border/80 shadow-xs px-4 h-11 text-sm font-semibold hover:bg-muted transition-all disabled:opacity-50 cursor-pointer"
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
                  <p className="text-xs text-primary font-semibold animate-pulse">{t("blog.uploadingImage")}</p>
                )}

                {coverImage && (
                  <div className="relative rounded-2xl overflow-hidden border border-border/80 shadow-xs bg-muted/30 p-2 max-h-56 flex justify-center">
                    <img
                      src={coverImage}
                      alt={t("blog.coverPreviewAlt")}
                      className="max-h-52 w-auto rounded-xl object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="mb-2 block text-sm font-bold text-foreground">{t("blog.visibilityLabel")}</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                    isPublic
                      ? "border-primary/30 bg-primary/10 text-primary shadow-xs"
                      : "border-border/80 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Globe size={16} />
                  {t("blog.public")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                    !isPublic
                      ? "border-primary/30 bg-primary/10 text-primary shadow-xs"
                      : "border-border/80 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Lock size={16} />
                  {t("blog.private")}
                </button>
              </div>
            </div>
          </div>

          {/* Content Editor Card */}
          <div className="rounded-3xl bg-card border border-border/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border/60 bg-muted/20">
              <label className="block text-sm font-bold text-foreground">
                {t("blog.contentLabel")} <span className="text-destructive">*</span>
              </label>
            </div>
            <EditorToolbar editor={editor} />
            <div className="min-h-[360px] p-2 bg-background/50">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-border/80 px-6 h-11 text-sm font-semibold hover:bg-muted transition-all cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={createBlog.isPending || updateBlog.isPending || !title.trim()}
              className="rounded-2xl bg-primary px-8 h-11 text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-xs hover:shadow-md active:scale-98 disabled:opacity-40 transition-all cursor-pointer"
            >
              {createBlog.isPending || updateBlog.isPending ? t("blog.saving") : (editId ? t("blog.saveChanges") : t("blog.publish"))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
