import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { CreateLinkFromClipboardCommand } from './CreateLinkFromClipboardCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';
import exp from 'constants';
import { VaultMock } from './../VaultMock';

describe('CreateLinkFromClipboardCommand test', () => {


    test.each(
        [
            {
                name: "cursor on text",
                text: "Aliqua minim voluptate reprehenderit duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate reprehende".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "cursor inside mdlink",
                text: "Aliqua minim voluptate [reprehenderit](duis) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: false,
            },
            {
                name: "cursor inside wikilink",
                text: "Aliqua minim voluptate [[reprehenderit]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: false,
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

            const cmd = new CreateLinkFromClipboardCommand(obsidianProxyMock);
            //
            const enabled = cmd.handler(editor, true)
            //
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)
            expect(enabled).toBe(expectedEnabled)
        })

    test.each(
        [
            // selection
            // --------

            // text
            {
                name: "selection, text in clipboard",
                selection: "some selection",
                clipboard: "some text",
                expected: '[some selection](<some text>)',
                cursurPos: "[some selection](<some text>)".length
            },
            // wikilink
            {
                name: "selection, wikilink in clipboard",
                selection: "some selection",
                clipboard: "[[some text]]",
                expected: '[some selection](<some text>)',
                cursurPos: "[some selection](<some text>)".length
            },
            {
                name: "selection, 1st wikilink in clipboard",
                selection: "some selection",
                clipboard: "Ipsum [[cupidatat ut]] elit [[deserunt minim]] minim",
                expected: '[some selection](<cupidatat ut>)',
                cursurPos: "[some selection](<cupidatat ut>)".length
            },

            // obsidian link
            {
                name: "selection, obsidian link in clipboard, same vault",
                selection: "some selection",
                clipboard: "obsidian://open?vault=defaultVault&file=file1",
                expected: '[some selection](file1)',
                cursurPos: "[some selection](file1)".length
            },


            //no selection
            //------
            {
                name: "no selection, text in clipboard",
                selection: "",
                clipboard: "some-text",
                expected: '[some-text](some-text)',
                cursurPos: "[some-text](some-text)".length
            },
            {
                name: "no selection, text in clipboard",
                selection: "",
                clipboard: "some text",
                expected: '[some text](<some text>)',
                cursurPos: "[some text](<some text>)".length
            },
            {
                name: "no selection, http:// url in clipboard",
                selection: "",
                clipboard: "http://google.com",
                expected: '[Google](http://google.com)',
                cursurPos: "[Google](http://google.com)".length
            },
            {
                name: "no selection, https:// url in clipboard",
                selection: "",
                clipboard: "https://google.com",
                expected: '[Google](https://google.com)',
                cursurPos: "[Google](https://google.com)".length
            },
        ]
    )
        ('create link - $name - success', ({ name, selection, clipboard: clipboard, expected, cursurPos }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(selection)
            const linkStart = 1;
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: linkStart })

            const vault = new VaultMock()
            vault.__mocks.getName.mockReturnValue('defaultVault')
            const obsidianProxyMock = new ObsidianProxyMock(vault)
            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>Google</title>"
            })
            obsidianProxyMock.__mocks.clipboardReadText.mockResolvedValue(clipboard)

            const cmd = new CreateLinkFromClipboardCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
                if (err) {
                    done(err)
                    return
                }
                try {
                    expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
                    expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe(expected)
                    expect(editor.__mocks.replaceRange.mock.calls[0][1].ch).toBe(linkStart)
                    expect(editor.__mocks.replaceRange.mock.calls[0][2].ch).toBe(linkStart)

                    expect(editor.__mocks.setCursor.mock.calls).toHaveLength(1)
                    expect(editor.__mocks.setCursor.mock.calls[0][0].ch).toBe(linkStart + cursurPos)
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