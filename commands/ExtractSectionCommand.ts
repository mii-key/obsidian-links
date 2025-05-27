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
		let blockEnd: number | undefined;
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		blockStart = blockEnd = cursorOffset;
		let headerLevel = 1;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			blockStart = text.lastIndexOf('# ', blockStart);
			if (blockStart < 0) {
				blockStart = 0;
				break;
			} else {
				while (blockStart >= 0 && text[blockStart] == '#') {
					blockStart--;
					headerLevel++;
				}

				if (blockStart < 0 || text[blockStart] == '\n') {
					blockStart++;
					headerLevel--;
					break;
				}
			}
		}
		if (blockStart < 0) {
			blockStart = 0;
		}

		blockEnd = this.getSectionEnd(text, blockEnd, headerLevel);

		if (blockEnd === undefined) {
			blockEnd = text.length;
		}

		const section = editor.getRange(editor.offsetToPos(blockStart), editor.offsetToPos(blockEnd))

		const currentView = this.obsidianProxy.Vault.getActiveNoteView();
		const currentNoteParentPath = currentView?.file?.parent?.path;
		if (!currentNoteParentPath) {
			return
		}

		const headerMatch = section.match(new RegExp(RegExPatterns.NoteHeading.source, 'im'))
		if (headerMatch) {
			const safeFilename = getSafeFilename(headerMatch[1]).trim();
			const noteFullPath = (currentNoteParentPath === '/' ? safeFilename :
				`${currentNoteParentPath}/${safeFilename}`) + ".md";
			const noteContent = section.substring(headerMatch[0].length + 1);

			(async () => {
				const noteFile = await this.obsidianProxy.Vault.createNote(noteFullPath, noteContent);
				const rawWikilink = `[[${noteFullPath}|${safeFilename}]]`
				//TODO: use \n from section
				editor.replaceRange(rawWikilink + '\n', editor.offsetToPos(blockStart), editor.offsetToPos(blockEnd))
				editor.setCursor(editor.offsetToPos(blockStart + rawWikilink.length))
			})();

		}
	}

	getSectionEnd(text: string, start: number, headerLevel: number): number | undefined {
		// Regular expression to match headers
		const headerRegex = /^(#+)\s/;

		let position = start;

		while (position < text.length) {
			const nextLineBreak = text.indexOf('\n', position);
			const lineEnd = nextLineBreak === -1 ? text.length : nextLineBreak;
			const line = text.slice(position, lineEnd);

			const match = line.match(headerRegex);
			if (match) {
				const currentHeaderLevel = match[1].length;

				// Check if the header level is the same or smaller than the provided level
				if (currentHeaderLevel <= headerLevel) {

					return (position > 1 && text[position - 1] === '\r') ? position - 1 : position;
					// return position;
				}
			}

			position = lineEnd + 1;
		}

		return undefined;
	}

}