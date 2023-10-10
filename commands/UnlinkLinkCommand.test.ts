import { expect, test } from '@jest/globals';
import moment from 'moment';
import { UnlinkLinkCommand } from './UnlinkLinkCommand';

import { EditorMock } from './EditorMock'

describe('UnlinkLinkCommand test', () => {

    test('status - selection without links - disabled', () => {
        const cmd = new UnlinkLinkCommand()
        const editor = new EditorMock()
        editor.__mocks.getSelection.mockReturnValue('some text')
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBeFalsy()
    })

    test.each(
        [
            {
                name: "html links",
                text: "<a href='google.com'>google1</a> <a href=\"google.com\">google2</a>",
                enabled: true
            },
            {
                name: "mdlink",
                text: "[google](google.com)",
                enabled: true
            },
            {
                name: "wikilink",
                text: "[[google.com|google]]",
                enabled: true

            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]",
                enabled: true

            },
            {
                name: "autolink",
                text: "<https://google.com>",
                enabled: false
            }
        ]
    )
        ('selection with $name - active=$enabled', ({ name, text, enabled }) => {
            const cmd = new UnlinkLinkCommand()
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(enabled)
        })

    test.each(
        [
            {
                name: "html links",
                text: "<a href='google.com'>google1</a> <a href=\"google.com\">google2</a>",
                enabled: true
            },
            {
                name: "mdlink",
                text: "[google](google.com)",
                enabled: true
            },
            {
                name: "wikilink",
                text: "[[google.com|google]]",
                enabled: true

            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]",
                enabled: true

            },
            {
                name: "autolink",
                text: "<https://google.com>",
                enabled: false
            }
        ]
    )
        ('status - cursor on $name - enabled=$enabled', ({ name, text, enabled }) => {
            const cmd = new UnlinkLinkCommand()
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue('')
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.posToOffset.mockReturnValue(1)
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(enabled)
        })

    test.each(
        [
            {
                name: "html links",
                text: "<a href=\"google.com\">google2</a>",
                expected: 'google2'
            },
            {
                name: "mdlink",
                text: "[google](google.com)",
                expected: 'google'
            },
            {
                name: "wikilink",
                text: "[[google.com|google]]",
                expected: 'google'
            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]",
                expected: 'google.com'
            }
        ]
    )
        ('unlink - selection with [$name] - success', ({ name, text, expected }) => {
            const cmd = new UnlinkLinkCommand()
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
            expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(expected)
        })

    test.each(
        [
            {
                name: "html links (\")",
                text: "<a href=\"google.com\">google2</a>",
                expected: 'google2'
            },
            // {
            //     name: "html links (')",
            //     text: "<a href=`google.com`>google2</a>",
            //     expected: 'google2'
            // },
            {
                name: "mdlink",
                text: "[google](google.com)",
                expected: 'google'
            },
            {
                name: "wikilink",
                text: "[[google.com|google]]",
                expected: 'google'
            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]",
                expected: 'google.com'
            }
        ]
    )
        ('unlink - cursor on [$name] - success', ({ name, text, expected }) => {
            const cmd = new UnlinkLinkCommand()
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue('')
            editor.__mocks.getValue.mockReturnValue(text)
            editor.posToOffset = jest.fn().mockReturnValue(1)
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
            expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe(expected)
            expect(editor.__mocks.offsetToPos.mock.calls[0][0]).toBe(0)
            expect(editor.__mocks.offsetToPos.mock.calls[1][0]).toBe(text.length)

        })

})