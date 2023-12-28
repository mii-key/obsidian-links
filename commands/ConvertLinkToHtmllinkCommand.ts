import { Editor } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";

export class ConvertLinkToHtmllinkCommand extends CommandBase {
	obsidianProxy: IObsidianProxy;

	// TODO: refactor
	readonly EmailScheme: string = "mailto:";

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => false, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled)
		this.id = 'editor-convert-link-to-htmllink';
		this.displayNameCommand = 'Convert to HTML link';
		this.displayNameContextMenu = 'Convert to HTML link';
		this.icon = 'rotate-cw';
		this.obsidianProxy = obsidianProxy;

		this.isEnabled = () => this.obsidianProxy.settings.ffConvertLinkToHtmllink;
		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.convertToHtmlLink;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if(checking && !this.isEnabled()){
			return false;
		}

		return true;
	}
	
}