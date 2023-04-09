import {findLink, findHtmlLink, replaceAllHtmlLinks, removeHtmlLinksFromHeadings} from './utils';

//TODO: use  data-driven test
test("md link: cursor inside", () => {
    const text = "Incididunt [dolore](http://dolore.com) ullamco [sunt](https://sunt.com) ullamco non.";
    const startPos = text.indexOf("[") + 3;
    const endPos = startPos;
    const result = findLink(text, startPos, endPos);
    expect(result).toBeDefined();
    expect(result?.rawText).toBe("[dolore](http://dolore.com)");
    expect(result?.text).toBe("dolore");
    expect(result?.link).toBe("http://dolore.com");
    expect(result?.startIdx).toBe(text.indexOf("["));
    expect(result?.endIdx).toBe(text.indexOf(")")+1);
});

//TODO: use  data-driven test
test("html link: cursor inside", () => {
    const text = "Incididunt <a href=\"http://dolore.com\">dolore</a> ullamco sunt ullamco non.";
    const startPos = text.indexOf("<a") + 5;
    const endPos = startPos;
    const result = findHtmlLink(text, startPos, endPos);
    expect(result).toBeDefined();
    expect(result?.rawText).toBe("<a href=\"http://dolore.com\">dolore</a>");
    expect(result?.text).toBe("dolore");
    expect(result?.link).toBe("http://dolore.com");
    expect(result?.startIdx).toBe(text.indexOf("<"));
    expect(result?.endIdx).toBe(text.indexOf("/a>")+3);
});

//TODO: use  data-driven test
test("convert all html links to markdown", () => {
    const text = "Incididunt <a href=\"http://dolore.com\">dolore</a> ullamco <a href=\"http://sunt.com\">sunt</a> ullamco non.";
    const expectedText = "Incididunt [dolore](http://dolore.com) ullamco [sunt](http://sunt.com) ullamco non.";
    const result = replaceAllHtmlLinks(text);
    expect(result).toBe(expectedText);
});


//TODO: use  data-driven test
test("wiki link: cursor inside", () => {
    const text = "Incididunt [[dolore]] ullamco [[sunt]] ullamco non.";
    const startPos = text.indexOf("[[") + 3;
    const endPos = startPos;
    const result = findLink(text, startPos, endPos);
    expect(result).toBeDefined();
    expect(result?.rawText).toBe("[[dolore]]");
    expect(result?.text).toBe("dolore");
    expect(result?.link).toBe("dolore");
    expect(result?.startIdx).toBe(text.indexOf("["));
    expect(result?.endIdx).toBe(text.indexOf("]]")+2);
});

//TODO: use  data-driven test
test("remove links from headings", () => {
    const text = "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" + 
        "# Aute officia [do eu](ea sit aute). Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
        "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" + 
        "## [[amet mollit velit|Duis cupidatat]]. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
        " Ut aliquip qui eu nulla Lorem elit aliqua.\n" + 
        "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip.\n" +
        "## <a href=\"google.com\">amet mollit velit1</a>. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n";
    const expectedResult = "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" + 
    "# Aute officia do eu. Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
    "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" + 
    "## Duis cupidatat. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
    " Ut aliquip qui eu nulla Lorem elit aliqua.\n" + 
    "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip.\n" +
    "## amet mollit velit1. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n";
    const result = removeHtmlLinksFromHeadings(text);
    expect(result).toBe(expectedResult);
});