import {findLink, findHtmlLink, replaceAllHtmlLinks} from './utils';

//TODO: use  data-drive test
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

//TODO: use  data-drive test
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

//TODO: use  data-drive test
test("md link: cursor inside", () => {
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


test("convert all html links to markdown", () => {
    const text = "Incididunt <a href=\"http://dolore.com\">dolore</a> ullamco <a href=\"http://sunt.com\">sunt</a> ullamco non.";
    const expectedText = "Incididunt [dolore](http://dolore.com) ullamco [sunt](http://sunt.com) ullamco non.";
    const result = replaceAllHtmlLinks(text);
    expect(result).toBe(expectedText);
});