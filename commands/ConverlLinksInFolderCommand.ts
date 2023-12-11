import { Editor } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { LinkTypes, findLink, findLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";

export class ConverlLinksInFolderCommand extends CommandBase {

	obsidianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => false, isEnabled: Func<boolean> = () => true,
		callback: ((error: Error | null, data: any) => void) | undefined = undefined,
	) {
		super(isPresentInContextMenu, isEnabled)
		
		this.id = 'editor-convert-links-in-folder';
		this.displayNameCommand = 'Convert links in folder';
		this.displayNameContextMenu = 'Convert links in folder';
		this.icon = 'rotate-cw';
		this.obsidianProxy = obsidianProxy;

		this.isEnabled = () => this.obsidianProxy.settings.ffConvertLinksInFolder;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if(checking) {
			if(!this.isEnabled()){
				return false;
			}

			return true;
		}

	}
}