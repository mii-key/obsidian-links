import { expect, test } from '@jest/globals';
import { RemoveLinksFromHeadingsCommand } from './RemoveLinksFromHeadingsCommand';

import { EditorMock } from './EditorMock'
import exp from 'constants';
import { InternalWikilinkWithoutTextAction } from '../utils';

describe('RemoveLinksFromHeadingsCommand test', () => {

    test.each(
        [
            // no links in headings
            {
                name: "no links in headings",
                text: '# heading1\nsome text\n# heading2\nsome text',
                isSelection: false,
                expected: false
            },
            {
                name: "no links in headings",
                text: '# heading1\nsome text\n# heading2\nsome text',
                isSelection: true,
                expected: false
            },

            // has links in headings
            //  text
            {
                name: "html - href in \"",
                text: "# heading1\nsome text\n# heading2 <a href=\"google.com\">google1</a>\nsome text",
                isSelection: false,
                expected: true
            },
            {
                name: "mdlink",
                text: "# heading1\nsome text\n# heading2 [google](google.com)\nsome text",
                isSelection: false,
                expected: true
            },
            {
                name: "wikilink",
                text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text",
                isSelection: false,
                expected: true
            },
            {
                name: "wikilink empty text",
                text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text",
                isSelection: false,
                expected: true
            },

            //  selection
            {
                name: "html - href in \"",
                text: "# heading1\nsome text\n# heading2 <a href=\"google.com\">google1</a>\nsome text",
                isSelection: true,
                expected: true
            },
            {
                name: "mdlink",
                text: "# heading1\nsome text\n# heading2 [google](google.com)\nsome text",
                isSelection: true,
                expected: true
            },
            {
                name: "wikilink",
                text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text",
                isSelection: true,
                expected: true
            },
            {
                name: "wikilink empty text",
                text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text",
                isSelection: true,
                expected: true
            },
        ]
    )
        ('status - isSelection: $isSelection, $name - enabled: $expected', ({ name, text, isSelection, expected }) => {
            const options = {
                internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.Delete
            };
            const cmd = new RemoveLinksFromHeadingsCommand(options)
            const editor = new EditorMock()
            if (isSelection) {
                editor.__mocks.getSelection.mockReturnValue(text)
            } else {
                editor.__mocks.getValue.mockReturnValue(text)
            }
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expected)
            expect(editor.__mocks.setValue.mock.calls).toHaveLength(0)
        })

    test.each(
        [
            // ---------- text

            // TODO:
            // {
            //     name: "html - href in '",
            //     text: "# heading1\nsome text\n# heading2 <a href='google.com'>google1</a>\nsome text"
            // },
            {
                name: "html - href in \"",
                text: "# heading1\nsome text\n# heading2 <a href=\"google.com\">google1</a>\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 google1\nsome text"
            },
            {
                name: "mdlink",
                text: "# heading1\nsome text\n# heading2 [google](google.com)\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 google\nsome text"

            },
            {
                name: "wikilink",
                text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 google\nsome text"
            },
            {
                name: "wikilink empty text",
                text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 \nsome text"
            },
            {
                name: "wikilink [[note#heading]]",
                text: "# heading1\nsome text\n# heading2 [[note#heading 1]]\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 \nsome text"
            },
            {
                name: "wikilink [[note#heading]]",
                text: "# heading1\nsome text\n# heading2 [[#heading 1]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 \nsome text"
            },
            //TODO:
            // {
            //     name: "autolink",
            //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
            // }

            // ------- selection

            // TODO:
            // {
            //     name: "html - href in '",
            //     text: "# heading1\nsome text\n# heading2 <a href='google.com'>google1</a>\nsome text"
            // },
            {
                name: "html - href in \"",
                text: "# heading1\nsome text\n# heading2 <a href=\"google.com\">google1</a>\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 google1\nsome text"
            },
            {
                name: "mdlink",
                text: "# heading1\nsome text\n# heading2 [google](google.com)\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 google\nsome text"

            },
            {
                name: "wikilink",
                text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 google\nsome text"
            },
            {
                name: "wikilink empty text",
                text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 \nsome text"
            },
            {
                name: "wikilink [[note#heading]]",
                text: "# heading1\nsome text\n# heading2 [[note#heading 1]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 \nsome text"
            },
            {
                name: "wikilink [[note#heading]]",
                text: "# heading1\nsome text\n# heading2 [[#heading 1]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 \nsome text"
            },
            //TODO:
            // {
            //     name: "autolink",
            //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
            // }
        ]
    )
        ('remove links (InternalWikilinkWithoutTextAction.Delete) - isSelection:$isSelection - heading with [$name] - success', ({ name, text, isSelection, expected }) => {
            const options = {
                internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.Delete
            };
            const cmd = new RemoveLinksFromHeadingsCommand(options)
            const editor = new EditorMock()
            if (isSelection) {
                editor.__mocks.getSelection.mockReturnValue(text)
            } else {
                editor.__mocks.getValue.mockReturnValue(text)
            }
            //
            cmd.handler(editor, false)
            //
            if (isSelection) {
                expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
                expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(expected)
            } else {
                expect(editor.__mocks.setValue.mock.calls).toHaveLength(1)
                expect(editor.__mocks.setValue.mock.calls[0][0]).toBe(expected)
            }
        })

    test.each(
        [
            // ---------- text

            {
                name: "wikilink",
                text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 google\nsome text"
            },
            {
                name: "wikilink empty text",
                text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 google.com\nsome text"
            },
            {
                name: "wikilink [[note#heading]]",
                text: "# heading1\nsome text\n# heading2 [[note#heading 1]]\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 heading 1\nsome text"
            },
            {
                name: "wikilink [[note#heading]]",
                text: "# heading1\nsome text\n# heading2 [[note#heading 1]]\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 heading 1\nsome text"
            },
            //TODO:
            // {
            //     name: "autolink",
            //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
            // }

            // ------- selection

            // TODO:
            // {
            //     name: "html - href in '",
            //     text: "# heading1\nsome text\n# heading2 <a href='google.com'>google1</a>\nsome text"
            // },
            {
                name: "html - href in \"",
                text: "# heading1\nsome text\n# heading2 <a href=\"google.com\">google1</a>\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 google1\nsome text"
            },
            {
                name: "mdlink",
                text: "# heading1\nsome text\n# heading2 [google](google.com)\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 google\nsome text"

            },
            {
                name: "wikilink",
                text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 google\nsome text"
            },
            {
                name: "wikilink empty text",
                text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 google.com\nsome text"
            },
            {
                name: "wikilink [[note#heading]]",
                text: "# heading1\nsome text\n# heading2 [[note#heading 1]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 heading 1\nsome text"
            },
            {
                name: "wikilink [[#heading]]",
                text: "# heading1\nsome text\n# heading2 [[#heading 1]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 heading 1\nsome text"
            },
            //TODO:
            // {
            //     name: "autolink",
            //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
            // }
        ]
    )
        ('remove links (InternalWikilinkWithoutTextAction.ReplaceWithLowestNoteHeading) - isSelection:$isSelection - heading with [$name] - success', ({ name, text, isSelection, expected }) => {
            const options = {
                internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.ReplaceWithLowestNoteHeading
            };
            const cmd = new RemoveLinksFromHeadingsCommand(options)
            const editor = new EditorMock()
            if (isSelection) {
                editor.__mocks.getSelection.mockReturnValue(text)
            } else {
                editor.__mocks.getValue.mockReturnValue(text)
            }
            //
            cmd.handler(editor, false)
            //
            if (isSelection) {
                expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
                expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(expected)
            } else {
                expect(editor.__mocks.setValue.mock.calls).toHaveLength(1)
                expect(editor.__mocks.setValue.mock.calls[0][0]).toBe(expected)
            }
        })

    test.each(
        [
            // ---------- text

            {
                name: "wikilink",
                text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 google\nsome text"
            },
            {
                name: "wikilink empty text",
                text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 google.com\nsome text"
            },
            {
                name: "wikilink [[note#heading]]",
                text: "# heading1\nsome text\n# heading2 [[note#heading 1]]\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 note#heading 1\nsome text"
            },
            {
                name: "wikilink [[#heading]]",
                text: "# heading1\nsome text\n# heading2 [[#heading 1]]\nsome text",
                isSelection: false,
                expected: "# heading1\nsome text\n# heading2 #heading 1\nsome text"
            },
            //TODO:
            // {
            //     name: "autolink",
            //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
            // }

            // ------- selection

            // TODO:
            // {
            //     name: "html - href in '",
            //     text: "# heading1\nsome text\n# heading2 <a href='google.com'>google1</a>\nsome text"
            // },
            {
                name: "html - href in \"",
                text: "# heading1\nsome text\n# heading2 <a href=\"google.com\">google1</a>\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 google1\nsome text"
            },
            {
                name: "mdlink",
                text: "# heading1\nsome text\n# heading2 [google](google.com)\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 google\nsome text"

            },
            {
                name: "wikilink",
                text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 google\nsome text"
            },
            {
                name: "wikilink empty text",
                text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 google.com\nsome text"
            },
            {
                name: "wikilink [[note#heading]]",
                text: "# heading1\nsome text\n# heading2 [[note#heading 1]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 note#heading 1\nsome text"
            },
            {
                name: "wikilink [[#heading]]",
                text: "# heading1\nsome text\n# heading2 [[#heading 1]]\nsome text",
                isSelection: true,
                expected: "# heading1\nsome text\n# heading2 #heading 1\nsome text"
            },
            //TODO:
            // {
            //     name: "autolink",
            //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
            // }
        ]
    )
        ('remove (InternalWikilinkWithoutTextAction.ReplaceWithDestination) - isSelection:$isSelection - heading with [$name] - success', ({ name, text, isSelection, expected }) => {
            const options = {
                internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.ReplaceWithDestination
            };
            const cmd = new RemoveLinksFromHeadingsCommand(options)
            const editor = new EditorMock()
            if (isSelection) {
                editor.__mocks.getSelection.mockReturnValue(text)
            } else {
                editor.__mocks.getValue.mockReturnValue(text)
            }
            //
            cmd.handler(editor, false)
            //
            if (isSelection) {
                expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
                expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(expected)
            } else {
                expect(editor.__mocks.setValue.mock.calls).toHaveLength(1)
                expect(editor.__mocks.setValue.mock.calls[0][0]).toBe(expected)
            }
        })
})