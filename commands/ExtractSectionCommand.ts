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
		if (checking) {
			if (!this.isEnabled()) {
				return false;
			}
			return true;
		}
		//TODO:

	}


}