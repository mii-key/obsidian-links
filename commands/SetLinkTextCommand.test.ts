import { expect, test } from '@jest/globals';

import { EditorMock, EditorPosition } from './EditorMock'
import { SetLinkTextCommand } from './SetLinkTextCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';
import { LinkData, LinkTypes, findLink } from '../utils';

describe('SetLinkTextCommand test', () => {

    test.each(
        [
            {
                name: "plain text",
                text: "some text",
                expected: false
            },

            // html
            {
                name: "html - href in '",
                text: "<a href='google.com'>google1</a>",
                expected: false
            },
            {
                name: "html - href in \"",
                text: "<a href=\"google.com\">google1</a>",
                expected: false
            },

            // wiki
            {
                name: "wikilink",
                text: "[[google.com|google]]",
                expected: false
            },
            {
                name: "wikilink heading in a note",
                text: "[[note1#heading 1|google]]",
                expected: true
            },
            {
                name: "wikilink heading",
                text: "[[#heading 1]]",
                expected: true
            },
            {
                name: "wikilink heading with text",
                text: "[[#heading 1|heading 1]]",
                expected: false
            },
            {
                name: "wikilink empty destination",
                text: "[[|google]]",
                expected: false
            },
            {
                name: "wikilink empty",
                text: "[[]]",
                expected: false
            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]",
                expected: true
            },
            //TODO: image links with dimensions

            // mdlink
            {
                name: "mdlink",
                text: "[google](google.com)",
                expected: false
            },
            {
                name: "mdlink empty text",
                text: "[](google.com)",
                expected: true
            },
            {
                name: "mdlink empty text, http",
                text: "[](http://google.com)",
                expected: true
            },
            {
                name: "mdlink empty text, https",
                text: "[](https://google.com)",
                expected: true
            },
            //TODO: image links with dimensions


            // autolink
            {
                name: "autolink ssh://",
                text: "<ssh://192.168.1.1>",
                expected: false
            },
            {
                name: "autolink email",
                text: "<jack.smith@example.com>",
                expected: false
            }
        ]
    )
        ('status - cursor on [$name] - enabled: $expected', ({ name, text, expected }) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new SetLinkTextCommand(obsidianProxyMock)

            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expected)
            expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(0)

        })

    test.each(
        [
            {
                name: "wikilink",
                text: "[[google.com]]",
                linkHasText: false,
                expected: '|google.com',
                selectionStart: "[[google.com|".length,
                selectionEnd: "[[google.com|google.com".length,
            },
            {
                name: "wikilink empty text",
                text: "[[google.com|]]",
                linkHasText: false,
                expected: '|google.com',
                selectionStart: "[[google.com|".length,
                selectionEnd: "[[google.com|google.com".length
            },
            {
                name: "wikilink w/heading, no text",
                text: "[[#heading1]]",
                linkHasText: false,
                expected: '|heading1',
                selectionStart: "[[#heading1|".length,
                selectionEnd: "[[#heading1|heading1".length,
                suggesterData: null,
                isDestinationUrl: false
            },
            {
                name: "wikilink w/headig, w/text - show suggestions",
                text: "[[note1#heading1|some heading]]",
                linkHasText: true,
                suggesterData: {
                    titles: ["heading1"]
                }
            },
            //TODO: image links with dimensions


            // mdlink
            {
                name: "mdlink wo/text",
                text: "[](google.com)",
                isDestinationUrl: false,
                linkHasText: false,
                expected: 'google.com',
                selectionStart: "[".length,
                selectionEnd: "[google.com".length
            },
            {
                name: "mdlink wo/text http://",
                text: "[](http://google.com)",
                isDestinationUrl: true,
                linkHasText: false,
                expected: 'Google',
                selectionStart: "[".length,
                selectionEnd: "[Google".length
            },
            {
                name: "mdlink w/headig, wo/text - show suggestions",
                text: "[](note1#heading1)",
                linkHasText: false,
                suggesterData: {
                    titles: ["heading1"]
                }
            },
            {
                name: "mdlink w/headig, w/text - show suggestions",
                text: "[some text](note1#heading1)",
                linkHasText: false,
                suggesterData: {
                    titles: ["heading1"]
                }
            },
            //TODO: image links with dimensions

        ]
    )
        ('set text - cursor on [$name] - success', ({ name, text, isDestinationUrl, linkHasText, expected,
            selectionStart, selectionEnd, suggesterData }, done) => {

            const offsetToPos = (offset: number) => ({ line: 0, ch: offset });
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
            const linkData = findLink(text, 1, 1);

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>Google</title>"
            })
            const cmd = new SetLinkTextCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
                if (err) {
                    done(err)
                    return
                }
                try {
                    if (suggesterData) {
                        expect(obsidianProxyMock.__mocks.linkTextSuggestContextSetLinkData.mock.calls).toHaveLength(1)
                        expect(obsidianProxyMock.__mocks.linkTextSuggestContextSetLinkData.mock.calls[0][0]).toEqual(linkData)
                        expect(obsidianProxyMock.__mocks.linkTextSuggestContextSetLinkData.mock.calls[0][1]).toEqual(suggesterData.titles)

                        // trigger suggester
                        expect(editor.__mocks.setCursor.mock.calls).toHaveLength(1)
                        expect(editor.__mocks.setCursor.mock.calls[0][0].ch).toBe(text.length)
                        expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(2)
                        expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe(' ')
                        expect(editor.__mocks.replaceRange.mock.calls[0][1].ch).toBe(text.length)
                        expect(editor.__mocks.replaceRange.mock.calls[1][0]).toBe('')
                        expect(editor.__mocks.replaceRange.mock.calls[1][1].ch).toBe(text.length)
                        expect(editor.__mocks.replaceRange.mock.calls[1][2].ch).toBe(text.length + 1)

                        done()
                    } else {
                        if (linkData?.type == LinkTypes.Wiki) {
                            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
                            expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe(expected)
                            expect(editor.__mocks.replaceRange.mock.calls[0][1].ch).toBe(selectionStart - 1)
                            if (linkHasText) {
                                expect(editor.__mocks.replaceRange.mock.calls[0][2].ch).toBe(selectionEnd)
                            }

                            expect(editor.__mocks.setSelection.mock.calls).toHaveLength(1)
                            expect(editor.__mocks.setSelection.mock.calls[0][0].ch).toBe(selectionStart)
                            expect(editor.__mocks.setSelection.mock.calls[0][1].ch).toBe(selectionEnd)
                        } else if (linkData?.type == LinkTypes.Markdown) {
                            if (isDestinationUrl) {
                                expect(obsidianProxyMock.__mocks.requestUrlMock.mock.calls).toHaveLength(1)
                                expect(editor.__mocks.setSelection.mock.calls).toHaveLength(2)
                                expect(editor.__mocks.setSelection.mock.calls[0][0].ch).toBe(selectionStart)
                                expect(editor.__mocks.setSelection.mock.calls[1][0].ch).toBe(selectionStart)
                                expect(editor.__mocks.setSelection.mock.calls[1][1].ch).toBe(selectionEnd)
                                expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
                                expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(expected)
                            } else {
                                if (suggesterData) {
                                    fail("123")
                                } else {
                                    expect(editor.__mocks.setSelection.mock.calls).toHaveLength(2)
                                    expect(editor.__mocks.setSelection.mock.calls[0][0].ch).toBe(selectionStart)
                                    expect(editor.__mocks.setSelection.mock.calls[1][0].ch).toBe(selectionStart)
                                    expect(editor.__mocks.setSelection.mock.calls[1][1].ch).toBe(selectionEnd)
                                    expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
                                    expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(expected)

                                }
                            }
                        } else {
                            fail(`Unknown link type ${linkData?.type}`)
                        }

                        done()
                    }
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