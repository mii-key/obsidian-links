import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { IObsidianProxy } from "./IObsidianProxy";

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

		console.log('extract');
		console.log(this.isEnabled())
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

				while (blockStart >= 0 && text[blockStart] == '#'){
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
				idx = ++blockEnd;
				while (idx < text.length && text[idx] == '#'){
					idx ++;
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
		editor.setSelection(editor.offsetToPos(blockStart), editor.offsetToPos(blockEnd))
	}
}