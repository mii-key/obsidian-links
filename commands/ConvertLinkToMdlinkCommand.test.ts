import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { ConvertLinkToMdlinkCommand } from './ConvertLinkToMdlinkCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';

describe('ConvertLinkToMdlinkCommand test', () => {

    test('status - cursor on text - command disabled', () => {
        const obsidianProxyMock = new ObsidianProxyMock()
        const cmd = new ConvertLinkToMdlinkCommand(obsidianProxyMock)
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue('some text')
        editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
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
        ('status - cursor on [$name] - command enabled', ({ name, text}) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
            const obsidianProxyMock = new ObsidianProxyMock()
            const cmd = new ConvertLinkToMdlinkCommand(obsidianProxyMock)
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
            }
        ]
    )
        ('convert link - cursor in selection [$name] - success', ({ name, text, expected, cursurPos}, done) => {
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>Google</title>"
            })
            const cmd = new ConvertLinkToMdlinkCommand(obsidianProxyMock, (err, data) => {
                if(err){
                    done(err)
                    return
                } 
                try{
                    expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
                    expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe(expected)
                    expect(editor.__mocks.replaceRange.mock.calls[0][1].ch).toBe(0)
                    expect(editor.__mocks.replaceRange.mock.calls[0][2].ch).toBe(text.length)
                    
                    expect(editor.__mocks.setCursor.mock.calls).toHaveLength(1)
                    expect(editor.__mocks.setCursor.mock.calls[0][0].ch).toBe(cursurPos)
                    done()
                }
                catch(err){
                    done(err)
                }
            })
           
            //
            cmd.handler(editor, false)
            //
        })

})