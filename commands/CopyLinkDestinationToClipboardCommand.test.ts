import { expect, test } from '@jest/globals';
import { CopyLinkDestinationToClipboardCommand } from './CopyLinkDestinationToClipboardCommand';

import { EditorMock } from './EditorMock'
import { ObsidianProxyMock } from './ObsidianProxyMock';

describe('CopyLinkDestinationToClipboardCommand test', () => {

    test('status - cursor on text - command disabled', () => {
        const obsidianProxy = new ObsidianProxyMock();
        const cmd = new CopyLinkDestinationToClipboardCommand(obsidianProxy)
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue('some text')
        editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
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
    )
        ('status - cursor on [$name] - command enabled', ({ name, text}) => {
            const obsidianProxy = new ObsidianProxyMock();
            const cmd = new CopyLinkDestinationToClipboardCommand(obsidianProxy)
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBeTruthy()
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

        })

    test.each(
        [
            {
                name: "html - href in '",
                text: "<a href='google.com'>google1</a>",
                expected: 'google.com'
            },
            {
                name: "html - href in \"",
                text: "<a href=\"google.com\">google1</a>",
                expected: 'google.com'
            },
            {
                name: "mdlink",
                text: "[google](google.com)",
                expected: 'google.com'

            },
            {
                name: "wikilink",
                text: "[[note 1|google]]",
                expected: 'note 1'
            },
            {
                name: "wikilink empty text",
                text: "[[note 1]]",
                expected: 'note 1'
            }
        ]
    )
        ('copy destination - [$name] - success', ({ name, text, expected}) => {
            const obsidianProxy = new ObsidianProxyMock();
            const cmd = new CopyLinkDestinationToClipboardCommand(obsidianProxy)
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
            //
            cmd.handler(editor, false)
            //
            expect(obsidianProxy.__mocks.clipboardWriteText.mock.calls).toHaveLength(1)
            expect(obsidianProxy.__mocks.clipboardWriteText.mock.calls[0][0]).toBe(expected)
            expect(obsidianProxy.__mocks.createNotice.mock.calls).toHaveLength(1)
        })

})