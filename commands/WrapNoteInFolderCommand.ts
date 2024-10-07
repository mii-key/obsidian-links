import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { IObsidianProxy } from "./IObsidianProxy";
import { isAbsoluteFilePath } from "utils";
import path from "path";

export class WrapNoteInFolderCommand extends CommandBase {

	obsidianProxy: IObsidianProxy;


	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.obsidianProxy = obsidianProxy;

		this.id = 'note-wrap-in-folder';
		this.displayNameCommand = 'Wrap in folder';
		this.displayNameContextMenu = 'Wrap in folder';
		this.icon = 'folder-input';

		this.isEnabled = () => this.obsidianProxy.settings.ffWrapNoteInFolder;
		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.wrapNoteInFolder;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking) {
			if (!this.isEnabled()) {
				return false;
			}

			return true;
		}

		const currentView = this.obsidianProxy.Vault.getActiveNoteView();
		if (!currentView) {
			return;
		}
		const currentNoteParentPath = currentView?.file?.parent?.path;
		const currentNotePath = currentView.file?.path;
		if (!currentNotePath || !currentNoteParentPath) {
			return
		}

		const matchNoteName = currentNotePath.match(/(.*\/)?(.*)\.md/);
		if (!matchNoteName) {
			return;
		}
		const currentNoteName = matchNoteName[2];
		(async () => {
			const hasSeparator = currentNoteParentPath[currentNoteParentPath.length - 1] === '/' ||
				currentNoteParentPath[currentNoteParentPath.length - 1] == '\\';
			const newParentFolder = `${currentNoteParentPath}${hasSeparator ? '' : '/'}${currentNoteName}`;
			await this.obsidianProxy.Vault.createFolder(newParentFolder);
			await this.obsidianProxy.Vault.rename(currentNotePath, `${newParentFolder}/${currentNoteName}.md`)
		})();

	}
}