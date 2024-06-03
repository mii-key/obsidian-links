import { expect, test } from '@jest/globals';
import { CopyLinkToHeadingToObjectCommand } from './CopyLinkToObjectToClipboardCommand';

import { EditorMock } from './EditorMock'
import { ObsidianProxyMock } from './ObsidianProxyMock';
import { VaultMock } from '../VaultMock';

describe('CopyLinkToHeadingToClipboardCommand test', () => {

    test.each(
        [
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
            {
                name: "text",
                text: "Ipsum commodo veniam aliqua nulla aute mollit nostrud.",
                expectedEnabled: false
            },
        ]
    )('status - cursor on [$name]', ({ name, text, expectedEnabled }) => {
        const obsidianProxy = new ObsidianProxyMock();
        const cmd = new CopyLinkToHeadingToObjectCommand(obsidianProxy)
        const editor = new EditorMock()
        editor.__mocks.getLine.mockReturnValue(text)
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
                name: "heading1",
                text: "# heading1",
                filepath: 'note1.md',
                expected: "[heading1](note1.md#heading1)"
            },
            {
                name: "heading w/spaces",
                text: "# heading 1",
                filepath: 'note1.md',
                expected: "[heading 1](<note1.md#heading 1>)"
            },
            {
                name: "note path w/spaces",
                text: "# heading1",
                filepath: 'note 1.md',
                expected: "[heading1](<note 1.md#heading1>)"
            }
        ]
    )('copy - [$name] - success', ({ name, text, filepath, expected }) => {

        const vault = new VaultMock();
        vault.__mocks.getActiveNoteView.mockReturnValue({
            file: {
                path: filepath
            }
        })

        const obsidianProxy = new ObsidianProxyMock(vault);
        const cmd = new CopyLinkToHeadingToObjectCommand(obsidianProxy)
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