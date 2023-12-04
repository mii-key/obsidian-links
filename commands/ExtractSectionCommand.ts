import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { IObsidianProxy } from "./IObsidianProxy";
import { RegExPatterns } from "../RegExPatterns";
import { LinkData, LinkTypes, getSafeFilename } from "../utils";
import { rawListeners } from "process";

export class ExtractSectionCommand extends CommandBase {

	obsidianProxy: IObsidianProxy;


	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.obsidianProxy = obsidianProxy;

		this.id = 'editor-extract-section';
		this.displayNameCommand = 'Extract section';
		this.displayNameContextMenu = 'Extract section';
		this.icon = 'split';

		this.isEnabled = () => this.obsidianProxy.settings.ffExtractSection;
		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.extractSection;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		const text = editor.getValue();
		if (checking) {
			if (!this.isEnabled() || !text) {
				return false;
			}

			return true;
		}

		if (!text) {
			return;
		}

		let blockStart;
		let blockEnd;
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		let found = false;
		blockStart = blockEnd = cursorOffset;
		while (true) {
			blockStart = text.lastIndexOf('# ', blockStart);
			if (blockStart < 0) {
				blockStart = 0;
				break;
			} else {

				while (blockStart >= 0 && text[blockStart] == '#') {
					blockStart--;
				}

				if (blockStart < 0 || text[blockStart] == '\n') {
					blockStart++;
					break;
				}
			}
		}
		if (blockStart < 0) {
			blockStart = 0;
		}

		found = false;
		let idx = blockEnd;
		while (true) {
			blockEnd = text.indexOf('\n#', blockEnd);
			if (blockEnd < 0) {
				blockEnd = text.length;
				break;
			} else {
				idx = blockEnd + 1;
				while (idx < text.length && text[idx] == '#') {
					idx++;
				}
				if (idx >= text.length || text[idx] == ' ') {
					break;
				}
			}
		}

		if (blockEnd >= text.length) {
			blockEnd = text.length;
		}

		const section = editor.getRange(editor.offsetToPos(blockStart), editor.offsetToPos(blockEnd))
		console.log(section)

		const currentView = this.obsidianProxy.Vault.getActiveNoteView();
		const currentNoteParentPath = currentView?.file.parent.path;
		
		const headerMatch = section.match(new RegExp(RegExPatterns.NoteHeader.source, 'im'))
		if (headerMatch) {
			const safeFilename = getSafeFilename(headerMatch[1]).trim();
			const noteFullPath =  (currentNoteParentPath === '/' ? safeFilename : 
			 `${currentNoteParentPath}/${safeFilename}`) + ".md";
			const noteContent = section.substring(headerMatch[0].length + 1);

			(async () => {
				const noteFile = await this.obsidianProxy.Vault.createNote(noteFullPath, noteContent);
				const rawWikilink = `[[${noteFullPath}|${safeFilename}]]`
				editor.replaceRange(rawWikilink, editor.offsetToPos(blockStart), editor.offsetToPos(blockEnd))
				editor.setCursor(editor.offsetToPos(blockStart + rawWikilink.length))
			})();

		}
	}
}