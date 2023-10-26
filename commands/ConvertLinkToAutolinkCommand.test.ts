import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { ConvertLinkToAutolinkCommand } from './ConvertLinkToAutolinkCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';

describe('ConvertLinkToAutolinkCommand test', () => {

    test('status - cursor on text - command disabled', () => {
        const cmd = new ConvertLinkToAutolinkCommand()
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
                name: "mdlink https",
                text: "[Google](https://google.com)",
                expected: true

            },
            {
                name: "mdlink ssh://",
                text: "[server](ssh://192.168.1.1)",
                expected: true

            },
            {
                name: "mkdlink email",
                text: "[jack](mailto:jack.smith@example.com)",
                expected: true

            },
            {
                name: "mdlink internal",
                text: "[note1](note1)",
                expected: false

            }
        ]
    )
        ('status - cursor on [$name] - enabled: $expected', ({ name, text, expected}) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
            const cmd = new ConvertLinkToAutolinkCommand()
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expected)
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)
        })

    test.each(
        [
            {
                name: "mdlink https",
                text: "[goole](https://google.com)",
                expected: '<https://google.com>',
                cursurPos: "<https://google.com>".length
            },
            {
                name: "mdlink http",
                text: "[goole](http://google.com)",
                expected: '<http://google.com>',
                cursurPos: "<http://google.com>".length
            },          
            {
                name: "mdlink absolute url",
                text: "[server](ssh://192.168.1.1)",
                expected: '<ssh://192.168.1.1>',
                cursurPos: "<ssh://192.168.1.1>".length
            },
            {
                name: "mdlink email",
                text: "[jack](mailto:jack@example.com)",
                expected: '<jack@example.com>',
                cursurPos: "<jack@example.com>".length
            },
        ]
    )
        ('convert link - cursor in selection [$name] - success', ({ name, text, expected, cursurPos }) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
            const cmd = new ConvertLinkToAutolinkCommand();
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
            expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe(expected)
            expect(editor.__mocks.replaceRange.mock.calls[0][1].ch).toBe(0)
            expect(editor.__mocks.replaceRange.mock.calls[0][2].ch).toBe(text.length)
            
            expect(editor.__mocks.setCursor.mock.calls).toHaveLength(1)
            expect(editor.__mocks.setCursor.mock.calls[0][0].ch).toBe(cursurPos)
        })

})