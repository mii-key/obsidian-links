import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { ConvertAllLinksToMdlinksCommand } from './ConvertAllLinksToMdlinksCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';

describe('ConvertAllLinksToMdlinksCommand test', () => {

    test('status - cursor on text - command disabled', () => {
        const obsidianProxyMock = new ObsidianProxyMock()
        const cmd = new ConvertAllLinksToMdlinksCommand(obsidianProxyMock)
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue('some text')
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBeFalsy()
        expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

    })

    test('status - selection with text - command disabled', () => {
        const obsidianProxyMock = new ObsidianProxyMock()
        const cmd = new ConvertAllLinksToMdlinksCommand(obsidianProxyMock)
        const editor = new EditorMock()
        editor.__mocks.getSelection.mockReturnValue('some text')
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
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
            //TODO:
            // {
            //     name: "html - href in \"",
            //     text: "<a href=\"google.com\">google1</a>"
            // },
            {
                name: "wikilink",
                text: "[[google.com|google]]"
            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]",
            },
            {
                name: "autolink https://",
                text: "<https://google.com>",
            },
            {
                name: "autolink ssh://",
                text: "<ssh://192.168.1.1>",
            },
            {
                name: "autolink email",
                text: "<jack.smith@example.com>",
            }
        ]
    )
        ('status - cursor on [$name] - command enabled', ({ name, text }) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new ConvertAllLinksToMdlinksCommand(obsidianProxyMock)
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBeTruthy()
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

        })

    test.each(
        [
            {
                name: "html - href in '",
                text: "<a href='google.com'>google1</a>"
            },
            //TODO:
            // {
            //     name: "html - href in \"",
            //     text: "<a href=\"google.com\">google1</a>"
            // },
            {
                name: "wikilink",
                text: "[[google.com|google]]"
            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]",
            },
            {
                name: "autolink https://",
                text: "<https://google.com>",
            },
            {
                name: "autolink ssh://",
                text: "<ssh://192.168.1.1>",
            },
            {
                name: "autolink email",
                text: "<jack.smith@example.com>",
            }
        ]
    )
        ('status - selection with [$name] - command enabled', ({ name, text }) => {
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new ConvertAllLinksToMdlinksCommand(obsidianProxyMock)
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBeTruthy()
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

        })

    test.each(
        [
            {
                name: "html - href in '",
                text: "<a href='google1.com'>google1</a> <a href='google2.com'>google2</a>",
                expected: [
                    {
                        text: '[google2](google2.com)',
                        start: "<a href='google1.com'>google1</a> ".length,
                        end: "<a href='google1.com'>google1</a> <a href='google2.com'>google2</a>".length
                    },
                    {
                        text: '[google1](google1.com)',
                        start: 0,
                        end: "<a href='google1.com'>google1</a>".length
                    }
                ],
                cursurPos: "[google1](google.com)".length
            },
            // TODO:
            // {
            //     name: "html - href in \"",
            //     text: "<a href=\"google.com\">google1</a>"
            // },
            {
                name: "wikilink",
                text: "[[google1.com|google1]] [[google2.com|google2]]",
                expected: [
                    {
                        text: '[google2](google2.com)',
                        start: "[[google1.com|google1]] ".length,
                        end: "[[google1.com|google1]] [[google2.com|google2]]".length
                    },
                    {
                        text: '[google1](google1.com)',
                        start: 0,
                        end: "[[google1.com|google1]]".length
                    }
                ],

                cursurPos: "[google](google.com)".length
            },
            {
                name: "wikilink empty text",
                text: "[[google1.com]] [[google2.com]]",
                expected: [
                    {
                        text: '[google2.com](google2.com)',
                        start: "[[google1.com]] ".length,
                        end: "[[google1.com]] [[google2.com]]".length
                    },
                    {
                        text: '[google1.com](google1.com)',
                        start: 0,
                        end: "[[google1.com]]".length
                    }
                ],
                cursurPos: "[google.com](google.com)".length
            },
            {
                name: "autolink https://",
                text: "<http://google.com> <https://google.com>",
                expected: [
                    {
                        text: '[Google](https://google.com)',
                        start: "<http://google.com> ".length,
                        end: "<http://google.com> <https://google.com>".length
                    },
                    {
                        text: '[Google](http://google.com)',
                        start: 0,
                        end: "<http://google.com>".length
                    }
                ],
                cursurPos: "[Google](https://google.com)".length
            },
            {
                name: "autolink ssh://",
                text: "<ssh://192.168.1.1> <ssh://192.168.1.2>",
                expected: [
                    {
                        text: '[](ssh://192.168.1.2)',
                        start: "<ssh://192.168.1.1> ".length,
                        end: "<ssh://192.168.1.1> <ssh://192.168.1.2>".length
                    },
                    {
                        text: '[](ssh://192.168.1.1)',
                        start: 0,
                        end: "<ssh://192.168.1.1>".length
                    }
                ],
                cursurPos: "[".length
            },
            {
                name: "autolink email",
                text: "<jack.smith@example1.com> <jack.smith@example2.com>",
                expected: [
                    {
                        text: '[](mailto:jack.smith@example2.com)',
                        start: "<jack.smith@example1.com> ".length,
                        end: "<jack.smith@example1.com> <jack.smith@example2.com>".length
                    },
                    {
                        text: '[](mailto:jack.smith@example1.com)',
                        start: 0,
                        end: "<jack.smith@example1.com>".length
                    }
                ],
                cursurPos: "[".length
            }
        ]
    )
        ('convert all links - text - success', ({ name, text, expected, cursurPos }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>Google</title>"
            })
            const cmd = new ConvertAllLinksToMdlinksCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
                if (err) {
                    done(err)
                    return
                }
                try {
                    expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(expected.length)
                    for (let call = 0; call < expected.length; call++) {
                        expect(editor.__mocks.replaceRange.mock.calls[call][0]).toBe(expected[call].text)
                        expect(editor.__mocks.replaceRange.mock.calls[call][1].ch).toBe(expected[call].start)
                        expect(editor.__mocks.replaceRange.mock.calls[call][2].ch).toBe(expected[call].end)
                    }
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

    test.each(
        [
            {
                name: "html - href in '",
                text: "<a href='google1.com'>google1</a> <a href='google2.com'>google2</a>",
                expected: [
                    {
                        text: '[google2](google2.com)',
                        start: "<a href='google1.com'>google1</a> ".length,
                        end: "<a href='google1.com'>google1</a> <a href='google2.com'>google2</a>".length
                    },
                    {
                        text: '[google1](google1.com)',
                        start: 0,
                        end: "<a href='google1.com'>google1</a>".length
                    }
                ],
                cursurPos: "[google1](google.com)".length
            },
            // TODO:
            // {
            //     name: "html - href in \"",
            //     text: "<a href=\"google.com\">google1</a>"
            // },
            {
                name: "wikilink",
                text: "[[google1.com|google1]] [[google2.com|google2]]",
                expected: [
                    {
                        text: '[google2](google2.com)',
                        start: "[[google1.com|google1]] ".length,
                        end: "[[google1.com|google1]] [[google2.com|google2]]".length
                    },
                    {
                        text: '[google1](google1.com)',
                        start: 0,
                        end: "[[google1.com|google1]]".length
                    }
                ],

                cursurPos: "[google](google.com)".length
            },
            {
                name: "wikilink empty text",
                text: "[[google1.com]] [[google2.com]]",
                expected: [
                    {
                        text: '[google2.com](google2.com)',
                        start: "[[google1.com]] ".length,
                        end: "[[google1.com]] [[google2.com]]".length
                    },
                    {
                        text: '[google1.com](google1.com)',
                        start: 0,
                        end: "[[google1.com]]".length
                    }
                ],
                cursurPos: "[google.com](google.com)".length
            },
            {
                name: "autolink https://",
                text: "<http://google.com> <https://google.com>",
                expected: [
                    {
                        text: '[Google](https://google.com)',
                        start: "<http://google.com> ".length,
                        end: "<http://google.com> <https://google.com>".length
                    },
                    {
                        text: '[Google](http://google.com)',
                        start: 0,
                        end: "<http://google.com>".length
                    }
                ],
                cursurPos: "[Google](https://google.com)".length
            },
            {
                name: "autolink ssh://",
                text: "<ssh://192.168.1.1> <ssh://192.168.1.2>",
                expected: [
                    {
                        text: '[](ssh://192.168.1.2)',
                        start: "<ssh://192.168.1.1> ".length,
                        end: "<ssh://192.168.1.1> <ssh://192.168.1.2>".length
                    },
                    {
                        text: '[](ssh://192.168.1.1)',
                        start: 0,
                        end: "<ssh://192.168.1.1>".length
                    }
                ],
                cursurPos: "[".length
            },
            {
                name: "autolink email",
                text: "<jack.smith@example1.com> <jack.smith@example2.com>",
                expected: [
                    {
                        text: '[](mailto:jack.smith@example2.com)',
                        start: "<jack.smith@example1.com> ".length,
                        end: "<jack.smith@example1.com> <jack.smith@example2.com>".length
                    },
                    {
                        text: '[](mailto:jack.smith@example1.com)',
                        start: 0,
                        end: "<jack.smith@example1.com>".length
                    }
                ],
                cursurPos: "[".length
            }
        ]
    )
        ('convert all links - selection - success', ({ name, text, expected, cursurPos }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 0 })

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>Google</title>"
            })
            const cmd = new ConvertAllLinksToMdlinksCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
                if (err) {
                    done(err)
                    return
                }
                try {
                    expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(expected.length)
                    for (let call = 0; call < expected.length; call++) {
                        expect(editor.__mocks.replaceRange.mock.calls[call][0]).toBe(expected[call].text)
                        expect(editor.__mocks.replaceRange.mock.calls[call][1].ch).toBe(expected[call].start)
                        expect(editor.__mocks.replaceRange.mock.calls[call][2].ch).toBe(expected[call].end)
                    }
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