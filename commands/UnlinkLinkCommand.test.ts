import { expect, test } from '@jest/globals';
import moment from 'moment';
import { UnlinkLinkCommand } from './UnlinkLinkCommand';

import { EditorMock } from './EditorMock'

describe('UnlinkLinkCommand test', () => {

    test('selection without links - active', () => {
        const cmd = new UnlinkLinkCommand()
        const editor = new EditorMock()
        editor.getSelection = jest.fn().mockReturnValue('some text')
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
            editor.getSelection = jest.fn().mockReturnValue(text)
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
        ('text with $name - active=$enabled', ({ name, text, enabled }) => {
            const cmd = new UnlinkLinkCommand()
            const editor = new EditorMock()
            editor.getSelection = jest.fn().mockReturnValue('')
            editor.getValue = jest.fn().mockReturnValue(text)
            editor.getCursor = jest.fn()
            editor.posToOffset = jest.fn().mockReturnValue(1)
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
        ('unlink in selection [$name]', ({ name, text, expected }) => {
            const cmd = new UnlinkLinkCommand()
            const editor = new EditorMock()
            editor.getSelection = jest.fn().mockReturnValue(text)
            let mockReplaceSelection = jest.fn()
            editor.replaceSelection = mockReplaceSelection

            //
            cmd.handler(editor, false)
            //
            expect(mockReplaceSelection.mock.calls).toHaveLength(1)
            expect(mockReplaceSelection.mock.calls[0][0]).toBe(expected)
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
        ('unlink in selection [$name]', ({ name, text, expected }) => {
            const cmd = new UnlinkLinkCommand()
            const editor = new EditorMock()
            editor.getSelection = jest.fn().mockReturnValue('')
            editor.getValue = jest.fn().mockReturnValue(text)
            editor.getCursor = jest.fn()
            editor.posToOffset = jest.fn().mockReturnValue(1)
            let mockReplaceRange = jest.fn()
            editor.replaceRange = mockReplaceRange
            let mockOffsetToPos = jest.fn()
            editor.offsetToPos = mockOffsetToPos
            //
            cmd.handler(editor, false)
            //
            expect(mockReplaceRange.mock.calls).toHaveLength(1)
            expect(mockReplaceRange.mock.calls[0][0]).toBe(expected)
            expect(mockOffsetToPos.mock.calls[0][0]).toBe(0)
            expect(mockOffsetToPos.mock.calls[1][0]).toBe(text.length)

        })

})