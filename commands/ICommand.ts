import {Editor} from 'obsidian'

export interface ICommand {
    id: string;
    displayNameCommand: string;
    displayNameContextMenu : string;
    icon: string;
    handler(editor: Editor, checking: boolean): boolean | void;
}