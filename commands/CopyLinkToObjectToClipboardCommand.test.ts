import { expect, test } from '@jest/globals';
import { CopyLinkToObjectToClipboardCommand } from './CopyLinkToObjectToClipboardCommand';

import { EditorMock } from './EditorMock'
import { ObsidianProxyMock } from './ObsidianProxyMock';
import { VaultMock } from '../VaultMock';
import { SectionCache, TFile } from 'obsidian';
import { createLoc, createPos, createTFile } from './obsidianUtils';

describe('CopyLinkToHeadingToClipboardCommand test', () => {

    test.each(
        [
            // headings
            {
                name: "heading1",
                text: "# heading1",
                expectedEnabled: true
            },
            {
                name: "heading3",
                text: "### heading1",
                expectedEnabled: true
            },
            // block
            {
                name: "text",
                text: "Ipsum commodo veniam aliqua nulla aute mollit nostrud.",
                expectedEnabled: true
            },
        ]
    )('status - cursor on [$name]', ({ name, text, expectedEnabled }) => {
        const isHeading = text[0] == '#';
        const vault = new VaultMock();
        vault.__mocks.getActiveNoteView.mockReturnValue({
            file: createTFile('note1.md')
        })

        const obsidianProxy = new ObsidianProxyMock(vault);
        if (!isHeading) {
            obsidianProxy.__mocks.getFileCache.mockReturnValue({
                sections: [{
                    id: undefined,
                    type: 'paragraph',
                    position: createPos(createLoc(), createLoc())

                } as SectionCache]
            });
        }

        const cmd = new CopyLinkToObjectToClipboardCommand(obsidianProxy)
        const editor = new EditorMock()
        editor.__mocks.getLine.mockReturnValue(text)
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })

        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBe(expectedEnabled)
        expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)
    })

    //TODO: fix
    test.each(
        [
            {
                name: "heading1",
                text: "# heading1",
                isHeading: true,
                filepath: 'note1.md',
                expected: "[heading1](note1.md#heading1)"
            },
            {
                name: "heading w/spaces",
                text: "# heading 1",
                isHeading: true,
                filepath: 'note1.md',
                expected: "[heading 1](<note1.md#heading 1>)"
            },
            {
                name: "note path w/spaces",
                text: "# heading1",
                isHeading: true,
                filepath: 'note 1.md',
                expected: "[heading1](<note 1.md#heading1>)"
            }
            //TODO: paragraph tests
            //TODO: link to image
        ]
    )('copy - [$name] - success', ({ name, text, isHeading, filepath, expected }) => {


        const vault = new VaultMock();
        vault.__mocks.getActiveNoteView.mockReturnValue({
            file: {
                path: filepath
            }
        })

        const obsidianProxy = new ObsidianProxyMock(vault);
        if (isHeading) {
            obsidianProxy.__mocks.createLink.mockReturnValue(expected)
        } else {
            //TODO:
        }
        const cmd = new CopyLinkToObjectToClipboardCommand(obsidianProxy)
        const editor = new EditorMock()
        editor.__mocks.getLine.mockReturnValue(text)
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
        //
        cmd.handler(editor, false)
        //
        expect(obsidianProxy.__mocks.clipboardWriteText.mock.calls).toHaveLength(1)
        expect(obsidianProxy.__mocks.clipboardWriteText.mock.calls[0][0]).toBe(expected)
        expect(obsidianProxy.__mocks.createNotice.mock.calls).toHaveLength(1)

    })

})