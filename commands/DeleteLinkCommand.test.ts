import { expect, test } from '@jest/globals';
import { DeleteLinkCommand } from './DeleteLinkCommand';

import { EditorMock } from './EditorMock'

describe('DeleteLinkCommand test', () => {

    test('status - cursor on text - command disabled', () => {
        const cmd = new DeleteLinkCommand()
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
            const cmd = new DeleteLinkCommand()
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.posToOffset.mockReturnValue(1)

            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBeTruthy()
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

        })

    test.each(
        [
            {
                name: "html links",
                text: "<a href=\"google.com\">google2</a>"
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
            }
        ]
    )
        ('delete link - cursor in selection [$name] - success', ({ name, text}) => {
            const cmd = new DeleteLinkCommand()
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.posToOffset.mockReturnValue(0)
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
            expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe('')

            expect(editor.__mocks.offsetToPos.mock.calls).toHaveLength(2)
            expect(editor.__mocks.offsetToPos.mock.calls[0][0]).toBe(0)
            expect(editor.__mocks.offsetToPos.mock.calls[1][0]).toBe(text.length)
        })

})