import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { EmbedLinkCommand } from "./EmbedLinkCommand";
import { UnembedLinkCommand } from "./UnembedLinkCommand";

export class EmbedUnembedLinkCommand extends CommandBase {

	embedCommand: EmbedLinkCommand
	unembedCommand: UnembedLinkCommand;
	activeCommand: CommandBase | undefined;

	constructor(isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-embed-unembed-link';
		this.displayNameCommand = 'Embed/Unembed link';
		this.displayNameContextMenu = 'Embed/Unembed';
		this.icon = 'file-output';

		this.embedCommand = new EmbedLinkCommand(isPresentInContextMenu);
		this.unembedCommand = new UnembedLinkCommand(isPresentInContextMenu);
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		if (this.embedCommand.handler(editor, true)) {
			this.activeCommand = this.embedCommand;
		} else if (this.unembedCommand.handler(editor, true)) {
			this.activeCommand = this.unembedCommand;
		} else {
			this.activeCommand = undefined;
		}

		if (checking) {
			if (this.activeCommand) {
				this.icon = this.activeCommand.icon;
				this.displayNameContextMenu = this.activeCommand.displayNameContextMenu;
				return true;
			}
			return false;
		}

		if (this.activeCommand) {
			this.activeCommand.handler(editor, checking);
		}
	}
}