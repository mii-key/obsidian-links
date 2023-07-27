// import { requestUrl } from 'obsidian';

class Position {
    constructor(public start: number, public end: number) { }
}

class TextPart {
    constructor(public content: string, public position: Position) { }
}

export enum LinkTypes {
    All = 0xFFFF,
    Markdown = 1,
    Wiki = 2,
    Html = 4,
    Autolink = 8
}

type LinkType = LinkTypes.Markdown | LinkTypes.Html | LinkTypes.Wiki | LinkTypes.Autolink;


export class LinkData extends TextPart {
    embeded : boolean = false;

    constructor(public type: LinkType, content: string, position: Position, public link?: TextPart, public text?: TextPart) {
        super(content, position);
        this.type = type;
    }
}

//TODO: refactor
export function findLink(text: string, startPos: number, endPos: number, linkType: LinkTypes = LinkTypes.All): LinkData | undefined {
    // eslint-disable-next-line no-useless-escape
    const wikiLinkRegEx = /(!?)\[\[([^\[\]|]+)(\|([^\[\]]*))?\]\]/g;
    const mdLinkRegEx = /(!?)\[([^\]\[]*)\]\(([^)(]*)\)/gmi
    const htmlLinkRegEx = /<a\s+[^>]*href\s*=\s*['"]([^'"]*)['"][^>]*>(.*?)<\/a>/gi;
    const autolinkRegEx1 = /<([a-z]+:\/\/[^>]+)>/gmi;
    const autolinkRegEx = /(<([a-zA-Z]{2,32}:[^>]+)>)|(<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>)/gmi;
    
    let match;

    if ((linkType & LinkTypes.Wiki)) {
        while ((match = wikiLinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= wikiLinkRegEx.lastIndex) {
                const [raw, exclamationMark, url, , text] = match;
                const linkData = new LinkData(LinkTypes.Wiki, raw, new Position(match.index, wikiLinkRegEx.lastIndex));
                linkData.embeded = exclamationMark === '!';
                if (url) {
                    const linkIdx = raw.indexOf(url)
                    linkData.link = new TextPart(url, new Position(linkIdx, linkIdx + url.length));
                }
                if (text !== undefined) {
                    const textIdx = text ? raw.indexOf(text, (linkData.link ? linkData.link.position.end : raw.indexOf('|')) + 1) : raw.length - 2;
                    linkData.text = new TextPart(text, new Position(textIdx, textIdx + text.length));
                }

                return linkData;
            }
        }
    }

    if ((linkType & LinkTypes.Markdown)) {
        while ((match = mdLinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= mdLinkRegEx.lastIndex) {
                const [raw, exclamationMark, text, url] = match;
                const linkData = new LinkData(LinkTypes.Markdown, raw, new Position(match.index, mdLinkRegEx.lastIndex));
                linkData.embeded = exclamationMark === '!';
                if (text) {
                    const textIdx = raw.indexOf(text);
                    linkData.text = new TextPart(text, new Position(textIdx, textIdx + text.length));
                }
                if (url) {
                    const linkIdx = raw.indexOf(url, linkData.text ? linkData.text.position.end : raw.lastIndexOf('(') + 1)
                    const wrappedInAngleBrackets = url[0] === '<' && url[url.length - 1] === '>';
                    linkData.link = wrappedInAngleBrackets ?
                        new TextPart(url.substring(1, url.length - 1), new Position(linkIdx + 1, linkIdx + url.length - 1))
                        : new TextPart(url, new Position(linkIdx, linkIdx + url.length))
                }

                return linkData;
            }
        }
    }

    if ((linkType & LinkTypes.Html)) {
        while ((match = htmlLinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= htmlLinkRegEx.lastIndex) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [raw, url, text] = match;
                const linkData = new LinkData(LinkTypes.Html, raw, new Position(match.index, htmlLinkRegEx.lastIndex));
                if (url) {
                    const linkIdx = raw.indexOf(url)
                    linkData.link = new TextPart(url, new Position(linkIdx, linkIdx + url.length));
                }
                if (text) {
                    const textIdx = raw.indexOf(text, linkData.link ? linkData.link.position.end : raw.indexOf('>') + 1);
                    linkData.text = new TextPart(text, new Position(textIdx, textIdx + text.length));
                }

                return linkData;
            }
        }
    }

    if ((linkType & LinkTypes.Autolink)) {
        while ((match = autolinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= autolinkRegEx.lastIndex) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [raw, urlAutolink, urlDestination, mailAutolink, mailDestination] = match;
                const linkData = new LinkData(LinkTypes.Autolink, raw, new Position(match.index, autolinkRegEx.lastIndex));
                if (urlDestination) {
                    const linkIdx = raw.indexOf(urlDestination);
                    linkData.link = new TextPart(urlDestination, new Position(linkIdx, linkIdx + urlDestination.length));
                } else if(mailDestination) {
                    const linkIdx = raw.indexOf(mailDestination);
                    linkData.link = new TextPart(mailDestination, new Position(linkIdx, linkIdx + mailDestination.length));
                }
                return linkData;
            }
        }
    }

    return undefined;
}

