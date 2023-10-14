// import { requestUrl } from 'obsidian';WikilinkDestinationReplacement

import exp from "constants";
import { RegExPatterns } from "./RegExPatterns";

const LinkEmbededChar = '!';

export class Position {
    constructor(public start: number, public end: number) { }
}

export class TextPart {
    constructor(public content: string, public position: Position) { }
}

export enum LinkTypes {
    All = 0xFFFF,
    Markdown = 1,
    Wiki = 2,
    Html = 4,
    Autolink = 8,
    PlainUrl = 16
}

type LinkType = LinkTypes.Markdown | LinkTypes.Html | LinkTypes.Wiki | LinkTypes.Autolink | LinkTypes.PlainUrl;


export class LinkData extends TextPart {
    constructor(public type: LinkType, content: string, position: Position, public link?: TextPart, public text?: TextPart, public embedded: boolean = false) {
        super(content, position);
        this.type = type;
    }
}

function parseMarkdownLink(regExp: RegExp, match: RegExpMatchArray, raw: string, embeddedChar?: string, text?: string, destination?: string): LinkData {
    if (match.index === undefined) {
        throw new Error("match: index must be defined.");
    }
    const linkData = new LinkData(LinkTypes.Markdown, raw, new Position(match.index, match.index + raw.length));
    linkData.embedded = embeddedChar === LinkEmbededChar;
    if (text) {
        const textIdx = raw.indexOf(text);
        linkData.text = new TextPart(text, new Position(textIdx, textIdx + text.length));
    }
    if (destination) {
        const linkIdx = raw.indexOf(destination, linkData.text ? linkData.text.position.end : raw.lastIndexOf('(') + 1)
        const wrappedInAngleBrackets = destination[0] === '<' && destination[destination.length - 1] === '>';
        linkData.link = wrappedInAngleBrackets ?
            new TextPart(destination.substring(1, destination.length - 1), new Position(linkIdx + 1, linkIdx + destination.length - 1))
            : new TextPart(destination, new Position(linkIdx, linkIdx + destination.length))
    }

    return linkData;
}

function parseWikiLink(regExp: RegExp, match: RegExpMatchArray, raw: string, embeddedChar?: string, text?: string, destination?: string): LinkData {
    if (match.index === undefined) {
        throw new Error("match: index must be defined.");
    }
    const linkData = new LinkData(LinkTypes.Wiki, raw, new Position(match.index, match.index + raw.length));
    linkData.embedded = embeddedChar === LinkEmbededChar;
    if (text) {
        const textIdx = raw.lastIndexOf(text);
        linkData.text = new TextPart(text, new Position(textIdx, textIdx + text.length));
    }
    if (destination) {
        const linkIdx = raw.indexOf(destination)
        linkData.link = new TextPart(destination, new Position(linkIdx, linkIdx + destination.length))
    }

    return linkData;
}

function parseAutolink(regExp: RegExp, match: RegExpMatchArray, raw: string, destination: string): LinkData {
    if (match.index === undefined) {
        throw new Error("match: index must be defined.")
    }
    if (!destination) {
        throw new Error("destination must not be empty")
    }
    const linkData = new LinkData(LinkTypes.Autolink, raw, new Position(match.index, match.index + raw.length));
    const destinationStartIdx = raw.indexOf(destination)
    linkData.link = new TextPart(destination, new Position(destinationStartIdx, destinationStartIdx + destination.length))

    return linkData;
}

function parseHtmlLink(regExp: RegExp, match: RegExpMatchArray, raw: string, text?: string, destination?: string): LinkData {
    if (match.index === undefined) {
        throw new Error("match: index must be defined.");
    }
    const linkData = new LinkData(LinkTypes.Html, raw, new Position(match.index, match.index + raw.length));
    if (text) {
        const textIdx = raw.lastIndexOf(text);
        linkData.text = new TextPart(text, new Position(textIdx, textIdx + text.length));
    }
    if (destination) {
        const linkIdx = raw.indexOf(destination)
        linkData.link = new TextPart(destination, new Position(linkIdx, linkIdx + destination.length))
    }

    return linkData;
}

