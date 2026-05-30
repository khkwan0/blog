/** True when the editor has no meaningful text or images. */
export function isEmptyEditorHtml(html: string, text: string) {
  if (text.trim()) {
    return false;
  }

  if (/<img\b/i.test(html)) {
    return false;
  }

  return !html.trim() || html === "<p></p>";
}
