// import { requestUrl } from 'obsidian';WikilinkDestinationReplacement

import exp from "constants";
import { RegExPatterns } from "./RegExPatterns";
import parseFilepath, { ParsedPath } from 'parse-filepath';

const LinkEmbededChar = '!';

export class Position {
    constructor(public start: number, public end: number) { }
}

export class TextPart {
    constructor(public content: string, public position: Position) { }
}

export class ImageDimensions extends TextPart {
    width: Number
    height?: Number

    constructor(content: string, position: Position, width: Number, height?: Number) {
        super(content, position)
        this.width = width
        this.height = height
    }
}

export enum LinkTypes {
    All = 0xFFFF,
    Markdown = 1,
    Wiki = 2,
    Html = 4,
    Autolink = 8,
    PlainUrl = 16,
    ObsidianUrl = 32
}

type LinkType = LinkTypes.Markdown | LinkTypes.Html | LinkTypes.Wiki | LinkTypes.Autolink | LinkTypes.PlainUrl | LinkTypes.ObsidianUrl;

export enum DestinationType {
    Unknown = 'unknown',
    //Markdown,
    Image = 'image',
    //Audio,
    //Video,
    //Pdf
}


export class LinkData extends TextPart {

    destinationType: DestinationType = DestinationType.Unknown;
    hash?: string;
    _destination?: TextPart;
    _text?: TextPart;
    _imageText?: TextPart;
    _imageDimensions?: ImageDimensions;
    _destinationInAngleBrackets = false;
    vault: string | undefined;

    get destination(): TextPart | undefined {
        return this._destination;
    }

    set destination(value: TextPart | undefined) {
        this._destination = value
        this.parseDestination()
        this.paseText()
    }

    get text(): TextPart | undefined {
        return this._imageDimensions ? this._imageText : this._text;
    }

    set text(value: TextPart | undefined) {
        this._text = value;
        this.paseText()
    }

    get imageDimensions() {
        return this._imageDimensions;
    }

    constructor(public type: LinkType, content: string, position: Position, destination?: TextPart, text?: TextPart, public embedded: boolean = false) {
        super(content, position);
        this.type = type;
        this.destination = destination;
        this.text = text;
    }

    parseDestination() {
        if (!this._destination?.content
            || !(this.type === LinkTypes.Markdown || this.type === LinkTypes.Wiki)) {
            return
        }
        const content = this._destination.content
        let path = '';
        if (isAbsoluteUri(content)) {
            path = new URL(content).pathname
        } else {
            const hashIdx = this._destination.content.indexOf('#');
            path = hashIdx >= 0 ? content.substring(0, hashIdx) : content;
        }
        const parsedPath = parseFilepath(path);
        const imageExtensions = ['.png', '.webp', '.jpg', '.jpeg', '.gif', '.bmp', '.svg'];
        if (imageExtensions.includes(parsedPath.ext)) {
            this.destinationType = DestinationType.Image;
        }
    }

    paseText() {
        if (!this._text?.content || this.destinationType !== DestinationType.Image) {
            return
        }
        const content = this._text.content
        const pipeIdx = content.lastIndexOf('|')
        let potentialDimensions: string
        let imageText: string | undefined = undefined
        let dimensionsStart: number
        if (pipeIdx >= 0) {
            potentialDimensions = this._text.content.substring(pipeIdx + 1)
            dimensionsStart = this._text.position.start + pipeIdx + 1
            imageText = this._text.content.substring(0, pipeIdx)
        } else {
            potentialDimensions = this._text.content
            dimensionsStart = this._text.position.start
        }

        const match = potentialDimensions.match(RegExPatterns.ImageDimentions)
        if (match) {
            const [, dimensions, singleWidth, , width, height] = match
            if (imageText == undefined) {
                this._imageText = undefined;
            } else {
                this._imageText = new TextPart(imageText,
                    new Position(this._text.position.start, this._text.position.start + pipeIdx))
            }
            const dimensionsPosition = new Position(dimensionsStart, dimensionsStart + dimensions.length)
            this._imageDimensions = singleWidth ? new ImageDimensions(dimensions, dimensionsPosition, parseInt(singleWidth)) :
                new ImageDimensions(dimensions, dimensionsPosition, parseInt(width), parseInt(height))

        } else {
            this._imageText = undefined
            this._imageDimensions = undefined
        }
    }

