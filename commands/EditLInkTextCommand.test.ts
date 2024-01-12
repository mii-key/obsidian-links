import { expect, test } from '@jest/globals';
import { EditLinkTextCommand } from './EditLinkTextCommand';

import { EditorMock } from './EditorMock'

describe('EditLinkTextCommand test', () => {

    test('status - cursor on text - command disabled', () => {
        const cmd = new EditLinkTextCommand()
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue('some text')
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
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
                expected: false
            },
            {
                name: "mdlink image wo/text w/width",
                text: "[text|400](image.png)",
                expected: true
            },
            {
                name: "mdlink image wo/text w/width",
                text: "[400](image.png)",
                expected: false
            },
            {
                name: "mdlink image wo/text w/dimensions",
                text: "[400x200](image.png)",
                expected: false
            },
            {
                name: "wikilink",
                text: "[[google.com|google]]",
                expected: true
            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]",
                expected: false
            },
            {
                name: "wikilink image wo/text w/width",
                text: "[[image.png|400]]",
                expected: false
            },
            {
                name: "wikilink image wo/text w/dimensions",
                text: "[[image.png|400x200]]",
                expected: false
            },
            {
                name: "wikilink image w/text w/width",
                text: "[[image.png|text|400]]",
                expected: true
            },
            {
                name: "wikilink image w/text w/dimensions",
                text: "[[image.png|text|400x200]]",
                expected: true
            },
            {
                name: "autolink",
                text: "<https://google.com>",
                expected: false
            }
        ]
    )
        ('status - cursor on [$name] - command enabled: $expected', ({ name, text, expected }) => {
            const cmd = new EditLinkTextCommand()
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
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
                selectionStart: "<a href='google.com'>".length,
                selectionEnd: "<a href='google.com'>google1".length
            },
            {
                name: "html - href in \"",
                text: "<a href=\"google.com\">google1</a>",
                selectionStart: "<a href=\"google.com\">".length,
                selectionEnd: "<a href=\"google.com\">google1".length
            },
            {
                name: "mdlink",
                text: "[google](google.com)",
                selectionStart: "[".length,
                selectionEnd: "[google".length
            },
            {
                name: "mdlink image w/text w/width",
                text: "[text|400](image.png)",
                selectionStart: "[".length,
                selectionEnd: "[text".length
            },
            {
                name: "mdlink image w/text w/dimensions",
                text: "[text|400x200](image.png)",
                selectionStart: "[".length,
                selectionEnd: "[text".length
            },
            {
                name: "wikilink",
                text: "[[google.com|google]]",
                selectionStart: "[[google.com|".length,
                selectionEnd: "[[google.com|google".length
            },
            {
                name: "wikilink image w/text w/width",
                text: "[[image.png|text|300]]",
                selectionStart: "[[image.png|".length,
                selectionEnd: "[[image.png|text".length
            },
            {
                name: "wikilink image w/text w/dimensions",
                text: "[[image.png|text|300x100]]",
                selectionStart: "[[image.png|".length,
                selectionEnd: "[[image.png|text".length
            }
        ]
    )
        ('select text - cursor on [$name] - success', ({ name, text, selectionStart, selectionEnd }, done) => {
            const cmd = new EditLinkTextCommand()
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 0 })
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