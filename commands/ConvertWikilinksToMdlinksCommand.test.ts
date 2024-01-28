import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { ConvertWikilinksToMdlinksCommand } from './ConvertWikilinksToMdlinksCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';
import { VaultMock } from '../VaultMock';


describe('ConvertWikilinksToMdlinksCommand test', () => {
    const statusData = [
        {
            name: "no links",
            text: "Aliquip esse exercitation deserunt ut. Ex Lorem incididunt cupidatat officia adipisicing est eiusmod. Ullamco elit fugiat commodo labore aliquip",
            expected: false
        },
        {
            name: "wikilinks",
            text: "Aliquip esse [[exercitation]] deserunt ut. Ex Lorem [[incididunt|cupidatat]] officia adipisicing est eiusmod. Ullamco elit fugiat commodo labore aliquip",
            expected: true
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
        }
    ];

    test.each(statusData)
        ('status - text with $name - enabled:$expected', ({ name, text, expected }) => {
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new ConvertWikilinksToMdlinksCommand(obsidianProxyMock)
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
            const vault = new VaultMock();
            vault.__mocks.exists.mockReturnValue(false);

            const obsidianProxyMock = new ObsidianProxyMock(vault);
            //TODO: add tests with true value
            obsidianProxyMock.settings.onConvertToMdlinkAppendMdExtension = false;

            const cmd = new ConvertWikilinksToMdlinksCommand(obsidianProxyMock)
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
            name: "wikilink",
            text: "Consectetur [[cillum]] magna sint laboris [[elit|elit text]] nisi laborum. Sint aliqua esse duis consequat.",
            expected: [
                {
                    text: '[elit text](elit)',
                    start: "Consectetur [[cillum]] magna sint laboris ".length,
                    end: "Consectetur [[cillum]] magna sint laboris [[elit|elit text]]".length
                },
                {
                    text: '[cillum](cillum)',
                    start: "Consectetur ".length,
                    end: "Consectetur [[cillum]]".length
                }
            ]
        },

        {
            name: "wikilink + other links",
            text: "Consectetur [[cillum]] magna sint laboris [[elit|elit text]] nisi. Sint aliqua esse duis consequat." +
                "Labore <http://adipisicing.com> occaecat <mailto:occaecat@velit.com> dolore eiusmod. reprehenderit " +
                "sint [labore](Esse) enim ipsum tempor [mollit](https://hello.com) laborum mollit nostrud magna excepteur aute quis. Eiusmod adipisicing velit " +
                "deserunt http://commodo cupidatat ex https://quis in Lorem eu nisi eu.",
            expected: [
                {
                    text: '[elit text](elit)',
                    start: "Consectetur [[cillum]] magna sint laboris ".length,
                    end: "Consectetur [[cillum]] magna sint laboris [[elit|elit text]]".length
                },
                {
                    text: '[cillum](cillum)',
                    start: "Consectetur ".length,
                    end: "Consectetur [[cillum]]".length
                }
            ]
        },
    ];
    test.each(convertData)
        ('convert wiki links - text with $name - success', ({ name, text, expected }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)

            const vault = new VaultMock();
            vault.__mocks.exists.mockReturnValue(false);

            const obsidianProxyMock = new ObsidianProxyMock(vault);
            //TODO: add tests with true value
            obsidianProxyMock.settings.onConvertToMdlinkAppendMdExtension = false;

            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>Google</title>"
            })

            const d = obsidianProxyMock.Vault.exists('123');
            expect(d).toBeFalsy();

            const cmd = new ConvertWikilinksToMdlinksCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
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

            const vault = new VaultMock();
            vault.__mocks.exists.mockReturnValue(false);

            const obsidianProxyMock = new ObsidianProxyMock(vault);
            //TODO: add tests with true value
            obsidianProxyMock.settings.onConvertToMdlinkAppendMdExtension = false;

            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>Google</title>"
            })
            const cmd = new ConvertWikilinksToMdlinksCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
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