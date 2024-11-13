import { Editor, TFile } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { LinkData, LinkTypes, findLinks, isAbsoluteFilePath, isAbsoluteUri } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import parseFilepath from "parse-filepath";
import { ButtonInfo } from "../ui/PromotModal.common";

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

		const selection = editor.getSelection();
		const text = editor.getValue();
		const cursorOffsetStart = editor.posToOffset(editor.getCursor('from'));
		const cursorOffsetEnd = editor.posToOffset(editor.getCursor('to'));

		const links = findLinks(text, LinkTypes.All, cursorOffsetStart, cursorOffsetEnd);
		if (checking) {
			if (selection) {
				console.log("'Delete link' command: Selected text is not supported.");
				return false;
			}
			if (links?.length == 0) {
				console.log("'Delete link' command: No links found.");
				return false;
			}
			if (links?.length > 1) {
				console.log("'Delete link' command: Multiple links are not supported.");
				return false;
			}

			return links?.length == 1;
		}
		if (links?.length == 1) {
			this.deleteLink(links[0], editor);
		}
	}

	deleteLink(linkData: LinkData, editor: Editor) {
		//TODO: draft!

		const destination = linkData.destination?.content;
		try {
			if (this.obsidianProxy.settings.deleteUnreferencedLinkTarget
				&& destination !== undefined
				&& !isAbsoluteUri(destination)
				&& !isAbsoluteFilePath(destination)) {
				const hashIdx = destination.indexOf('#');
				if (hashIdx == 0) {
					return;
				}

				let filePath = hashIdx > 0 ? destination.substring(0, hashIdx) : destination;
				let file = this.obsidianProxy.Vault.getAbstractFileByPath(filePath) as TFile;
				if (!file) {
					const path = parseFilepath(filePath);
					let pathExt = path.ext;
					if (pathExt === '') {
						pathExt = ".md";
						filePath += pathExt;
						file = this.obsidianProxy.Vault.getAbstractFileByPath(filePath) as TFile;
					}
					if (!file) {
						const vaultFiles = pathExt === '.md'
							? this.obsidianProxy.Vault.getMarkdownFiles()
							: this.obsidianProxy.Vault.getFiles();
						const targetFile = vaultFiles.find(x => x.path.endsWith(filePath));
						if (targetFile) {
							file = targetFile;
						}
					}
				}
				if (!file) {
					return;
				}
				const cache = this.obsidianProxy.Vault.getBacklinksForFileByPath(file);
				if (!cache) {
					return;
				}
				const backlinks = Object.keys(cache);
				if (backlinks.length != 1
					|| (backlinks.length === 1 && cache[backlinks[0]].length > 1)) {
					return;
				}
				this.obsidianProxy.showPromptModal(
					"Delete file",
					[
						`The file "${filePath}" is no longer referenced by any note.`,
						"Do you want to delete it?"
					],
					[
						new ButtonInfo('Yes', 'Yes', true, true),
						new ButtonInfo('No', 'No')
					],
					(result) => {
						if (result === 'Yes') {
							this.obsidianProxy.Vault.delete(file);
						}
					});
			}
		}
		finally {
			editor.replaceRange(
				'',
				editor.offsetToPos(linkData.position.start),
				editor.offsetToPos(linkData.position.end));
		}
	}
}