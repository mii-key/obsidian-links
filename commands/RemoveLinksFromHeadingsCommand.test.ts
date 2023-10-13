import { expect, test } from '@jest/globals';
import { RemoveLinksFromHeadingsCommand } from './RemoveLinksFromHeadingsCommand';

import { EditorMock } from './EditorMock'
import exp from 'constants';

describe('RemoveLinksFromHeadingsCommand test', () => {

    test('status - text: no links in the headings - command disabled', () => {
        const cmd = new RemoveLinksFromHeadingsCommand()
        const editor = new EditorMock()
        editor.__mocks.getValue.mockReturnValue('# heading1\nsome text\n# heading2\nsome text')
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBeFalsy()
        expect(editor.__mocks.setValue.mock.calls).toHaveLength(0)
    })

    test('status - selection: no links in the headings - command disabled', () => {
        const cmd = new RemoveLinksFromHeadingsCommand()
        const editor = new EditorMock()
        editor.__mocks.getSelection.mockReturnValue('# heading1\nsome text\n# heading2\nsome text')
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBeFalsy()
        expect(editor.__mocks.setValue.mock.calls).toHaveLength(0)
    })

    test.each(
        [
            // TODO:
            // {
            //     name: "html - href in '",
            //     text: "# heading1\nsome text\n# heading2 <a href='google.com'>google1</a>\nsome text"
            // },
            {
                name: "html - href in \"",
                text: "# heading1\nsome text\n# heading2 <a href=\"google.com\">google1</a>\nsome text"
            },
            {
                name: "mdlink",
                text: "# heading1\nsome text\n# heading2 [google](google.com)\nsome text"
            },
            {
                name: "wikilink",
                text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text"
            },
            {
                name: "wikilink empty text",
                text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text"
            },
            //TODO:
            // {
            //     name: "autolink",
            //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
            // }
        ]
    )
        ('status - text: heading contains [$name] - command enabled', ({ name, text }) => {
            const cmd = new RemoveLinksFromHeadingsCommand()
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)

            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBeTruthy()
            expect(editor.__mocks.setValue.mock.calls).toHaveLength(0)

        })

    test.each(
        [
            // TODO:
            // {
            //     name: "html - href in '",
            //     text: "# heading1\nsome text\n# heading2 <a href='google.com'>google1</a>\nsome text"
            // },
            {
                name: "html - href in \"",
                text: "# heading1\nsome text\n# heading2 <a href=\"google.com\">google1</a>\nsome text"
            },
            {
                name: "mdlink",
                text: "# heading1\nsome text\n# heading2 [google](google.com)\nsome text"
            },
            {
                name: "wikilink",
                text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text"
            },
            {
                name: "wikilink empty text",
                text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text"
            },
            //TODO:
            // {
            //     name: "autolink",
            //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
            // }
        ]
    )
        ('status - selection: heading contains [$name] - command enabled', ({ name, text }) => {
            const cmd = new RemoveLinksFromHeadingsCommand()
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)

            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBeTruthy()
            expect(editor.__mocks.setValue.mock.calls).toHaveLength(0)

        })

    test.each(
        [
            // TODO:
            // {
            //     name: "html - href in '",
            //     text: "# heading1\nsome text\n# heading2 <a href='google.com'>google1</a>\nsome text"
            // },
            {
                name: "html - href in \"",
                text: "# heading1\nsome text\n# heading2 <a href=\"google.com\">google1</a>\nsome text",
                expected: "# heading1\nsome text\n# heading2 google1\nsome text"
            },
            {
                name: "mdlink",
                text: "# heading1\nsome text\n# heading2 [google](google.com)\nsome text",
                expected: "# heading1\nsome text\n# heading2 google\nsome text"

            },
            {
                name: "wikilink",
                text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text",
                expected: "# heading1\nsome text\n# heading2 google\nsome text"
            },
            {
                name: "wikilink empty text",
                text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text",
                expected: "# heading1\nsome text\n# heading2 google.com\nsome text"
            },
            {
                name: "wikilink [[note#heading]]",
                text: "# heading1\nsome text\n# heading2 [[note#heading 1]]\nsome text",
                expected: "# heading1\nsome text\n# heading2 note#heading 1\nsome text"
            },
            //TODO:
            // {
            //     name: "autolink",
            //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
            // }
        ]
    )
        ('remove links - text: heading with [$name] - success', ({ name, text, expected }) => {
            const cmd = new RemoveLinksFromHeadingsCommand()
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.setValue.mock.calls).toHaveLength(1)
            expect(editor.__mocks.setValue.mock.calls[0][0]).toBe(expected)
        })

    test.each(
        [
            // TODO:
            // {
            //     name: "html - href in '",
            //     text: "# heading1\nsome text\n# heading2 <a href='google.com'>google1</a>\nsome text"
            // },
            {
                name: "html - href in \"",
                text: "# heading1\nsome text\n# heading2 <a href=\"google.com\">google1</a>\nsome text",
                expected: "# heading1\nsome text\n# heading2 google1\nsome text"
            },
            {
                name: "mdlink",
                text: "# heading1\nsome text\n# heading2 [google](google.com)\nsome text",
                expected: "# heading1\nsome text\n# heading2 google\nsome text"

            },
            {
                name: "wikilink",
                text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text",
                expected: "# heading1\nsome text\n# heading2 google\nsome text"
            },
            {
                name: "wikilink empty text",
                text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text",
                expected: "# heading1\nsome text\n# heading2 google.com\nsome text"
            },
            {
                name: "wikilink [[note#heading]]",
                text: "# heading1\nsome text\n# heading2 [[note#heading 1]]\nsome text",
                expected: "# heading1\nsome text\n# heading2 note#heading 1\nsome text"
            },
            //TODO:
            // {
            //     name: "autolink",
            //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
            // }
        ]
    )
        ('remove links - selection: heading with [$name] - success', ({ name, text, expected }) => {
            const cmd = new RemoveLinksFromHeadingsCommand()
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
            expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(expected)
        })

})