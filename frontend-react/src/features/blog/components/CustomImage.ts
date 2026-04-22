// CustomImage.ts
import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImage } from "./ResizableImage";

export const CustomImage = Image.extend({
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "auto",
        parseHTML: (element) => {
          const el = element as HTMLElement;
          const dataWidth = el.getAttribute("data-width");
          if (dataWidth) return dataWidth;

          const width = el.style.width;
          return width || "auto";
        },
        renderHTML: (attributes) => {
          if (!attributes.width || attributes.width === "auto") {
            return {};
          }
          return { "data-width": String(attributes.width) };
        },
      },
      align: {
        default: "left",
        parseHTML: (element) => {
          const el = element as HTMLElement;
          const dataAlign = el.getAttribute("data-align");
          if (dataAlign) return dataAlign;

          const marginLeft = el.style.marginLeft;
          const marginRight = el.style.marginRight;

          if (marginLeft === "auto" && marginRight === "auto") return "center";
          if (marginLeft === "auto") return "right";
          return "left";
        },
        renderHTML: (attributes) => {
          const align = attributes.align || "left";
          return { "data-align": align };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage);
  },
});