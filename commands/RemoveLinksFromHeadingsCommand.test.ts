import { expect, test } from '@jest/globals';
import { RemoveLinksFromHeadingsCommand } from './RemoveLinksFromHeadingsCommand';

import { EditorMock } from './EditorMock'
import exp from 'constants';
import { InternalWikilinkWithoutTextAction } from '../utils';

describe('RemoveLinksFromHeadingsCommand test', () => {

    const statusData = [
        // no links in headings
        {
            name: "no links in headings",
            text: '# heading1\nsome text\n# heading2\nsome text',
            expected: false
        },
        {
            name: "no links in headings",
            text: '# heading1\nsome text\n# heading2\nsome text',
            expected: false
        },

        // has links in headings
        //  text
        {
            name: "html - href in \"",
            text: "# heading1\nsome text\n# heading2 <a href=\"google.com\">google1</a>\nsome text",
            expected: true
        },
        {
            name: "mdlink",
            text: "# heading1\nsome text\n# heading2 [google](google.com)\nsome text",
            expected: true
        },
        {
            name: "wikilink",
            text: "# heading1\nsome text\n# heading2 [[google.com|google]]\nsome text",
            expected: true
        },
        {
            name: "wikilink empty text",
            text: "# heading1\nsome text\n# heading2 [[google.com]]\nsome text",
            expected: true
        },
    ];

    test.each(statusData)
        ('status - $name', ({ name, text, expected }) => {
            const options = {
                internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.Delete
            };
            const cmd = new RemoveLinksFromHeadingsCommand(options)
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expected)
            expect(editor.__mocks.setValue.mock.calls).toHaveLength(0)
        })


    test.each(statusData)
        ('status (selection) - $name', ({ name, text, expected }) => {
            const options = {
                internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.Delete
            };
            const cmd = new RemoveLinksFromHeadingsCommand(options)
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            //
            const result = cmd.handler(editor, true)
            //
            expect(result).toBe(expected)
            expect(editor.__mocks.setValue.mock.calls).toHaveLength(0)
        })

    const removeDataInternalWikilinkWithoutTextActionDelete = [

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
            expected: "# heading1\nsome text\n# heading2 \nsome text"
        },
        {
            name: "wikilink [[note#heading]]",
            text: "# heading1\nsome text\n# heading2 [[note#heading 1]]\nsome text",
            expected: "# heading1\nsome text\n# heading2 \nsome text"
        },
        {
            name: "wikilink [[note#heading]]",
            text: "# heading1\nsome text\n# heading2 [[#heading 1]]\nsome text",
            expected: "# heading1\nsome text\n# heading2 \nsome text"
        },
        //TODO:
        // {
        //     name: "autolink",
        //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
        // }
    ];

    test.each(removeDataInternalWikilinkWithoutTextActionDelete)
        ('remove (InternalWikilinkWithoutTextAction.Delete) [$name]', ({ name, text, expected }) => {
            const options = {
                internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.Delete
            };
            const cmd = new RemoveLinksFromHeadingsCommand(options)
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.setValue.mock.calls).toHaveLength(1)
            expect(editor.__mocks.setValue.mock.calls[0][0]).toBe(expected)
        })

    test.each(removeDataInternalWikilinkWithoutTextActionDelete)
        ('remove (selection) (InternalWikilinkWithoutTextAction.Delete) [$name]', ({ name, text, expected }) => {
            const options = {
                internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.Delete
            };
            const cmd = new RemoveLinksFromHeadingsCommand(options)
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
            expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(expected)
        })

    const removeDataInternalWikilinkWithoutTextActionReplaceWithLowestHeading = [
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
            expected: "# heading1\nsome text\n# heading2 heading 1\nsome text"
        },
        {
            name: "wikilink [[note#heading]]",
            text: "# heading1\nsome text\n# heading2 [[note#heading 1]]\nsome text",
            expected: "# heading1\nsome text\n# heading2 heading 1\nsome text"
        },
        //TODO:
        // {
        //     name: "autolink",
        //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
        // }
    ];

    test.each(removeDataInternalWikilinkWithoutTextActionReplaceWithLowestHeading)
        ('remove (InternalWikilinkWithoutTextAction.ReplaceWithLowestNoteHeading) [$name]', ({ name, text, expected }) => {
            const options = {
                internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.ReplaceWithLowestNoteHeading
            };
            const cmd = new RemoveLinksFromHeadingsCommand(options)
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.setValue.mock.calls).toHaveLength(1)
            expect(editor.__mocks.setValue.mock.calls[0][0]).toBe(expected)
        })

    test.each(removeDataInternalWikilinkWithoutTextActionReplaceWithLowestHeading)
        ('remove (selection) (InternalWikilinkWithoutTextAction.ReplaceWithLowestNoteHeading) [$name]', ({ name, text, expected }) => {
            const options = {
                internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.ReplaceWithLowestNoteHeading
            };
            const cmd = new RemoveLinksFromHeadingsCommand(options)
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
            expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(expected)
        })

    const removeDataInternalWikilinkWithoutTextActionReplaceWithDestination = [
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
        {
            name: "wikilink [[#heading]]",
            text: "# heading1\nsome text\n# heading2 [[#heading 1]]\nsome text",
            expected: "# heading1\nsome text\n# heading2 #heading 1\nsome text"
        },
        //TODO:
        // {
        //     name: "autolink",
        //     text: "# heading1\nsome text\n# heading2 <https://google.com>\nsome text"
        // }
    ];

    test.each(removeDataInternalWikilinkWithoutTextActionReplaceWithDestination)
        ('remove (InternalWikilinkWithoutTextAction.ReplaceWithDestination) [$name]', ({ name, text, expected }) => {
            const options = {
                internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.ReplaceWithDestination
            };
            const cmd = new RemoveLinksFromHeadingsCommand(options)
            const editor = new EditorMock()
            editor.__mocks.getValue.mockReturnValue(text)
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.setValue.mock.calls).toHaveLength(1)
            expect(editor.__mocks.setValue.mock.calls[0][0]).toBe(expected)
        })

    test.each(removeDataInternalWikilinkWithoutTextActionReplaceWithDestination)
        ('remove (selection) (InternalWikilinkWithoutTextAction.ReplaceWithDestination) [$name]', ({ name, text, expected }) => {
            const options = {
                internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.ReplaceWithDestination
            };
            const cmd = new RemoveLinksFromHeadingsCommand(options)
            const editor = new EditorMock()
            editor.__mocks.getSelection.mockReturnValue(text)
            //
            cmd.handler(editor, false)
            //
            expect(editor.__mocks.replaceSelection.mock.calls).toHaveLength(1)
            expect(editor.__mocks.replaceSelection.mock.calls[0][0]).toBe(expected)
        })
})