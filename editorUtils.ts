import { Editor } from "obsidian";

export function selectWordUnderCursor(editor: Editor): string {
  const cursorOffset = editor.posToOffset(editor.getCursor('from'));
  const text = editor.getValue();
  const stopChar = new Set<string>([' ', '\t', '(', ')', '{', '}', '[', ']', '.', ',', '\r', '\n', ':', ';', '\xa0']);
  if (!stopChar.has(text[cursorOffset])
    || !stopChar.has(text[Math.max(cursorOffset - 1, 0)])) {
    let leftIdx = cursorOffset;
    while (leftIdx > 0 && !stopChar.has(text[leftIdx - 1])) {
      leftIdx--;
    }


    let rightIdx = cursorOffset;
    while (rightIdx < text.length && !stopChar.has(text[rightIdx])) {
      rightIdx++;
    }

    if (leftIdx < rightIdx) {
      editor.setSelection(editor.offsetToPos(leftIdx), editor.offsetToPos(rightIdx));
      return text.substring(leftIdx, rightIdx);
    }

  }
  return '';
}