import { expect, test } from '@jest/globals';
import { CreateLinkFromSelectionCommand } from './CreateLinkFromSelectionCommand';

import { EditorMock, EditorPosition } from './EditorMock'
import { ObsidianProxyMock } from './ObsidianProxyMock';

describe('CreateLinkFromSelectionCommand test', () => {

    test('status - cursor on text - command disabled', () => {
        const obsidianProxy = new ObsidianProxyMock();
        const cmd = new CreateLinkFromSelectionCommand(obsidianProxy);
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
    )('status - $name - command enabled', ({ name, text }) => {
        const obsidianProxy = new ObsidianProxyMock();
        const cmd = new CreateLinkFromSelectionCommand(obsidianProxy);
        const editor = new EditorMock()
        editor.__mocks.getSelection.mockReturnValue(text)
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBeTruthy()
        expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(0)

    })

    test('create link - selection not empty - success', () => {
        const obsidianProxy = new ObsidianProxyMock();
        const cmd = new CreateLinkFromSelectionCommand(obsidianProxy);
        const editor = new EditorMock()
        const selection = "some text"
        const linkStart = 1;
        editor.__mocks.getSelection.mockReturnValue(selection)
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: linkStart })
        //
        cmd.handler(editor, false)
        //
        expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
        expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(`[[|${selection}]]`)
        expect(editor.__mocks.setCursor.mock.calls).toHaveLength(1)
        expect(editor.__mocks.setCursor.mock.calls[0][0].ch).toBe(linkStart + 2)
    })

    test.each(
        [
            {
                name: "cursor: <space>wo|rd<space>",
                text: "Ea non laboris ut magna amet laborum",
                cursorPos: "Ea non labo".length,
                expectedSelection: "laboris",
                expectedSelectionStart: "Ea non ".length,
                expected: '[laboris](laboris)'
            },
            {
                name: "cursor: |<space>word<space>",
                text: "Ea non laboris ut magna amet laborum",
                cursorPos: "Ea non ".length,
                expectedSelection: "laboris",
                expectedSelectionStart: "Ea non ".length,
                expected: '[laboris](laboris)'
            },
            {
                name: "cursor: <space>word|<space>",
                text: "Ea non laboris ut magna amet laborum",
                cursorPos: "Ea non laboris".length,
                expectedSelection: "laboris",
                expectedSelectionStart: "Ea non ".length,
            },
            {
                name: "cursor: <doc-start>|word<space>",
                text: "Ea non laboris ut magna amet laborum",
                cursorPos: "".length,
                expectedSelection: "Ea",
                expectedSelectionStart: "".length,
            },
            {
                name: "cursor: <space>word|<doc-end>",
                text: "Ea non laboris ut magna amet laborum",
                cursorPos: "Ea non laboris ut magna amet laborum".length,
                expectedSelection: "laborum",
                expectedSelectionStart: "Ea non laboris ut magna amet ".length,
            },
            //TODO:
            // - wordEOL
            // - EOLword
        ]
    )('create link - selectWordUnderCursor - $name - success', ({ name, text, cursorPos, expectedSelection, expectedSelectionStart }) => {
        const editor = new EditorMock();

        editor.__mocks.getValue.mockReturnValue(text);
        let currentCursorPos = cursorPos;
        let currentSelection = '';
        editor.__mocks.getSelection.mockImplementation(() => currentSelection);

        editor.__mocks.getCursor.mockImplementation((pos?: string) => {
            switch (pos) {
                case 'from':
                    return { line: 0, ch: currentCursorPos }
                case 'to':
                    return { line: 0, ch: currentCursorPos + currentSelection.length }
            }
        });
        editor.__mocks.setSelection.mockImplementation((anchor: EditorPosition, head?: EditorPosition) => {
            currentCursorPos = anchor.ch
            currentSelection = text.substring(anchor.ch, head?.ch);
        });

        const obsidianProxy = new ObsidianProxyMock();
        obsidianProxy.settings.autoselectWordOnCreateLink = true;

        const cmd = new CreateLinkFromSelectionCommand(obsidianProxy);

        //
        cmd.handler(editor, false)
        //

        expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
        expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(`[[|${expectedSelection}]]`)
        expect(editor.__mocks.setCursor.mock.calls).toHaveLength(1)
        expect(editor.__mocks.setCursor.mock.calls[0][0].ch).toBe(expectedSelectionStart + 2)
    })

})