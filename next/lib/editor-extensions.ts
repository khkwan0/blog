import type { Extensions } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";

export function createEditorExtensions(options?: { placeholder?: string }): Extensions {
  const extensions: Extensions = [
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

  if (options?.placeholder) {
    extensions.push(
      Placeholder.configure({
        placeholder: options.placeholder,
      }),
    );
  }

  return extensions;
}
