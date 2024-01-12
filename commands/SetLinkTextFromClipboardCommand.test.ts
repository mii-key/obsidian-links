import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { SetLinkTextFromClipboardCommand } from './SetLinkTextFromClipboardCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';
import exp from 'constants';

describe('SetLinkTextFromClipboardCommand test', () => {


    test.each(
        [
            {
                name: "text",
                text: "Aliqua minim voluptate reprehenderit duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate reprehende".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: false,
            },

            // mdlink
            {
                name: "mdlink",
                text: "Aliqua minim voluptate [reprehenderit](duis) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "mdlink image with text + size",
                text: "Aliqua minim voluptate [reprehenderit|100x200](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            //TODO: image links with dimensions


            // wikilink
            {
                name: "wikilink",
                text: "Aliqua minim voluptate [[reprehenderit]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "wikilink with text",
                text: "Aliqua minim voluptate [[reprehenderit|some text]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "wikilink image with caption + size",
                text: "Aliqua minim voluptate [[reprehenderit.png|some text|100x200]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            //TODO: image links with dimensions


            //autolink
            {
                name: "autolink",
                text: "Aliqua minim voluptate <http://reprehenderit> duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate <re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: false,
            },

            //url
            {
                name: "URL",
                text: "Aliqua minim voluptate http://reprehenderit duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate ht".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
        ]
    )
        ('status - cursor on $name - success', ({ name, text, cursorPos, selection, clipboard, expectedEnabled }) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: cursorPos })
            editor.__mocks.getSelection.mockReturnValue(selection)

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.__mocks.clipboardReadText.mockResolvedValue(clipboard)

            const cmd = new SetLinkTextFromClipboardCommand(obsidianProxyMock);
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
                expectedReplacementEnd: "Proident laboris [nisi".length,
                expectedCursorPos: "Proident laboris [some text".length

            },
            {
                name: "mdlink",
                text: "Proident laboris [](elit) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris [".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris [".length,
                expectedReplacementEnd: "Proident laboris [".length,
                expectedCursorPos: "Proident laboris [some text".length

            },
            //TODO: image links with dimensions


            // wikilink
            {
                name: "wikilink",
                text: "Proident laboris [[nisi|elit]] irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris [[n".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris [[nisi|".length,
                expectedReplacementEnd: "Proident laboris [[nisi|elit".length,
                expectedCursorPos: "Proident laboris [[nisi|some text".length

            },
            {
                name: "wikilink wo/text",
                text: "Proident laboris [[nisi]] irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris [[n".length,
                expectedReplacement: '|some text',
                expectedReplacementStart: "Proident laboris [[nisi".length,
                expectedReplacementEnd: "Proident laboris [[nisi".length,
                expectedCursorPos: "Proident laboris [[nisi|some text".length

            },
            {
                name: "wikilink empty text",
                text: "Proident laboris [[nisi|]] irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris [[n".length,
                expectedReplacement: '|some text',
                expectedReplacementStart: "Proident laboris [[nisi".length,
                expectedReplacementEnd: "Proident laboris [[nisi".length,
                expectedCursorPos: "Proident laboris [[nisi|some text".length
            },
            //TODO: image links with dimensions

            // url
            {
                name: "url http",
                text: "Proident laboris http://obsidian irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris http://ob".length,
                expectedReplacement: '[some text](http://obsidian)',
                expectedReplacementStart: "Proident laboris ".length,
                expectedReplacementEnd: "Proident laboris http://obsidian".length,
                expectedCursorPos: "Proident laboris [some text".length
            },
        ]
    )
        ('set text - $name - success', ({ name, text, clipboardText, cursorOffset,
            expectedReplacement, expectedReplacementStart, expectedReplacementEnd, expectedCursorPos }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getSelection.mockRejectedValue('')
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: cursorOffset })

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.__mocks.clipboardReadText.mockResolvedValue(clipboardText)

            const cmd = new SetLinkTextFromClipboardCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
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
                    expect(editor.__mocks.setCursor.mock.calls[0][0].ch).toBe(expectedCursorPos)
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