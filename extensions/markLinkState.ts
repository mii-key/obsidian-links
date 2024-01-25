import { EditorView, ViewUpdate, ViewPlugin } from "@codemirror/view";

function markLinkState(domElement: HTMLElement) {
  const brokenLinkClass = 'broken-link';
  const links = domElement.querySelectorAll(".cm-hmd-internal-link, .cm-link, .cm-url");

  if (links) {
    [].forEach.call(links, (el: Element) => {
      if (!el.classList.contains(brokenLinkClass)) {
        // el.classList.add(brokenLinkClass);
      }
    });
  }
}

export const MarkLinkState = ViewPlugin.fromClass(
  class {
    constructor(view: EditorView) {
      markLinkState(view.dom);
    }

    update(update: ViewUpdate) {
      markLinkState(update.view.dom);
    }
  },
);
