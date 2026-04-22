// ResizableImage.tsx
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export const ResizableImage = ({ node, updateAttributes, editor, getPos }: NodeViewProps) => {
  const { src, width, align } = node.attrs;

  const alignmentClass =
    align === "center"
      ? "mx-auto"
      : align === "right"
        ? "ml-auto mr-0"
        : "ml-0 mr-auto";

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editor.isEditable) return;
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = e.currentTarget.parentElement!.offsetWidth;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      updateAttributes({ width: `${newWidth}px` });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleSelectImage = () => {
    if (!editor.isEditable) return;
    if (typeof getPos !== "function") return;

    const pos = getPos();
    if (typeof pos !== "number") return;
    editor.chain().focus().setNodeSelection(pos).run();
  };


  return (
    <NodeViewWrapper className="block w-full">
      <div className={`relative block w-fit ${alignmentClass}`} onClick={handleSelectImage}>

        <img
          src={src}
          style={{
            width: width || "auto",
            maxWidth: "100%",
          }}
          className="cursor-pointer"
        />

        {/* resize handle */}
        {editor.isEditable && (
          <span
            onMouseDown={handleMouseDown}
            className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize bg-transparent"
          />
        )}
      </div>
    </NodeViewWrapper>
  );
};