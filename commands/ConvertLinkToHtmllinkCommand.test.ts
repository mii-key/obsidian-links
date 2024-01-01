import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { ConvertLinkToHtmllinkCommand } from './ConvertLinkToHtmllinkCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';

describe('ConvertLinkToHtmllinkCommand test', () => {

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
                expected: false
            },
            {
                name: "wikilink",
                text: "[[note1|note 1]]",
                expected: true
            },
            {
                name: "wikilink empty text",
                text: "[[note 1]]",
                expected: true
            },
            {
                name: "autolink",
                text: "<https://obsidian.md>",
                expected: false
            },
            {
                name: "url http",
                text: "http://google.com",
                expected: false
            },
            {
                name: "url https",
                text: "https://google.com",
                expected: false
            },
            {
                name: "url",
                text: "irc://google.com",
                expected: false
            }
        ]
    )
    ('status - cursor on [$name]', ({ name, text, expected }) => {
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue(text)
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: 1 })
        const obsidianProxyMock = new ObsidianProxyMock()
        const cmd = new ConvertLinkToHtmllinkCommand(obsidianProxyMock)
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBe(expected)
        expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

    })

    test('status - selection - disabled', () => {
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue("In labore tempor dolore dolore. Proident adipisicing est aute ad. Nisi cillum do ")
        editor.__mocks.getSelection.mockReturnValue("tempor dolore dolore")
        editor.__mocks.getCursor.mockReturnValue({ line: 0, ch: "In labore ".length })
        const obsidianProxyMock = new ObsidianProxyMock()
        const cmd = new ConvertLinkToHtmllinkCommand(obsidianProxyMock)
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBeFalsy()
        expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

    })

    test.each(
        [
            {
                name: "wikilink",
                text: "[[note1|note 1]]",
                expected: '<a href="note1" class="internal-link">note 1</a>',
                cursurPos: '<a href="note1" class="internal-link">note 1</a>'.length
            },
            {
                name: "wikilink wo/text",
                text: "[[note1]]",
                expected: '<a href="note1" class="internal-link">note1</a>',
                cursurPos: '<a href="note1" class="internal-link">note1</a>'.length
            },
            {
                name: "wikilink w/parent wo/text",
                text: "[[folder1/folder 2/note1]]",
                expected: '<a href="folder1/folder 2/note1" class="internal-link">note1</a>',
                cursurPos: '<a href="folder1/folder 2/note1" class="internal-link">note1</a>'.length
            },
            {
                name: "wikilink w/hash wo/text",
                text: "[[folder1/folder 2/note1#heading 1]]",
                expected: '<a href="folder1/folder 2/note1#heading 1" class="internal-link">heading 1</a>',
                cursurPos: '<a href="folder1/folder 2/note1#heading 1" class="internal-link">heading 1</a>'.length
            },
        ]
    )
        ('convert - cursor on [$name] - success', ({ name, text, expected, cursurPos }) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new ConvertLinkToHtmllinkCommand(obsidianProxyMock)
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
            expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe(expected)
            expect(editor.__mocks.replaceRange.mock.calls[0][1].ch).toBe(0)
            expect(editor.__mocks.replaceRange.mock.calls[0][2].ch).toBe(text.length)
            
            expect(editor.__mocks.setCursor.mock.calls).toHaveLength(1)
            expect(editor.__mocks.setCursor.mock.calls[0][0].ch).toBe(cursurPos)
        })
})