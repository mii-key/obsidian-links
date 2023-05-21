// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { TAbstractFile, TFile, TFolder } from 'obsidian'
import { TextInputSuggest } from './suggest'



class Suggestion {
  type: 'File' | 'Heading';
  file: TFile;
  heading: string;
}

export class FolderSuggest extends TextInputSuggest<Suggestion> {
  selectedFile: TFile;


  getSuggestions(inputStr: string): Suggestion[] {
    //TODO: suggest headings
    // const [headings] = app.metadataCache.getCache(file.path)
    let normalizedInput = inputStr.toLowerCase();
    const hashIdx = normalizedInput.indexOf('#');
    if (hashIdx < 0) {
      const notes = app.vault.getMarkdownFiles()
      const matchedNotes: Suggestion[] = []
      const lowerCaseInputStr = inputStr.toLowerCase()

      notes.forEach((file: TFile) => {
        if (
          file.path.toLowerCase().contains(lowerCaseInputStr)
        ) {
          matchedNotes.push({ type: 'File', file: file, heading: '' });
        }
      })
      return matchedNotes
    } else {
      const metadata = app.metadataCache.getCache(this.selectedFile.path)
      if (metadata && metadata.headings) {
        const matchedNotes: Suggestion[] = []
        const headingSearch = normalizedInput.substring(hashIdx + 1);
        metadata.headings.forEach(h => {
          if (h.heading.contains(headingSearch)) {
            matchedNotes.push({ type: 'Heading', file: this.selectedFile, heading: h.heading });
          }
        });
        return matchedNotes;
      }
      return [];
    }
  }

  renderSuggestion(suggestion: Suggestion, el: HTMLElement): void {
    switch (suggestion.type) {
      case 'File': {
        const div = el.createDiv();
        const dotIdx = suggestion.file.name.lastIndexOf('.');
        const noteTitle = dotIdx > 0 ? suggestion.file.name.substring(0, dotIdx) : suggestion.file.name;
        div.createDiv().setText(noteTitle);
        if (suggestion.file.parent && !suggestion.file.parent.isRoot()) {
          div.createDiv({ text: suggestion.file.parent.path, cls: "note-path" });
        }
      };
        break;
      case 'Heading': {
        const div = el.createDiv();
        div.createDiv().setText(suggestion.heading);
      }
    }
  }

  selectSuggestion(suggestion: Suggestion): void {
    if (suggestion.type == 'File') {
      this.selectedFile = suggestion.file;
      this.inputEl.value = suggestion.file.path;
    } else {
      this.inputEl.value = suggestion.file.path + '#' + suggestion.heading;
    }
    this.inputEl.trigger('input')
    this.close()
  }
}
