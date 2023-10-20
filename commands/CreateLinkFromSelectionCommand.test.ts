import { expect, test } from '@jest/globals';
import { CreateLinkFromSelectionCommand } from './CreateLinkFromSelectionCommand';

import { EditorMock } from './EditorMock'

describe('CreateLinkFromSelectionCommand test', () => {

    test('status - cursor on text - command disabled', () => {
        const cmd = new CreateLinkFromSelectionCommand()
        const editor = new EditorMock()
        editor.__mocks.getSelection.mockReturnValue('')
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBeFalsy()
        expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(0)
    })

    test.each(
        [
            {
                name: "non empty selection",
                text: "some text"
            }
        ]
    )
        ('status - $name - command enabled', ({ name, text }) => {
            const cmd = new CreateLinkFromSelectionCommand()
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBeTruthy()
            expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(0)

        })

    test('create link - selection not empty - success', () => {
        const cmd = new CreateLinkFromSelectionCommand()
        const editor = new EditorMock()
        const selection = "some text"
        const linkStart = 1;
        editor.__mocks.getSelection.mockReturnValue(selection)
        editor.__mocks.posToOffset.mockReturnValue(linkStart)
        //
        cmd.handler(editor, false)
        //
        expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
        expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(`[[|${selection}]]`)

        expect(editor.__mocks.offsetToPos.mock.calls).toHaveLength(1)
        expect(editor.__mocks.offsetToPos.mock.calls[0][0]).toBe(linkStart + 2)
    })

})