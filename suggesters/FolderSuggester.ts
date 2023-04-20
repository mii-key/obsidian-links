// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { TAbstractFile, TFile, TFolder } from 'obsidian'
import { TextInputSuggest } from './suggest'

export class FolderSuggest extends TextInputSuggest<TFile> {
  getSuggestions (inputStr: string): TFile[] {
    const notes = app.vault.getMarkdownFiles()
    const matchedNotes: TFile[] = []
    const lowerCaseInputStr = inputStr.toLowerCase()

    notes.forEach((file: TFile) => {
      if (
        file.path.toLowerCase().contains(lowerCaseInputStr)
      ) {
        matchedNotes.push(file)
      }
    })

    return matchedNotes
  }

  renderSuggestion (file: TFile, el: HTMLElement): void {
    const div = el.createDiv();
    const dotIdx = file.name.lastIndexOf('.');
    const noteTitle = dotIdx > 0 ? file.name.substring(0, dotIdx) : file.name;
    div.createDiv().setText(noteTitle);
    if(file.parent && !file.parent.isRoot()){
      div.createDiv({text: file.parent.path, cls: "note-path"});
    }
  }

  selectSuggestion (file: TFile): void {
    this.inputEl.value = file.path
    this.inputEl.trigger('input')
    this.close()
  }
}
