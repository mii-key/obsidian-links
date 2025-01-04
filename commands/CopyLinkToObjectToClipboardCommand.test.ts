import { expect, test } from '@jest/globals';
import { CopyLinkToObjectToClipboardCommand } from './CopyLinkToObjectToClipboardCommand';

import { EditorMock } from './EditorMock'
import { ObsidianProxyMock } from './ObsidianProxyMock';
import { VaultMock } from '../VaultMock';
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
            obsidianProxy.__mocks.getBlock.mockReturnValue({
                position: createPos(createLoc(), createLoc()),
                id: undefined,
                type: 'paragraph'
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
    test.skip.each(
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
            },
            //TODO: paragraph tests
            {
                name: "block wo/id",
                text: "Nulla sit ut nisi quis pariatur culpa adipisicing labore quis enim ipsum.",
                isHeading: false,
                filepath: 'note 1.md',
                expected: "[heading1](<note 1.md^1234>)"
            },

            //TODO: link to image


            {
                name: "block wo/id w/selection",
                text: "Nulla sit ut nisi quis pariatur culpa adipisicing labore quis enim ipsum.",
                selectionStart: "Nulla sit ut nisi ",
                selectionEnd: "Nulla sit ut nisi quis pariatur",
                isHeading: false,
                filepath: 'note 1.md',
                expected: "[quis pariatur](<note 1.md^1234>)"
            },

        ]
    )('copy - [$name] - success', ({ name, text, isHeading, filepath, selectionStart, selectionEnd, expected }) => {


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
            obsidianProxy.__mocks.getBlock.mockReturnValue({
                position: createPos(createLoc(), createLoc()),
                id: undefined,
                type: 'paragraph'
            })

        }
        const editor = new EditorMock()
        editor.__mocks.getLine.mockReturnValue(text)
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })

        if (selectionStart && selectionEnd) {
            editor.__mocks.getSelection.mockReturnValue(text.substring(selectionStart.length, selectionEnd.length))
        }

        const cmd = new CopyLinkToObjectToClipboardCommand(obsidianProxy)
        //
        cmd.handler(editor, false)
        //
        const blockLinkPattern = /^\^\w{4}/;
        expect(obsidianProxy.__mocks.clipboardWriteText.mock.calls).toHaveLength(1)
        if (isHeading) {
            expect(obsidianProxy.__mocks.clipboardWriteText.mock.calls[0][0]).toBe(expected)
        } else {
            expect(obsidianProxy.__mocks.createLink.mock.calls).toHaveLength(1);
            const [sourcePath, destination, destinationSubPath, text] = (obsidianProxy.__mocks.createLink.mock.calls[0]);
            expect(sourcePath).toBe('');
            expect(destination).toBe(filepath);
            expect(blockLinkPattern.test(destinationSubPath)).toBeTruthy;
            expect(text).toBeUndefined();
        }
        expect(obsidianProxy.__mocks.createNotice.mock.calls).toHaveLength(1)

    })

})