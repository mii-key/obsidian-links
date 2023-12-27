import { Editor } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { LinkData, LinkTypes, Position, findCodeBlocks, findLink, findLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import { ConvertToMdlinkCommandBase } from "./ConvertToMdlinkCommandBase";
import { TextBuffer } from "../TextBuffer";

export class ConvertLinksInFolderCommand extends ConvertToMdlinkCommandBase {

	obsidianProxy: IObsidianProxy;
	callback: ((error: Error | null, data?: any) => void) | undefined


	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => false, isEnabled: Func<boolean> = () => true,
		callback: ((error: Error | null, data?: any) => void) | undefined = undefined,
	) {
		super(obsidianProxy, isPresentInContextMenu, isEnabled)

		this.id = 'editor-convert-links-in-folder';
		this.displayNameCommand = 'Convert links in folder';
		this.displayNameContextMenu = 'Convert links in folder';
		this.icon = 'rotate-cw';
		this.callback = callback;

		this.isEnabled = () => this.obsidianProxy.settings.ffConvertLinksInFolder;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking) {
			if (!this.isEnabled()) {
				return false;
			}
			return true;
		}

		const activeView = this.obsidianProxy.Vault.getActiveNoteView();
		if (!activeView) {
			return;
		}

		const parentFolder = activeView.file.parent;
		const files = this.obsidianProxy.Vault.getFilesInFolder(parentFolder);
		if (!files) {
			this.callback?.(null)
			return;
		}
		(async () => {
			try {
				for (let file of files) {
					if (file.extension !== 'md') {
						continue;
					}
					const content = await this.obsidianProxy.Vault.read(file);
					//TODO: fix regex and move inside of findLinks
					const codeBlocks = findCodeBlocks(content);

					const insideCodeBlock = (pos: Position) => {
						for (const block of codeBlocks) {
							if (pos.start > block.position.end) {
								return false
							} else if (pos.start >= block.position.start && pos.end <= block.position.end) {
								return true;
							}
						}

						return false;
					}

					const links = findLinks(content, LinkTypes.Wiki).filter(x => !insideCodeBlock(x.position));
					if (links.length > 0) {
						const textBuffer = new TextBuffer(content);
						for (let i = links.length - 1; i >= 0; i--) {
							const link = links[i];
							//TODO: refactor
							await this.convertLinkToMarkdownLink1(link, textBuffer, false)
						}
						const updatedContent = textBuffer.getValue();
						await this.obsidianProxy.Vault.modify(file, updatedContent);
					}
				}
				this.obsidianProxy.createNotice(`${files.length} notes processed.`);
				this.callback?.(null);
			}
			catch (err) {
				this.obsidianProxy.createNotice(`Failed: ${err}`);
				console.log(err);
				this.callback?.(err);
			}
		})();
	}
}