import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { ConvertAutolinksToMdlinksCommand } from './ConvertAutolinksToMdlinksCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';

describe('ConvertAutolinksToMdlinksCommand test', () => {

    const statusData = [
        {
            name: "no links",
            text: "Aliquip esse exercitation deserunt ut. Ex Lorem incididunt cupidatat officia adipisicing est eiusmod. Ullamco elit fugiat commodo labore aliquip",
            expected: false
        },
        {
            name: "wikilinks",
            text: "Aliquip esse [[exercitation]] deserunt ut. Ex Lorem [[incididunt|cupidatat]] officia adipisicing est eiusmod. Ullamco elit fugiat commodo labore aliquip",
            expected: false
        },
        {
            name: "mdlinks",
            text: "Aliquip esse [exercitation](deserunt) ut. Ex Lorem [](incididunt) cupidatat officia adipisicing est eiusmod. Ullamco elit fugiat commodo labore aliquip",
            expected: false
        },
        {
            name: "html link",
            text: "Aliquip esse <a href=\"http://ex.com\">exercitation</a> deserunt ut. Ex Lorem incididunt cupidatat officia adipisicing est eiusmod. Ullamco elit fugiat commodo labore aliquip",
            expected: false
        },
        {
            name: "raw http link",
            text: "Aliquip esse href=\"http://ex.com\" exercitation</a> deserunt ut. Ex Lorem incididunt cupidatat officia adipisicing est eiusmod. Ullamco elit fugiat commodo labore aliquip",
            expected: false
        },
        {
            name: "raw https link",
            text: "Aliquip esse href=\"https://ex.com\" exercitation</a> deserunt ut. Ex Lorem incididunt cupidatat officia adipisicing est eiusmod. Ullamco elit fugiat commodo labore aliquip",
            expected: false
        },
        {
            name: "autolinks",
            text: "Aliquip esse <https://ex.com> exercitation</a> deserunt ut. Ex Lorem <incididunt@cupidatat.com> officia adipisicing est eiusmod. Ullamco elit fugiat commodo labore aliquip",
            expected: true
        }
    ];

    test.each(statusData)
        ('status - text with $name - enabled:$expected', ({ name, text, expected }) => {
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new ConvertAutolinksToMdlinksCommand(obsidianProxyMock)
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expected)
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

        })

    test.each(statusData)
        ('status - selection with $name - enabled:$expected', ({ name, text, expected }) => {
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new ConvertAutolinksToMdlinksCommand(obsidianProxyMock)
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expected)
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

        })


    const convertData = [
        {
            name: "autolinks http, https",
            text: "Consectetur <http://cillum> magna sint laboris <https://elit> nisi laborum. Sint aliqua esse duis consequat.",
            expected: [
                {
                    text: '[Autolink text](https://elit)',
                    start: "Consectetur <http://cillum> magna sint laboris ".length,
                    end: "Consectetur <http://cillum> magna sint laboris <https://elit>".length
                },
                {
                    text: '[Autolink text](http://cillum)',
                    start: "Consectetur ".length,
                    end: "Consectetur <http://cillum>".length
                }
            ]
        },
        {
            name: "autolinks email",
            text: "Consectetur <jack@cillum.com> magna sint laboris nisi laborum. Sint aliqua esse duis consequat.",
            expected: [
                {
                    text: '[](mailto:jack@cillum.com)',
                    start: "Consectetur ".length,
                    end: "Consectetur <jack@cillum.com>".length
                }
            ]
        },

        {
            name: "autolinks + other links",
            text: "Commodo sint <https://cupidatat> elit Lorem veniam culpa <cupidatat@occaecat.com> reprehenderit ad incididunt labore fugiat incididunt. Velit labore officia " +
                "Consectetur [[cillum]] magna sint laboris [[elit|elit text]] nisi. Sint aliqua esse duis consequat." +
                "sint [labore](Esse) enim ipsum tempor [mollit](https://hello.com) laborum mollit nostrud magna excepteur aute quis. Eiusmod adipisicing velit " +
                "deserunt http://commodo cupidatat ex https://quis in Lorem eu nisi eu.",
            expected: [
                {
                    text: '[](mailto:cupidatat@occaecat.com)',
                    start: "Commodo sint <https://cupidatat> elit Lorem veniam culpa ".length,
                    end: "Commodo sint <https://cupidatat> elit Lorem veniam culpa <cupidatat@occaecat.com>".length
                },
                {
                    text: '[Autolink text](https://cupidatat)',
                    start: "Commodo sint ".length,
                    end: "Commodo sint <https://cupidatat>".length
                }
            ]
        },

    ];

    test.each(convertData)
        ('convert autolinks - text with $name - success', ({ name, text, expected }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>Autolink text</title>"
            })
            const cmd = new ConvertAutolinksToMdlinksCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
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
        ('convert wiki links - selection with $name - success', ({ name, text, expected }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 0 })

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>Autolink text</title>"
            })
            const cmd = new ConvertAutolinksToMdlinksCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
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