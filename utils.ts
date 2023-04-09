import { link } from "fs";

export interface ILinkData {
    type: LinkType;
    rawText: string;
    text: string;
    link: string;
    startIdx: number;
    endIdx: number;
}

export enum LinkTypes {
	All = 0xFFFF,
	Markdown = 1,
	Wiki  = 2,
	Html = 4
}

type LinkType = LinkTypes.Markdown | LinkTypes.Html | LinkTypes.Wiki;


class LinkData implements ILinkData {
    rawText: string;
    text: string;
    link: string;
    startIdx: number;
    endIdx: number;
    type : LinkType;

    constructor(type: LinkType, rawText: string, text: string, link: string, startIdx: number, endIdx: number) {
        this.type = type;
        this.rawText = rawText;
        this.text = text;
        this.link = link;
        this.startIdx = startIdx;
        this.endIdx = endIdx;
    }
}

//TODO: refactor
export function findLink(text: string, startPos: number, endPos: number, linkType: LinkTypes = LinkTypes.All): ILinkData | undefined {
    const wikiLinkRegEx = /\[\[([^\[\]|]+)(\|([^\[\]]+))?\]\]/g;
    const mdLinkRegEx = /\[([^\]]*)\]\(([^)]*)\)/gmi
    const htmlLinkRegEx = /<a\s+[^>]*href\s*=\s*['"]([^'"]*)['"][^>]*>(.*?)<\/a>/gi;
    let match;


    if ((linkType & LinkTypes.Wiki)) {
        while ((match = wikiLinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= wikiLinkRegEx.lastIndex) {
                const [raw, url, , text] = match;
                return !text ? 
                    new LinkData(LinkTypes.Wiki, raw, url, url, match.index, wikiLinkRegEx.lastIndex)
                    : new LinkData(LinkTypes.Wiki, raw, text, url, match.index, wikiLinkRegEx.lastIndex);
            }
        }
    }

    if ((linkType & LinkTypes.Markdown)) {
        while ((match = mdLinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= mdLinkRegEx.lastIndex) {
                const [raw, text, link] = match;
                return new LinkData(LinkTypes.Markdown, raw, text, link, match.index, mdLinkRegEx.lastIndex);
            }
        }
    }

    if ((linkType & LinkTypes.Html)) {
        while ((match = htmlLinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= htmlLinkRegEx.lastIndex) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [raw, openTag, href, url, text] = match;
                return new LinkData(LinkTypes.Html, raw, text, url, match.index, htmlLinkRegEx.lastIndex);
            }
        }
    }

    return undefined;
}

//TODO: refactor
export function findHtmlLink(text: string, startPos: number, endPos: number): ILinkData | undefined {
    const htmlLinkRegEx = /<a\s+[^>]*href\s*=\s*['"]([^'"]*)['"][^>]*>(.*?)<\/a>/gi;
    let match;

    while ((match = htmlLinkRegEx.exec(text))) {
        if (startPos >= match.index && endPos <= htmlLinkRegEx.lastIndex) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [raw, url, text] = match;
            return new LinkData(LinkTypes.Html, raw, text, url, match.index, htmlLinkRegEx.lastIndex);
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

//TODO: refactor
export function removeHtmlLinksFromHeadings(text: string) : string {
    const headingWithLinksRegEx = /^(#+ .*)(?:(\[(.*)\]\((.*)\))|(\[\[([^\[\]|]+)(?:\|([^\[\]]+))?\]\])|(<a\s[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>))(.*)$/gm
    const result = text.replace(headingWithLinksRegEx, (match, start, rawMdLink, mdText, mdUrl, rawWikiLink, wkLink, wkText, rawHtmlLink, htmlUrl, htmlText, end, offset) => {
        let linkText;
        if(rawMdLink){
            linkText =  mdText? mdText : "";
        } else if(rawWikiLink){
            linkText = wkText ? wkText : wkLink;
        } else if(rawHtmlLink){
            linkText = htmlText ? htmlText : ""
        } 
        return start + linkText + end;
    });

    return result;
}