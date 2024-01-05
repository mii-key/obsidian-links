import { expect, test } from '@jest/globals';
import { CutLinkToClipboardCommand } from './CutLinkToClipboardCommand';

import { EditorMock } from './EditorMock'
import { ObsidianProxyMock } from './ObsidianProxyMock';

describe('CutLinkToClipboardCommand test', () => {

    test.each(
        [
            {
                name: "text wo/links'",
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
            },
            {
                name: "url https",
                text: "https://google.com",
                expectedEnabled: true
            },
            {
                name: "url http",
                text: "http://google.com",
                expectedEnabled: true
            }
        ]
    )
        ('status - cursor on [$name]', ({ name, text, expectedEnabled}) => {
            const obsidianProxy = new ObsidianProxyMock();
            const cmd = new CutLinkToClipboardCommand(obsidianProxy)
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expectedEnabled)
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

        })

    test.each(
        [
            {
                name: "html - href in '",
                text: "<a href='google.com'>google1</a>",
                expected: "<a href='google.com'>google1</a>"
            },
            {
                name: "html - href in \"",
                text: "<a href=\"google.com\">google1</a>",
                expected: "<a href=\"google.com\">google1</a>"
            },
            {
                name: "mdlink",
                text: "[google](google.com)",
                expected: "[google](google.com)"

            },
            {
                name: "wikilink",
                text: "[[note 1|google]]",
                expected: "[[note 1|google]]"
            },
            {
                name: "wikilink empty text",
                text: "[[note 1]]",
                expected: "[[note 1]]"
            }
        ]
    )
        ('cut - [$name] - success', ({ name, text, expected}) => {
            const obsidianProxy = new ObsidianProxyMock();
            const cmd = new CutLinkToClipboardCommand(obsidianProxy)
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
            //
            cmd.handler(editor, false)
            //
            expect(obsidianProxy.__mocks.clipboardWriteText.mock.calls).toHaveLength(1)
            expect(obsidianProxy.__mocks.clipboardWriteText.mock.calls[0][0]).toBe(expected)
            
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
            expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe('')
            expect(editor.__mocks.replaceRange.mock.calls[0][1].ch).toBe(0)
            expect(editor.__mocks.replaceRange.mock.calls[0][2].ch).toBe(expected.length)
            
            expect(obsidianProxy.__mocks.createNotice.mock.calls).toHaveLength(1)
        })

})