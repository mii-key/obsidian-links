import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { ConvertHtmlLinksToMdlinksCommand } from './ConvertHtmlLinksToMdlinksCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';
import { VaultMock } from '../VaultMock';

describe('ConvertHtmlLinksToMdlinksCommand test', () => {

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
            expected: true
        },
        {
            name: "URL http",
            text: "Aliquip esse href=\"http://ex.com\" exercitation</a> deserunt ut. Ex Lorem incididunt cupidatat officia adipisicing est eiusmod. Ullamco elit fugiat commodo labore aliquip",
            expected: false
        },
        {
            name: "URL https",
            text: "Aliquip esse href=\"https://ex.com\" exercitation</a> deserunt ut. Ex Lorem incididunt cupidatat officia adipisicing est eiusmod. Ullamco elit fugiat commodo labore aliquip",
            expected: false
        },
        {
            name: "autolinks",
            text: "Aliquip esse <https://ex.com> exercitation</a> deserunt ut. Ex Lorem <incididunt@cupidatat.com> officia adipisicing est eiusmod. Ullamco elit fugiat commodo labore aliquip",
            expected: false
        }
    ];

    test.each(statusData)
        ('status - $name', ({ name, text, expected }) => {
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new ConvertHtmlLinksToMdlinksCommand(obsidianProxyMock)
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
        ('status (selection)  $name', ({ name, text, expected }) => {
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new ConvertHtmlLinksToMdlinksCommand(obsidianProxyMock)
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
            name: "html links http, https",
            text: "Consectetur <a href=\"http://cillum\">magna</a> sint laboris <a href=\"https://elit\">nisi</a> laborum. Sint aliqua esse duis consequat.",
            expected: [
                {
                    text: '[nisi](https://elit)',
                    start: "Consectetur <a href=\"http://cillum\">magna</a> sint laboris ".length,
                    end: "Consectetur <a href=\"http://cillum\">magna</a> sint laboris <a href=\"https://elit\">nisi</a>".length
                },
                {
                    text: '[magna](http://cillum)',
                    start: "Consectetur ".length,
                    end: "Consectetur <a href=\"http://cillum\">magna</a>".length
                }
            ]
        },
        {
            name: "html links + other links",
            text: "deserunt <a href=\"http://commodo\">cupidatat</a> ex <a href=\"https://quis\">in</a> Lorem eu nisi eu." +
                "Commodo sint <https://cupidatat> elit Lorem veniam culpa <cupidatat@occaecat.com> reprehenderit ad incididunt labore fugiat incididunt. Velit labore officia " +
                "Consectetur [[cillum]] magna sint laboris [[elit|elit text]] nisi. Sint aliqua esse duis consequat." +
                "sint [labore](Esse) enim ipsum tempor [mollit](https://hello.com) laborum mollit nostrud magna excepteur aute quis. Eiusmod adipisicing velit ",
            expected: [
                {
                    text: '[in](https://quis)',
                    start: "deserunt <a href=\"http://commodo\">cupidatat</a> ex ".length,
                    end: "deserunt <a href=\"http://commodo\">cupidatat</a> ex <a href=\"https://quis\">in</a>".length
                },
                {
                    text: '[cupidatat](http://commodo)',
                    start: "deserunt ".length,
                    end: "deserunt <a href=\"http://commodo\">cupidatat</a>".length
                }
            ]
        },
    ];

    test.each(convertData)
        ('convert -  $name', ({ name, text, expected }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>URL text</title>"
            })
            const cmd = new ConvertHtmlLinksToMdlinksCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
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
        ('convert (selection) - $name', ({ name, text, expected }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 0 })

            const vault = new VaultMock();
            const obsidianProxyMock = new ObsidianProxyMock(vault)
            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>URL text</title>"
            })
            const cmd = new ConvertHtmlLinksToMdlinksCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
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