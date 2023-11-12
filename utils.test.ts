import exp from 'constants';
import { findLink, findHtmlLink, replaceAllHtmlLinks, removeLinksFromHeadings, LinkTypes, getPageTitle, replaceMarkdownTarget, hasLinksInHeadings, HasLinks, removeLinks, decodeHtmlEntities, findLinks, LinkData, Position, TextPart, InternalWikilinkWithoutTextAction } from './utils';
import { expect, test } from '@jest/globals';

describe("Utils tests", () => {
    test.each([
        // markdown
        {
            name: "md link: cursor on text",
            input: "Incididunt [dolore](http://dolore.com) ullamco [sunt](https://sunt.com) ullamco non.",
            cursorPos: "Incididunt [do".length,
            linkType: LinkTypes.Markdown,
            linkText: "[dolore](http://dolore.com)",
            linkStart: "Incididunt ".length,
            linkEnd: "Incididunt [dolore](http://dolore.com)".length,
            text: "dolore",
            textStart: "[".length,
            textEnd: "[dolore".length,
            target: "http://dolore.com",
            targetStart: "[dolore](".length,
            targetEnd: "[dolore](http://dolore.com".length
        },
        {
            name: "md link: cursor on target",
            input: "Incididunt [dolore](http://dolore.com) ullamco [sunt](https://sunt.com) ullamco non.",
            cursorPos: "Incididunt [dolore](htt".length,
            linkType: LinkTypes.Markdown,
            linkText: "[dolore](http://dolore.com)",
            linkStart: "Incididunt ".length,
            linkEnd: "Incididunt [dolore](http://dolore.com)".length,
            text: "dolore",
            textStart: "[".length,
            textEnd: "[dolore".length,
            target: "http://dolore.com",
            targetStart: "[dolore](".length,
            targetEnd: "[dolore](http://dolore.com".length
        },
        {
            name: "md link: cursor on target",
            input: "Incidid`[`unt [dolore](http://dolore.com) ullamco [sunt](https://sunt.com) ullamco non.",
            cursorPos: "Incidid`[`unt [dolore](h".length,
            linkType: LinkTypes.Markdown,
            linkText: "[dolore](http://dolore.com)",
            linkStart: "Incidid`[`unt ".length,
            linkEnd: "Incidid`[`unt [dolore](http://dolore.com)".length,
            text: "dolore",
            textStart: "[".length,
            textEnd: "[dolore".length,
            target: "http://dolore.com",
            targetStart: "[dolore](".length,
            targetEnd: "[dolore](http://dolore.com".length
        },
        {
            name: "md link with <> in destination: cursor on target",
            input: "Incidid`[`unt [dolore](<http://dolore.com>) ullamco [sunt](https://sunt.com) ullamco non.",
            cursorPos: "Incidid`[`unt [dol".length,
            linkType: LinkTypes.Markdown,
            linkText: "[dolore](<http://dolore.com>)",
            linkStart: "Incidid`[`unt ".length,
            linkEnd: "Incidid`[`unt [dolore](<http://dolore.com>)".length,
            text: "dolore",
            textStart: "[".length,
            textEnd: "[dolore".length,
            target: "http://dolore.com",
            targetStart: "[dolore](<".length,
            targetEnd: "[dolore](<http://dolore.com".length
        },
        {
            name: "embeded md link: cursor on target",
            input: "Incidid`[`unt ![dolore](http://dolore.com) ullamco [sunt](https://sunt.com) ullamco non.",
            cursorPos: "Incidid`[`unt ![dolore](h".length,
            linkType: LinkTypes.Markdown,
            linkText: "![dolore](http://dolore.com)",
            linkStart: "Incidid`[`unt ".length,
            linkEnd: "Incidid`[`unt ![dolore](http://dolore.com)".length,
            text: "dolore",
            textStart: "![".length,
            textEnd: "![dolore".length,
            target: "http://dolore.com",
            targetStart: "![dolore](".length,
            targetEnd: "![dolore](http://dolore.com".length,
            embedded: true
        },

        // html
        {
            name: "html link: cursor on text",
            input: "Incididunt <a href=\"http://dolore.com\">dolore</a> ullamco sunt ullamco non.",
            cursorPos: "Incididunt <a href=\"http://dolore.com\">dol".length,
            linkType: LinkTypes.Html,
            linkText: "<a href=\"http://dolore.com\">dolore</a>",
            linkStart: "Incididunt ".length,
            linkEnd: "Incididunt <a href=\"http://dolore.com\">dolore</a>".length,
            text: "dolore",
            textStart: "<a href=\"http://dolore.com\">".length,
            textEnd: "<a href=\"http://dolore.com\">dolore".length,
            target: "http://dolore.com",
            targetStart: "<a href=\"".length,
            targetEnd: "<a href=\"http://dolore.com".length,
            embedded: false
        },

        // wiki
        {
            name: "wikilink: cursor on destination",
            input: "Incididunt [[dolore]] ullamco [[sunt]] ullamco non.",
            cursorPos: "Incididunt [[dol".length,
            linkType: LinkTypes.Wiki,
            linkText: "[[dolore]]",
            linkStart: "Incididunt ".length,
            linkEnd: "Incididunt [[dolore]]".length,
            text: undefined,
            textStart: undefined,
            textEnd: undefined,
            target: "dolore",
            targetStart: "[[".length,
            targetEnd: "[[dolore".length
        },
        {
            name: "wikilink with text: cursor on text",
            input: "Incididunt [[dolore|dolore text]] ullamco [[sunt]] ullamco non.",
            cursorPos: "Incididunt [[dolore|dol".length,
            linkType: LinkTypes.Wiki,
            linkText: "[[dolore|dolore text]]",
            linkStart: "Incididunt ".length,
            linkEnd: "Incididunt [[dolore|dolore text]]".length,
            text: "dolore text",
            textStart: "[[dolore|".length,
            textEnd: "[[dolore|dolore text".length,
            target: "dolore",
            targetStart: "[[".length,
            targetEnd: "[[dolore".length
        },
        {
            name: "wikilink with empty text: cursor after |",
            input: "Incididunt [[dolore|]] ullamco [[sunt]] ullamco non.",
            cursorPos: "Incididunt [[dolore|".length,
            linkType: LinkTypes.Wiki,
            linkText: "[[dolore|]]",
            linkStart: "Incididunt ".length,
            linkEnd: "Incididunt [[dolore|]]".length,
            text: undefined,
            textStart: undefined,
            textEnd: undefined,
            target: "dolore",
            targetStart: "[[".length,
            targetEnd: "[[dolore".length
        },
        {
            name: "embeded wikilink with text: cursor after |",
            input: "Incididunt ![[dolore|dolore text]] ullamco [[sunt]] ullamco non.",
            cursorPos: "Incididunt [[dolore|".length,
            linkType: LinkTypes.Wiki,
            linkText: "![[dolore|dolore text]]",
            linkStart: "Incididunt ".length,
            linkEnd: "Incididunt ![[dolore|dolore text]]".length,
            text: "dolore text",
            textStart: "![[dolore|".length,
            textEnd: "![[dolore|dolore text".length,
            target: "dolore",
            targetStart: "![[".length,
            targetEnd: "![[dolore".length,
            embeded: true,
        },

        // autolink
        {
            name: "http autolink: cursor on target",
            input: "Incididunt dolore <http://dolore.com> ullamco sunt <https://sunt.com> ullamco non.",
            cursorPos: "Incididunt dolore <htt".length,
            linkType: LinkTypes.Autolink,
            linkText: "<http://dolore.com>",
            linkStart: "Incididunt dolore ".length,
            linkEnd: "Incididunt dolore <http://dolore.com>".length,
            text: undefined,
            textStart: undefined,
            textEnd: undefined,
            target: "http://dolore.com",
            targetStart: ">".length,
            targetEnd: "<http://dolore.com".length
        },
        {
            name: "irc scheme autolink with port: cursor on target",
            input: "Incididunt dolore <irc://foo.bar:2233/baz> ullamco sunt <https://sunt.com> ullamco non.",
            cursorPos: "Incididunt dolore <ir".length,
            linkType: LinkTypes.Autolink,
            linkText: "<irc://foo.bar:2233/baz>",
            linkStart: "Incididunt dolore ".length,
            linkEnd: "Incididunt dolore <irc://foo.bar:2233/baz>".length,
            text: undefined,
            textStart: undefined,
            textEnd: undefined,
            target: "irc://foo.bar:2233/baz",
            targetStart: "<".length,
            targetEnd: "<irc://foo.bar:2233/baz".length
        },
        {
            name: "url with request: cursor on target",
            input: "Incididunt dolore <http://foo.bar.baz/test?q=hello&id=22&boolean> ullamco sunt <https://sunt.com> ullamco non.",
            cursorPos: "Incididunt dolore <ht".length,
            linkType: LinkTypes.Autolink,
            linkText: "<http://foo.bar.baz/test?q=hello&id=22&boolean>",
            linkStart: "Incididunt dolore ".length,
            linkEnd: "Incididunt dolore <http://foo.bar.baz/test?q=hello&id=22&boolean>".length,
            text: undefined,
            textStart: undefined,
            textEnd: undefined,
            target: "http://foo.bar.baz/test?q=hello&id=22&boolean",
            targetStart: "<".length,
            targetEnd: "<http://foo.bar.baz/test?q=hello&id=22&boolean".length
        },
        {
            name: "mailto autolink: cursor on target",
            input: "Incididunt dolore <MAILTO:FOO@BAR.BAZ> ullamco sunt <https://sunt.com> ullamco non.",
            cursorPos: "Incididunt dolore <M".length,
            linkType: LinkTypes.Autolink,
            linkText: "<MAILTO:FOO@BAR.BAZ>",
            linkStart: "Incididunt dolore ".length,
            linkEnd: "Incididunt dolore <MAILTO:FOO@BAR.BAZ>".length,
            text: undefined,
            textStart: undefined,
            textEnd: undefined,
            target: "MAILTO:FOO@BAR.BAZ",
            targetStart: "<".length,
            targetEnd: "<MAILTO:FOO@BAR.BAZ".length
        },
        {
            name: "mail autolink: cursor on target",
            input: "Incididunt dolore <foo@bar.example.com> ullamco sunt <https://sunt.com> ullamco non.",
            cursorPos: "Incididunt dolore <f".length,
            linkType: LinkTypes.Autolink,
            linkText: "<foo@bar.example.com>",
            linkStart: "Incididunt dolore ".length,
            linkEnd: "Incididunt dolore <foo@bar.example.com>".length,
            text: undefined,
            textStart: undefined,
            textEnd: undefined,
            target: "foo@bar.example.com",
            targetStart: "<".length,
            targetEnd: "<foo@bar.example.com".length
        }
    ])('findLink: $# $name', ({ name, input, cursorPos, linkType, linkText, linkStart, linkEnd,
        text, textStart, textEnd, target, targetStart, targetEnd, embedded }) => {
        const result = findLink(input, cursorPos, cursorPos);
        expect(result).toBeDefined();
        expect(result?.type).toBe(linkType);
        expect(result?.content).toBe(linkText);
        expect(result?.position.start).toBe(linkStart);
        expect(result?.position.end).toBe(linkEnd);
        if (text !== undefined) {
            expect(result?.text?.content).toBe(text);
            expect(result!.text!.position.start).toBe(textStart);
            expect(result!.text!.position.end).toBe(textEnd);
        } else {
            expect(result?.text).toBeUndefined();
        }
        if (target) {
            expect(result?.link?.content).toBe(target);
            expect(result!.link!.position.start).toBe(targetStart);
            expect(result!.link!.position.end).toBe(targetEnd);
        }
        else {
            expect(result?.link).toBeUndefined();
        }
        if (embedded) {
            expect(result!.embedded).toBe(embedded);
        }
    });

    test.each([
        {
            name: "cursor on text",
            input: "Incididunt <a href=\"http://dolore.com\">dolore</a> ullamco sunt ullamco non.",
            cursorPos: "Incididunt <a href=\"http://dolore.com\">dol".length,
            linkText: "<a href=\"http://dolore.com\">dolore</a>",
            linkStart: "Incididunt ".length,
            linkEnd: "Incididunt <a href=\"http://dolore.com\">dolore</a>".length,
            text: "dolore",
            textStart: "<a href=\"http://dolore.com\">".length,
            textEnd: "<a href=\"http://dolore.com\">dolore".length,
            target: "http://dolore.com",
            targetStart: "<a href=\"".length,
            targetEnd: "<a href=\"http://dolore.com".length
        }
    ])('findHtmlLink: $# html link [$name]', ({ name, input, cursorPos, linkText, linkStart, linkEnd,
        text, textStart, textEnd, target, targetStart, targetEnd }) => {
        const result = findHtmlLink(input, cursorPos, cursorPos);
        expect(result).toBeDefined();
        expect(result?.content).toBe(linkText);
        expect(result?.position.start).toBe(linkStart);
        expect(result?.position.end).toBe(linkEnd);
        expect(result?.text?.content).toBe(text);
        expect(result!.text!.position.start).toBe(textStart);
        expect(result!.text!.position.end).toBe(textEnd);
        expect(result?.link?.content).toBe(target);
        expect(result!.link!.position.start).toBe(targetStart);
        expect(result!.link!.position.end).toBe(targetEnd);

    });

    test.each([
        {
            name: "standard links",
            input: "Incididunt <a href=\"http://dolore.com\">dolore</a> ullamco <a href=\"http://sunt.com\">sunt</a> ullamco non.",
            expected: "Incididunt [dolore](http://dolore.com) ullamco [sunt](http://sunt.com) ullamco non."
        }
    ])('replaceAllHtmlLinks: $# convert html links to markdown [$name]', ({ name, input, expected }) => {
        const result = replaceAllHtmlLinks(input);
        expect(result).toBe(expected);
    });

    test.each([
        {
            name: "headings without links",
            linksInHeadings: false,
            internalWikilinkWithoutTextAction: undefined,
            input: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
                "# Aute officia do eu. Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
                "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" +
                "## Duis cupidatat. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
                " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
                "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip.\n" +
                "## amet mollit velit1. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
            expected: null
        },
        {
            name: "wiki, markdown, html links",
            linksInHeadings: true,
            internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.Delete,
            input: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
                "# Aute officia [do eu](ea sit aute). Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
                "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" +
                "## [[amet mollit velit|Duis cupidatat]]. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
                " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
                "### [[Tempor]] voluptate aute dolore non deserunt duis voluptate. \r\n" +
                "Pariatur ad laboris voluptate labore esse dolor deserunt. Dolor pariatur do nisi cillum cillum ad sit duis laborum enim enim Lorem ipsum adipisicing.\n" +
                "# Sint [[nulla#heading1#headin1.1]] excepteur eu exercitation aute. Elit ipsum duis voluptate sint exercitation anim aliqua proident mollit. Laborum amet consequat esse duis \n" +
                "dolore sint culpa aliquip fugiat officia consectetur nostrud adipisicing. Sunt cupidatat in eu non sint tempor ea enim officia reprehenderit elit veniam. Aute velit reprehenderit Lorem velit anim eiusmod non. Veniam labore nulla aute fugiat anim\n" +
                "# Elit [[#sunt]] tempor amet velit consectetur. Minim fugiat labore aliquip laboris dolore \n" +
                "in nisi voluptate consectetur ea aliqua sint ullamco sint. Incididunt incididunt ex commodo laboris minim nostrud duis excepteur labore id do anim deserunt id.\n" +
                "## <a href=\"google.com\">amet mollit velit1</a>. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
            expected: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
                "# Aute officia do eu. Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
                "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" +
                "## Duis cupidatat. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
                " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
                "###  voluptate aute dolore non deserunt duis voluptate. \r\n" +
                "Pariatur ad laboris voluptate labore esse dolor deserunt. Dolor pariatur do nisi cillum cillum ad sit duis laborum enim enim Lorem ipsum adipisicing.\n" +
                "# Sint  excepteur eu exercitation aute. Elit ipsum duis voluptate sint exercitation anim aliqua proident mollit. Laborum amet consequat esse duis \n" +
                "dolore sint culpa aliquip fugiat officia consectetur nostrud adipisicing. Sunt cupidatat in eu non sint tempor ea enim officia reprehenderit elit veniam. Aute velit reprehenderit Lorem velit anim eiusmod non. Veniam labore nulla aute fugiat anim\n" +
                "# Elit  tempor amet velit consectetur. Minim fugiat labore aliquip laboris dolore \n" +
                "in nisi voluptate consectetur ea aliqua sint ullamco sint. Incididunt incididunt ex commodo laboris minim nostrud duis excepteur labore id do anim deserunt id.\n" +
                "## amet mollit velit1. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
        },
        {
            name: "wiki, markdown, html links",
            linksInHeadings: true,
            internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.ReplaceWithDestination,
            input: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
                "# Aute officia [do eu](ea sit aute). Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
                "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" +
                "## [[amet mollit velit|Duis cupidatat]]. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
                " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
                "### [[Tempor]] voluptate aute dolore non deserunt duis voluptate. \r\n" +
                "Pariatur ad laboris voluptate labore esse dolor deserunt. Dolor pariatur do nisi cillum cillum ad sit duis laborum enim enim Lorem ipsum adipisicing.\n" +
                "# Sint [[nulla#heading1#headin1.1]] excepteur eu exercitation aute. Elit ipsum duis voluptate sint exercitation anim aliqua proident mollit. Laborum amet consequat esse duis \n" +
                "dolore sint culpa aliquip fugiat officia consectetur nostrud adipisicing. Sunt cupidatat in eu non sint tempor ea enim officia reprehenderit elit veniam. Aute velit reprehenderit Lorem velit anim eiusmod non. Veniam labore nulla aute fugiat anim\n" +
                "# Elit [[#sunt]] tempor amet velit consectetur. Minim fugiat labore aliquip laboris dolore \n" +
                "in nisi voluptate consectetur ea aliqua sint ullamco sint. Incididunt incididunt ex commodo laboris minim nostrud duis excepteur labore id do anim deserunt id.\n" +
                "## <a href=\"google.com\">amet mollit velit1</a>. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
            expected: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
                "# Aute officia do eu. Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
                "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" +
                "## Duis cupidatat. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
                " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
                "### Tempor voluptate aute dolore non deserunt duis voluptate. \r\n" +
                "Pariatur ad laboris voluptate labore esse dolor deserunt. Dolor pariatur do nisi cillum cillum ad sit duis laborum enim enim Lorem ipsum adipisicing.\n" +
                "# Sint nulla#heading1#headin1.1 excepteur eu exercitation aute. Elit ipsum duis voluptate sint exercitation anim aliqua proident mollit. Laborum amet consequat esse duis \n" +
                "dolore sint culpa aliquip fugiat officia consectetur nostrud adipisicing. Sunt cupidatat in eu non sint tempor ea enim officia reprehenderit elit veniam. Aute velit reprehenderit Lorem velit anim eiusmod non. Veniam labore nulla aute fugiat anim\n" +
                "# Elit #sunt tempor amet velit consectetur. Minim fugiat labore aliquip laboris dolore \n" +
                "in nisi voluptate consectetur ea aliqua sint ullamco sint. Incididunt incididunt ex commodo laboris minim nostrud duis excepteur labore id do anim deserunt id.\n" +
                "## amet mollit velit1. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
        },
        {
            name: "wiki, markdown, html links",
            linksInHeadings: true,
            internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.ReplaceWithLowestNoteHeading,
            input: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
                "# Aute officia [do eu](ea sit aute). Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
                "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" +
                "## [[amet mollit velit|Duis cupidatat]]. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
                " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
                "### [[Tempor]] voluptate aute dolore non deserunt duis voluptate. \r\n" +
                "Pariatur ad laboris voluptate labore esse dolor deserunt. Dolor pariatur do nisi cillum cillum ad sit duis laborum enim enim Lorem ipsum adipisicing.\n" +
                "# Sint [[nulla#heading1#headin1.1]] excepteur eu exercitation aute. Elit ipsum duis voluptate sint exercitation anim aliqua proident mollit. Laborum amet consequat esse duis \n" +
                "dolore sint culpa aliquip fugiat officia consectetur nostrud adipisicing. Sunt cupidatat in eu non sint tempor ea enim officia reprehenderit elit veniam. Aute velit reprehenderit Lorem velit anim eiusmod non. Veniam labore nulla aute fugiat anim\n" +
                "# Elit [[#sunt]] tempor amet velit consectetur. Minim fugiat labore aliquip laboris dolore \n" +
                "in nisi voluptate consectetur ea aliqua sint ullamco sint. Incididunt incididunt ex commodo laboris minim nostrud duis excepteur labore id do anim deserunt id.\n" +
                "## <a href=\"google.com\">amet mollit velit1</a>. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
            expected: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
                "# Aute officia do eu. Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
                "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" +
                "## Duis cupidatat. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
                " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
                "### Tempor voluptate aute dolore non deserunt duis voluptate. \r\n" +
                "Pariatur ad laboris voluptate labore esse dolor deserunt. Dolor pariatur do nisi cillum cillum ad sit duis laborum enim enim Lorem ipsum adipisicing.\n" +
                "# Sint headin1.1 excepteur eu exercitation aute. Elit ipsum duis voluptate sint exercitation anim aliqua proident mollit. Laborum amet consequat esse duis \n" +
                "dolore sint culpa aliquip fugiat officia consectetur nostrud adipisicing. Sunt cupidatat in eu non sint tempor ea enim officia reprehenderit elit veniam. Aute velit reprehenderit Lorem velit anim eiusmod non. Veniam labore nulla aute fugiat anim\n" +
                "# Elit sunt tempor amet velit consectetur. Minim fugiat labore aliquip laboris dolore \n" +
                "in nisi voluptate consectetur ea aliqua sint ullamco sint. Incididunt incididunt ex commodo laboris minim nostrud duis excepteur labore id do anim deserunt id.\n" +
                "## amet mollit velit1. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
        },
        
    ])('removeLinksFromHeadings check & remove links from headings [$name] - linksInHeadings:$linksInHeadings, InternalWikilinkWithoutTextAction:$internalWikilinkWithoutTextAction: $# ', 
        ({ name, linksInHeadings, internalWikilinkWithoutTextAction, input, expected }) => {

        const hasLinks = hasLinksInHeadings(input);
        expect(hasLinks).toBe(linksInHeadings);

        if (linksInHeadings) {
            expect(hasLinks).toBeTruthy();
            const options = {
                internalWikilinkWithoutTextAction: internalWikilinkWithoutTextAction ?? InternalWikilinkWithoutTextAction.ReplaceWithDestination
            };
            const result = removeLinksFromHeadings(input, options);
            expect(result).toBe(expected);
        }
    });

    test.each([
        {
            name: "text without links",
            input: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
                "# Aute [[officia do eu. Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
                "sit consequat ]] mollit. Duis cupidatat minim </a> commodo <a>exercitation labore qui non qui eiusmod labore \n" +
                "## Duis cupidatat. Velit dolor non ut occaecat eiusmod est [ipsum] culpa (nulla) eu nulla culpa ullamco.\r\n" +
                " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
                "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip.\n" +
                "## amet mollit velit1. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
            expected: null
        },
        {
            name: "wiki, markdown, html links",
            input: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
                "# Aute officia [do eu](ea sit aute). Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
                "sit consequat mollit. [Duis](duis) cupidatat minim [[commodo]] exercitation [[lkjf0934|labore qui]] non qui eiusmod labore \n" +
                "## [[amet mollit velit|Duis cupidatat]]. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
                " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
                "Et magna velit <a href=\"http://hi.com\">adipisicing</a> non exercitation commodo officia in sunt aliquip.\n" +
                "## <a href=\"google.com\">amet mollit velit1</a>. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
            expected: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
                "# Aute officia do eu. Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
                "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" +
                "## Duis cupidatat. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
                " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
                "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip.\n" +
                "## amet mollit velit1. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n"
        }

    ])('HasLinks/RemoveLinks: $# check & remove links from headings [$name]', ({ name, input, expected }) => {

        const hasLinks = HasLinks(input);
        if (expected) {
            expect(hasLinks).toBeTruthy();
            const result = removeLinks(input);
            expect(result).toBe(expected);
        } else {
            expect(hasLinks).toBeFalsy();
        }
    });

    test.each([
        {
            name: "simple page",
            url: "https://simple-page.com",
            pageText: `
<!DOCTYPE html>
<html>
<head>
  <title>Simple page</title>
</head>
<body>
</body>
</html>`,
            expected: "Simple page"
        }

    ])("getPageTitle: $# get page title [$name]", async ({ name, url, pageText, expected }) => {
        const result = await getPageTitle(new URL(url), async (url: URL) => Promise.resolve(pageText));
        expect(result).toBe(expected);
    })


    test.each([
        {
            name: "markddown with http urls",
            target: "http://link1.com",
            newtarget: "link 1 page",
            input: "Dolore qui elit cillum ex. [link1 text 1](http://link1.com) Veniam veniam est sit cillum tempor in nostrud ad. Cillum ex irure ipsum [link1 text 2](http://link1.com) et esse aliquip minim. Elit ullamco qui laboris reprehenderit. Reprehenderit incididunt nulla cupidatat id enim nisi dolor nulla id do mollit.",
            expected: "Dolore qui elit cillum ex. [link1 text 1](link%201%20page) Veniam veniam est sit cillum tempor in nostrud ad. Cillum ex irure ipsum [link1 text 2](link%201%20page) et esse aliquip minim. Elit ullamco qui laboris reprehenderit. Reprehenderit incididunt nulla cupidatat id enim nisi dolor nulla id do mollit."
        }
    ])("$# replace markdown target [$name]", ({ name, target, newtarget, input, expected }) => {
        const [output, count] = replaceMarkdownTarget(input, target, newtarget);
        expect(count).toBe(2);
        expect(output).toBe(expected);
    });


    test.each([
        {
            name: "&",
            input: "Dolore qui elit &amp; cillum ex.",
            expected: "Dolore qui elit & cillum ex."
        },
        {
            name: "nbsp",
            input: "Dolore qui elit&nbsp;cillum ex.",
            expected: "Dolore qui elit cillum ex."
        },
        {
            name: "\"",
            input: "Dolore qui &quot;elit&quot; cillum ex.",
            expected: "Dolore qui \"elit\" cillum ex."
        }

    ])("$# decode html entity [$name]", ({ name, input, expected }) => {
        const result = decodeHtmlEntities(input);
        expect(result).toBe(expected);
    });


    test.each([
        {
            name: "mdlink",
            input: "[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                "laborum aliqua [consequat]() voluptate ![esse]() officia in [](id-dest) ad voluptate ![](voluptate-dest) " +
                "ad voluptate [Consectetur](<Consectetur dest>) officia ![tempor](<tempor dest>)",
            expected: [
                new LinkData(LinkTypes.Markdown, "[Consectetur](Consectetur-dest)",
                    new Position(0, "[Consectetur](Consectetur-dest)".length),
                    new TextPart("Consectetur-dest", new Position("[Consectetur](".length, "[Consectetur](Consectetur-dest".length)),
                    new TextPart("Consectetur", new Position("[".length, "[Consectetur".length))),
                new LinkData(LinkTypes.Markdown, "[]()",
                    new Position("[Consectetur](Consectetur-dest) in id ".length, "[Consectetur](Consectetur-dest) in id []()".length),
                    undefined,
                    undefined),
                new LinkData(LinkTypes.Markdown, "![tempor](tempor-dest)",
                    new Position("[Consectetur](Consectetur-dest) in id []() ad voluptate ".length,
                        "[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest)".length),
                    new TextPart("tempor-dest", new Position("![tempor](".length, "![tempor](tempor-dest".length)),
                    new TextPart("tempor", new Position("![".length, "![tempor".length)),
                    true),
                new LinkData(LinkTypes.Markdown, "![]()",
                    new Position("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ".length,
                        "[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]()".length),
                    undefined,
                    undefined,
                    true),
                new LinkData(LinkTypes.Markdown, "[consequat]()",
                    new Position(("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                        "laborum aliqua ").length,
                        ("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                            "laborum aliqua [consequat]()").length),
                    undefined,
                    new TextPart("consequat", new Position("[".length, "[consequat".length))),
                new LinkData(LinkTypes.Markdown, "![esse]()",
                    new Position(("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                        "laborum aliqua [consequat]() voluptate ").length,
                        ("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                            "laborum aliqua [consequat]() voluptate ![esse]()").length),
                    undefined,
                    new TextPart("esse", new Position("![".length, "![esse".length)),
                    true),
                new LinkData(LinkTypes.Markdown, "[](id-dest)",
                    new Position(("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                        "laborum aliqua [consequat]() voluptate ![esse]() officia in ").length,
                        ("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                            "laborum aliqua [consequat]() voluptate ![esse]() officia in [](id-dest)").length),
                    new TextPart("id-dest", new Position("[](".length, "[](id-dest".length)),
                    undefined),
                new LinkData(LinkTypes.Markdown, "![](voluptate-dest)",
                    new Position(("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                        "laborum aliqua [consequat]() voluptate ![esse]() officia in [](id-dest) ad voluptate ").length,
                        ("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                            "laborum aliqua [consequat]() voluptate ![esse]() officia in [](id-dest) ad voluptate ![](voluptate-dest)").length),
                    new TextPart("voluptate-dest", new Position("![](".length, "![](voluptate-dest".length)),
                    undefined,
                    true),
                new LinkData(LinkTypes.Markdown, "[Consectetur](<Consectetur dest>)",
                    new Position(("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                        "laborum aliqua [consequat]() voluptate ![esse]() officia in [](id-dest) ad voluptate ![](voluptate-dest) " +
                        "ad voluptate ").length,
                        ("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                            "laborum aliqua [consequat]() voluptate ![esse]() officia in [](id-dest) ad voluptate ![](voluptate-dest) " +
                            "ad voluptate [Consectetur](<Consectetur dest>)").length),
                    new TextPart("Consectetur dest", new Position("[Consectetur](<".length, "[Consectetur](<Consectetur dest".length)),
                    new TextPart("Consectetur", new Position("[".length, "[Consectetur".length))),
                new LinkData(LinkTypes.Markdown, "![tempor](<tempor dest>)",
                    new Position(("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                        "laborum aliqua [consequat]() voluptate ![esse]() officia in [](id-dest) ad voluptate ![](voluptate-dest) " +
                        "ad voluptate [Consectetur](<Consectetur dest>) officia ").length,
                        ("[Consectetur](Consectetur-dest) in id []() ad voluptate ![tempor](tempor-dest) sit ![]() " +
                            "laborum aliqua [consequat]() voluptate ![esse]() officia in [](id-dest) ad voluptate ![](voluptate-dest) " +
                            "ad voluptate [Consectetur](<Consectetur dest>) officia ![tempor](<tempor dest>)").length),
                    new TextPart("tempor dest", new Position("![tempor](<".length, "![tempor](<tempor dest".length)),
                    new TextPart("tempor", new Position("![".length, "![tempor".length)),
                    true),
            ]
        },
        {
            name: "wikilink",
            input: "[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ![[tempor-dest|tempor]] sit ![[]] " +
                "laborum aliqua [[|consequat]] voluptate ![[|esse]] officia in [[id-dest]] ad voluptate ![[voluptate-dest]] " +
                "ad voluptate Consectetur officia tempor",
            expected: [
                new LinkData(LinkTypes.Wiki, "[[Consectetur-dest|Consectetur]]",
                    new Position(0, "[[Consectetur-dest|Consectetur]]".length),
                    new TextPart("Consectetur-dest", new Position("[[".length, "[[Consectetur-dest".length)),
                    new TextPart("Consectetur", new Position("[[Consectetur-dest|".length, "[[Consectetur-dest|Consectetur".length))),
                new LinkData(LinkTypes.Wiki, "[[]]",
                    new Position("[[Consectetur-dest|Consectetur]] in id ".length, "[[Consectetur-dest|Consectetur]] in id [[]]".length),
                    undefined,
                    undefined),
                new LinkData(LinkTypes.Wiki, "![[tempor-dest|tempor]]",
                    new Position("[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ".length,
                        "[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ![[tempor-dest|tempor]]".length),
                    new TextPart("tempor-dest", new Position("![[".length, "![[tempor-dest".length)),
                    new TextPart("tempor", new Position("![[tempor-dest|".length, "![[tempor-dest|tempor".length)),
                    true),
                new LinkData(LinkTypes.Wiki, "![[]]",
                    new Position("[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ![[tempor-dest|tempor]] sit ".length,
                        "[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ![[tempor-dest|tempor]] sit ![[]]".length),
                    undefined,
                    undefined,
                    true),
                new LinkData(LinkTypes.Wiki, "[[|consequat]]",
                    new Position(("[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ![[tempor-dest|tempor]] sit ![[]] " +
                        "laborum aliqua ").length,
                        ("[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ![[tempor-dest|tempor]] sit ![[]] " +
                            "laborum aliqua [[|consequat]]").length),
                    undefined,
                    new TextPart("consequat", new Position("[[|".length, "[[|consequat".length))),
                new LinkData(LinkTypes.Wiki, "![[|esse]]",
                    new Position(("[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ![[tempor-dest|tempor]] sit ![[]] " +
                        "laborum aliqua [[|consequat]] voluptate ").length,
                        ("[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ![[tempor-dest|tempor]] sit ![[]] " +
                            "laborum aliqua [[|consequat]] voluptate ![[|esse]]").length),
                    undefined,
                    new TextPart("esse", new Position("![[|".length, "![[|esse".length)),
                    true),
                new LinkData(LinkTypes.Wiki, "[[id-dest]]",
                    new Position(("[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ![[tempor-dest|tempor]] sit ![[]] " +
                        "laborum aliqua [[|consequat]] voluptate ![[|esse]] officia in ").length,
                        ("[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ![[tempor-dest|tempor]] sit ![[]] " +
                            "laborum aliqua [[|consequat]] voluptate ![[|esse]] officia in [[id-dest]]").length),
                    new TextPart("id-dest", new Position("[[".length, "[[id-dest".length)),
                    undefined),
                new LinkData(LinkTypes.Wiki, "![[voluptate-dest]]",
                    new Position(("[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ![[tempor-dest|tempor]] sit ![[]] " +
                        "laborum aliqua [[|consequat]] voluptate ![[|esse]] officia in [[id-dest]] ad voluptate ").length,
                        ("[[Consectetur-dest|Consectetur]] in id [[]] ad voluptate ![[tempor-dest|tempor]] sit ![[]] " +
                            "laborum aliqua [[|consequat]] voluptate ![[|esse]] officia in [[id-dest]] ad voluptate ![[voluptate-dest]]").length),
                    new TextPart("voluptate-dest", new Position("![[".length, "![[voluptate-dest".length)),
                    undefined,
                    true),
            ]
        },
        {
            name: "autlink",
            input: "Consectetur in <http://dolore.com> id ad voluptate  <https://sunt.com> tempor sit <irc://foo.bar:2233/baz>" +
                "laborum <http://foo.bar.baz/test?q=hello&id=22&boolean> aliqua consequatvoluptate esse officia in ad voluptate voluptate-dest " +
                "<MAILTO:FOO@BAR.BAZ> ad voluptate <foo@bar.example.com> Consectetur <> officia <hello> tempor",
            expected: [
                new LinkData(LinkTypes.Autolink, "<http://dolore.com>",
                    new Position("Consectetur in ".length, "Consectetur in <http://dolore.com>".length),
                    new TextPart("http://dolore.com", new Position("<".length, "<http://dolore.com".length)),
                    undefined),
                new LinkData(LinkTypes.Autolink, "<https://sunt.com>",
                    new Position("Consectetur in <http://dolore.com> id ad voluptate  ".length, "Consectetur in <http://dolore.com> id ad voluptate  <https://sunt.com>".length),
                    new TextPart("https://sunt.com", new Position("<".length, "<https://sunt.com".length)),
                    undefined),
                new LinkData(LinkTypes.Autolink, "<irc://foo.bar:2233/baz>",
                    new Position("Consectetur in <http://dolore.com> id ad voluptate  <https://sunt.com> tempor sit ".length,
                        "Consectetur in <http://dolore.com> id ad voluptate  <https://sunt.com> tempor sit <irc://foo.bar:2233/baz>".length),
                    new TextPart("irc://foo.bar:2233/baz", new Position("<".length, "<irc://foo.bar:2233/baz".length)),
                    undefined),
                new LinkData(LinkTypes.Autolink, "<http://foo.bar.baz/test?q=hello&id=22&boolean>",
                    new Position(("Consectetur in <http://dolore.com> id ad voluptate  <https://sunt.com> tempor sit <irc://foo.bar:2233/baz>" +
                        "laborum ").length,
                        ("Consectetur in <http://dolore.com> id ad voluptate  <https://sunt.com> tempor sit <irc://foo.bar:2233/baz>" +
                            "laborum <http://foo.bar.baz/test?q=hello&id=22&boolean>").length),
                    new TextPart("http://foo.bar.baz/test?q=hello&id=22&boolean", new Position("<".length, "<http://foo.bar.baz/test?q=hello&id=22&boolean".length)),
                    undefined),
                new LinkData(LinkTypes.Autolink, "<MAILTO:FOO@BAR.BAZ>",
                    new Position(("Consectetur in <http://dolore.com> id ad voluptate  <https://sunt.com> tempor sit <irc://foo.bar:2233/baz>" +
                        "laborum <http://foo.bar.baz/test?q=hello&id=22&boolean> aliqua consequatvoluptate esse officia in ad voluptate voluptate-dest ").length,
                        ("Consectetur in <http://dolore.com> id ad voluptate  <https://sunt.com> tempor sit <irc://foo.bar:2233/baz>" +
                            "laborum <http://foo.bar.baz/test?q=hello&id=22&boolean> aliqua consequatvoluptate esse officia in ad voluptate voluptate-dest " +
                            "<MAILTO:FOO@BAR.BAZ>").length),
                    new TextPart("MAILTO:FOO@BAR.BAZ", new Position("<".length, "<MAILTO:FOO@BAR.BAZ".length)),
                    undefined),
                new LinkData(LinkTypes.Autolink, "<foo@bar.example.com>",
                    new Position(("Consectetur in <http://dolore.com> id ad voluptate  <https://sunt.com> tempor sit <irc://foo.bar:2233/baz>" +
                        "laborum <http://foo.bar.baz/test?q=hello&id=22&boolean> aliqua consequatvoluptate esse officia in ad voluptate voluptate-dest " +
                        "<MAILTO:FOO@BAR.BAZ> ad voluptate ").length,
                        ("Consectetur in <http://dolore.com> id ad voluptate  <https://sunt.com> tempor sit <irc://foo.bar:2233/baz>" +
                            "laborum <http://foo.bar.baz/test?q=hello&id=22&boolean> aliqua consequatvoluptate esse officia in ad voluptate voluptate-dest " +
                            "<MAILTO:FOO@BAR.BAZ> ad voluptate <foo@bar.example.com>").length),
                    new TextPart("foo@bar.example.com", new Position("<".length, "<foo@bar.example.com".length)),
                    undefined),
            ]
        },
        {
            name: "html link",
            input: "<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !<a href=\"tempor-dest\">tempor</a> sit !<a href=''></a> " +
                "laborum aliqua <a href=\"\">consequat</a> voluptate !<a href=''>esse</a> officia in <a href=\"id-dest\"></a> ad voluptate !<a href='voluptate-dest'></a> ",
            expected: [
                new LinkData(LinkTypes.Html, "<a href='Consectetur-dest'>Consectetur</a>",
                    new Position(0, "<a href='Consectetur-dest'>Consectetur</a>".length),
                    new TextPart("Consectetur-dest", new Position("<a href='".length, "<a href='Consectetur-dest".length)),
                    new TextPart("Consectetur", new Position("<a href='Consectetur-dest'>".length, "<a href='Consectetur-dest'>Consectetur".length))),
                new LinkData(LinkTypes.Html, "<a href=\"\"></a>",
                    new Position("<a href='Consectetur-dest'>Consectetur</a> in id ".length, "<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a>".length),
                    undefined,
                    undefined),
                new LinkData(LinkTypes.Html, "<a href=\"tempor-dest\">tempor</a>",
                    new Position("<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !".length,
                        "<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !<a href=\"tempor-dest\">tempor</a>".length),
                    new TextPart("tempor-dest", new Position("<a href=\"".length, "<a href=\"tempor-dest".length)),
                    new TextPart("tempor", new Position("<a href=\"tempor-dest\">".length, "<a href=\"tempor-dest\">tempor".length))),
                new LinkData(LinkTypes.Html, "<a href=''></a>",
                    new Position("<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !<a href=\"tempor-dest\">tempor</a> sit !".length,
                        "<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !<a href=\"tempor-dest\">tempor</a> sit !<a href=''></a>".length),
                    undefined,
                    undefined),
                new LinkData(LinkTypes.Html, "<a href=\"\">consequat</a>",
                    new Position(("<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !<a href=\"tempor-dest\">tempor</a> sit !<a href=''></a> " +
                        "laborum aliqua ").length,
                        ("<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !<a href=\"tempor-dest\">tempor</a> sit !<a href=''></a> " +
                            "laborum aliqua <a href=\"\">consequat</a>").length),
                    undefined,
                    new TextPart("consequat", new Position("<a href=\"\">".length, "<a href=\"\">consequat".length))),
                new LinkData(LinkTypes.Html, "<a href=''>esse</a>",
                    new Position(("<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !<a href=\"tempor-dest\">tempor</a> sit !<a href=''></a> " +
                        "laborum aliqua <a href=\"\">consequat</a> voluptate !").length,
                        ("<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !<a href=\"tempor-dest\">tempor</a> sit !<a href=''></a> " +
                            "laborum aliqua <a href=\"\">consequat</a> voluptate !<a href=''>esse</a>").length),
                    undefined,
                    new TextPart("esse", new Position("<a href=''>".length, "<a href=''>esse".length))),
                new LinkData(LinkTypes.Html, "<a href=\"id-dest\"></a>",
                    new Position(("<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !<a href=\"tempor-dest\">tempor</a> sit !<a href=''></a> " +
                        "laborum aliqua <a href=\"\">consequat</a> voluptate !<a href=''>esse</a> officia in ").length,
                        ("<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !<a href=\"tempor-dest\">tempor</a> sit !<a href=''></a> " +
                            "laborum aliqua <a href=\"\">consequat</a> voluptate !<a href=''>esse</a> officia in <a href=\"id-dest\"></a>").length),
                    new TextPart("id-dest", new Position("<a href=\"".length, "<a href=\"id-dest".length))),
                new LinkData(LinkTypes.Html, "<a href='voluptate-dest'></a>",
                    new Position(("<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !<a href=\"tempor-dest\">tempor</a> sit !<a href=''></a> " +
                        "laborum aliqua <a href=\"\">consequat</a> voluptate !<a href=''>esse</a> officia in <a href=\"id-dest\"></a> ad voluptate !").length,
                        ("<a href='Consectetur-dest'>Consectetur</a> in id <a href=\"\"></a> ad voluptate !<a href=\"tempor-dest\">tempor</a> sit !<a href=''></a> " +
                            "laborum aliqua <a href=\"\">consequat</a> voluptate !<a href=''>esse</a> officia in <a href=\"id-dest\"></a> ad voluptate !<a href='voluptate-dest'></a>").length),
                    new TextPart("voluptate-dest", new Position("<a href='".length, "<a href='voluptate-dest".length)),
                    undefined),
            ]
        },
        {
            name: "plain link",
            input: "Consectetur in http://dolore.com id ad voluptate https://sunt.com tempor sit irc://foo.bar:2233/baz " +
                "laborum http://foo.bar.baz/test?q=hello&id=22&boolean aliqua consequatvoluptate esse officia in ad voluptate voluptate-dest ",
            expected: [
                new LinkData(LinkTypes.PlainUrl, "http://dolore.com",
                    new Position("Consectetur in ".length, "Consectetur in http://dolore.com".length),
                    new TextPart("http://dolore.com", new Position("".length, "http://dolore.com".length)),
                    undefined),
                new LinkData(LinkTypes.PlainUrl, "https://sunt.com",
                    new Position("Consectetur in http://dolore.com id ad voluptate ".length, "Consectetur in http://dolore.com id ad voluptate https://sunt.com".length),
                    new TextPart("https://sunt.com", new Position("".length, "https://sunt.com".length)),
                    undefined),
                new LinkData(LinkTypes.PlainUrl, "irc://foo.bar:2233/baz",
                    new Position("Consectetur in http://dolore.com id ad voluptate https://sunt.com tempor sit ".length,
                        "Consectetur in http://dolore.com id ad voluptate https://sunt.com tempor sit irc://foo.bar:2233/baz".length),
                    new TextPart("irc://foo.bar:2233/baz", new Position("".length, "irc://foo.bar:2233/baz".length)),
                    undefined),
                new LinkData(LinkTypes.PlainUrl, "http://foo.bar.baz/test?q=hello&id=22&boolean",
                    new Position(("Consectetur in http://dolore.com id ad voluptate https://sunt.com tempor sit irc://foo.bar:2233/baz " +
                        "laborum ").length,
                        ("Consectetur in http://dolore.com id ad voluptate https://sunt.com tempor sit irc://foo.bar:2233/baz " +
                            "laborum http://foo.bar.baz/test?q=hello&id=22&boolean").length),
                    new TextPart("http://foo.bar.baz/test?q=hello&id=22&boolean", new Position("".length, "http://foo.bar.baz/test?q=hello&id=22&boolean".length)),
                    undefined),
            ]
        }
    ])("$# findLinks [$name]", ({ name, input, expected }) => {
        const result = findLinks(input);
        expect(result.length).toBe(expected.length);
        for (let i = 0; i < expected.length; i++) {
            // console.log(expected[i].content)
            expect(result[i].type).toBe(expected[i].type);
            expect(result[i].content).toBe(expected[i].content);
            expect(result[i].position.start).toBe(expected[i].position.start);
            expect(result[i].position.end).toBe(expected[i].position.end);
            if (expected[i].link) {
                expect(result[i].link).toBeDefined();
                expect(result[i].link?.content).toBe(expected[i].link?.content);
                expect(result[i].link?.position.start).toBe(expected[i].link?.position.start);
                expect(result[i].link?.position.end).toBe(expected[i].link?.position.end);
            }
            if (expected[i].text) {
                expect(result[i].text).toBeDefined();
                expect(result[i].text?.content).toBe(expected[i].text?.content);
                expect(result[i].text?.position.start).toBe(expected[i].text?.position.start);
                expect(result[i].text?.position.end).toBe(expected[i].text?.position.end);
            }
            expect(result[i].embedded).toBe(expected[i].embedded);
        }
    });

})
