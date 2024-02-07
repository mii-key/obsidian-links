import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { IObsidianProxy } from "./IObsidianProxy";
import { selectWordUnderCursor } from "../editorUtils";

export class CreateLinkFromSelectionCommand extends CommandBase {
	obsidianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-create-link-from-selection';
		this.displayNameCommand = 'Create link';
		this.displayNameContextMenu = 'Create link';
		this.icon = 'link';
		this.obsidianProxy = obsidianProxy;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		let selection = editor.getSelection();

		if (checking) {
			return !!selection
				|| (this.obsidianProxy.settings.ffAutoselectWordOnCreateLink
					&& this.obsidianProxy.settings.autoselectWordOnCreateLink);
		}

		if (this.obsidianProxy.settings.ffAutoselectWordOnCreateLink
			&& this.obsidianProxy.settings.autoselectWordOnCreateLink) {
			selection = selectWordUnderCursor(editor);
		}
		const linkStart = editor.posToOffset(editor.getCursor('from'));
		editor.replaceSelection(`[[|${selection}]]`);
		editor.setCursor(editor.offsetToPos(linkStart + 2));
	}
}