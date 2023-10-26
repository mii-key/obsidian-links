import { expect, test } from '@jest/globals';
import { EditLinkDestinationCommand } from './EditLinkDestinationCommand';

import { EditorMock } from './EditorMock'

describe('EditLinkDestinationCommand test', () => {

    test('status - cursor on text - command disabled', () => {
        const cmd = new EditLinkDestinationCommand()
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue('some text')
        editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBeFalsy()
        expect(editor.__mocks.setSelection.mock.calls).toHaveLength(0)
    })

    test.each(
        [
            {
                name: "html - href in '",
                text: "<a href='google.com'>google1</a>",
                expected: true
            },
            {
                name: "html - href in \"",
                text: "<a href=\"google.com\">google1</a>",
                expected: true
            },
            {
                name: "mdlink",
                text: "[google](google.com)",
                expected: true
            },
            {
                name: "mdlink empty text",
                text: "[](google.com)",
                expected: true
            },
            {
                name: "wikilink",
                text: "[[google.com|google]]",
                expected: true
            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]",
                expected: true
            },
            {
                name: "autolink",
                text: "<https://google.com>",
                expected: true
            }
        ]
    )
        ('status - cursor on [$name] - command enabled: $expected', ({ name, text, expected }) => {
            const cmd = new EditLinkDestinationCommand()
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expected);
            expect(editor.__mocks.setSelection.mock.calls).toHaveLength(0)
        })

    test.each(
        [
            {
                name: "html - href in '",
                text: "<a href='google.com'>google1</a>",
                selectionStart: "<a href='".length,
                selectionEnd: "<a href='google.com".length
            },
            {
                name: "html - href in \"",
                text: "<a href=\"google.com\">google1</a>",
                selectionStart: "<a href=\"".length,
                selectionEnd: "<a href=\"google.com".length
            },
            {
                name: "mdlink",
                text: "[google](google.com)",
                selectionStart: "[google](".length,
                selectionEnd: "[google](google.com".length
            },
            {
                name: "wikilink",
                text: "[[google.com|google]]",
                selectionStart: "[[".length,
                selectionEnd: "[[google.com".length
            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]",
                selectionStart: "[[".length,
                selectionEnd: "[[google.com".length
            },
            {
                name: "autolink",
                text: "<https://google.com>",
                selectionStart: "<".length,
                selectionEnd: "<https://google.com".length
            }
        ]
    )
        ('select text - cursor on [$name] - success', ({ name, text, selectionStart, selectionEnd }, done) => {
            const cmd = new EditLinkDestinationCommand()
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
            //
            cmd.handler(editor, false)
            //
            setTimeout(() => {
                try {
                    expect(editor.__mocks.setSelection.mock.calls).toHaveLength(1)
                    expect(editor.__mocks.setSelection.mock.calls[0][0].ch).toBe(selectionStart)
                    expect(editor.__mocks.setSelection.mock.calls[0][1].ch).toBe(selectionEnd)
                    done();
                }
                catch (err) {
                    done(err);
                }
            }, 700);
        })

})