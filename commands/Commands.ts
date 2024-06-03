import { IObsidianLinksSettings } from "settings";
import { IObsidianProxy } from "./IObsidianProxy";
import { ICommand } from "./ICommand";
import { UnlinkLinkCommand } from "./UnlinkLinkCommand";
import { DeleteLinkCommand } from "./DeleteLinkCommand";
import { ConvertLinkToMdlinkCommand } from "./ConvertLinkToMdlinkCommand";
import { ConvertLinkToWikilinkCommand } from "./ConvertLinkToWikilinkCommand";
import { ConvertLinkToAutolinkCommand } from "./ConvertLinkToAutolinkCommand";
import { CopyLinkDestinationToClipboardCommand } from "./CopyLinkDestinationToClipboardCommand";
import { RemoveLinksFromHeadingsCommand } from "./RemoveLinksFromHeadingsCommand";
import { EditLinkTextCommand } from "./EditLinkTextCommand";
import { SetLinkTextCommand } from "./SetLinkTextCommand";
import { EditLinkDestinationCommand } from "./EditLinkDestinationCommand";
import { CreateLinkFromSelectionCommand } from "./CreateLinkFromSelectionCommand";
import { CreateLinkFromClipboardCommand } from "./CreateLinkFromClipboardCommand";
import { ConvertAllLinksToMdlinksCommand } from "./ConvertAllLinksToMdlinksCommand";
import { ConvertWikilinksToMdlinksCommand } from "./ConvertWikilinksToMdlinksCommand";
import { ConvertAutolinksToMdlinksCommand } from "./ConvertAutolinksToMdlinksCommand";
import { ConvertUrlsToMdlinksCommand } from "./ConvertUrlsToMdlinksCommand";
import { ExtractSectionCommand } from "./ExtractSectionCommand";
import { ConvertHtmlLinksToMdlinksCommand } from "./ConvertHtmlLinksToMdlinksCommand";
import { SetLinkTextFromClipboardCommand } from "./SetLinkTextFromClipboardCommand";
import { WrapNoteInFolderCommand } from "./WrapNoteInFolderCommand";
import { CopyLinkToClipboardCommand } from "./CopyLinkToClipboardCommand";
import { ConvertLinksInFolderCommand } from "./ConvertLinksInFolderCommand";
import { ConvertLinkToHtmllinkCommand } from "./ConvertLinkToHtmllinkCommand";
import { CutLinkToClipboardCommand } from "./CutLinkToClipboardCommand";
import { SetLinkDestinationFromClipboardCommand } from "./SetLinkDestinationFromClipboardCommand";
import { CopyLinkToHeadingToObjectCommand } from "./CopyLinkToObjectToClipboardCommand";
import { EmbedUnembedLinkCommand } from "./EmbedUnembedLinkCommand";
import { CopyLinkToBlockToClipboardCommand } from "./CopyLinkToBlockToClipboardCommand";


const commands: Map<string, ICommand> = new Map<string, ICommand>();

