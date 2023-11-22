import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { SetTextFromClipboardCommand } from './SetTextFromClipboardCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';
import exp from 'constants';

describe('SetTextFromClipboardCommand test', () => {


    test.each(
        [
            {
                name: "cursor on text",
                text: "Aliqua minim voluptate reprehenderit duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate reprehende".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: false,
            },
            {
                name: "cursor inside mdlink",
                text: "Aliqua minim voluptate [reprehenderit](duis) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "cursor inside wikilink",
                text: "Aliqua minim voluptate [[reprehenderit]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "cursor inside autolink",
                text: "Aliqua minim voluptate <http://reprehenderit> duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate <re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: false,
            },
        ]
    )
        ('status - $name - success', ({ name, text, cursorPos, selection, clipboard, expectedEnabled }) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: cursorPos })
            editor.__mocks.getSelection.mockReturnValue(selection)

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.__mocks.clipboardReadText.mockResolvedValue(clipboard)

            const cmd = new SetTextFromClipboardCommand(obsidianProxyMock);
            //
            const enabled = cmd.handler(editor, true)
            //
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)
            expect(enabled).toBe(expectedEnabled)
        })

    test.each(
        [
            {
                name: "mdlink",
                text: "Proident laboris [nisi](elit) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris [n".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris [".length,
                expectedReplacementEnd: "Proident laboris [nisi".length
            },
            {
                name: "mdlink",
                text: "Proident laboris [](elit) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris [".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris [".length,
                expectedReplacementEnd: "Proident laboris [".length
            },
            {
                name: "wikilink",
                text: "Proident laboris [[nisi|elit]] irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris [[n".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris [[nisi|".length,
                expectedReplacementEnd: "Proident laboris [[nisi|elit".length
            },
            {
                name: "wikilink wo/text",
                text: "Proident laboris [[nisi]] irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris [[n".length,
                expectedReplacement: '|some text',
                expectedReplacementStart: "Proident laboris [[nisi".length,
                expectedReplacementEnd: "Proident laboris [[nisi".length
            },
            {
                name: "wikilink empty text",
                text: "Proident laboris [[nisi|]] irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris [[n".length,
                expectedReplacement: '|some text',
                expectedReplacementStart: "Proident laboris [[nisi".length,
                expectedReplacementEnd: "Proident laboris [[nisi".length
            },
        ]
    )
        ('create link - $name - success', ({ name, text, clipboardText, cursorOffset, expectedReplacement, expectedReplacementStart, expectedReplacementEnd }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getSelection.mockRejectedValue('')
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: cursorOffset })

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.__mocks.clipboardReadText.mockResolvedValue(clipboardText)

            const cmd = new SetTextFromClipboardCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
                if (err) {
                    done(err)
                    return
                }
                try {
                    expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
                    expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe(expectedReplacement)
                    expect(editor.__mocks.replaceRange.mock.calls[0][1].ch).toBe(expectedReplacementStart)
                    expect(editor.__mocks.replaceRange.mock.calls[0][2].ch).toBe(expectedReplacementEnd)

                    expect(editor.__mocks.setCursor.mock.calls).toHaveLength(1)
                    expect(editor.__mocks.setCursor.mock.calls[0][0].ch).toBe(expectedReplacementStart + expectedReplacement.length)
                    done()
                }
                catch (err) {
                    done(err)
                }
            })

            //
            cmd.handler(editor, false)
            //
        })



})