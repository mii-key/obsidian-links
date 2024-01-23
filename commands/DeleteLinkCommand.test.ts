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

    test('status - cursor on text - command disabled', () => {
        const obsidianProxyMock = new ObsidianProxyMock()
        const cmd = new DeleteLinkCommand(obsidianProxyMock)
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue('some text')
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBeFalsy()
        expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)
    })

    test.each(
        [
            {
                name: "html - href in '",
                text: "<a href='google.com'>google1</a>"
            },
            {
                name: "html - href in \"",
                text: "<a href=\"google.com\">google1</a>"
            },
            {
                name: "mdlink",
                text: "[google](google.com)"
            },
            {
                name: "wikilink",
                text: "[[google.com|google]]"
            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]"
            },
            {
                name: "autolink",
                text: "<https://google.com>"
            }
        ]
    )('status - cursor on [$name] - command enabled', ({ name, text }) => {
        const obsidianProxyMock = new ObsidianProxyMock()
        const cmd = new DeleteLinkCommand(obsidianProxyMock)
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue(text)
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBeTruthy()
        expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

    })

    test.each(
        [
            {
                name: "html links",
                text: "<a href=\"https://obsidian.md\">obsidian</a>"
            },
            {
                name: "mdlink",
                text: "[obsidian](http://obsidian.md)"
            },
            {
                name: "wikilink",
                text: "[[http://obsidian.md|obsidian]]"
            },
            {
                name: "wikilink empty text",
                text: "[[http://obsidian.md]]"
            },
            {
                name: "wikilink local note.md 1 ref",
                text: "[[note.md]]",
                linkTarget: 'note.md',
                backlinks: {
                    'file1.md': [LinkData.parse('[[note.md]]')]
                },
                expectedShowPrompt: true,
                expectedDeleteFile: true
            },
            {
                name: "wikilink to heading",
                text: "[[#heading 1]]",
                linkTarget: undefined,
                backlinks: null,
                expectedShowPrompt: false,
                expectedDeleteFile: false
            },
            {
                name: "wikilink a note wo/.md extension",
                text: "[[folder 1/note 1]]",
                linkTarget: 'folder 1/note 1.md',
                backlinks: {
                    'file1.md': [LinkData.parse('[[folder 1/note 1]]')]
                },
                expectedShowPrompt: true,
                expectedDeleteFile: true
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
                expectedDeleteFile: false
            },
            {
                name: "wikilink w/multiple backlinks same note",
                text: "[[folder 1/note 1]]",
                linkTarget: 'folder 1/note 1.md',
                backlinks: {
                    'file1.md': [LinkData.parse('[[folder 1/note 1]]'), LinkData.parse('[[folder 1/note 1]]')],
                },
                expectedShowPrompt: false,
                expectedDeleteFile: false
            },
            {
                name: "wikilink w/prompt user click 'No'",
                text: "[[folder 1/note 1]]",
                linkTarget: 'folder 1/note 1.md',
                backlinks: {
                    'file1.md': [LinkData.parse('[[folder 1/note 1]]')]
                },
                expectedShowPrompt: true,
                expectedDeleteFile: false
            }
        ]
    )('delete link - cursor in selection [$name] - success', ({ name, text, linkTarget, backlinks, expectedShowPrompt, expectedDeleteFile }) => {

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