//TODO: refactor
export function findHtmlLink(text: string, startPos: number, endPos: number): LinkData | undefined {
    const htmlLinkRegEx = /<a\s+[^>]*href\s*=\s*['"]([^'"]*)['"][^>]*>(.*?)<\/a>/gi;
    let match;

    while ((match = htmlLinkRegEx.exec(text))) {
        if (startPos >= match.index && endPos <= htmlLinkRegEx.lastIndex) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [raw, url, text] = match;
            const linkData = new LinkData(LinkTypes.Html, raw, new Position(match.index, htmlLinkRegEx.lastIndex));
            if (url) {
                const linkIdx = raw.indexOf(url)
                linkData.link = new TextPart(url, new Position(linkIdx, linkIdx + url.length));
            }
            if (text) {
                const textIdx = raw.indexOf(text, linkData.link ? linkData.link.position.end : raw.indexOf('|') + 1);
                linkData.text = new TextPart(text, new Position(textIdx, textIdx + text.length));
            }

            return linkData;
        }
    }

    return undefined;
}

//TODO: refactor
export function replaceAllHtmlLinks(text: string): string {
    const htmlLinkRegEx = /<a\s+[^>]*href\s*=\s*['"]([^'"]*)['"][^>]*>(.*?)<\/a>/gi;

    return text.replace(htmlLinkRegEx, (match, url, text) => {
        return `[${text}](${url})`;
    })
}

const headingWithLinksRegEx = /^(#+ .*)(?:(\[(.*)\]\((.*)\))|(\[\[([^\[\]|]+)(?:\|([^\[\]]+))?\]\])|(<a\s[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>))(.*)$/gm

export function HasLinksInHeadings(text: string): boolean {
    return headingWithLinksRegEx.test(text);
}


//TODO: refactor
export function removeLinksFromHeadings(text: string): string {
    // eslint-disable-next-line no-useless-escape

    const result = text.replace(headingWithLinksRegEx, (match, start, rawMdLink, mdText, mdUrl, rawWikiLink, wkLink, wkText, rawHtmlLink, htmlUrl, htmlText, end, offset) => {
        let linkText;
        if (rawMdLink) {
            linkText = mdText ? mdText : "";
        } else if (rawWikiLink) {
            linkText = wkText ? wkText : wkLink;
        } else if (rawHtmlLink) {
            linkText = htmlText ? htmlText : ""
        }
        return start + linkText + end;
    });

    return result;
}


// const textWithLinksRegEx = /(?:(\[(.*?)\]\((.*?)\))|(\[\[([^\[\]|]+)(?:\|([^\[\]]+))?\]\])|(<a\s[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>))/gm
const textWithLinksRegEx = /(?:(\[(.*?)\]\((.*?)\))|(\[\[([^\[\]|\r\n]+)(?:\|([^\[\]]+))?\]\])|(<a\s[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>))/gm

export function HasLinks(text: string): boolean {
    return textWithLinksRegEx.test(text);
}

//TODO: refactor
export function removeLinks(text: string): string {
    // eslint-disable-next-line no-useless-escape

    const result = text.replace(textWithLinksRegEx, (match, rawMdLink, mdText, mdUrl, rawWikiLink, wkLink, wkText, rawHtmlLink, htmlUrl, htmlText, offset) => {
        let linkText;
        if (rawMdLink) {
            linkText = mdText ? mdText : "";
        } else if (rawWikiLink) {
            linkText = wkText ? wkText : wkLink;
        } else if (rawHtmlLink) {
            linkText = htmlText ? htmlText : ""
        }
        return linkText;
    });

    return result;
}


export async function getPageTitle(url: URL, getPageText: (url: URL) => Promise<string>): Promise<string> {
    const titleRegEx = /<title[^>]*>(.*?)<\/title>/i;
    const text = await getPageText(url);
    const match = text.match(titleRegEx);
    if (match) {
        const [, title] = match;
        return decodeHtmlEntities(title);
    }

    throw new Error("Page has no title.");
}

export function getLinkTitles(linkData: LinkData): string[] {
    if (!linkData.link
        || (linkData.type & (LinkTypes.Markdown | LinkTypes.Wiki)) == 0) {
        return [];
    }

    const linkContent = linkData.type == LinkTypes.Markdown ?
        decodeURI(linkData.link?.content) : linkData.link?.content;

    const hashIdx = linkContent.indexOf('#');
    if (hashIdx > 0 && hashIdx < linkContent.length - 1) {
        return linkContent.substring(hashIdx + 1).split('#');
    }

    return [];
}

export function getFileName(path: string): string {
    return path.replace(/^.*[\\\/]/, '');
}

export function removeExtention(path: string, extention = ".md"): [string, boolean] {
    const extIdx = path.lastIndexOf(extention);

    if (extIdx < 0 || extIdx < path.length - extention.length) {
        return [path, false];
    }

    return [path.substring(0, extIdx), true];
}

function escapeRegex(str: string): string {
    return str.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function replaceMarkdownTarget(text: string, target: string, newTarget: string): [string, number] {
    const regexp = new RegExp("\\[([^\\]]*)?\\]\\((" + escapeRegex(target) + ")\\)", "ig");
    let count = 0;
    return [text.replace(regexp, (match, text) => {
        count++;
        return `[${text}](${encodeURI(newTarget)})`;
    }), count];
}

export function decodeHtmlEntities(text: string): string {
    const regexpHe = /&([a-zA-Z\d]+);/gm;
    const charByHe = new Map<string, string>();
    charByHe.set("amp", "&");
    charByHe.set("nbsp", " ");
    charByHe.set("quot", "\"");

    return text.replace(regexpHe, (match, he) => {
        const entry = charByHe.get(he);
        return entry ?? match;
    });
}