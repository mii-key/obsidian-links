
class Position {
    constructor(public start: number, public end: number){}
}

class TextPart {
    constructor(public content: string, public position: Position){}
}

export enum LinkTypes {
	All = 0xFFFF,
	Markdown = 1,
	Wiki  = 2,
	Html = 4
}

type LinkType = LinkTypes.Markdown | LinkTypes.Html | LinkTypes.Wiki;


export class LinkData extends TextPart {

    constructor(public type: LinkType, content: string, position: Position, public link?: TextPart, public text?: TextPart) {
        super(content, position);
        this.type = type;
    }
}

//TODO: refactor
export function findLink(text: string, startPos: number, endPos: number, linkType: LinkTypes = LinkTypes.All): LinkData | undefined {
    // eslint-disable-next-line no-useless-escape
    const wikiLinkRegEx = /\[\[([^\[\]|]+)(\|([^\[\]]+))?\]\]/g;
    const mdLinkRegEx = /\[([^\]]*)\]\(([^)]*)\)/gmi
    const htmlLinkRegEx = /<a\s+[^>]*href\s*=\s*['"]([^'"]*)['"][^>]*>(.*?)<\/a>/gi;
    let match;

    if ((linkType & LinkTypes.Wiki)) {
        while ((match = wikiLinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= wikiLinkRegEx.lastIndex) {
                const [raw, url, , text] = match;
                const linkData = new LinkData(LinkTypes.Wiki, raw, new Position(match.index, wikiLinkRegEx.lastIndex));
                if(url){
                    const linkIdx = raw.indexOf(url)
                    linkData.link = new TextPart(url, new Position(linkIdx, linkIdx + url.length));
                }
                if(text){
                    const textIdx = raw.indexOf(text, linkData.link ? linkData.link.position.end : raw.indexOf('|') + 1);
                    linkData.text = new TextPart(text, new Position(textIdx, textIdx + text.length));
                }
                
                return linkData;
            }
        }
    }

    if ((linkType & LinkTypes.Markdown)) {
        while ((match = mdLinkRegEx.exec(text))) {
            if (startPos >= match.index && endPos <= mdLinkRegEx.lastIndex) {
                const [raw, text, url] = match;
                const linkData = new LinkData(LinkTypes.Markdown, raw, new Position(match.index, mdLinkRegEx.lastIndex));
                if(text){
                    const textIdx = raw.indexOf(text);
                    linkData.text = new TextPart(text, new Position(textIdx, textIdx + text.length));
                }
                if(url){
                    const linkIdx = raw.indexOf(url, linkData.text ? linkData.text.position.end : raw.lastIndexOf('(') + 1)
                    linkData.link = new TextPart(url, new Position(linkIdx, linkIdx + url.length));
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
                if(url){
                    const linkIdx = raw.indexOf(url)
                    linkData.link = new TextPart(url, new Position(linkIdx, linkIdx + url.length));
                }
                if(text){
                    const textIdx = raw.indexOf(text, linkData.link ? linkData.link.position.end : raw.indexOf('>') + 1);
                    linkData.text = new TextPart(text, new Position(textIdx, textIdx + text.length));
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
                if(url){
                    const linkIdx = raw.indexOf(url)
                    linkData.link = new TextPart(url, new Position(linkIdx, linkIdx + url.length));
                }
                if(text){
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

//TODO: refactor
export function removeHtmlLinksFromHeadings(text: string) : string {
    // eslint-disable-next-line no-useless-escape
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