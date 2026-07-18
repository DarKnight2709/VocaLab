import {type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
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
} from "lucide-react";
import { useUploadImageMutation } from "@/shared/hooks/useUpload";
import { useTranslation } from "@/shared/hooks/useTranslation";

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: ReactNode;
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

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const { t } = useTranslation();
  const uploadImage = useUploadImageMutation();
  if (!editor) return null;

  const setAlignment = (align: "left" | "center" | "right") => {
    if (editor.isActive("image")) {
      editor.chain().focus().updateAttributes("image", { align }).run();
      return;
    }
    editor.chain().focus().setTextAlign(align).run();
  };

  const isAlignActive = (align: "left" | "center" | "right") => {
    if (editor.isActive("image")) {
      return editor.getAttributes("image").align === align;
    }
    return editor.isActive({ textAlign: align });
  };

  const addLink = () => {
    const url = prompt(t("blog.editor.enterUrl"));
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        // use mutation
        uploadImage.mutate(file, {
          onSuccess: (data) => {
            if (data && data.url) {
              editor
                .chain()
                .focus()
                .setImage({
                  src: data.url,
                  width: 300,
                })
                .updateAttributes("image", { align: "left" })
                .run();
            }
          },
        });
      } catch (err) {
        console.error(err);
      }
    };

    input.click();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl shadow-sm border-b-0 bg-muted/30 px-2 py-1.5">
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title={t("blog.editor.bold")}
      >
        <Bold size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title={t("blog.editor.italic")}
      >
        <Italic size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title={t("blog.editor.underline")}
      >
        <UnderlineIcon size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title={t("blog.editor.strike")}
      >
        <Strikethrough size={15} />
      </ToolbarBtn>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title={t("blog.editor.h1")}
      >
        <Heading1 size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title={t("blog.editor.h2")}
      >
        <Heading2 size={15} />
      </ToolbarBtn>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title={t("blog.editor.list")}
      >
        <List size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title={t("blog.editor.orderedList")}
      >
        <ListOrdered size={15} />
      </ToolbarBtn>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarBtn
        onClick={() => setAlignment("left")}
        active={isAlignActive("left")}
        title={t("blog.editor.alignLeft")}
      >
        <AlignLeft size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => setAlignment("center")}
        active={isAlignActive("center")}
        title={t("blog.editor.alignCenter")}
      >
        <AlignCenter size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => setAlignment("right")}
        active={isAlignActive("right")}
        title={t("blog.editor.alignRight")}
      >
        <AlignRight size={15} />
      </ToolbarBtn>
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarBtn
        onClick={addLink}
        active={editor.isActive("link")}
        title={t("blog.editor.insertLink")}
      >
        <LinkIcon size={15} />
      </ToolbarBtn>
      <ToolbarBtn onClick={addImage} title={t("blog.editor.insertImage")}>
        <ImageIcon size={15} />
      </ToolbarBtn>
    </div>
  );
}
