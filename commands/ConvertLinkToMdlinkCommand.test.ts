import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { ConvertLinkToMdlinkCommand } from './ConvertLinkToMdlinkCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';
import { VaultMock } from '../VaultMock';

describe('ConvertLinkToMdlinkCommand test', () => {
    test.each(
        [
            {
                name: "text",
                text: "some text",
                expected: false,
            },
            {
                name: "mdlink",
                text: "[note1](some-note)",
                expected: false,
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
            },
            {
                name: "url http",
                text: "http://google.com",
                expected: true
            },
            {
                name: "url https",
                text: "https://google.com",
                expected: true
            },
            {
                name: "url",
                text: "irc://google.com",
                expected: true
            }
        ]
    )
        ('status - cursor on [$name]', ({ name, text, expected }) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new ConvertLinkToMdlinkCommand(obsidianProxyMock)
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expected)
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

        })

    test('status - text selected - disabled', () => {
        const editor = new EditorMock()
        editor.__mocks.getSelection.mockReturnValue("some text")
        const obsidianProxyMock = new ObsidianProxyMock()
        const cmd = new ConvertLinkToMdlinkCommand(obsidianProxyMock)
        //
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
                text: "<a href='google.com'>google1</a>",
                expected: '[google1](google.com)',
                cursurPos: "[google1](google.com)".length
            },
            // TODO:
            // {
            //     name: "html - href in \"",
            //     text: "<a href=\"google.com\">google1</a>"
            // },
            {
                name: "wikilink",
                text: "[[google.com|google]]",
                expected: '[google](google.com)',
                cursurPos: "[google](google.com)".length
            },
            {
                name: "wikilink empty text",
                text: "[[google.com]]",
                expected: '[google.com](google.com)',
                cursurPos: "[google.com](google.com)".length
            },
            {
                name: "autolink https://",
                text: "<https://google.com>",
                expected: '[Google](https://google.com)',
                cursurPos: "[Google](https://google.com)".length
            },
            {
                name: "autolink ssh://",
                text: "<ssh://192.168.1.1>",
                expected: '[](ssh://192.168.1.1)',
                cursurPos: "[".length
            },
            {
                name: "autolink email",
                text: "<jack.smith@example.com>",
                expected: '[](mailto:jack.smith@example.com)',
                cursurPos: "[".length
            },
            {
                name: "url http",
                text: "http://google.com",
                expected: '[Google](http://google.com)',
                cursurPos: "[Google](http://google.com)".length
            },
            {
                name: "url https",
                text: "https://google.com",
                expected: '[Google](https://google.com)',
                cursurPos: "[Google](https://google.com)".length
            },
            {
                name: "url irc",
                text: "irc://google.com",
                expected: '[](irc://google.com)',
                cursurPos: "[".length
            },
            {
                name: "wikilink local wo/ext file-!exists mdlinkAppendMdExtension=true",
                text: "[[folder1/note1|note 1]]",
                expected: '[note 1](folder1/note1.md)',
                cursurPos: "[note 1](folder1/note1.md)".length,
                filePath: 'folder1/note1.md',
                fileExists: true,
                mdlinkAppendMdExtension: true

            },
            //TODO:
            // {
            //     name: "wikilink local wo/ext w/# file-!exists mdlinkAppendMdExtension=true",
            //     text: "[[folder1/note1#heading1|note 1]]",
            //     expected: '[note 1](folder1/note1.md#heading1)',
            //     cursurPos: "[note 1](folder1/note1.md#heading1)".length,
            //     filePath: 'folder1/note1.md',
            //     fileExists: true,
            //     mdlinkAppendMdExtension: true
            // },
            // {
            //     name: "wikilink local wo/ext w/# file-!exists mdlinkAppendMdExtension=true",
            //     text: "[[folder1/note1#heading1|note 1]]",
            //     expected: '[note 1](folder1/note1#heading1)',
            //     cursurPos: "[note 1](folder1/note1#heading1)".length,
            //     filePath: 'folder1/note1',
            //     fileExists: true,
            //     mdlinkAppendMdExtension: true
            // },
            {
                name: "wikilink local wo/ext file-!exists mdlinkAppendMdExtension=false",
                text: "[[folder1/note1|note 1]]",
                expected: '[note 1](folder1/note1)',
                cursurPos: "[note 1](folder1/note1)".length,
                filePath: 'folder1/note1',
                fileExists: false,
                mdlinkAppendMdExtension: false
            },
            //TODO:
            // {
            //     name: "wikilink local wo/ext file-exists mdlinkAppendMdExtension=true",
            //     text: "[[folder1/note1|note 1]]",
            //     expected: '[note 1](folder1/note1)',
            //     cursurPos: "[note 1](folder1/note1)".length,
            //     filePath: 'folder1/note1',
            //     fileExists: true,
            //     mdlinkAppendMdExtension: true

            // },
            {
                name: "wikilink local w/ext file-!exists mdlinkAppendMdExtension=true",
                text: "[[folder1/note1.dat|note 1]]",
                expected: '[note 1](folder1/note1.dat)',
                cursurPos: "[note 1](folder1/note1.dat)".length,
                filePath: 'folder1/note1.dat',
                fileExists: false,
                mdlinkAppendMdExtension: true
            },
        ]
    )
        ('convert - cursor on [$name] - success', ({ name, text, expected, cursurPos, filePath, fileExists, mdlinkAppendMdExtension }, done) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })

            const vault = new VaultMock();
            vault.__mocks.exists.mockImplementation((p, cs) => p === filePath ? !!fileExists : false);

            const obsidianProxyMock = new ObsidianProxyMock(vault);

            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>Google</title>"
            })
            obsidianProxyMock.settings.onConvertToMdlinkAppendMdExtension = !!mdlinkAppendMdExtension;

            const cmd = new ConvertLinkToMdlinkCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
                if (err) {
                    done(err)
                    return
                }
                try {
                    expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
                    expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe(expected)
                    expect(editor.__mocks.replaceRange.mock.calls[0][1].ch).toBe(0)
                    expect(editor.__mocks.replaceRange.mock.calls[0][2].ch).toBe(text.length)

                    expect(editor.__mocks.setCursor.mock.calls).toHaveLength(1)
                    expect(editor.__mocks.setCursor.mock.calls[0][0].ch).toBe(cursurPos)
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