function parsePlainUrl(regExp: RegExp, match: RegExpMatchArray, raw: string, destination: string): LinkData {
    if (match.index === undefined) {
        throw new Error("match: index must be defined.")
    }
    if (!destination) {
        throw new Error("destination must not be empty")
    }
    const linkData = new LinkData(LinkTypes.PlainUrl, raw, new Position(match.index, match.index + raw.length));
    linkData.link = new TextPart(destination, new Position(0, destination.length))

    return linkData;
}

//TODO: refactor
export function findLink(text: string, startPos: number, endPos: number, linkType: LinkTypes = LinkTypes.All): LinkData | undefined {
    // eslint-disable-next-line no-useless-escape
    const wikiLinkRegEx = /(!?)\[\[([^\[\]|]+)(\|([^\[\]]*))?\]\]/g;
    // const mdLinkRegEx = /(!?)\[([^\]\[]*)\]\(([^)(]*)\)/gmi
    const mdLinkRegEx = new RegExp(RegExPatterns.Markdownlink.source, 'gmi');
    const htmlLinkRegEx = /<a\s+[^>]*href\s*=\s*['"]([^'"]*)['"][^>]*>(.*?)<\/a>/gi;
    const autolinkRegEx1 = /<([a-z]+:\/\/[^>]+)>/gmi;
    const autolinkRegEx = /(<([a-zA-Z]{2,32}:[^>]+)>)|(<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>)/gmi;

    let match;

    if ((linkType & LinkTypes.Wiki)) {
        while ((match = wikiLinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= wikiLinkRegEx.lastIndex) {
                const [raw, exclamationMark, destination, , text] = match
                const linkData = parseWikiLink(wikiLinkRegEx, match, raw, exclamationMark, text, destination)
                return linkData;
            }
        }
    }

    if ((linkType & LinkTypes.Markdown)) {
        while ((match = mdLinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= mdLinkRegEx.lastIndex) {
                const [raw, exclamationMark, text, destination] = match;
                const linkData = parseMarkdownLink(mdLinkRegEx, match, raw, exclamationMark, text, destination);
                return linkData;
            }
        }
    }

    if ((linkType & LinkTypes.Html)) {
        while ((match = htmlLinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= htmlLinkRegEx.lastIndex) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [raw, destination, text] = match;
                const linkData = parseHtmlLink(mdLinkRegEx, match, raw, text, destination);
                return linkData;
            }
        }
    }

    if ((linkType & LinkTypes.Autolink)) {
        while ((match = autolinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= autolinkRegEx.lastIndex) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [raw, urlAutolink, urlDestination, mailAutolink, mailDestination] = match;
                const linkData = parseAutolink(autolinkRegEx, match, raw, 
                    urlDestination ? urlDestination : mailDestination)
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
    return new RegExp(headingWithLinksRegEx.source, 'gm').test(text);
}

export enum WikilinkDestinationReplacement {
    Destination = 'Destination',
    LowestNoteHeading = 'LowestNoteHeading'
}

export interface RemoveLinksFromHeadingsOptions {
    internalWikilinkWithoutTextReplacement: WikilinkDestinationReplacement;
}

//TODO: refactor
export function removeLinksFromHeadings(text: string, options: RemoveLinksFromHeadingsOptions): string {
    // eslint-disable-next-line no-useless-escape

    const result = text.replace(headingWithLinksRegEx, (match, start, rawMdLink, mdText, mdUrl, rawWikiLink, wkLink, wkText, rawHtmlLink, htmlUrl, htmlText, end, offset) => {
        let linkText;
        if (rawMdLink) {
            linkText = mdText ? mdText : "";
        } else if (rawWikiLink) {
            if(wkText){
                linkText = wkText;
            } else{
                // default
                linkText = wkLink;

                switch(options.internalWikilinkWithoutTextReplacement){
                    case WikilinkDestinationReplacement.LowestNoteHeading:{
                        let idx = 0;
                        if(wkLink && (idx = wkLink.lastIndexOf('#')) > 0 && idx + 1 <= wkLink.length){
                            const subheading = wkLink.substring(idx + 1);
                            if(subheading){
                                linkText = subheading;
                            }
                        }
                    }
                    break;
                }
            }
        } else if (rawHtmlLink) {
            linkText = htmlText ? htmlText : ""
        }
        return start + linkText + end;
    });

    return result;
}

//TODO: <a href='google.com'>google1</a>
const textWithLinksRegEx = /(?:(\[(.*?)\]\((.*?)\))|(\[\[([^\n\[\]|]+)(?:\|([^\[\]]+))?\]\])|(<a\s[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>))/gm

export function HasLinks(text: string): boolean {
    return new RegExp(textWithLinksRegEx.source, 'gm').test(text);
}

//TODO: refactor
export function removeLinks(text: string): string {
    // eslint-disable-next-line no-useless-escape

    const result = text.replace(new RegExp(textWithLinksRegEx.source, 'gm'), (match, rawMdLink, mdText, mdUrl, rawWikiLink, wkLink, wkText, rawHtmlLink, htmlUrl, htmlText, offset) => {
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

function removeWhitespaces(str :string) : string {
    return str.replace(/\s+/g, ' ').trim();
}

export async function getPageTitle(url: URL, getPageText: (url: URL) => Promise<string>): Promise<string> {
    const titleRegEx = /<title[^>]*>([^<]*?)<\/title>/i;
    const text = await getPageText(url);
    const match = text.match(titleRegEx);
    if (match) {
        const [, title] = match;
        return decodeHtmlEntities(removeWhitespaces(title));
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

export function findLinks(text: string): Array<LinkData> {
    const linksRegex = new RegExp(`${RegExPatterns.Markdownlink.source}|${RegExPatterns.Wikilink.source}` +
        `|${RegExPatterns.AutolinkUrl.source}|${RegExPatterns.AutolinkMail.source}` +
        `|${RegExPatterns.Htmllink.source}|${RegExPatterns.PlainUrl.source}` 
        //+ `|${RegExPatterns.AbsoluteUri.source}`
        , "gmi");

    let match;
    const links: Array<LinkData> = new Array<LinkData>;

    while ((match = linksRegex.exec(text))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [rawMatch, mdLinkEmbeded, mdLinkText, mdLinkDestination,
            wikiLinkEmbeded, wikiLinkDestination, wikiLinkTextRaw, wikiLinkText,
            autoLinkUrlDestination, autoLinkMailDestination,
            htmlLinkDestination, htmlLinkText,
            plainUrl] = match;

        if (rawMatch.indexOf("](") >= 0 || mdLinkEmbeded || mdLinkText || mdLinkDestination) {
            const linkData = parseMarkdownLink(linksRegex, match, rawMatch, mdLinkEmbeded, mdLinkText, mdLinkDestination);
            links.push(linkData);
        } else if (rawMatch.indexOf("[[") >= 0 || wikiLinkEmbeded || wikiLinkDestination || wikiLinkText) {
            const linkData = parseWikiLink(linksRegex, match, rawMatch, wikiLinkEmbeded, wikiLinkText, wikiLinkDestination);
            links.push(linkData);
        } else if (rawMatch.startsWith('<a')) {
            const linkData = parseHtmlLink(linksRegex, match, rawMatch,
                htmlLinkText, htmlLinkDestination);
            links.push(linkData)
        } else if (rawMatch[0] === '<') {
            const linkData = parseAutolink(linksRegex, match, rawMatch,
                autoLinkUrlDestination ? autoLinkUrlDestination : autoLinkMailDestination)
            links.push(linkData)
        } else if(plainUrl){
            const linkData = parsePlainUrl(linksRegex, match, rawMatch, plainUrl)
            links.push(linkData)
        }
    }
    return links;
}