    static parse(linkText: string): LinkData | null {
        const links = findLinks(linkText, LinkTypes.All, 0, linkText.length);
        return links.length === 1 ? links[0] : null;
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
        linkData.destination = wrappedInAngleBrackets ?
            new TextPart(destination.substring(1, destination.length - 1), new Position(linkIdx + 1, linkIdx + destination.length - 1))
            : new TextPart(destination, new Position(linkIdx, linkIdx + destination.length))
        //TODO
        linkData._destinationInAngleBrackets = wrappedInAngleBrackets;
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
        linkData.destination = new TextPart(destination, new Position(linkIdx, linkIdx + destination.length))
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
    linkData.destination = new TextPart(destination, new Position(destinationStartIdx, destinationStartIdx + destination.length))

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
        linkData.destination = new TextPart(destination, new Position(linkIdx, linkIdx + destination.length))
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
    const type = destination.startsWith('obsidian://open?vault=') ? LinkTypes.PlainUrl | LinkTypes.ObsidianUrl : LinkTypes.PlainUrl
    const linkData = new LinkData(type, raw, new Position(match.index, match.index + raw.length));
    linkData.destination = new TextPart(destination, new Position(0, destination.length))
    if ((type & LinkTypes.ObsidianUrl) === LinkTypes.ObsidianUrl) {
        const url = new URL(destination)
        const vault = url.searchParams.get('vault')
        linkData.vault = vault ? vault : undefined
    }

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
                linkData.destination = new TextPart(url, new Position(linkIdx, linkIdx + url.length));
            }
            if (text) {
                const textIdx = raw.indexOf(text, linkData.destination ? linkData.destination.position.end : raw.indexOf('|') + 1);
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

// const headingWithLinksRegEx = /^(#+ .*)(?:(\[(.*)\]\((.*)\))|(\[\[([^\[\]|]+)(?:\|([^\[\]]+))?\]\])|(<a\s[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>))(.*)$/gm
const headingWithLinksRegEx = /^(#+ .*)(?:(\[(.*)\]\((.*)\))|(\[\[([^\[\]|]+)(?:\|([^\[\]]+))?\]\])|(<a\s[^>]*[^>]*>(.*?)<\/a>))(.*)$/gm

export function hasLinksInHeadings(text: string): boolean {
    return new RegExp(headingWithLinksRegEx.source, 'gm').test(text);
}

export enum InternalWikilinkWithoutTextAction {
    //TODO: remove
    None = "None",

    Delete = 'Delete',
    ReplaceWithDestination = 'ReplaceWithDestination',
    ReplaceWithLowestNoteHeading = 'ReplaceWithLowestNoteHeading'
}

export interface RemoveLinksFromHeadingsOptions {
    internalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction;
}

//TODO: refactor
//TODO: fix - works only for 1 link in a heading
export function removeLinksFromHeadings(text: string, options: RemoveLinksFromHeadingsOptions): string {
    // eslint-disable-next-line no-useless-escape

    const result = text.replace(headingWithLinksRegEx, (match, start, rawMdLink, mdText, mdUrl, rawWikiLink, wkLink, wkText, rawHtmlLink, htmlText, end, offset) => {
        let linkText;
        if (rawMdLink) {
            linkText = mdText ? mdText : "";
        } else if (rawWikiLink) {
            if (wkText) {
                linkText = wkText;
            } else {
                // default: text = destination
                linkText = wkLink;

                switch (options.internalWikilinkWithoutTextAction) {
                    case InternalWikilinkWithoutTextAction.ReplaceWithLowestNoteHeading: {
                        let idx = 0;
                        if (wkLink && (idx = wkLink.lastIndexOf('#')) > -1 && idx + 1 <= wkLink.length) {
                            const subheading = wkLink.substring(idx + 1);
                            if (subheading) {
                                linkText = subheading;
                            }
                        }
                    }
                        break;
                    case InternalWikilinkWithoutTextAction.Delete:
                        linkText = '';
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

function removeWhitespaces(str: string): string {
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
    if (!linkData.destination
        || (linkData.type & (LinkTypes.Markdown | LinkTypes.Wiki)) == 0) {
        return [];
    }

    const linkContent = linkData.type == LinkTypes.Markdown ?
        decodeURI(linkData.destination?.content) : linkData.destination?.content;

    const hashIdx = linkContent.indexOf('#');
    if (hashIdx > 0 && hashIdx < linkContent.length - 1) {
        return linkContent.substring(hashIdx + 1).split('#');
    }

    return [];
}

export function getFileName(path: string): string {
    return path.replace(/^.*[\\\/]/, '');
}

export function removeExtension(path: string, extension = ".md"): [string, boolean] {
    const extIdx = path.lastIndexOf(extension);

    if (extIdx < 0 || extIdx < path.length - extension.length) {
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
        let destination = encodeURI(newTarget);
        if ((destination.indexOf("%20") > 0)) {
            destination = `<${destination.replace(/%20/g, " ")}>`;
        }
        return `[${text}](${destination})`;
    }), count];
}

export function decodeHtmlEntities(text: string): string {
    const regexpHe = /&([a-zA-Z\d]+);/gm;
    const charByHe = new Map<string, string>();
    charByHe.set("amp", "&");
    charByHe.set("nbsp", " ");
    charByHe.set("quot", "\"");
    charByHe.set("gt", ">");
    charByHe.set("lt", "<");

    return text.replace(regexpHe, (match, he) => {
        const entry = charByHe.get(he);
        return entry ?? match;
    });
}

export function findLinks(text: string, type?: LinkTypes, start?: number, end?: number): Array<LinkData> {
    const linksRegex = new RegExp(`${RegExPatterns.Markdownlink.source}|${RegExPatterns.Wikilink.source}` +
        `|${RegExPatterns.AutolinkUrl.source}|${RegExPatterns.AutolinkMail.source}` +
        `|${RegExPatterns.Htmllink.source}|${RegExPatterns.PlainUrl.source}`
        //+ `|${RegExPatterns.AbsoluteUri.source}`
        , "gmi");

    let match;
    const links: Array<LinkData> = new Array<LinkData>;
    let startOffset = start ? start : 0;
    let endOffset = end ? end : text.length;
    let linkType = type ? type : LinkTypes.All;

    while ((match = linksRegex.exec(text))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [rawMatch, mdLinkEmbeded, mdLinkText, mdLinkDestination,
            wikiLinkEmbeded, wikiLinkDestination, wikiLinkTextRaw, wikiLinkText,
            autoLinkUrlDestination, autoLinkMailDestination,
            htmlLinkDestination, htmlLinkText,
            plainUrl] = match;

        if (startOffset == endOffset) {
            if (!(startOffset >= match.index && startOffset <= (match.index + rawMatch.length))) {
                continue;
            }
        } else {
            if (!(match.index >= startOffset && (match.index + rawMatch.length) <= endOffset)) {
                continue;
            }
        }

        if ((rawMatch.indexOf("](") >= 0 || mdLinkEmbeded || mdLinkText || mdLinkDestination)) {
            if (!(linkType & LinkTypes.Markdown)) {
                continue
            }
            const linkData = parseMarkdownLink(linksRegex, match, rawMatch, mdLinkEmbeded, mdLinkText, mdLinkDestination);
            links.push(linkData);
        } else if ((rawMatch.indexOf("[[") >= 0 || wikiLinkEmbeded || wikiLinkDestination || wikiLinkText)) {
            if (!(linkType & LinkTypes.Wiki)) {
                continue
            }
            const linkData = parseWikiLink(linksRegex, match, rawMatch, wikiLinkEmbeded, wikiLinkText, wikiLinkDestination);
            links.push(linkData);
        } else if (rawMatch.startsWith('<a')) {
            if (!(linkType & LinkTypes.Html)) {
                continue
            }
            const linkData = parseHtmlLink(linksRegex, match, rawMatch,
                htmlLinkText, htmlLinkDestination);
            links.push(linkData)
        } else if (rawMatch[0] === '<') {
            if (!(linkType & LinkTypes.Autolink)) {
                continue
            }
            const linkData = parseAutolink(linksRegex, match, rawMatch,
                autoLinkUrlDestination ? autoLinkUrlDestination : autoLinkMailDestination)
            links.push(linkData)
        } else if (plainUrl) {
            if (!(linkType & LinkTypes.PlainUrl)) {
                continue
            }
            const linkData = parsePlainUrl(linksRegex, match, rawMatch, plainUrl)
            links.push(linkData)
        }
    }
    return links;
}

export function getSafeFilename(filename: string): string {
    const regex = new RegExp(RegExPatterns.InvalidNoteNameChars.source, 'g');
    if (!filename) {
        return filename;
    }

    return filename.replace(regex, '');
}

export function getPathWithoutHash(path: string): string {
    const hashIdx = path.indexOf('#');
    if (hashIdx < 0) {
        return path;
    }
    return path.substring(0, hashIdx);
}

export function isAbsoluteUri(path: string): boolean {
    return new RegExp(RegExPatterns.AbsoluteUri.source, 'i').test(path);
}

export function isSectionLink(path: string): boolean {
    return path[0] === '#';
}

export function isAbsoluteFilePath(path: string) {
    return new RegExp(RegExPatterns.AbsoluteFilePathCheck.source, 'i').test(path);
}

export class CodeBlock extends TextPart {
    constructor(content: string, position: Position) {
        super(content, position);
    }
}

function parseCodeBlock(regExp: RegExp, match: RegExpMatchArray, raw: string): CodeBlock {
    if (match.index === undefined) {
        throw new Error("match: index must be defined.");
    }
    const codeBlock = new CodeBlock(raw, new Position(match.index, match.index + raw.length));

    return codeBlock;
}

export function findCodeBlocks(text: string, start?: number, end?: number): Array<CodeBlock> {
    const codeBlockRegex = new RegExp(RegExPatterns.CodeBlock.source, "gsi");

    let match;
    const blocks: Array<CodeBlock> = new Array<CodeBlock>;
    let startOffset = start ? start : 0;
    let endOffset = end ? end : text.length;

    while ((match = codeBlockRegex.exec(text))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [rawMatch, firstLine, header, content, lastLine] = match;

        if (startOffset == endOffset) {
            if (!(startOffset >= match.index && startOffset <= (match.index + rawMatch.length))) {
                continue;
            }
        } else {
            if (!(match.index >= startOffset && (match.index + rawMatch.length) <= endOffset)) {
                continue;
            }
        }

        const block = parseCodeBlock(codeBlockRegex, match, rawMatch);
        blocks.push(block);
    }
    return blocks;
}

export function getFrontmatter(text: string): TextPart | null {
    if (!text || !text.startsWith('---')) {
        return null;
    }
    const match = text.match(new RegExp(RegExPatterns.Frontmatter.source, 'gs'));
    if (!match) {
        return null;
    }
    const [frontmatter] = match;
    return new TextPart(frontmatter, new Position(0, frontmatter.length));
}

export function getFileExtension(path: string): string | null {
    const dotIdx = path.lastIndexOf('.');
    if (dotIdx > 0) {
        for (let i = dotIdx; i < path.length; i++) {
            if (path[i] === "/" || path[i] === "\\") {
                return null;
            }
        }
        return path.substring(dotIdx);
    }
    return null;
}

export function destinationRequireAngleBrackets(destination: string): boolean {
    for (let i = 0; i < destination.length; i++) {
        const code = destination.charCodeAt(i);
        //TODO:
        if (code === 0x20) {
            return true;
        }
    }

    return false;
}