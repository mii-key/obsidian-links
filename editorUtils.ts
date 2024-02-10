import { Editor } from "obsidian";

export function selectWordUnderCursor(editor: Editor): string {
  const cursorOffset = editor.posToOffset(editor.getCursor('from'));
  const text = editor.getValue();
  const stopChar = new Set<string>([' ', '\t', '(', ')', '{', '}', '[', ']', '.', ',', '\r', '\n', ':', ';', '\xa0']);
  if (!stopChar.has(text[cursorOffset])) {
    let leftIdx = cursorOffset;
    while (--leftIdx > 0 && !stopChar.has(text[leftIdx]));
    if (++leftIdx < 0) {
      leftIdx = 0;
    }

    let rightIdx = cursorOffset;
    while (++rightIdx < text.length && !stopChar.has(text[rightIdx]));

    if (leftIdx < rightIdx) {
      editor.setSelection(editor.offsetToPos(leftIdx), editor.offsetToPos(rightIdx));
      return text.substring(leftIdx, rightIdx);
    }

  }
  return '';
}