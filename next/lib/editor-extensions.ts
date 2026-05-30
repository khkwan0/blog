import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";

export function createEditorExtensions() {
  return [
    StarterKit,
    Image.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: "post-image",
        loading: "lazy",
        decoding: "async",
      },
    }),
  ];
}
