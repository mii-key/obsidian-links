import { Editor, TAbstractFile } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, isAbsoluteFilePath, removeLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import { ButtonInfo, PromptModal } from "ui/PromptModal";

export class DeleteLinkCommand extends CommandBase {

	obsidianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);

		this.obsidianProxy = obsidianProxy;

		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.deleteLink;

		this.id = 'editor-delete-link';
		this.displayNameCommand = 'Delete link';
		this.displayNameContextMenu = 'Delete';
		this.icon = 'trash-2';
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset);
		if (checking) {
			return !!linkData;
		}
		if (linkData) {
			this.deleteLink(linkData, editor);
		}
	}

	deleteLink(linkData: LinkData, editor: Editor) {

		editor.replaceRange(
			'',
			editor.offsetToPos(linkData.position.start),
			editor.offsetToPos(linkData.position.end));

		//TODO: draft!

		if (this.obsidianProxy.settings.ffDeleteUnreferencedLinkTarget
			&& linkData.destination
			&& !isAbsoluteFilePath(linkData.destination.content)) {
			const cache = this.obsidianProxy.Vault.getBacklinksForFileByPath(linkData.destination.content);
			if (cache) {
				const backlinksCount = Object.keys(cache).length;
				//TODO: check duplicate links in the file
				if (backlinksCount === 1) {
					new PromptModal(this.obsidianProxy.app,
						"Delete file",
						[
							`The file "${linkData.destination.content}" is no longer referenced by any note.`,
							"Do you want to delete it?"
						],
						[
							new ButtonInfo('Delete', 'Delete', true, true),
							new ButtonInfo('Cancel', 'Cancel')
						],
						(result) => {
							if (result === 'Delete') {
								const targetFile = this.obsidianProxy.Vault.getAbstractFileByPath(linkData.destination!.content);
								if (targetFile) {
									this.obsidianProxy.Vault.delete(targetFile);
								}
							}
						})
						.open();
				}
			}
		}

	}
}