import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { SetLinkTextFromClipboardCommand } from './SetLinkTextFromClipboardCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';
import exp from 'constants';

describe('SetLinkTextFromClipboardCommand test', () => {


    test.each(
        [
            // text
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
                name: "mdlink image, text + WxH",
                text: "Aliqua minim voluptate [reprehenderit|100x200](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "mdlink image, text + W",
                text: "Aliqua minim voluptate [reprehenderit|100](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "mdlink image, empty text + W",
                text: "Aliqua minim voluptate [|100](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "mdlink image, W",
                text: "Aliqua minim voluptate [100](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "mdlink image, empty text + WxH",
                text: "Aliqua minim voluptate [|100x200](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "mdlink image, WxH",
                text: "Aliqua minim voluptate [100x200](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!mdlink",
                text: "Aliqua minim voluptate ![reprehenderit](duis) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!mdlink image, text + WxH",
                text: "Aliqua minim voluptate ![reprehenderit|100x200](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!mdlink image, text + W",
                text: "Aliqua minim voluptate ![reprehenderit|100](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!mdlink image, empty text + W",
                text: "Aliqua minim voluptate ![|100](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!mdlink image, W",
                text: "Aliqua minim voluptate ![100](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!mdlink image, empty text + WxH",
                text: "Aliqua minim voluptate ![|100x200](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!mdlink image, WxH",
                text: "Aliqua minim voluptate ![100x200](duis.png) amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },

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
                name: "wikilink image, text + WxH",
                text: "Aliqua minim voluptate [[reprehenderit.png|some text|100x200]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "wikilink image, empty text + WxH",
                text: "Aliqua minim voluptate [[reprehenderit.png||100x200]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "wikilink image, WxH",
                text: "Aliqua minim voluptate [[reprehenderit.png|100x200]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "wikilink image, text + W",
                text: "Aliqua minim voluptate [[reprehenderit.png|some text|100]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "wikilink image, empty text + W",
                text: "Aliqua minim voluptate [[reprehenderit.png||100]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "wikilink image, W",
                text: "Aliqua minim voluptate [[reprehenderit.png|100]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!wikilink",
                text: "Aliqua minim voluptate ![[reprehenderit]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!wikilink with text",
                text: "Aliqua minim voluptate ![[reprehenderit|some text]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!wikilink image, text + WxH",
                text: "Aliqua minim voluptate ![[reprehenderit.png|some text|100x200]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!wikilink image, empty text + WxH",
                text: "Aliqua minim voluptate ![[reprehenderit.png||100x200]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!wikilink image, WxH",
                text: "Aliqua minim voluptate ![[reprehenderit.png|100x200]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!wikilink image, text + W",
                text: "Aliqua minim voluptate ![[reprehenderit.png|some text|100]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!wikilink image, empty text + W",
                text: "Aliqua minim voluptate ![[reprehenderit.png||100]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },
            {
                name: "!wikilink image, W",
                text: "Aliqua minim voluptate ![[reprehenderit.png|100]] duis amet et consectetur in excepteur sint exercitation.",
                cursorPos: "Aliqua minim voluptate [[re".length,
                selection: "",
                clipboard: "some text",
                expectedEnabled: true,
            },

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
    )('status - cursor on $name - success', ({ name, text, cursorPos, selection, clipboard, expectedEnabled }) => {
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
            //mdlink
            {
                name: "mdlink w/text",
                text: "Proident laboris [nisi](elit) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris [n".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris [".length,
                expectedReplacementEnd: "Proident laboris [nisi".length,
                expectedCursorPos: "Proident laboris [some text".length

            },
            {
                name: "mdlink wo/text",
                text: "Proident laboris [](elit) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris [".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris [".length,
                expectedReplacementEnd: "Proident laboris [".length,
                expectedCursorPos: "Proident laboris [some text".length

            },
            {
                name: "mdlink ! w/text",
                text: "Proident laboris ![nisi](elit) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![n".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris ![".length,
                expectedReplacementEnd: "Proident laboris ![nisi".length,
                expectedCursorPos: "Proident laboris ![some text".length

            },
            {
                name: "!mdlink wo/text",
                text: "Proident laboris ![](elit) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris ![".length,
                expectedReplacementEnd: "Proident laboris ![".length,
                expectedCursorPos: "Proident laboris ![some text".length

            },
            {
                name: "!mdlink img, text + WxH",
                text: "Proident laboris ![image1|200x100](elit.png) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris ![".length,
                expectedReplacementEnd: "Proident laboris ![image1".length,
                expectedCursorPos: "Proident laboris ![some text".length

            },
            {
                name: "!mdlink img, empty text + WxH",
                text: "Proident laboris ![|200x100](elit.png) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris ![".length,
                expectedReplacementEnd: "Proident laboris ![".length,
                expectedCursorPos: "Proident laboris ![some text".length

            },
            {
                name: "!mdlink img, WxH",
                text: "Proident laboris ![200x100](elit.png) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![".length,
                expectedReplacement: 'some text|',
                expectedReplacementStart: "Proident laboris ![".length,
                expectedReplacementEnd: "Proident laboris ![".length,
                expectedCursorPos: "Proident laboris ![some text".length

            },
            {
                name: "!mdlink img, text + W",
                text: "Proident laboris ![image1|200](elit.png) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris ![".length,
                expectedReplacementEnd: "Proident laboris ![image1".length,
                expectedCursorPos: "Proident laboris ![some text".length

            },
            {
                name: "!mdlink img, empty text + W",
                text: "Proident laboris ![|200](elit.png) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris ![".length,
                expectedReplacementEnd: "Proident laboris ![".length,
                expectedCursorPos: "Proident laboris ![some text".length

            },
            {
                name: "!mdlink img, W",
                text: "Proident laboris ![200](elit.png) irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![".length,
                expectedReplacement: 'some text|',
                expectedReplacementStart: "Proident laboris ![".length,
                expectedReplacementEnd: "Proident laboris ![".length,
                expectedCursorPos: "Proident laboris ![some text".length

            },

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
            {
                name: "!wikilink img, text + WxH",
                text: "Proident laboris ![[elit.png|image1|200x100]] irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![[e".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris ![[elit.png|".length,
                expectedReplacementEnd: "Proident laboris ![[elit.png|image1".length,
                expectedCursorPos: "Proident laboris ![[elit.png|some text".length
            },
            {
                name: "!wikilink img, empty text + WxH",
                text: "Proident laboris ![[elit.png||200x100]] irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![[e".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris ![[elit.png|".length,
                expectedReplacementEnd: "Proident laboris ![[elit.png|".length,
                expectedCursorPos: "Proident laboris ![[elit.png|some text".length
            },
            {
                name: "!wikilink img, WxH",
                text: "Proident laboris ![[elit.png|200x100]] irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![[e".length,
                expectedReplacement: '|some text',
                expectedReplacementStart: "Proident laboris ![[elit.png".length,
                expectedReplacementEnd: "Proident laboris ![[elit.png".length,
                expectedCursorPos: "Proident laboris ![[elit.png|some text".length
            },
            {
                name: "!wikilink img, text + W",
                text: "Proident laboris ![[elit.png|image1|200]] irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![[e".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris ![[elit.png|".length,
                expectedReplacementEnd: "Proident laboris ![[elit.png|image1".length,
                expectedCursorPos: "Proident laboris ![[elit.png|some text".length
            },
            {
                name: "!wikilink img, empty text + W",
                text: "Proident laboris ![[elit.png||200]] irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![[e".length,
                expectedReplacement: 'some text',
                expectedReplacementStart: "Proident laboris ![[elit.png|".length,
                expectedReplacementEnd: "Proident laboris ![[elit.png|".length,
                expectedCursorPos: "Proident laboris ![[elit.png|some text".length
            },
            {
                name: "!wikilink img, W",
                text: "Proident laboris ![[elit.png|200]] irure in aliquip nulla aliqua laboris.",
                clipboardText: "some text",
                cursorOffset: "Proident laboris ![[e".length,
                expectedReplacement: '|some text',
                expectedReplacementStart: "Proident laboris ![[elit.png".length,
                expectedReplacementEnd: "Proident laboris ![[elit.png".length,
                expectedCursorPos: "Proident laboris ![[elit.png|some text".length
            },

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
    )('set text - $name - success', ({ name, text, clipboardText, cursorOffset,
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