import { expect, test } from '@jest/globals';
import { ExtractSectionCommand } from './ExtractSectionCommand';

import { EditorMock } from './EditorMock'
import { ObsidianProxyMock } from './ObsidianProxyMock';

describe('ExtractSectionCommand test', () => {

    test.each(
        [
            {
                name: "text wo/section",
                text: "Officia dolore ut excepteur excepteur laboris sit. Do nisi voluptate excepteur id veniam nisi Lorem esse.\r\n" + 
                    "Incididunt non ut labore sunt. Nostrud consectetur ut laborum irure ad minim aliqua eiusmod velit do id veniam.\r\n" +
                    "Voluptate sunt laboris laboris adipisicing consectetur dolore. Duis cillum consequat nostrud est eiusmod sint elit",
                cursorOffest: "Officia dolore ut excepteur excepteur laboris sit. Do nisi voluptate excepteur id veniam nisi Lorem esse.\r\n" + 
                "Incididunt non ut labore sunt. No".length,
                enabled: true
            },
           {
                name: "inside middle section",
                text: "Magna ullamco ullamco consequat esse nisi excepteur labore excepteur esse consectetur tempor esse cillum.\r\n" +
                "# Eiusmod mollit magna consectetur est.\r\n" +
                "Non voluptate quis laborum officia cupidatat. Commodo in amet Lorem incididunt.\r\n" +
                "Et laborum eu velit eu Lorem irure labore. \r\n" +
                "# Culpa laboris cupidatat commodo sunt occaecat sint irure mollit sunt voluptate dolor dolor quis.",
                cursorOffest: "Magna ullamco ullamco consequat esse nisi excepteur labore excepteur esse consectetur tempor esse cillum.\r\n" +
                "# Eiusmod mol".length,
                enabled: true
            }
        ]
    )
        ('status - cursor on [$name]', ({ name, text, enabled}) => {
            const obsidianProxy = new ObsidianProxyMock();
            const cmd = new ExtractSectionCommand(obsidianProxy)
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: 1})
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(enabled)
            expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)
        })

    // TODO:
    test.skip.each(
        [
            {
                name: "text wo/section",
                text: "Officia dolore ut excepteur excepteur laboris sit. Do nisi voluptate excepteur id veniam nisi Lorem esse.\r\n" + 
                    "Incididunt non ut labore sunt. Nostrud consectetur ut laborum irure ad minim aliqua eiusmod velit do id veniam.\r\n" +
                    "Voluptate sunt laboris laboris adipisicing consectetur dolore. Duis cillum consequat nostrud est eiusmod sint elit",
                cursorOffest: ("Officia dolore ut excepteur excepteur laboris sit. Do nisi voluptate excepteur id veniam nisi Lorem esse.\r\n" + 
                "Incididunt non ut labore sunt. No").length,
                expectedSection: "Officia dolore ut excepteur excepteur laboris sit. Do nisi voluptate excepteur id veniam nisi Lorem esse.\r\n" + 
                "Incididunt non ut labore sunt. Nostrud consectetur ut laborum irure ad minim aliqua eiusmod velit do id veniam.\r\n" +
                "Voluptate sunt laboris laboris adipisicing consectetur dolore. Duis cillum consequat nostrud est eiusmod sint elit",
                expectedSectionStart: 0,
                expectedSectionEnd: ("Officia dolore ut excepteur excepteur laboris sit. Do nisi voluptate excepteur id veniam nisi Lorem esse.\r\n" + 
                "Incididunt non ut labore sunt. Nostrud consectetur ut laborum irure ad minim aliqua eiusmod velit do id veniam.\r\n" +
                "Voluptate sunt laboris laboris adipisicing consectetur dolore. Duis cillum consequat nostrud est eiusmod sint elit").length
            },
           {
                name: "inside middle section",
                text: "Magna ullamco ullamco consequat esse nisi excepteur labore excepteur esse consectetur tempor esse cillum.\r\n" +
                "# Eiusmod mollit magna consectetur est.\r\n" +
                "Non voluptate quis laborum officia cupidatat. Commodo in amet Lorem incididunt.\r\n" +
                "Et laborum eu velit eu Lorem irure labore. \r\n" +
                "# Culpa laboris cupidatat commodo sunt occaecat sint irure mollit sunt voluptate dolor dolor quis.",
                cursorOffest: ("Magna ullamco ullamco consequat esse nisi excepteur labore excepteur esse consectetur tempor esse cillum.\r\n" +
                "# Eiusmod mol").length,
                expectedSection: "# Eiusmod mollit magna consectetur est.\r\n" +
                "Non voluptate quis laborum officia cupidatat. Commodo in amet Lorem incididunt.\r\n",
                expectedSectionStart: "Magna ullamco ullamco consequat esse nisi excepteur labore excepteur esse consectetur tempor esse cillum.\r\n".length,
                expectedSectionEnd: ("Magna ullamco ullamco consequat esse nisi excepteur labore excepteur esse consectetur tempor esse cillum.\r\n" +
                "# Eiusmod mollit magna consectetur est.\r\n" +
                "Non voluptate quis laborum officia cupidatat. Commodo in amet Lorem incididunt.\r\n" +
                "Et laborum eu velit eu Lorem irure labore. \r\n").length
            }
        ]
    )
        ('extract - $name - success', ({ name, text, cursorOffest, expectedSection, expectedSectionStart, expectedSectionEnd}) => {
            const obsidianProxy = new ObsidianProxyMock()
            const cmd = new ExtractSectionCommand(obsidianProxy)
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            editor.__mocks.getCursor.mockReturnValue({line: 0, ch: cursorOffest})

            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.getRange.mock.calls).toHaveLength(1)
            expect(editor.__mocks.getRange.mock.calls[0][0].ch).toBe(expectedSectionStart)
            expect(editor.__mocks.getRange.mock.calls[0][1].ch).toBe(expectedSectionEnd)
        })

})

