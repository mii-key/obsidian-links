import { Editor, EditorPosition, HeadingCache, ListItemCache, SectionCache, TFile } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { IObsidianProxy } from "./IObsidianProxy";
import { RegExPatterns } from "../RegExPatterns";
import { DestinationType, LinkTypes, findLinks, getIntersection } from "../utils";

export class CopyLinkToObjectToClipboardCommand extends CommandBase {


	obsidianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled)
		this.id = 'editor-copy-link-to-object-to-clipboard';
		this.displayNameCommand = 'Copy link to element';
		this.displayNameContextMenu = 'Copy link to element';
		this.icon = 'copy';
		this.obsidianProxy = obsidianProxy;

		this.isEnabled = () => this.obsidianProxy.settings.ffCopyLinkToObject;
		this.isPresentInContextMenu = () => this.obsidianProxy.settings.ffCopyLinkToObject && this.obsidianProxy.settings.contexMenu.copyLinkToHeadingToClipboard;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}
		const text = editor.getLine(editor.getCursor('from').line);
		const headingMatch = text.match(new RegExp(RegExPatterns.NoteHeading.source));
		const currentView = this.obsidianProxy.Vault.getActiveNoteView();
		const block = headingMatch ? undefined : currentView?.file ? this.obsidianProxy.getBlock(editor, currentView?.file) : undefined;

		if (checking) {
			return !!headingMatch || !!block;
		}
		const currentNoteFile = currentView?.file;

		if (headingMatch && headingMatch[1] && currentNoteFile) {
			this.copyLinkToHeadingUnderCursorToClipboard(editor, headingMatch[1], currentNoteFile);
		} else if (block && currentView?.file) {
			this.copyLinkToBlockUnderCursorToClipboard(currentView?.file, editor, block as SectionCache | ListItemCache);
		}
	}

	copyLinkToHeadingUnderCursorToClipboard(editor: Editor, heading: string, noteFile: TFile) {
		// let destination = `${noteFile.path}#${heading}`;
		// if (destinationRequireAngleBrackets(destination)) {
		// 	destination = `<${destination}>`;
		// }
		// let rawLink = `[${heading}](${destination})`;

		const selection = editor.getSelection();
		const linkText = selection ? selection : heading;
		const rawLink = this.obsidianProxy.createLink("", noteFile.path, heading, linkText);
		this.obsidianProxy.clipboardWriteText(rawLink);
		this.obsidianProxy.createNotice("Link copied to your clipboard");
	}

	copyLinkToBlockUnderCursorToClipboard(
		file: TFile,
		editor: Editor,
		block: ListItemCache | SectionCache
	) {
		let linkText = undefined;

		const selection = editor.getSelection();
		const blockFirstLine = editor.getLine(block.position.start.line);
		const links = findLinks(blockFirstLine, LinkTypes.Wiki | LinkTypes.Markdown);
		const firstLink = links.length ? links[0] : undefined;

		if (selection) {
			console.log(selection)
			const cursorStart = editor.posToOffset(editor.getCursor('from'));
			const cursorEnd = editor.posToOffset(editor.getCursor('to'));
			console.log(firstLink);
			if (!firstLink
				|| !getIntersection([cursorStart, cursorEnd],
					[firstLink.position.start + block.position.start.offset, firstLink.position.end + block.position.start.offset])) {
				linkText = selection;
			} else {
				if (links && links.length && links[0].destinationType == DestinationType.Image) {
					linkText = links[0].text?.content;
				}
			}
		}

		if (block.id) {
			this.obsidianProxy.clipboardWriteText(
				this.obsidianProxy.createLink("", file.path, '^' + block.id, linkText)
			);
			this.obsidianProxy.createNotice("Link copied to your clipboard");
			return;
		}

		const sectionEnd = block.position.end;
		const end: EditorPosition = {
			ch: sectionEnd.col,
			line: sectionEnd.line,
		};

		const id = this.generateId();

		editor.replaceRange(`${this.isEolRequired(block) ? "\n\n" : " "}^${id}`, end);
		this.obsidianProxy.clipboardWriteText(
			this.obsidianProxy.createLink("", file.path, '^' + id, linkText)
		);
		this.obsidianProxy.createNotice("Link copied to your clipboard");
	}

	generateId(): string {
		return Math.random().toString(36).substring(2, 6);
	}

	isEolRequired(block: ListItemCache | SectionCache): boolean {
		const blockType = (block as SectionCache).type || "";

		switch (blockType) {
			case "blockquote":
			case "code":
			case "table":
			case "comment":
			case "footnoteDefinition":
				return true;
			default:
				return false;
		}
	}

}


