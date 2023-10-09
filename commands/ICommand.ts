import {Editor} from 'obsidian'

export interface ICommand {
    id: string;
    displayName: string;
    icon: string;
    handler(editor: Editor, checking: boolean): boolean | void;
}