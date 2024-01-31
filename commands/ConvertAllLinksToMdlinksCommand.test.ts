import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { ConvertAllLinksToMdlinksCommand } from './ConvertAllLinksToMdlinksCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';
import { VaultMock } from '../VaultMock';

describe('ConvertAllLinksToMdlinksCommand test', () => {

    const statusData = [
        {
            name: "text wo/links",
            text: "some text",
            expected: false
        },
        {
            name: "html - href in '",
            text: "<a href='google.com'>google1</a>",
            expected: true
        },
        //TODO:
        // {
        //     name: "html - href in \"",
        //     text: "<a href=\"google.com\">google1</a>"
        // },
        {
            name: "wikilink",
            text: "[[google.com|google]]",
            expected: true
        },
        {
            name: "wikilink empty text",
            text: "[[google.com]]",
            expected: true
        },
        {
            name: "autolink https://",
            text: "<https://google.com>",
            expected: true
        },
        {
            name: "autolink ssh://",
            text: "<ssh://192.168.1.1>",
            expected: true
        },
        {
            name: "autolink email",
            text: "<jack.smith@example.com>",
            expected: true
        }
    ]

    test.each(statusData)
        ('status - cursor on [$name] - command enabled', ({ name, text, expected }) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new ConvertAllLinksToMdlinksCommand(obsidianProxyMock)
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expected)
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

        })

    test.each(statusData)
        ('status - selection with [$name] - command enabled', ({ name, text, expected }) => {
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new ConvertAllLinksToMdlinksCommand(obsidianProxyMock)
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expected)
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

        })

    const convertData = [
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
        },
        {
            name: "wikilink local mdlinkAppendMdExtension=true",
            text: "[[folder1/note1|note1]] [[folder 1/note 1#heading 1#heading 2|heading 2]] [[#heading 1#heading 2|heading 2]]",
            expected: [
                {
                    text: '[heading 2](<#heading 1#heading 2>)',
                    start: "[[folder1/note1|note1]] [[folder 1/note 1#heading 1#heading 2|heading 2]] ".length,
                    end: "[[folder1/note1|note1]] [[folder 1/note 1#heading 1#heading 2|heading 2]] [[#heading 1#heading 2|heading 2]]".length,
                },
                {
                    text: '[heading 2](<folder 1/note 1.md#heading 1#heading 2>)',
                    start: "[[folder1/note1|note1]] ".length,
                    end: "[[folder1/note1|note1]] [[folder 1/note 1#heading 1#heading 2|heading 2]]".length,
                },
                {
                    text: '[note1](folder1/note1.md)',
                    start: 0,
                    end: "[[folder1/note1|note1]]".length,
                }
            ],
            mdlinkAppendMdExtension: true
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
        }
    ];

    test.each(convertData)
        ('convert - text -[$name] - success', ({ name, text, expected, mdlinkAppendMdExtension }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.settings.onConvertToMdlinkAppendMdExtension = !!mdlinkAppendMdExtension;
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

    test.each(convertData)
        ('convert - selection - success', ({ name, text, expected }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 0 })

            const obsidianProxyMock = new ObsidianProxyMock();

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

    const skipCodeBlockData = [
        {
            name: "simple block",
            text: "Est deserunt [[officia]] tempor adipisicing non. Anim anim laboris amet cillum qui do aliquip nostrud \n" +
                "```\nLorem nulla [[quis]] fugiat non consequat\n```\n" +
                "Ullamco ipsum in aliqua [[tempor]] excepteur et excepteur incididunt. ",
            expected: [
                {
                    text: '[tempor](tempor)',
                    start: ("Est deserunt [[officia]] tempor adipisicing non. Anim anim laboris amet cillum qui do aliquip nostrud \n" +
                        "```\nLorem nulla [[quis]] fugiat non consequat\n```\n" +
                        "Ullamco ipsum in aliqua ").length,
                    end: ("Est deserunt [[officia]] tempor adipisicing non. Anim anim laboris amet cillum qui do aliquip nostrud \n" +
                        "```\nLorem nulla [[quis]] fugiat non consequat\n```\n" +
                        "Ullamco ipsum in aliqua [[tempor]]").length
                },
                {
                    text: '[officia](officia)',
                    start: "Est deserunt ".length,
                    end: "Est deserunt [[officia]]".length
                }
            ],
            cursurPos: "Est deserunt [officia](officia)".length

        }
    ]

    test.each(skipCodeBlockData)
        ('convert & skip code blocks - text - success', ({ name, text, expected, cursurPos }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)

            const vault = new VaultMock();
            vault.__mocks.exists.mockReturnValue(false);
            const obsidianProxyMock = new ObsidianProxyMock(vault)
            obsidianProxyMock.settings.onConvertToMdlinkAppendMdExtension = false;

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