function createCommands(obsidianProxy: IObsidianProxy, settings: IObsidianLinksSettings) {
    if (commands.size > 0) {
        return;
    }
    commands.set(UnlinkLinkCommand.name, new UnlinkLinkCommand(() => settings.contexMenu.unlink));
    commands.set(DeleteLinkCommand.name, new DeleteLinkCommand(obsidianProxy));
    commands.set(ConvertLinkToMdlinkCommand.name, new ConvertLinkToMdlinkCommand(obsidianProxy, () => settings.contexMenu.convertToMakrdownLink));
    commands.set(ConvertLinkToWikilinkCommand.name, new ConvertLinkToWikilinkCommand(() => settings.contexMenu.convertToWikilink));
    commands.set(ConvertLinkToHtmllinkCommand.name, new ConvertLinkToHtmllinkCommand(obsidianProxy));
    commands.set(ConvertLinkToAutolinkCommand.name, new ConvertLinkToAutolinkCommand(() => settings.contexMenu.convertToAutolink));
    commands.set(CopyLinkToClipboardCommand.name, new CopyLinkToClipboardCommand(obsidianProxy));
    commands.set(CopyLinkToHeadingToObjectCommand.name, new CopyLinkToHeadingToObjectCommand(obsidianProxy));
    commands.set(CopyLinkToBlockToClipboardCommand.name, new CopyLinkToBlockToClipboardCommand(obsidianProxy));
    commands.set(CutLinkToClipboardCommand.name, new CutLinkToClipboardCommand(obsidianProxy));
    commands.set(CopyLinkDestinationToClipboardCommand.name,
        new CopyLinkDestinationToClipboardCommand(obsidianProxy, () => settings.contexMenu.copyLinkDestination));
    const options = {
        get internalWikilinkWithoutTextAction() {
            return settings.removeLinksFromHeadingsInternalWikilinkWithoutTextAction;
        }
    };
    commands.set(RemoveLinksFromHeadingsCommand.name, new RemoveLinksFromHeadingsCommand(options));
    commands.set(EditLinkTextCommand.name, new EditLinkTextCommand(() => settings.contexMenu.editLinkText));
    commands.set(SetLinkTextCommand.name, new SetLinkTextCommand(obsidianProxy, () => settings.contexMenu.setLinkText));
    commands.set(EditLinkDestinationCommand.name, new EditLinkDestinationCommand(() => settings.contexMenu.editLinkDestination));
    commands.set(CreateLinkFromSelectionCommand.name, new CreateLinkFromSelectionCommand(obsidianProxy, () => settings.contexMenu.createLink));
    commands.set(CreateLinkFromClipboardCommand.name, new CreateLinkFromClipboardCommand(obsidianProxy, () => settings.contexMenu.createLinkFromClipboard));
    // commands.set(EmbedLinkCommand.name, new EmbedLinkCommand(() => settings.contexMenu.embedUnembedLink));
    // commands.set(UnembedLinkCommand.name, new UnembedLinkCommand(() => settings.contexMenu.embedUnembedLink));
    commands.set(EmbedUnembedLinkCommand.name, new EmbedUnembedLinkCommand(() => settings.contexMenu.embedUnembedLink));

    commands.set(ConvertAllLinksToMdlinksCommand.name, new ConvertAllLinksToMdlinksCommand(obsidianProxy));
    commands.set(ConvertWikilinksToMdlinksCommand.name, new ConvertWikilinksToMdlinksCommand(obsidianProxy));
    commands.set(ConvertUrlsToMdlinksCommand.name, new ConvertUrlsToMdlinksCommand(obsidianProxy));
    commands.set(ConvertAutolinksToMdlinksCommand.name, new ConvertAutolinksToMdlinksCommand(obsidianProxy));
    commands.set(ConvertHtmlLinksToMdlinksCommand.name, new ConvertHtmlLinksToMdlinksCommand(obsidianProxy));

    commands.set(ExtractSectionCommand.name, new ExtractSectionCommand(obsidianProxy));
    commands.set(SetLinkTextFromClipboardCommand.name, new SetLinkTextFromClipboardCommand(obsidianProxy));
    commands.set(SetLinkDestinationFromClipboardCommand.name, new SetLinkDestinationFromClipboardCommand(obsidianProxy));
    commands.set(WrapNoteInFolderCommand.name, new WrapNoteInFolderCommand(obsidianProxy));

    commands.set(ConvertLinksInFolderCommand.name, new ConvertLinksInFolderCommand(obsidianProxy));
}

export function getPaletteCommands(obsidianProxy: IObsidianProxy, settings: IObsidianLinksSettings): ICommand[] {
    createCommands(obsidianProxy, settings);
    return Array.from(commands.values());
}

export function getContextMenuCommands(obsidianProxy: IObsidianProxy, settings: IObsidianLinksSettings): (ICommand | null)[] {
    createCommands(obsidianProxy, settings);

    // context menu commands in order; null - separator
    const commandNames = [
        null,
        EditLinkTextCommand.name,
        SetLinkTextCommand.name,
        SetLinkTextFromClipboardCommand.name,
        EditLinkDestinationCommand.name,
        SetLinkDestinationFromClipboardCommand.name,
        CopyLinkToClipboardCommand.name,
        CopyLinkToHeadingToObjectCommand.name,
        CopyLinkToBlockToClipboardCommand.name,
        CutLinkToClipboardCommand.name,
        CopyLinkDestinationToClipboardCommand.name,
        null,
        UnlinkLinkCommand.name,
        null,
        ConvertLinkToWikilinkCommand.name,
        ConvertLinkToAutolinkCommand.name,
        ConvertLinkToMdlinkCommand.name,
        ConvertLinkToHtmllinkCommand.name,
        // UnembedLinkCommand.name,
        // EmbedLinkCommand.name,
        EmbedUnembedLinkCommand.name,
        DeleteLinkCommand.name,
        null,
        CreateLinkFromSelectionCommand.name,
        CreateLinkFromClipboardCommand.name,
        null,
        ConvertAllLinksToMdlinksCommand.name,
        ConvertWikilinksToMdlinksCommand.name,
        ConvertUrlsToMdlinksCommand.name,
        ConvertAutolinksToMdlinksCommand.name,
        ConvertHtmlLinksToMdlinksCommand.name,
        null,
        ExtractSectionCommand.name,
        WrapNoteInFolderCommand.name
    ];

    const contextMenuCommands = [];
    for (const cmdName of commandNames) {
        if (cmdName == null) {
            contextMenuCommands.push(null);
            continue;
        }
        const cmd = commands.get(cmdName);
        if (cmd && cmd.isEnabled() && cmd.isPresentInContextMenu()) {
            contextMenuCommands.push(cmd);
        }
    }

    return contextMenuCommands;
}
