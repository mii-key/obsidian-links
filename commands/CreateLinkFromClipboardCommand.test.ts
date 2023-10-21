import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { CreateLinkFromClipboardCommand } from './CreateLinkFromClipboardCommand';
import { ObsidianProxyMock } from './ObsidianProxyMock';

describe('CreateLinkFromClipboardCommand test', () => {

   
    //TODO: 
    // test.only.each(
    //     [
    //         {
    //             name: "empty clipboard",
    //             selection: "",
    //             clipboard: "",
    //             expected: false
    //         },
    //     ]
    // )
    //     ('status - cursor on [$name] - command enabled', ({ name, selection, clipboard, expected}) => {
    //         const editor = new EditorMock()
    //         editor.__mocks.getSelection.mockReturnValue(selection)
    //         editor.__mocks.posToOffset.mockReturnValue(1)
    //         const obsidianProxyMock = new ObsidianProxyMock()
    //         obsidianProxyMock.__mocks.clipboardReadText.mockResolvedValue(clipboard)
    //         const cmd = new CreateLinkFromClipboardCommand(obsidianProxyMock)
    //         //
    //         const result = cmd.handler(editor, true)
    //         //
    //         expect(result).toBe(expected)
    //         expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)

    //     })

    test.each(
        [
            {
                name: "no selection, text in clipboard",
                selection: "",
                clipboard: "some text",
                expected: '[some text](some text)',
                cursurPos: "[some text](some text)".length
            },
            {
                name: "selection, text in clipboard",
                selection: "some selection",
                clipboard: "some text",
                expected: '[some selection](some text)',
                cursurPos: "[some selection](some text)".length
            },
            {
                name: "no selection, http:// url in clipboard",
                selection: "",
                clipboard: "http://google.com",
                expected: '[Google](http://google.com)',
                cursurPos: "[Google](http://google.com)".length
            },
            {
                name: "no selection, https:// url in clipboard",
                selection: "",
                clipboard: "https://google.com",
                expected: '[Google](https://google.com)',
                cursurPos: "[Google](https://google.com)".length
            },
            {
                name: "no selection, http:// url in clipboard",
                selection: "",
                clipboard: "http://google.com",
                expected: '[Google](http://google.com)',
                cursurPos: "[Google](http://google.com)".length
            },
            {
                name: "no selection, https:// url in clipboard",
                selection: "",
                clipboard: "https://google.com",
                expected: '[Google](https://google.com)',
                cursurPos: "[Google](https://google.com)".length
            },
        ]
    )
        ('create link - $name - success', ({ name, selection, clipboard: clipboard, expected, cursurPos}, done) => {
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(selection)
            const linkStart = 1;
            editor.__mocks.posToOffset.mockReturnValue(linkStart)

            const obsidianProxyMock = new ObsidianProxyMock()
            obsidianProxyMock.__mocks.requestUrlMock.mockReturnValue({
                status: 200,
                text: "<title>Google</title>"
            })
            obsidianProxyMock.__mocks.clipboardReadText.mockResolvedValue(clipboard)

            const cmd = new CreateLinkFromClipboardCommand(obsidianProxyMock, (err, data) => {
                if(err){
                    done(err)
                    return
                } 
                try{
                    expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(1)
                    expect(editor.__mocks.replaceRange.mock.calls[0][0]).toBe(expected)
        
                    expect(editor.__mocks.setCursor.mock.calls).toHaveLength(1)

                    expect(editor.__mocks.offsetToPos.mock.calls).toHaveLength(1)
                    expect(editor.__mocks.offsetToPos.mock.calls[0][0]).toBe(linkStart + cursurPos)
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