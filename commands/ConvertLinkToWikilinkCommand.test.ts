import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { ConvertLinkToWikilinkCommand } from './ConvertLinkToWikilinkCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';

describe('ConvertLinkToWikilinkCommand test', () => {

    test('status - cursor on text - command disabled', () => {
        const cmd = new ConvertLinkToWikilinkCommand()
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue('some text')
        editor.__mocks.posToOffset.mockReturnValue(1)
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
                text: "<a href='google.com'>google1</a>",
                expected: false
            },
            //TODO:
            // {
            //     name: "html - href in \"",
            //     text: "<a href=\"google.com\">google1</a>",
            //     expected: false
            // },
            {
                name: "wikilink",
                text: "[[note1|note1]]",
                expected: false

            },
            {
                name: "wikilink empty text",
                text: "[[note1]]",
                expected: false

            },
            {
                name: "autolink https",
                text: "<https://google.com>",
                expected: false

            },
            {
                name: "autolink ssh://",
                text: "<ssh://192.168.1.1>",
                expected: false

            },
            {
                name: "autolink email",
                text: "<jack.smith@example.com>",
                expected: false

            },
            {
                name: "mdlink",
                text: "[note1](note1)",
                expected: true

            },
            {
                name: "mdlink empty text",
                text: "[](note1)",
                expected: true

            },
            {
                name: "mdlink external",
                text: "[google](https://google.com)",
                expected: false

            },
        ]
    )
        ('status - cursor on [$name] - enabled: $expected', ({ name, text, expected}) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.posToOffset.mockReturnValue(1)
            const cmd = new ConvertLinkToWikilinkCommand()
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expected)
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

        })

    test.each(
        [
            {
                name: "mdlink",
                text: "[note1 text](note1)",
                expected: '[[note1|note1 text]]',
                cursurPos: "[[note1|note1 text]]".length
            },
            {
                name: "mdlink destination w/spaces",
                text: "[note1 text](<note 1>)",
                expected: '[[note 1|note1 text]]',
                cursurPos: "[[note 1|note1 text]]".length
            },            
            {
                name: "mdlink empty text",
                text: "[](note1)",
                expected: '[[note1]]',
                cursurPos: "[[note1]]".length
            },
            {
                name: "mdlink with header",
                text: "[note1 text](note1#header1)",
                expected: '[[note1#header1|note1 text]]',
                cursurPos: "[[note1#header1|note1 text]]".length
            },
        ]
    )
        ('convert link - cursor in selection [$name] - success', ({ name, text, expected, cursurPos }) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.posToOffset.mockReturnValue(1)

            const cmd = new ConvertLinkToWikilinkCommand();
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
            expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe(expected)

            expect(editor.__mocks.offsetToPos.mock.calls).toHaveLength(3)
            expect(editor.__mocks.offsetToPos.mock.calls[0][0]).toBe(0)
            expect(editor.__mocks.offsetToPos.mock.calls[1][0]).toBe(text.length)
            //cursor position
            expect(editor.__mocks.offsetToPos.mock.calls[2][0]).toBe(cursurPos)

        })

})