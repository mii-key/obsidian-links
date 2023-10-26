import { expect, test } from '@jest/globals';
import { UnembedLinkCommand } from './UnembedLinkCommand';

import { EditorMock } from './EditorMock'

describe('UnembedLinkCommand test', () => {

    test.each(
        [
            {
                name: "text wo/link",
                text: "some text",
                enabled: false
            },
            {
                name: "wikilink",
                text: "[[some note]]",
                enabled: false
            },
            {
                name: "!wikilink",
                text: "![[some note]]",
                enabled: true
            },
            {
                name: "html - href in '",
                text: "<a href='google.com'>google1</a>",
                enabled: false
            },
            {
                name: "!html - href in '",
                text: "!<a href='google.com'>google1</a>",
                enabled: false
            },
            {
                name: "html - href in \"",
                text: "<a href=\"google.com\">google1</a>",
                enabled: false
            },
            {
                name: "!html - href in \"",
                text: "!<a href=\"google.com\">google1</a>",
                enabled: false
            },
            {
                name: "mdlink",
                text: "[google](google.com)",
                enabled: false
            },
            {
                name: "!mdlink",
                text: "![google](google.com)",
                enabled: true
            },
            {
                name: "autolink",
                text: "<https://google.com>",
                enabled: false
            },
            {
                name: "!autolink",
                text: "!<https://google.com>",
                enabled: false
            }
        ]
    )
        ('status - cursor on [$name] - command enabled', ({ name, text, enabled}) => {
            const cmd = new UnembedLinkCommand()
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(enabled)
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)
        })

    test.each(
        [
            {
                name: "!wikilink wo/text",
                text: "![[some note]]",
                expected: "[[some note]]"
            },
            {
                name: "wikilink",
                text: "![[some note|some text]]",
                expected: "[[some note|some text]]"
            },
            {
                name: "mdlink",
                text: "![google](google.com)",
                expected: "[google](google.com)"
            },
            {
                name: "mdlink wo/text",
                text: "![](google.com)",
                expected: "[](google.com)"
            },
        ]
    )
        ('unembed link - cursor on [$name] - success', ({ name, text, expected}) => {
            const cmd = new UnembedLinkCommand()
            const editor = new EditorMock()
            const linkStart = 0
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: linkStart})
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
            expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe(expected)
            expect(editor.__mocks.replaceRange.mock.calls[0][1].ch).toBe(linkStart)
            expect(editor.__mocks.replaceRange.mock.calls[0][2].ch).toBe(linkStart + text.length)
        })

})