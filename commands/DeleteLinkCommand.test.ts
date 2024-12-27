import { expect, test } from '@jest/globals';
import { DeleteLinkCommand } from './DeleteLinkCommand';

import { EditorMock } from './EditorMock'
import { ObsidianProxyMock } from './ObsidianProxyMock';
import { UiFactoryMock } from '../ui/UiFactoryMock';
import { TFile, VaultMock } from '../VaultMock';
import { PromptModalMock } from '../ui/PromptModalMock';
import { ButtonInfo } from '../ui/PromotModal.common';
import { LinkData } from '../utils';

describe('DeleteLinkCommand test', () => {

    test.each(
        [
            {
                name: "no links in selection",
                text: "some text",
                selectionStart: "",
                selectionEnd: "some text",
                expectedEnabled: false
            },
            {
                name: "1 link selected",
                text: "some [[my note]] text",
                selectionStart: "some ",
                selectionEnd: "some [[my note]]",
                expectedEnabled: true
            },
            {
                name: "selection inside a link",
                text: "some [[my note]] text",
                selectionStart: "some [[my n",
                selectionEnd: "some [[my no",
                expectedEnabled: true
            },
        ]
    )('status - selection - [$name] - enable=$expectedEnabled', ({ name, text, selectionStart, selectionEnd, expectedEnabled }) => {

        const vault = new VaultMock();
        vault.__mocks.getAbstractFileByPath.mockImplementation((path: string) => {
            if (!path || path.indexOf('.') == -1) {
                return null;
            }
            return new TFile(path, vault.getRoot())
        });

        const obsidianProxy = new ObsidianProxyMock(vault);
        const cmd = new DeleteLinkCommand(obsidianProxy)
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue(text);
        const selection = text.substring(selectionStart.length, selectionEnd.length);
        editor.__mocks.getSelection.mockReturnValue(selection)
        editor.__mocks.getCursor.mockImplementation((pos: string) => {
            switch (pos) {
                case 'from':
                    return { line: 0, ch: selectionStart.length };
                case 'to':
                    return { line: 0, ch: selectionEnd.length };
                default: return { line: 0, ch: selectionStart.length };
            }

        })

        //
        const enabled = cmd.handler(editor, true)
        //

        expect(enabled).toBe(expectedEnabled);
    })


    test.each(
        [
            {
                name: "plain text",
                text: "some text",
                expectedEnabled: false
            },
            {
                name: "html - href in '",
                text: "<a href='google.com'>google1</a>",
                expectedEnabled: true
            },
            {
                name: "html - href in \"",
                text: "<a href=\"google.com\">google1</a>",
                expectedEnabled: true

            },
            {
                name: "mdlink",
                text: "[google](google.com)",
                expectedEnabled: true
            },
            {
                name: "wikilink",
                text: "[[google.com|google]]",
                expectedEnabled: true
            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]",
                expectedEnabled: true
            },
            {
                name: "autolink",
                text: "<https://google.com>",
                expectedEnabled: true
            }
        ]
    )('status - cursor on [$name] - command enabled', ({ name, text, expectedEnabled }) => {
        const obsidianProxyMock = new ObsidianProxyMock()
        const cmd = new DeleteLinkCommand(obsidianProxyMock)
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue(text)
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBe(expectedEnabled)
        expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

    })

    test.each(
        [
            {
                name: "html links",
                text: "<a href=\"https://obsidian.md\">obsidian</a>",
                deleteLinkTargetEnabled: true

            },
            {
                name: "mdlink",
                text: "[obsidian](http://obsidian.md)",
                deleteLinkTargetEnabled: true

            },
            {
                name: "wikilink",
                text: "[[http://obsidian.md|obsidian]]",
                deleteLinkTargetEnabled: true
            },
            {
                name: "wikilink empty text",
                text: "[[http://obsidian.md]]",
                deleteLinkTargetEnabled: true

            },
            {
                name: "wikilink local note.md 1 ref",
                text: "[[note.md]]",
                linkTarget: 'note.md',
                backlinks: {
                    'file1.md': [LinkData.parse('[[note.md]]')]
                },
                expectedShowPrompt: true,
                expectedDeleteFile: true,
                deleteLinkTargetEnabled: true

            },
            {
                name: "wikilink to heading",
                text: "[[#heading 1]]",
                linkTarget: undefined,
                backlinks: null,
                expectedShowPrompt: false,
                expectedDeleteFile: false,
                deleteLinkTargetEnabled: true

            },
            {
                name: "wikilink note wo/.md extension",
                text: "[[folder 1/note 1]]",
                linkTarget: 'folder 1/note 1.md',
                backlinks: {
                    'file1.md': [LinkData.parse('[[folder 1/note 1]]')]
                },
                expectedShowPrompt: true,
                expectedDeleteFile: true,
                deleteLinkTargetEnabled: true

            },
            {
                name: "mdlink <> note wo/.md extension",
                text: "[folder 1/note 1](<folder 1/note 1>)",
                linkTarget: 'folder 1/note 1.md',
                backlinks: {
                    'file1.md': [LinkData.parse('[folder 1/note 1](<folder 1/note 1>)')]
                },
                expectedShowPrompt: true,
                expectedDeleteFile: true,
                deleteLinkTargetEnabled: true

            },
            {
                name: "wikilink w/multiple backlinks different notes",
                text: "[[folder 1/note 1]]",
                linkTarget: 'folder 1/note 1.md',
                backlinks: {
                    'file1.md': [LinkData.parse('[[folder 1/note 1]]')],
                    'file2.md': [LinkData.parse('(note1)[folder 1/note 1]')]
                },
                expectedShowPrompt: false,
                expectedDeleteFile: false,
                deleteLinkTargetEnabled: true

            },
            {
                name: "wikilink w/multiple backlinks same note",
                text: "[[folder 1/note 1]]",
                linkTarget: 'folder 1/note 1.md',
                backlinks: {
                    'file1.md': [LinkData.parse('[[folder 1/note 1]]'), LinkData.parse('[[folder 1/note 1]]')],
                },
                expectedShowPrompt: false,
                expectedDeleteFile: false,
                deleteLinkTargetEnabled: true

            },
            {
                name: "wikilink w/prompt user click 'No'",
                text: "[[folder 1/note 1]]",
                linkTarget: 'folder 1/note 1.md',
                backlinks: {
                    'file1.md': [LinkData.parse('[[folder 1/note 1]]')]
                },
                expectedShowPrompt: true,
                expectedDeleteFile: false,
                deleteLinkTargetEnabled: true
            },
            {
                name: "wikilink w/prompt, deleteFile=OFF",
                text: "[[folder 1/note 1]]",
                linkTarget: 'folder 1/note 1.md',
                backlinks: {
                    'file1.md': [LinkData.parse('[[folder 1/note 1]]')]
                },
                expectedShowPrompt: false,
                expectedDeleteFile: false,
                deleteLinkTargetEnabled: false
            }
            //TODO: test for short link


        ]
    )('delete link - cursor on [$name] - success', ({ name, text, linkTarget, backlinks, expectedShowPrompt, expectedDeleteFile, deleteLinkTargetEnabled }) => {

        const uiFactory = new UiFactoryMock();
        let promptModal: PromptModalMock | undefined;
        uiFactory.__mocks.createPromptModel.mockImplementation((title: string, text: string[], buttons: ButtonInfo[], onSubmit: (result: string) => void) => {
            return promptModal = new PromptModalMock(buttons, onSubmit);
        })
        const vault = new VaultMock();
        vault.__mocks.getAbstractFileByPath.mockImplementation((path: string) => {
            if (!path || path.indexOf('.') == -1) {
                return null;
            }
            return new TFile(path, vault.getRoot())
        });
        vault.__mocks.getBacklinksForFileByPath.mockImplementation((file: TFile) => {
            return backlinks;
        });

        const obsidianProxy = new ObsidianProxyMock(vault, uiFactory);
        obsidianProxy.settings.deleteUnreferencedLinkTarget = !!deleteLinkTargetEnabled;
        const cmd = new DeleteLinkCommand(obsidianProxy)
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue(text)
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 0 })
        //
        cmd.handler(editor, false)
        //
        if (expectedShowPrompt) {
            expect(obsidianProxy.__mocks.showPromptModal.mock.calls).toHaveLength(1);
            if (expectedDeleteFile) {
                expect(promptModal).toBeDefined();
                promptModal?.buttonClick(0);
                expect(vault.__mocks.delete.mock.calls).toHaveLength(1);
                expect(vault.__mocks.delete.mock.calls[0][0].path).toBe(linkTarget);
            } else {
                expect(promptModal).toBeDefined();
                promptModal?.buttonClick(1);
                expect(vault.__mocks.delete.mock.calls).toHaveLength(0);
            }
        } else {
            expect(obsidianProxy.__mocks.showPromptModal.mock.calls).toHaveLength(0);
        }
        if (!expectedDeleteFile) {
            expect(vault.__mocks.delete.mock.calls).toHaveLength(0);
        }

        expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
        expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe('')
        expect(editor.__mocks.replaceRange.mock.calls[0][1].ch).toBe(0)
        expect(editor.__mocks.replaceRange.mock.calls[0][2].ch).toBe(text.length)
    })

})